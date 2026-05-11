// Next.js 16 instrumentation hook — kjøres ved oppstart av server.
// Brukes til å initialisere Sentry i riktig runtime.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Fanger uncaught errors fra Server Components / Route Handlers.
// Next 16 instrumentation hook — bruker Sentry sin signatur direkte.
export const onRequestError: typeof import("@sentry/nextjs").captureRequestError =
  async (...args) => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(...args);
  };
