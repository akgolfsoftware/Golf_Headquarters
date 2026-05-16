// POST /api/recording/complete
// Body: { recordingId, durationSec }. Merger alle chunks til final.webm,
// setter status=PROCESSING, completedAt, retentionUntil (+90 dager).
// V2: trigger transkribering/AI-analyse her.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { audit } from "@/lib/audit";

const BUCKET = "coaching-recordings";
const RETENTION_DAYS = 90;

const Body = z.object({
  recordingId: z.string().min(1),
  durationSec: z.number().int().nonnegative(),
});

type ChunkEntry = { idx: number; path: string; size: number };

function isChunkArray(value: unknown): value is ChunkEntry[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (v) =>
      v !== null &&
      typeof v === "object" &&
      typeof (v as { idx?: unknown }).idx === "number" &&
      typeof (v as { path?: unknown }).path === "string",
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
  }
  const { recordingId, durationSec } = parsed.data;

  const recording = await prisma.sessionRecording.findUnique({
    where: { id: recordingId },
    select: {
      id: true,
      uploadedById: true,
      status: true,
      chunks: true,
      bookingId: true,
      playerId: true,
    },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording finnes ikke" }, { status: 404 });
  }
  if (recording.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }

  const chunks = isChunkArray(recording.chunks) ? recording.chunks : [];
  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "Ingen chunks å merge" },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  const sorted = [...chunks].sort((a, b) => a.idx - b.idx);
  const buffers: Buffer[] = [];

  for (const c of sorted) {
    const { data, error } = await admin.storage.from(BUCKET).download(c.path);
    if (error || !data) {
      console.error("[recording] kunne ikke laste chunk", c.path, error);
      return NextResponse.json(
        { error: `Mangler chunk ${c.idx}` },
        { status: 500 },
      );
    }
    buffers.push(Buffer.from(await data.arrayBuffer()));
  }

  const merged = Buffer.concat(buffers);
  const finalPath = `${recording.uploadedById}/${recording.id}/final.webm`;

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(finalPath, merged, {
      contentType: "audio/webm",
      upsert: true,
    });
  if (uploadErr) {
    console.error("[recording] final upload feilet", uploadErr);
    return NextResponse.json(
      { error: `Storage-feil: ${uploadErr.message}` },
      { status: 500 },
    );
  }

  const completedAt = new Date();
  const retentionUntil = new Date(completedAt);
  retentionUntil.setDate(retentionUntil.getDate() + RETENTION_DAYS);

  await prisma.sessionRecording.update({
    where: { id: recording.id },
    data: {
      audioUrl: finalPath,
      durationSec,
      status: "PROCESSING",
      completedAt,
      retentionUntil,
    },
  });

  await audit({
    actorId: user.id,
    action: "recording.completed",
    target: `SessionRecording:${recording.id}`,
    metadata: {
      bookingId: recording.bookingId,
      playerId: recording.playerId,
      durationSec,
      chunkCount: sorted.length,
    },
  });

  // V2: trigge transkribering (Whisper) i bakgrunnen — fire-and-forget.
  // V3 AI-analyse trigges automatisk fra /api/recording/transcribe når
  // transcript er lagret.
  try {
    const transcribeUrl = new URL(
      "/api/recording/transcribe",
      req.url,
    ).toString();
    fetch(transcribeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ recordingId: recording.id }),
    }).catch((e) => {
      console.error("[complete] kunne ikke trigge transcribe:", e);
    });
  } catch (e) {
    console.error("[complete] feil ved trigging av transcribe:", e);
  }

  return NextResponse.json({ ok: true, recordingId: recording.id });
}
