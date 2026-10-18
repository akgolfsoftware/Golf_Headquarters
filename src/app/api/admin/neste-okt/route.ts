// Coachens neste økt i dag, til kortet i AgencyOS-menyen.
// Samme utvalg som Cockpit (daily-brief-data): egne bookinger for coach, alle for admin.
// Svarer { okt: null } når det ikke er flere økter i dag; menyen viser da «—».

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { lagNesteOktKort } from "@/lib/agencyos/neste-okt";
import { prisma } from "@/lib/prisma";
import { endOfDay } from "@/lib/uke-helpers";

export const runtime = "nodejs";

export async function GET() {
  const coach = await getCurrentUser();
  if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const now = new Date();
  const booking = await prisma.booking.findFirst({
    where: {
      endAt: { gt: now },
      startAt: { lt: endOfDay(now) },
      status: { in: ["CONFIRMED", "PENDING"] },
      ...(coach.role === "ADMIN"
        ? {}
        : {
            OR: [
              { coachId: coach.id },
              { serviceType: { coachUserId: coach.id } },
              { user: coachScopedPlayerWhere(coach) },
            ],
          }),
    },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      startAt: true,
      notes: true,
      guestName: true,
      user: { select: { name: true } },
      serviceType: { select: { name: true } },
      location: { select: { name: true } },
      facility: { select: { name: true } },
    },
  });

  return NextResponse.json(
    { okt: booking ? lagNesteOktKort(booking) : null },
    { headers: { "cache-control": "private, no-store" } },
  );
}
