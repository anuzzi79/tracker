# Transcript Worker

This Cloudflare Worker keeps the Supadata API key out of the GitHub Pages frontend.

## Deploy

```powershell
cd worker
npx wrangler login
npx wrangler secret put SUPADATA_API_KEY
npx wrangler secret put TRACKER_TOKEN
npx wrangler deploy
```

Use a long random value for `TRACKER_TOKEN`. After deployment, enter the Worker URL
and the same tracker token in the app under **Settings -> Automatic transcripts**.
