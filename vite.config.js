import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps every asset URL relative, so the same build works at
// https://oursharedcode.github.io/prompt-engineering-studio/, at
// https://www.oursharedcode.com/prompt-engineering-studio/, and at any other
// path the site is ever served from — no rebuild needed to move it.
// Ports are pinned away from Vite's defaults (5173/4173) because other projects
// on this machine use those. strictPort makes a clash fail loudly instead of
// drifting to a free port — a drifted port is not in the visitor-counter
// Worker's CORS allowlist, which would silently blank the map in dev.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5290, strictPort: true },
  preview: { port: 4290, strictPort: true },
});
