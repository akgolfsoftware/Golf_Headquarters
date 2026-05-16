// POST /api/recording/start
// Oppretter en SessionRecording for en booking. Validerer at innlogget bruker
// er coach på booking.serviceType eller ADMIN. Returnerer { recordingId }.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  bookingId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    select: {
      id: true,
      userId: true,
      serviceType: { select: { coachUserId: true } },
    },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking finnes ikke" }, { status: 404 });
  }

  const coachId = booking.serviceType.coachUserId;
  if (user.role !== "ADMIN" && coachId && coachId !== user.id) {
    return NextResponse.json(
      { error: "Du er ikke coach på denne booking" },
      { status: 403 },
    );
  }

  const recording = await prisma.sessionRecording.create({
    data: {
      bookingId: booking.id,
      uploadedById: user.id,
      playerId: booking.userId,
      status: "RECORDING",
    },
    select: { id: true },
  });

  await audit({
    actorId: user.id,
    action: "recording.started",
    target: `SessionRecording:${recording.id}`,
    metadata: { bookingId: booking.id, playerId: booking.userId },
  });

  return NextResponse.json({ recordingId: recording.id });
}
