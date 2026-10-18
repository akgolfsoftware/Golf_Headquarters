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
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { hentLydSamtykkeStatus } from "@/lib/recording/lyd-samtykke";
import { checkedRecordingChunks, recordingFormat } from "@/lib/recording/chunk-contract";

const BUCKET = "coaching-recordings";
const RETENTION_DAYS = 90;

const Body = z.object({
  recordingId: z.string().min(1),
  durationSec: z.number().int().min(0).max(43200).optional(),
  expectedChunks: z.number().int().min(1).max(1441),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }
  if (user.role !== "COACH" && user.role !== "ADMIN") return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  const rl = await rateLimit({ key: `recording-complete:${user.id}`, max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
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
      updatedAt: true,
      audioUrl: true,
    },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording finnes ikke" }, { status: 404 });
  }
  if (recording.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }
  if (!recording.playerId || !(await harCoachTilgangTilSpiller(user, recording.playerId))
    || !(await hentLydSamtykkeStatus(recording.playerId)).tillatt)
    return NextResponse.json({ error: "Mangler gjeldende tilgang eller lydsamtykke" }, { status: 403 });
  if (["PROCESSING", "DONE"].includes(recording.status) && recording.audioUrl)
    return NextResponse.json({ ok: true, recordingId: recording.id });
  if (recording.status !== "RECORDING") return NextResponse.json({ error: "Opptaket kan ikke fullføres i denne tilstanden" }, { status: 409 });

  const chunks = checkedRecordingChunks(recording.chunks, recording.uploadedById, recording.id, parsed.data.expectedChunks);
  if (!chunks) {
    return NextResponse.json(
      { error: "ufullstendig-lyd", message: "Alle registrerte lydbiter er ikke bekreftet. Last opp ventende lyd og prøv igjen." },
      { status: 409 },
    );
  }

  const admin = supabaseAdmin();
  const sorted = [...chunks].sort((a, b) => a.idx - b.idx);
  const buffers: Buffer[] = [];

  for (const c of sorted) {
    const { data, error } = await admin.storage.from(BUCKET).download(c.path);
    if (error || !data) {
      await logError({ context: "recording.complete.last-chunk", error, meta: { recordingId: recording.id, chunkIdx: c.idx, chunkPath: c.path } });
      return NextResponse.json(
        { error: `Mangler chunk ${c.idx}` },
        { status: 500 },
      );
    }
    buffers.push(Buffer.from(await data.arrayBuffer()));
  }

  const merged = Buffer.concat(buffers);
  const format = recordingFormat(sorted[0].mimeType ?? "audio/webm")!;
  const finalPath = `${recording.uploadedById}/${recording.id}/final-${recording.updatedAt.getTime()}.${format.extension}`;

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(finalPath, merged, {
      contentType: format.mime,
      upsert: true,
    });
  if (uploadErr) {
    await logError({ context: "recording.complete.final-upload", error: uploadErr, meta: { recordingId: recording.id } });
    return NextResponse.json(
      { error: "Lydfilen kunne ikke lagres. Prøv igjen." },
      { status: 500 },
    );
  }

  const completedAt = new Date();
  const retentionUntil = new Date(completedAt);
  retentionUntil.setDate(retentionUntil.getDate() + RETENTION_DAYS);
  if (!(await hentLydSamtykkeStatus(recording.playerId)).tillatt)
    return NextResponse.json({ error: "lyd-samtykke-mangler" }, { status: 403 });

  const completed = await prisma.sessionRecording.updateMany({
    where: { id: recording.id, status: "RECORDING", updatedAt: recording.updatedAt },
    data: {
      audioUrl: finalPath,
      durationSec,
      status: "PROCESSING",
      completedAt,
      retentionUntil,
    },
  });
  if (completed.count !== 1) return NextResponse.json({ error: "opptak-endret", message: "Opptaket ble endret under lagring. Prøv fullføring igjen." }, { status: 409 });

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
    }).catch((error) => {
      void logError({ context: "recording.complete.trigger-transcribe", error, severity: "warn", meta: { recordingId: recording.id } });
    });
  } catch (error) {
    await logError({ context: "recording.complete.trigger-transcribe", error, severity: "warn", meta: { recordingId: recording.id } });
  }

  return NextResponse.json({ ok: true, recordingId: recording.id });
}
