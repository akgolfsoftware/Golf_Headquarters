// GET /api/recording/status?recordingId=…
// Lettvekts-poll for /admin/recording: forteller klienten hvor i kjeden
// (transkribering → analyse) et opptak står, uten å sende hele transkripsjonen
// over nettet hvert 5. sekund.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `recording-status:${user.id}`, max: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }


  const recordingId = new URL(req.url).searchParams.get("recordingId");
  if (!recordingId) {
    return NextResponse.json({ error: "Mangler recordingId" }, { status: 400 });
  }

  const rec = await prisma.sessionRecording.findUnique({
    where: { id: recordingId },
    select: {
      id: true,
      uploadedById: true,
      status: true,
      transcript: true,
      aiAnalysis: true,
    },
  });
  if (!rec) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }
  if (rec.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }

  return NextResponse.json({
    recordingId: rec.id,
    status: rec.status,
    harTranskripsjon: !!rec.transcript?.trim(),
    harAnalyse: rec.aiAnalysis !== null,
  });
}
