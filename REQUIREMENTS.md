# Prompt Engineering Studio — Requirements

Scope: the **system-prompt-engineering** functionality of the original Prompt
Studio, and nothing else. The specs, steering, and skills features of the old
project are explicitly **out of scope** and were removed.

## 1. Purpose

A free, static, single-page web app for composing reliable LLM system prompts
from labelled building blocks. No backend, no accounts, no telemetry of prompt
content: everything the user writes stays in their browser or on their own disk.

## 2. Functional requirements

### 2.1 Prompt editor

- FR-1 The editor SHALL present the prompt as an ordered list of editable
  block rows; each row is independently editable inline (contenteditable).
- FR-2 The user SHALL be able to drag a template block from the left sidebar
  and drop it at any position in the editor; a drop-position indicator SHALL
  show where the block will land.
- FR-3 Template placeholders written as `[UPPERCASE_TOKENS]` SHALL render as
  clickable chips; clicking a chip SHALL open an inline input that substitutes
  the value into the block text.
- FR-4 The editor SHALL support undo/redo with at least 50 history steps,
  bound to Ctrl+Z / Ctrl+Y (and Ctrl+Shift+Z).
- FR-5 The editor SHALL show a live word count and character count.
- FR-6 A prompt-health indicator SHALL score the prompt in real time based on
  the presence of key techniques (role, context, task, constraints,
  chain-of-thought, output format, examples, self-verification), and a
  hallucination-risk badge SHALL reflect missing grounding / constraints /
  uncertainty blocks.

### 2.2 Template blocks (left sidebar)

- FR-7 The sidebar SHALL offer the built-in prompt blocks: Role, Context,
  Task, Constraints, Think Step-by-Step, Output Format, Few-Shot Examples,
  Self-Verify, Tone & Style, Grounding, Uncertainty, Separator. Each SHALL
  carry a "Why?" tooltip explaining the underlying technique.
- FR-8 **Custom blocks — new:** the user SHALL be able to create a custom
  block with label, emoji, colour, and template text; edit and delete existing
  custom blocks; and reorder them by drag-and-drop.
- FR-9 **Custom blocks — save:** the user SHALL be able to save the custom
  block library to a local file (`blocks.json`) chosen by them.
- FR-10 **Custom blocks — load:** the user SHALL be able to load a
  `blocks.json` file from disk; when loading would overwrite existing custom
  blocks, the app SHALL ask for confirmation first, and invalid files SHALL
  produce a readable validation error, never data loss.

### 2.3 Local disk input/output for prompts

- FR-11 **Save:** the user SHALL be able to save the composed prompt to a
  local file. WHEN the browser supports the File System Access API
  (`showSaveFilePicker`) the app SHALL use it so the user picks name and
  location; otherwise it SHALL fall back to a standard browser download.
- FR-12 **Export formats:** `.prompt` (JSON with `{version, exportedAt,
  wordCount, text}`), Python string literal, OpenAI/Anthropic `messages`
  JSON, Markdown, and plain text.
- FR-13 **Load:** the user SHALL be able to load a `.prompt` file from disk
  via a file picker; a plain-text file SHALL also load as raw prompt text.
- FR-14 Copy-to-clipboard of the full prompt SHALL be available at all times.
- FR-15 Between sessions, prompts saved to the in-app library and the custom
  block library SHALL persist in browser `localStorage`. No data SHALL ever be
  sent to a server.

### 2.4 Prompt library and template gallery

- FR-16 The user SHALL be able to save named prompts to an in-browser
  library, organise them into colour-coded projects, reload and delete them.
- FR-17 A template gallery SHALL provide ready-made prompts (summarise a
  document, write a PRD, meeting notes, review a technical spec, issue-tracker
  analysis, release notes), each with a filled example and a placeholder
  template.

### 2.5 Page layout, ads, and visitor map

- FR-18 The studio SHALL occupy the left two thirds of the page; the right
  third SHALL be a vertical rail.
- FR-19 The top of the rail SHALL host a Google AdSense display unit,
  configured via `src/config.js` (`adsenseClient`, `adsenseSlot`); while
  unconfigured, a neutral placeholder SHALL keep the layout stable. `ads.txt`
  is NOT part of this repository — Google reads it only from the domain root,
  so it lives in `oursharedcode.github.io`.
- FR-20 Below the ad, the rail SHALL host a small world map plus a ranked list
  of visitor counts by country, sourced from a Cloudflare Worker
  (`deploy/visitor-stats-worker.js`) configured via `src/config.js`
  (`visitorStatsUrl`); while unconfigured, a neutral placeholder SHALL appear.
- FR-20a The counter SHALL derive country from Cloudflare's request geo header,
  SHALL count a visitor at most once per 12 hours, and SHALL NOT store IP
  addresses — only a salted, dated hash used for that deduplication.
- FR-21 On screens narrower than 900 px the rail SHALL drop below the studio
  instead of compressing it.

### 2.6 Written content

Added September 2026. The site is not only a tool: an AdSense review of the
domain returned *Low value content* while the studio page carried 53 crawlable
words, everything on it being drawn by React after load.

- FR-22 The studio page SHALL carry substantive prose in the served HTML,
  outside the React root, readable without executing JavaScript. It SHALL be
  ordinary visible content — not hidden, clipped, or positioned off-screen.
- FR-23 The repository SHALL hold a set of written guides on system-prompt
  engineering as static HTML under `guides/<slug>/index.html`, with an index at
  `guides/index.html`, sharing one stylesheet.
- FR-24 The build SHALL discover guide pages automatically, so that adding one
  requires creating a directory and nothing else.
- FR-25 Every guide SHALL carry a title, a byline, a canonical URL, a meta
  description, and footer links to the studio, the guides index, and the site's
  About, Contact and Privacy pages.
- FR-26 Guides SHALL be written in first person from the author's own
  experience, SHALL state where a technique stops working, and SHALL NOT contain
  invented statistics. Where no figure is known the text SHALL say so rather
  than supply one.

## 3. Non-functional requirements

- NFR-1 Pure static site: `npm run build` SHALL emit a self-contained `dist/`
  deployable to GitHub Pages or Cloudflare with no server code and no
  environment variables.
- NFR-2 All asset URLs SHALL be relative (`vite base "./"`), so the identical
  build works at `oursharedcode.github.io/prompt-engineering-studio/` and at
  `www.oursharedcode.com/prompt-engineering-studio/`. This SHALL hold for the
  guide pages too, which sit one and two directories deeper than the studio.
- NFR-3 Low maintenance: the app is rarely edited; the only routinely edited
  file is `src/config.js`. Dependencies are limited to React + Vite. Written
  content is the exception — guides are expected to be added over time, and
  doing so SHALL not require touching the build configuration.
- NFR-4 Three visual themes (black / white / grey) SHALL be switchable in-app.
- NFR-5 Works in current Chrome, Edge, and Firefox; save falls back gracefully
  where the File System Access API is unavailable.

## 4. Out of scope

- Kiro feature specs (requirements/design/tasks blocks) — removed.
- Kiro steering documents (product/tech/structure blocks) — removed.
- Agent Skills (SKILL.md templates, skill zip export, Bitbucket skill
  browser/import) — removed.
- Any backend, authentication, analytics of prompt content, or database.
- **Translating the guides.** Machine-translated bulk falls under Google's
  scaled-content-abuse policy and would flatten the voice FR-26 requires. If
  anything on the domain is ever translated it is the site's About page, into
  the same locales as the books, reviewed by a human.
