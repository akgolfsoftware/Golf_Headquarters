import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // Lås Turbopack-root til denne katalogen — uten dette feiler CSS-resolve
  // og dev-server kan havne i compile/render-loop (jf. CLAUDE.md gotcha).
  turbopack: {
    root: import.meta.dirname,
  },
};

// PWA service worker via Serwist. Genererer /sw.js fra src/app/sw.ts.
// Disabled i dev for å unngå caching-overraskelser ved HMR.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const withPwa = withSerwist(nextConfig);

// Sentry wrapping — kjører bare med upload av source-maps hvis
// SENTRY_AUTH_TOKEN er satt (i prod via Vercel). Lokalt er den no-op.
export default withSentryConfig(withPwa, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Disable kilde-map upload hvis token mangler (dev / preview uten secret).
  silent: !process.env.CI,

  // Upload større chunks i én batch.
  widenClientFileUpload: true,

  // Don't tunnel — bruker direkte Sentry-CDN (ingen ad-blocker som blokkerer akgolf.no).
  tunnelRoute: undefined,
});
