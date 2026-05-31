# Setup — English Listening Tracker

Tutto vive in `index.html`. Due cose da configurare a mano: **Firebase** e **OpenAI**.

---

## 1) Firebase (sync tra dispositivi)

1. Vai su https://console.firebase.google.com e crea un progetto (es. `listening-tracker`).
2. Nel progetto: **Build → Firestore Database → Create database** → "Production mode" → scegli la region (es. `eur3`).
3. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**.
4. **Project settings (⚙️) → "Le tue app" → icona Web `</>`** → registra l'app (qualsiasi nome) → copia l'oggetto `firebaseConfig`.
5. Apri `index.html`, trova il blocco `// ============ FIREBASE CONFIG — SOSTITUISCI ===` e incolla i tuoi valori.
6. **Firestore → Rules**: incolla queste regole (solo il proprietario legge/scrive i propri dati):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

   "Publish".

---

## 2) OpenAI (quiz)

1. https://platform.openai.com/api-keys → "Create new secret key" → copia.
2. **Settings → Limits**: imposta un **monthly spending limit** basso (es. 5 USD).
3. Apri l'app, **Impostazioni → OpenAI key**, incolla, "Salva chiave". La chiave resta solo nel localStorage di quel browser.

Il modello usato di default è `gpt-4o-mini` (puoi cambiarlo nella costante `OPENAI_MODEL` in alto nello script).

---

## 3) Deploy su GitHub Pages

1. Crea un repo (es. `tracker`), aggiungi `index.html` (+ questo `SETUP.md` se vuoi).
2. **Push** su `main`.
3. Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `/ (root)` → Save.
4. Dopo ~30s avrai `https://<utente>.github.io/<repo>/`.
5. Sul telefono: apri il link in Chrome → menu → **Aggiungi a schermata Home**.

> Nota: la chiave OpenAI **non** finisce nel repo (sta solo nel browser). Tieni le rules di Firestore strette: chiunque visiti la pagina si autentica come *un altro* utente anonimo e vede solo i propri dati (vuoti). I tuoi dati restano legati al tuo `uid` su quel browser.

---

## 4) Backup

Usa "Esporta dati (JSON)" periodicamente (Impostazioni → Backup). L'import aggiunge record, non sovrascrive.

## 5) Transcript del quiz

L'auto-fetch del transcript YouTube **dal browser è bloccato da CORS** nella stragrande maggioranza dei casi. La via pratica:

- Apri il video su YouTube → "..." sotto al player → **Mostra trascrizione** → seleziona tutto, copia.
- Nell'app, apri "Transcript manuale", incolla, "Genera dal testo incollato".
