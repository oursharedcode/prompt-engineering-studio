// ─── Site configuration ──────────────────────────────────────────────────────
// The only file you need to edit after registering with Google AdSense and a
// visitor-map provider. Leave a value empty ("") and the page shows a neutral
// placeholder in its spot instead.

export const CONFIG = {
  // Google AdSense publisher ID, e.g. "ca-pub-1234567890123456".
  // Get it at https://adsense.google.com after your site is approved.
  // Also update public/ads.txt with the same ID (without the "ca-" prefix).
  adsenseClient: "",

  // AdSense ad-unit slot ID for the vertical ad, e.g. "1234567890".
  // Create a "Display ad" unit (vertical) in AdSense → Ads → By ad unit.
  adsenseSlot: "",

  // Base URL of the visitor-counter Worker deployed from
  // deploy/visitor-stats-worker.js, e.g.
  // "https://promengi-visitor-stats.<subdomain>.workers.dev" (no trailing slash).
  // It tallies visitors by country and feeds the world map in the right rail.
  visitorStatsUrl: "https://promengi-visitor-stats.oursharedcode.workers.dev",
};
