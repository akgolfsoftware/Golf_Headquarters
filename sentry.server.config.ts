// Sentry — server-side init.
// Lastes i Node.js-runtime (Server Components, Route Handlers, Server Actions).

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,

    beforeSend(event) {
      // Filtrer ut e-postadresser fra exception-meldinger.
      if (event.message) {
        event.message = event.message.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
      }
      if (event.exception?.values) {
        for (const exc of event.exception.values) {
          if (exc.value) {
            exc.value = exc.value.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
          }
        }
      }
      // Drop Stripe webhook bodies — kan inneholde betalingsinfo.
      if (event.request?.data) {
        delete event.request.data;
      }
      return event;
    },

    release: process.env.SENTRY_RELEASE,
  });
}
