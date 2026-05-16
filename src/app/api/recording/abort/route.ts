// POST /api/recording/abort
// Setter status=ABORTED. Beholder chunks for evt. manuell gjenoppretting.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  recordingId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
  }

  const recording = await prisma.sessionRecording.findUnique({
    where: { id: parsed.data.recordingId },
    select: { id: true, uploadedById: true, bookingId: true, status: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording finnes ikke" }, { status: 404 });
  }
  if (recording.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }
  if (recording.status === "DONE" || recording.status === "PROCESSING") {
    return NextResponse.json(
      { error: `Kan ikke avbryte recording med status ${recording.status}` },
      { status: 409 },
    );
  }

  await prisma.sessionRecording.update({
    where: { id: recording.id },
    data: { status: "ABORTED", completedAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "recording.aborted",
    target: `SessionRecording:${recording.id}`,
    metadata: { bookingId: recording.bookingId },
  });

  return NextResponse.json({ ok: true });
}
