// POST /api/recording/upload-chunk
// Multipart: recordingId, chunkIdx, chunk (Blob). Lagrer chunk i Supabase
// Storage og oppdaterer SessionRecording.chunks JSON-arrayen.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Prisma } from "@/generated/prisma/client";

const BUCKET = "coaching-recordings";

type ChunkEntry = {
  idx: number;
  path: string;
  size: number;
};

function isChunkArray(value: unknown): value is ChunkEntry[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (v) =>
      v !== null &&
      typeof v === "object" &&
      typeof (v as { idx?: unknown }).idx === "number" &&
      typeof (v as { path?: unknown }).path === "string" &&
      typeof (v as { size?: unknown }).size === "number",
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ugyldig form-data" }, { status: 400 });
  }

  const recordingId = form.get("recordingId");
  const chunkIdxRaw = form.get("chunkIdx");
  const chunk = form.get("chunk");

  if (typeof recordingId !== "string" || typeof chunkIdxRaw !== "string") {
    return NextResponse.json(
      { error: "Mangler recordingId/chunkIdx" },
      { status: 400 },
    );
  }
  const chunkIdx = Number.parseInt(chunkIdxRaw, 10);
  if (!Number.isFinite(chunkIdx) || chunkIdx < 0) {
    return NextResponse.json({ error: "Ugyldig chunkIdx" }, { status: 400 });
  }
  if (!(chunk instanceof Blob)) {
    return NextResponse.json({ error: "Mangler chunk-blob" }, { status: 400 });
  }

  // S-15: Chunk-størrelsesbegrensning (10 MB)
  const MAX_CHUNK_BYTES = 10 * 1024 * 1024;
  if (chunk.size > MAX_CHUNK_BYTES) {
    return NextResponse.json(
      { error: "Chunk er for stor (maks 10 MB per chunk)." },
      { status: 413 },
    );
  }

  // S-15: MIME magic bytes — WebM/EBML: 1A 45 DF A3
  const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
  const isWebM =
    chunkBuffer[0] === 0x1a &&
    chunkBuffer[1] === 0x45 &&
    chunkBuffer[2] === 0xdf &&
    chunkBuffer[3] === 0xa3;
  if (!isWebM) {
    return NextResponse.json(
      { error: "Ugyldig filformat. Kun WebM-lyd støttes." },
      { status: 415 },
    );
  }

  const recording = await prisma.sessionRecording.findUnique({
    where: { id: recordingId },
    select: { id: true, uploadedById: true, status: true, chunks: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording finnes ikke" }, { status: 404 });
  }
  if (recording.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }
  if (recording.status !== "RECORDING") {
    return NextResponse.json(
      { error: `Recording har status ${recording.status} — chunks tillates ikke` },
      { status: 409 },
    );
  }

  const path = `${recording.uploadedById}/${recording.id}/chunk-${String(
    chunkIdx,
  ).padStart(5, "0")}.webm`;

  const { error: uploadErr } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, chunkBuffer, {
      contentType: "audio/webm",
      upsert: true,
    });
  if (uploadErr) {
    console.error("[recording] upload-chunk feilet", uploadErr);
    return NextResponse.json(
      { error: `Storage-feil: ${uploadErr.message}` },
      { status: 500 },
    );
  }

  // Append chunk-entry til JSON-arrayen
  const existing = isChunkArray(recording.chunks) ? recording.chunks : [];
  const filtered = existing.filter((c) => c.idx !== chunkIdx);
  const next: ChunkEntry[] = [...filtered, { idx: chunkIdx, path, size: chunkBuffer.length }];
  next.sort((a, b) => a.idx - b.idx);

  await prisma.sessionRecording.update({
    where: { id: recording.id },
    data: { chunks: next as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ ok: true, path });
}
