import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
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
