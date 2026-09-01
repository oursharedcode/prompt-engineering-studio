// Cloudflare Worker: per-country visitor counter for Prompt Engineering Studio.
//
// The page is a static site with no backend, so this Worker is the only piece
// that can see where a request came from. It reads Cloudflare's own geo header,
// keeps one tally per country in Workers KV, and serves that tally back to the
// page as JSON. No IP address is ever stored — only a salted daily hash used to
// avoid counting the same visitor twice.
//
// Setup:
//   1. npm install -g wrangler && wrangler login
//   2. wrangler kv namespace create VISITORS
//      → paste the printed id into wrangler.toml
//   3. wrangler secret put VISITOR_SALT      (any long random string)
//   4. wrangler deploy
//   5. Put the deployed URL into visitorStatsUrl in src/config.js.
//
// Endpoints:
//   GET  /stats  → { total, countries: [{ code, count }], updated }
//   POST /hit    → counts this visitor (once per 12h), returns the same shape

// Local ports match vite.config.js (pinned off Vite's defaults, which other
// projects on this machine already use).
const ALLOWED_ORIGINS = [
  "https://www.oursharedcode.com",
  "https://oursharedcode.github.io",
  "http://localhost:5290",
  "http://localhost:4290",
];

const SNAPSHOT_KEY = "snapshot";
const DEDUPE_TTL = 60 * 60 * 12;

function cors(request) {
  const origin = request.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(request, body, maxAge) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...cors(request),
      "Content-Type": "application/json",
      "Cache-Control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
}

async function readSnapshot(env) {
  return (await env.VISITORS.get(SNAPSHOT_KEY, "json")) || {};
}

function shape(counts) {
  const countries = Object.entries(counts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
  return {
    total: countries.reduce((sum, c) => sum + c.count, 0),
    countries,
    updated: new Date().toISOString(),
  };
}

async function visitorHash(request, salt) {
  const parts = [
    request.headers.get("CF-Connecting-IP") || "",
    request.headers.get("User-Agent") || "",
    new Date().toISOString().slice(0, 10),
    salt,
  ].join("|");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(parts));
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function countVisit(request, env) {
  const country = (request.cf?.country || request.headers.get("CF-IPCountry") || "").toUpperCase();
  // XX = unknown, T1 = Tor exit node; neither maps to a place on the map.
  if (!/^[A-Z]{2}$/.test(country) || country === "XX" || country === "T1") {
    return readSnapshot(env);
  }

  const seenKey = `seen:${await visitorHash(request, env.VISITOR_SALT || "")}`;
  const counts = await readSnapshot(env);
  if (await env.VISITORS.get(seenKey)) return counts;

  // KV has no atomic increment and throttles to one write per second per key,
  // so a burst of simultaneous first-visits can lose a count or throw. Neither
  // is worth failing the request over — the map still renders from what we
  // read, and approximate totals are the accepted trade for a free tier.
  counts[country] = (counts[country] || 0) + 1;
  try {
    await Promise.all([
      env.VISITORS.put(SNAPSHOT_KEY, JSON.stringify(counts)),
      env.VISITORS.put(seenKey, "1", { expirationTtl: DEDUPE_TTL }),
    ]);
  } catch {
    // write throttled — this visit goes uncounted rather than erroring out
  }
  return counts;
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(request) });
    }

    try {
      if (request.method === "POST" && pathname === "/hit") {
        return json(request, shape(await countVisit(request, env)));
      }

      if (request.method === "GET" && (pathname === "/stats" || pathname === "/")) {
        return json(request, shape(await readSnapshot(env)), 60);
      }
    } catch {
      // A KV hiccup must not surface as Cloudflare's error page: the page reads
      // this as JSON and would otherwise blank the whole panel.
      return json(request, { total: 0, countries: [], updated: null });
    }

    return new Response("Not found", { status: 404, headers: cors(request) });
  },
};
