# Prompt Engineering Studio

A free drag-and-drop studio for building reliable LLM **system prompts** from
labelled blocks (Role, Context, Task, Constraints, Chain-of-Thought, Output
Format, …). Pure static single-page React app — no backend, no accounts.
Everything the user writes stays in their browser (`localStorage`) or on their
own disk.

Live page: <https://www.oursharedcode.com/prompt-engineering-studio/>

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full requirement set.

## Features

- Block-based prompt editor with drag-and-drop, inline editing, placeholder
  chips, undo/redo (50 steps), live word/char count, prompt-health score and
  hallucination-risk badge.
- **Template blocks on the left** — 12 built-in technique blocks, each with a
  "Why?" tooltip, plus **custom blocks**: create (new), edit, delete, reorder,
  and **save / load** the whole custom-block library as a `blocks.json` file
  on your own disk.
- **Prompts save/load to local disk** — File System Access API when available,
  download fallback otherwise. Export as `.prompt` JSON, Python string,
  OpenAI/Anthropic messages JSON, Markdown, or plain text; load `.prompt` or
  plain text back.
- In-browser prompt library with colour-coded projects; template gallery of
  ready-made prompts; three themes (black / white / grey).
- Right rail: Google AdSense unit (top) and a live world map of visitors with
  per-country counts (bottom) — both optional and configured in one file.

## Local development

```bash
npm install
npm run dev        # http://localhost:5290
npm run build      # static site in ./dist
npm run preview    # http://localhost:4290
```

Ports are pinned in [`vite.config.js`](./vite.config.js) (5290 dev / 4290
preview) rather than left on Vite's defaults, which other projects on this
machine use. They are `strictPort`, so a clash fails loudly — a silently
drifted port would not be in the visitor-counter Worker's CORS allowlist and
the map would come up blank. Change a port in both places or dev breaks.

## One-file site configuration

Edit [`src/config.js`](./src/config.js):

| Key                | What to put there                                                              |
| ------------------ | ------------------------------------------------------------------------------ |
| `adsenseClient`    | The AdSense publisher ID — `ca-pub-1213781225888339`                           |
| `adsenseSlot`      | The slot ID of a vertical *Display ad* unit you create in AdSense               |
| `visitorStatsUrl`  | Base URL of the visitor-counter Worker (see *Visitor counter* below)            |

Until these are filled in, the page shows neutral placeholders in both spots.

> **`ads.txt` does not belong in this repo.** Google reads `ads.txt` only from
> the domain root — `www.oursharedcode.com/ads.txt` — and ignores any copy at a
> subpath, so a file here would never be read. It belongs in the root site repo
> (`oursharedcode.github.io`), where one file covers every page on the domain.
>
> **AdSense note:** Google approves the domain, not the page — and the site is
> registered as `oursharedcode.com`, not `www.oursharedcode.com`, which AdSense
> rejects as a subdomain. Approval covers the whole domain, but ads appear only
> on pages carrying the ad code — see
> [`docs/adsense-snippet.md`](https://github.com/oursharedcode/oursharedcode.github.io/blob/main/docs/adsense-snippet.md)
> in the root repo. Note the rail needs **both** `adsenseClient` and
> `adsenseSlot` before it renders an ad; the slot ID comes from an ad unit
> created in the dashboard once the site is approved.

## Visitor counter

The right rail's world map is not a third-party widget — it runs on data the
site owns. A small Cloudflare Worker
([`deploy/visitor-stats-worker.js`](./deploy/visitor-stats-worker.js)) reads
Cloudflare's own country header, keeps one tally per country in Workers KV, and
serves it as JSON; the page renders it with Google Charts **GeoChart** (free,
no API key) plus a ranked country list.

```bash
npm install -g wrangler
wrangler login
cd deploy
wrangler kv namespace create VISITORS   # paste the id into wrangler.toml
wrangler secret put VISITOR_SALT        # any long random string
wrangler deploy
```

Then set `visitorStatsUrl` in [`src/config.js`](./src/config.js) to the
deployed Worker URL (no trailing slash).

Notes:

- **No IP is ever stored.** Deduplication uses a salted SHA-256 of IP + user
  agent + date, kept for 12 hours, so one visitor counts once per half-day.
- **Counts are approximate.** KV has no atomic increment and throttles to one
  write per second per key, so simultaneous first-visits collapse into one
  count (a 10-request burst measured as +1). Visitors arriving seconds apart
  all register; only same-second bursts are lost. Exact counts would need a
  Durable Object — the accepted trade for staying on the free tier.
- **Free-tier ceiling.** KV allows 1,000 writes/day; each *new* visitor costs
  two, so the counter tops out around 500 unique visitors/day. Repeat views and
  everyone reading the map are reads (100,000/day), not writes.
- Allowed origins are listed at the top of the Worker — add any new host there
  or the browser will block the request.

## Deployment

### 1. GitHub Pages (build + hosting)

Pushing to `main` on `github.com/oursharedcode/prompt-engineering-studio` runs
[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which builds
the site and publishes `dist/` to GitHub Pages.

One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

The site is then live at
`https://oursharedcode.github.io/prompt-engineering-studio/`.

### 2. Custom domain path

The `oursharedcode` org's root Pages site
(`oursharedcode/oursharedcode.github.io`) already carries the verified custom
domain `www.oursharedcode.com`, so every project page of the org is served
under it automatically — this repo is live at
**`https://www.oursharedcode.com/prompt-engineering-studio/`** with no extra
configuration.

The path comes from the repository name and nothing else, because GitHub Pages
always serves a project site at its repo-name path. Renaming the repo is
therefore the whole mechanism for changing the URL: there is no redirect file
and no route configuration to keep in sync.

### 3. Cloudflare alternative (only if the domain moves to Cloudflare)

If `oursharedcode.com` is ever proxied through Cloudflare, the app can instead
be served *directly* at `/prompt-engineering-studio` by deploying
[`deploy/cloudflare-worker.js`](./deploy/cloudflare-worker.js) as a Worker on
the route `www.oursharedcode.com/prompt-engineering-studio*` (it proxies to
the GitHub Pages origin; the relative asset URLs make this work without any
HTML rewriting). Not needed with the current DNS setup, which points the
domain straight at GitHub Pages.

## File formats

| File          | Contents                                                            |
| ------------- | ------------------------------------------------------------------- |
| `*.prompt`    | JSON `{ version, exportedAt, wordCount, text }`                      |
| `blocks.json` | JSON `{ version, exportedAt, blocks: [{label, emoji, color, text}] }` |

Both are plain JSON — easy to read, diff, or hand-edit.

## Maintenance

The page is intentionally low-maintenance: no server, no database, two runtime
dependencies (react, react-dom). Routine edits touch only `src/config.js`.
