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
- **Static prose under the app** and **ten written guides** at
  [`/guides/`](./guides/) — see *Written content* below. These are plain HTML,
  not React, and are the reason the site is more than a tool.

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

## Written content

Two pieces of the site are hand-written HTML rather than React, added in
September 2026 after AdSense reviewed the domain and returned *Low value
content*. The studio page had 53 crawlable words at the time — everything on it
was drawn by React after load, so a reviewer or a crawler that does not run
JavaScript saw an empty `<div>`.

**1. Prose under the app.** [`index.html`](./index.html) carries ~730 words
below `<div id="root">`: what the studio is for, which of the twelve blocks
actually change an answer, how the health score is weighted, what the page
deliberately does not do. React owns `#root` and nothing else, so this survives
every render with no wrapper and no portal. It is ordinary visible content —
scroll past the studio and you read it — not hidden text propped up for a
crawler. Its styling lives in [`src/page-notes.css`](./src/page-notes.css).

**2. Ten guides** under [`guides/`](./guides/), ~14,000 words, on writing system
prompts. Each is a self-contained `guides/<slug>/index.html` sharing
[`guides/guide.css`](./guides/guide.css), with [`guides/index.html`](./guides/index.html)
listing them. They are live at
`https://www.oursharedcode.com/prompt-engineering-studio/guides/`.

### Adding a guide

Create `guides/<slug>/index.html`, copy the head and footer of an existing one,
and build. **That is the whole procedure** — [`vite.config.js`](./vite.config.js)
discovers every `guides/*/index.html` with a `readdir` and registers it as a
build entry, so there is no list to keep in sync.

Two build traps are worth knowing before you move these files, because both cost
an hour and neither error message points at the real cause:

- **Do not put the HTML in `public/`.** Vite 5 picks up `.html` under
  `publicDir` as extra input and the build then fails to resolve the inline
  `<style>` of the real `index.html`, reporting
  `No matching HTML proxy module found` against `index.html` with no mention of
  `public/` at all.
- **Do not use inline `<style>` blocks in any page.** With several HTML entries
  the `vite:html-inline-proxy` plugin intermittently fails to resolve one, which
  is why a single guide built fine and six did not. Both stylesheets are linked
  files for this reason; keep them that way.

Guides are also written to a house style, which matters more than it sounds:
first person, an opening that names a specific failure, an honest account of
where each technique stops working, and no invented statistics. Guide 1 argues
with the studio page about negations and then resolves the contradiction rather
than quietly dropping one side. Match that or the set stops reading as one
person's work.

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
>
> **Approval status (8 September 2026): not approved.** The first review came
> back *Low value content* on 7 September. The domain has since grown from 4
> pages and ~4,300 crawlable words to 13 pages and ~13,300, most of it the
> guides in this repo. A re-review has **not** been requested yet — the plan is
> to wait until Google Search Console shows the guides indexed, then request it
> from AdSense → Sites. As part of preparing for that re-review the studio
> page's visitor tally is now hidden below 250 — see *Visitor counter* below.
> Until approval lands, `adsenseClient` and `adsenseSlot` stay empty and no ad
> code runs anywhere on the domain.

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

- **Small tallies stay hidden.** Below `REVEAL_AT` (250) in
  [`src/VisitorMap.jsx`](./src/VisitorMap.jsx) the rail shows the shaded map
  and a plain "VISITORS BY COUNTRY" label; the total, the country count and the
  ranked list appear only once the total passes it. Counting is unaffected, so
  the figures return on their own. This exists because the page was carrying
  "11 VISITORS" — eight of them the author reloading the site — on the one
  page Google had just rejected for *Low value content*.
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
