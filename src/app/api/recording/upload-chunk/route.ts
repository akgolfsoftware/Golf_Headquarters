// POST /api/recording/upload-chunk — bare egne, samtykkede opptak.
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Prisma } from "@/generated/prisma/client";
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";
import { hentLydSamtykkeStatus } from "@/lib/recording/lyd-samtykke";
import { RecordingChunkSchema, hasAudioHeader, recordingFormat } from "@/lib/recording/chunk-contract";
const BUCKET = "coaching-recordings";
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  if (user.role !== "COACH" && user.role !== "ADMIN") return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  const limit = await rateLimit({ key: `recording-upload-chunk:${user.id}`, max: 60, windowMs: 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  const form = await req.formData().catch(() => null);
  const recordingId = form?.get("recordingId"), rawIdx = form?.get("chunkIdx"), chunk = form?.get("chunk");
  if (typeof recordingId !== "string" || recordingId.length > 200 || typeof rawIdx !== "string" || !/^(0|[1-9]\d{0,3})$/.test(rawIdx) || !(chunk instanceof Blob))
    return NextResponse.json({ error: "Ugyldig lyddata" }, { status: 400 });
  const idx = Number(rawIdx), format = recordingFormat(chunk.type);
  if (idx > 1440 || !format || chunk.size < 1 || chunk.size > 10 * 1024 * 1024)
    return NextResponse.json({ error: "Ugyldig format eller størrelse" }, { status: 415 });
  const recording = await prisma.sessionRecording.findUnique({ where: { id: recordingId },
    select: { id: true, uploadedById: true, playerId: true, status: true } });
  if (!recording) return NextResponse.json({ error: "Opptaket finnes ikke" }, { status: 404 });
  if ((recording.uploadedById !== user.id && user.role !== "ADMIN") || !recording.playerId
    || !(await harCoachTilgangTilSpiller(user, recording.playerId))) return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  if (!(await hentLydSamtykkeStatus(recording.playerId)).tillatt) return NextResponse.json({ error: "lyd-samtykke-mangler" }, { status: 403 });
  const bytes = Buffer.from(await chunk.arrayBuffer()), hash = createHash("sha256").update(bytes).digest("hex");
  if (idx === 0 && !hasAudioHeader(bytes, format.mime)) return NextResponse.json({ error: "Ugyldig lydfilhode" }, { status: 415 });
  try {
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "session_recordings" WHERE "id" = ${recordingId} FOR UPDATE`);
      const current = await tx.sessionRecording.findUnique({ where: { id: recordingId }, select: { status: true, chunks: true, uploadedById: true } });
      if (!current || current.status !== "RECORDING") return { ok: false, status: 409 };
      const existing = Array.isArray(current.chunks) ? current.chunks.flatMap(value => {
        const parsed = RecordingChunkSchema.safeParse(value); return parsed.success ? [parsed.data] : [];
      }) : [];
      const first = existing.find(part => part.idx === 0);
      // MediaRecorder sender ett filhode, deretter fragmenter av samme lydstrøm.
      if (idx > 0 && (!first || (first.mimeType ?? "audio/webm") !== format.mime)) return { ok: false, status: 409 };
      const previous = existing.find(part => part.idx === idx);
      if (previous?.sha256 === hash) return { ok: true, status: 200 };
      if (previous && !previous.sha256) {
        const expectedPath = `${current.uploadedById}/${recordingId}/chunk-${String(idx).padStart(5, "0")}.${format.extension}`;
        if (previous.path !== expectedPath) return { ok: false, status: 409 };
        const saved = await supabaseAdmin().storage.from(BUCKET).download(previous.path);
        if (saved.error || !saved.data || saved.data.size > 10 * 1024 * 1024) return { ok: false, status: 409 };
        const previousHash = createHash("sha256").update(Buffer.from(await saved.data.arrayBuffer())).digest("hex");
        if (previousHash !== hash) return { ok: false, status: 409 };
        await tx.sessionRecording.update({ where: { id: recordingId }, data: {
          chunks: existing.map(part => part.idx === idx ? { ...part, sha256: hash, mimeType: format.mime } : part),
        } });
        return { ok: true, status: 200 };
      }
      if (previous) return { ok: false, status: 409 };
      const path = `${current.uploadedById}/${recordingId}/chunk-${String(idx).padStart(5, "0")}.${format.extension}`;
      const uploaded = await supabaseAdmin().storage.from(BUCKET).upload(path, bytes, { contentType: format.mime, upsert: true });
      if (uploaded.error) throw new Error("Lydopplasting mislyktes");
      await tx.sessionRecording.update({ where: { id: recordingId }, data: {
        chunks: [...existing, { idx, path, size: bytes.length, mimeType: format.mime, sha256: hash }].sort((a,b) => a.idx-b.idx),
      } });
      return { ok: true, status: 200 };
    }, { timeout: 15000 });
    return NextResponse.json({ ok: result.ok, ...(result.ok ? {} : { error: "Lyddata eller opptaksstatus er endret. Prøv igjen." }) }, { status: result.status });
  } catch {
    await logError({ context: "recording.upload-chunk", error: new Error("Lydopplasting mislyktes"), meta: { recordingId } });
    return NextResponse.json({ error: "Lydopplasting er ikke bekreftet. Prøv igjen." }, { status: 500 });
  }
}
