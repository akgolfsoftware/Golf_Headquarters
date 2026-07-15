"use server";

import { logError } from "@/lib/error-tracking";

/**
 * Server action kalt fra global-error.tsx/error.tsx (klient-feilgrenser).
 * Disse kan ikke importere error-tracking.ts direkte ("server-only" + Prisma),
 * så de går via denne actionen for å faktisk trigge Slack/e-post-varsling.
 */
export async function reportClientError(input: {
  context: string;
  message: string;
  stack?: string;
  digest?: string;
}): Promise<void> {
  const error = input.stack
    ? Object.assign(new Error(input.message), { stack: input.stack })
    : input.message;

  await logError({
    context: input.context,
    error,
    meta: input.digest ? { digest: input.digest } : undefined,
    severity: "fatal",
  });
}
