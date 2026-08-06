/**
 * Cron-job: slett feillogger eldre enn 90 dager.
 *
 * `ErrorLog` kan inneholde personopplysninger (stack traces + `meta` med
 * bookingId/sessionId, og `userId`). GDPR-lagringsminimering krever at de ikke
 * ligger på ubestemt tid. 90 dager er nok til feilsøking/incident-analyse og
 * matcher løftet i personvernerklæringen.
 *
 * Kjøres daglig via Vercel Cron. Beskyttet med CRON_SECRET (fail-closed).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS = 90;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `cron-cleanup-error-logs`, max: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }


  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const res = await prisma.errorLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return NextResponse.json({ ok: true, slettet: res.count });
  } catch (error) {
    await logError({
      context: "cron.cleanup-error-logs",
      error,
      severity: "error",
    });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
