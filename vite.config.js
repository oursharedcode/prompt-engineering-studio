import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const guidesDir = resolve(root, "guides");

// Every guides/<slug>/index.html is a build entry, discovered rather than
// listed, so writing a new guide means adding a folder and nothing else.
//
// They are NOT in public/. That was the obvious home for hand-written HTML and
// it breaks the build: Vite 5 picks up .html under publicDir as extra input and
// then fails to resolve the inline <style> of the real index.html
// ("No matching HTML proxy module found"). Discovered 2026-09-07 by bisecting —
// the failure names index.html and says nothing about public/, so it is worth
// the paragraph. As proper entries the pages also get their stylesheet hashed
// and cache-busted, which a public/ copy would not.
const htmlEntries = { main: resolve(root, "index.html") };

if (existsSync(resolve(guidesDir, "index.html"))) {
  htmlEntries.guides = resolve(guidesDir, "index.html");
}

if (existsSync(guidesDir)) {
  for (const entry of readdirSync(guidesDir, { withFileTypes: true })) {
    const page = resolve(guidesDir, entry.name, "index.html");
    if (entry.isDirectory() && existsSync(page)) {
      htmlEntries[`guide-${entry.name}`] = page;
    }
  }
}

// base: "./" keeps every asset URL relative, so the same build works at
// https://oursharedcode.github.io/prompt-engineering-studio/, at
// https://www.oursharedcode.com/prompt-engineering-studio/, and at any other
// path the site is ever served from — no rebuild needed to move it. It also
// carries the guides, which sit one and two directories deeper than the studio.
// Ports are pinned away from Vite's defaults (5173/4173) because other projects
// on this machine use those. strictPort makes a clash fail loudly instead of
// drifting to a free port — a drifted port is not in the visitor-counter
// Worker's CORS allowlist, which would silently blank the map in dev.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { rollupOptions: { input: htmlEntries } },
  server: { port: 5290, strictPort: true },
  preview: { port: 4290, strictPort: true },
});
