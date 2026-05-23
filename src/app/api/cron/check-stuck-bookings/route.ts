/**
 * Cron-job: sjekk for stuck bookings.
 * Kjører hver 15. min via Vercel Cron.
 *
 * Booking-flyt: PENDING -> CONFIRMED ved Stripe webhook.
 * Hvis booking er PENDING > 30 min: Stripe-webhook har sannsynligvis feilet.
 * Send Slack-alert til coach + Anders for manuell oppfølging.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSlackAlert } from "@/lib/slack-alert";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STUCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 min

export async function GET(req: Request): Promise<NextResponse> {
  // Beskytt cron-endpoint
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MS);

    const stuckBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: cutoff },
      },
      select: {
        id: true,
        createdAt: true,
        priceOre: true,
        stripeCheckoutSessionId: true,
        guestEmail: true,
      },
      take: 50,
      orderBy: { createdAt: "asc" },
    });

    if (stuckBookings.length === 0) {
      return NextResponse.json({ ok: true, stuck: 0 });
    }

    // Send én samlet alert
    await sendSlackAlert({
      title: `${stuckBookings.length} stuck bookings (PENDING > 30 min)`,
      message: `Stripe webhook har sannsynligvis feilet for disse bookingene. Manuell oppfølging trengs.`,
      meta: {
        count: stuckBookings.length,
        oldest: stuckBookings[0]?.createdAt.toISOString(),
        ids: stuckBookings.map((b) => b.id).join(", "),
      },
    });

    return NextResponse.json({
      ok: true,
      stuck: stuckBookings.length,
      ids: stuckBookings.map((b) => b.id),
    });
  } catch (error) {
    await logError({
      context: "cron.check-stuck-bookings",
      error,
      severity: "error",
    });
    return NextResponse.json(
      { error: "internal error" },
      { status: 500 },
    );
  }
}
