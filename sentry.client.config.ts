// Sentry — client-side init.
// Lastes når en bruker åpner en route i nettleseren.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",

    // 10 % sampling i prod for tracing. 100 % errors.
    tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? 0.1 : 1.0,

    // PII-filter: ikke send request-body med form-data eller cookies.
    sendDefaultPii: false,

    // Ikke fang nettverksfeil mot tredjepart-domener.
    beforeSend(event) {
      // Filtrer ut e-postadresser fra error-meldinger som ekstra forsiktighet.
      if (event.message) {
        event.message = event.message.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
      }
      return event;
    },

    // Release tag (settes av Vercel Sentry-integrasjonen i prod)
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  });
}
