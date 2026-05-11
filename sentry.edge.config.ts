// Sentry — edge runtime init.
// Vi bruker ikke edge i akgolf-hq (Next 16 proxy kjører på nodejs),
// men Sentry krever filen for å unngå warning.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: 0,
  });
}
