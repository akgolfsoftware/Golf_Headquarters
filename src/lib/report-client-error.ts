/**
 * Klient-side feilrapportering til logError-pipen.
 *
 * error.tsx / global-error.tsx kan ikke importere error-tracking.ts
 * (server-only + Prisma). De poster herfra til /api/client-error, som
 * kaller logError (console + ErrorLog + Slack/Telegram ved error/fatal).
 *
 * keepalive: true slik at rapporten rekker fram også ved reload/navigering.
 * Aldri kast — rapportering skal ikke krasje feilsiden selv.
 */

export type ReportClientErrorInput = {
  context: string;
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
};

export async function reportClientError(
  input: ReportClientErrorInput,
): Promise<void> {
  try {
    const body = {
      context: (input.context || "client-error").slice(0, 200),
      message: (input.message || "Ukjent klientfeil").slice(0, 2000),
      stack: input.stack?.slice(0, 8000),
      digest: input.digest?.slice(0, 200),
      url:
        input.url?.slice(0, 500) ??
        (typeof window !== "undefined"
          ? window.location.href.slice(0, 500)
          : undefined),
    };

    await fetch("/api/client-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Rapportering skal aldri krasje feilsiden
  }
}
