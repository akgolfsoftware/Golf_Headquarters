/**
 * Cron-job: minimer gjeste-kontaktdata på gamle bookinger.
 *
 * Bookinger uten brukerkonto (guest checkout) lagrer `guestName`, `guestEmail`
 * og `guestPhone`. Selve booking-raden må bestå (regnskap — 5 år iht.
 * bokføringsloven), men gjeste-kontakt-PII trengs ikke ut over en rimelig
 * periode etter at timen er gjennomført. GDPR-lagringsminimering: vi vasker
 * kontaktfeltene 365 dager etter `endAt` og beholder de avidentifiserte
 * finans-/transaksjonsfeltene (pris, Stripe-ID-er, tidspunkt).
 *
 * Kjøres ukentlig via Vercel Cron. Beskyttet med CRON_SECRET (fail-closed).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS = 365;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const res = await prisma.booking.updateMany({
      where: {
        endAt: { lt: cutoff },
        // Kun rader som fortsatt bærer gjeste-kontakt (idempotent: allerede
        // vaskede rader har guestEmail = null og treffes ikke igjen).
        guestEmail: { not: null },
      },
      data: { guestName: null, guestEmail: null, guestPhone: null },
    });
    return NextResponse.json({ ok: true, vasket: res.count });
  } catch (error) {
    await logError({
      context: "cron.cleanup-guest-bookings",
      error,
      severity: "error",
    });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
