/**
 * Cron-job: avidentifiser soft-deleted bruker-konti etter 30 dager.
 * Kjører daglig kl. 03:30.
 *
 * P20 GDPR: brukere som har markert konto for sletting kan angre i 30 dager.
 *
 * ENDRET 2026-07-28 (Anders' beslutning): etter angrefristen SLETTES ikke
 * kontoen lenger — den anonymiseres. Treningsdataene beholdes, aggregert til
 * spillernivå (snittscore stemples), mens alle persondata og all fritekst
 * spilleren har skrevet vaskes bort.
 *
 * Grunnen til at data beholdes: treningshistorikk er grunnlaget for
 * akademiets utviklingsarbeid, og et slettet årskull ville etterlatt hull i
 * spillerutviklingen. Grunnen til at det er forsvarlig: etter vasken peker
 * radene ikke lenger på en person.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";
import { anonymiserBruker } from "@/lib/gdpr/anonymiser-bruker";
import { slettGamleFeillogger } from "@/lib/gdpr/slett-gamle-feillogger";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS = 30;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `cron-cleanup-deleted-accounts`, max: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }


  try {
    // Feillogg-retensjon (90 dager) kjører uansett om det finnes konti å
    // anonymisere — den er en egen forpliktelse fra personvernerklæringen.
    let feilloggSlettet = 0;
    try {
      feilloggSlettet = await slettGamleFeillogger();
    } catch (error) {
      await logError({ context: "cron.cleanup-deleted-accounts.feillogg", error });
    }

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const kandidater = await prisma.user.findMany({
      where: {
        deletedAt: { lt: cutoff, not: null },
        // Allerede anonymiserte konti er ferdigbehandlet — hopp over dem.
        anonymisertAt: null,
      },
      select: { id: true, email: true, deletedAt: true },
      take: 100,
    });

    if (kandidater.length === 0) {
      return NextResponse.json({ ok: true, anonymisert: 0, feilloggSlettet });
    }

    // Én konto om gangen: en feil på én skal ikke stoppe resten, og hver
    // anonymisering er idempotent så en delvis kjøring kan trygt gjentas.
    let anonymisert = 0;
    const feilet: string[] = [];
    for (const bruker of kandidater) {
      try {
        await anonymiserBruker(bruker.id);
        anonymisert++;
      } catch (error) {
        feilet.push(bruker.id);
        await logError({
          context: "cron.cleanup-deleted-accounts.anonymiser",
          error,
          userId: bruker.id,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      anonymisert,
      feilloggSlettet,
      feilet: feilet.length,
      ids: kandidater.map((u) => u.id),
    });
  } catch (error) {
    await logError({
      context: "cron.cleanup-deleted-accounts",
      error,
      severity: "error",
    });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
