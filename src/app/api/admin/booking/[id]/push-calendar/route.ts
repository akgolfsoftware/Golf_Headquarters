/**
 * Admin-only: trigger manuell push av booking til Google Calendar.
 * Brukes for å re-syncke etter webhook-feil eller for manuell debug.
 */
import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { pushBookingToCalendar } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, status: true, googleEventId: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking ikke funnet" }, { status: 404 });
  }

  try {
    await pushBookingToCalendar(id);
    const refreshed = await prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true, googleEventId: true },
    });
    return NextResponse.json({
      ok: true,
      admin: user.email,
      before: booking,
      after: refreshed,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg, stack: err instanceof Error ? err.stack : null },
      { status: 500 },
    );
  }
}
