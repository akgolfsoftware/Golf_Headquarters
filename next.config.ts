import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Lås Turbopack-root til denne katalogen — uten dette feiler CSS-resolve
  // og dev-server kan havne i compile/render-loop (jf. CLAUDE.md gotcha).
  turbopack: {
    root: import.meta.dirname,
  },
};

// Sentry wrapping — kjører bare med upload av source-maps hvis
// SENTRY_AUTH_TOKEN er satt (i prod via Vercel). Lokalt er den no-op.
export default withSentryConfig(nextConfig, {
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
