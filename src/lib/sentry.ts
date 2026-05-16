// Sentry-stub — aktiver med `npm install @sentry/nextjs` og NEXT_PUBLIC_SENTRY_DSN
// Når DSN er satt i miljøvariabler vil alle kall logges til konsollen i prod
// inntil full @sentry/nextjs-integrasjon er installert.

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    // TODO: bytt ut med Sentry.captureException(error, { extra: context })
    // etter `npm install @sentry/nextjs` og sentry.client.config.ts er opprettet
    console.error("[Sentry stub]", error, context);
  }
}
