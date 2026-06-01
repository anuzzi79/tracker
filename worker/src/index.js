const ALLOWED_ORIGINS = new Set([
  "https://anuzzi79.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://anuzzi79.github.io",
    "Access-Control-Allow-Headers": "Content-Type, x-tracker-token",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") return json({ error: "Method not allowed." }, 405, origin);
    if (!ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed." }, 403, origin);
    if (!env.SUPADATA_API_KEY || !env.TRACKER_TOKEN) {
      return json({ error: "Worker secrets are not configured." }, 500, origin);
    }
    if (request.headers.get("x-tracker-token") !== env.TRACKER_TOKEN) {
      return json({ error: "Invalid tracker token." }, 401, origin);
    }

    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId") || "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return json({ error: "Invalid YouTube video ID." }, 400, origin);
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const upstreamUrl = new URL("https://api.supadata.ai/v1/transcript");
    upstreamUrl.searchParams.set("url", youtubeUrl);
    upstreamUrl.searchParams.set("lang", "en");
    upstreamUrl.searchParams.set("text", "true");
    upstreamUrl.searchParams.set("mode", "native");

    try {
      const response = await fetch(upstreamUrl, {
        headers: { "x-api-key": env.SUPADATA_API_KEY },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return json({ error: payload.error || `Transcript provider error (${response.status}).` }, response.status, origin);
      }
      if (typeof payload.content !== "string" || payload.content.trim().length < 80) {
        return json({ error: "Transcript provider returned no usable captions." }, 502, origin);
      }
      return json({ transcript: payload.content, lang: payload.lang || null }, 200, origin);
    } catch (error) {
      return json({ error: `Transcript request failed: ${error.message}` }, 502, origin);
    }
  },
};
