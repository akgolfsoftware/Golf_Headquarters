// Serwist configurator-modus (Turbopack-kompatibel).
// `serwist build serwist.config.mjs` kjøres etter `next build` og bundler
// src/app/sw.ts med esbuild + injiserer precache-manifestet i public/sw.js.
// Bakgrunn: @serwist/next sin webpack-plugin kjører aldri under Turbopack,
// så sw.js ble aldri generert i prod (404). Se plan-sw-js-fiks i git-historikk.
import { serwist } from "@serwist/next/config";

export default serwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // public/ er ~19 MB (523 filer) — precache kun det små/kritiske.
  // Tunge bildemapper ekskluderes; de dekkes av runtime-caching
  // (StaleWhileRevalidate for bilder via defaultCache i src/app/sw.ts).
  globIgnores: [
    "public/images/**",
    "public/design-handover/**",
    "public/splash/**",
    "public/team-gfgk/**",
  ],
});
