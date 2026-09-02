/**
 * Cron-job: friskner opp `dashboard.mv_topar_grunnlag`.
 *
 * Viewet (STEG 16.1, `scripts/lag-topar-grunnlag-2026-08-30.ts`) er MATERIALISERT
 * fordi et vanlig view over 942 299 runder tidsavbrøt på en enkel telling — men
 * det betyr at snapshotet fryser til noen kjører refresh manuelt. Denne jobben
 * er den manglende oppfriskningen (dokumentert som "gjenstår" i MASTERPLAN 16.1).
 *
 * CONCURRENTLY krever en unik indeks på viewet (finnes: mv_topar_grunnlag_entry_idx
 * på entry_id) og lar spørringer lese det gamle snapshotet mens refresh pågår —
 * ingen nedetid for skjermer som senere leser viewet.
 *
 * Kjøres nattlig via Vercel Cron. Beskyttet med CRON_SECRET (fail-closed).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";
import { avvisUgyldigCron } from "@/lib/cron/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const avvist = avvisUgyldigCron(req);
  if (avvist) return avvist;
  const rl = await rateLimit({ key: "cron-refresh-topar-grunnlag", max: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  try {
    await prisma.$executeRawUnsafe(
      "REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard.mv_topar_grunnlag",
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError({
      context: "cron.refresh-topar-grunnlag",
      error,
      severity: "error",
    });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
