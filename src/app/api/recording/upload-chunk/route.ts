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
import { MAX_RECORDING_PART_BYTES, RecordingChunkSchema, hasAudioHeader, recordingFormat } from "@/lib/recording/chunk-contract";
import { MAX_WHOLE_RECORDING_CHUNK_BYTES, readRecordingChunkFragment, type RecordingChunkFragment } from "@/lib/recording/chunk-fragments";
const BUCKET = "coaching-recordings";
function fragmentPaths(ownerId: string, recordingId: string, idx: number, extension: string, fragment: RecordingChunkFragment): string[] {
  const prefix = `${ownerId}/${recordingId}/fragments/chunk-${String(idx).padStart(5, "0")}-${fragment.wholeSHA256}-${fragment.wholeSize}-${fragment.fragmentCount}.${extension}`;
  return Array.from({ length: fragment.fragmentCount }, (_, i) => `${prefix}/part-${i}.${extension}`);
}
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  if (user.role !== "COACH" && user.role !== "ADMIN") return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  const limit = await rateLimit({ key: `recording-upload-chunk:${user.id}`, max: 60, windowMs: 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  const form = await req.formData().catch(() => null);
  const recordingId = form?.get("recordingId"), rawIdx = form?.get("chunkIdx"), chunk = form?.get("chunk");
  if (typeof recordingId !== "string" || !recordingId || recordingId.length > 200 || typeof rawIdx !== "string" || !/^(0|[1-9]\d{0,3})$/.test(rawIdx) || !(chunk instanceof Blob))
    return NextResponse.json({ error: "Ugyldig lyddata" }, { status: 400 });
  const idx = Number(rawIdx), format = recordingFormat(chunk.type);
  if (idx > 1440 || !format || chunk.size < 1 || chunk.size > MAX_WHOLE_RECORDING_CHUNK_BYTES)
    return NextResponse.json({ error: "Ugyldig format eller størrelse" }, { status: 415 });
  let fragment: RecordingChunkFragment | null;
  try { fragment = readRecordingChunkFragment(form!, chunk.size); }
  catch { return NextResponse.json({ error: "Ugyldige lydfragmenter" }, { status: 400 }); }
  const recording = await prisma.sessionRecording.findUnique({ where: { id: recordingId },
    select: { id: true, uploadedById: true, playerId: true, status: true } });
  if (!recording) return NextResponse.json({ error: "Opptaket finnes ikke" }, { status: 404 });
  if ((recording.uploadedById !== user.id && user.role !== "ADMIN") || !recording.playerId
    || !(await harCoachTilgangTilSpiller(user, recording.playerId))) return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  if (!(await hentLydSamtykkeStatus(recording.playerId)).tillatt) return NextResponse.json({ error: "lyd-samtykke-mangler" }, { status: 403 });
  const receivedBytes = Buffer.from(await chunk.arrayBuffer());
  const wholeSize = fragment?.wholeSize ?? receivedBytes.length;
  const hash = fragment?.wholeSHA256 ?? createHash("sha256").update(receivedBytes).digest("hex");
  if (!fragment && idx === 0 && !hasAudioHeader(receivedBytes, format.mime)) return NextResponse.json({ error: "Ugyldig lydfilhode" }, { status: 415 });
  try {
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "session_recordings" WHERE "id" = ${recordingId} FOR UPDATE`);
      const current = await tx.sessionRecording.findUnique({ where: { id: recordingId }, select: { status: true, chunks: true, uploadedById: true, playerId: true } });
      if (!current || current.status !== "RECORDING") return { ok: false, status: 409 };
      // Gjenta tilgang og samtykke under opptakslåsen, før noe skrives til lageret.
      if ((current.uploadedById !== user.id && user.role !== "ADMIN") || !current.playerId
        || !(await harCoachTilgangTilSpiller(user, current.playerId))) return { ok: false, status: 403 };
      if (!(await hentLydSamtykkeStatus(current.playerId)).tillatt) return { ok: false, status: 403 };
      const path = `${current.uploadedById}/${recordingId}/chunk-${String(idx).padStart(5, "0")}.${format.extension}`;
      const temporaryPaths = fragment ? fragmentPaths(current.uploadedById, recordingId, idx, format.extension, fragment) : [];
      const confirmed = () => ({ ok: true, status: 200, chunkComplete: true, cleanupPaths: temporaryPaths });
      const existing = Array.isArray(current.chunks) ? current.chunks.flatMap(value => {
        const parsed = RecordingChunkSchema.safeParse(value); return parsed.success ? [parsed.data] : [];
      }) : [];
      const first = existing.find(part => part.idx === 0);
      // MediaRecorder sender ett filhode, deretter fragmenter av samme lydstrøm.
      if (idx > 0 && (!first || (first.mimeType ?? "audio/webm") !== format.mime)) return { ok: false, status: 409 };
      const previous = existing.find(part => part.idx === idx);
      if (previous?.sha256 === hash && previous.size === wholeSize && previous.path === path
        && (previous.mimeType ?? "audio/webm") === format.mime) return confirmed();
      if (previous && !previous.sha256) {
        if (previous.path !== path || previous.size !== wholeSize) return { ok: false, status: 409 };
        const saved = await supabaseAdmin().storage.from(BUCKET).download(previous.path);
        if (saved.error || !saved.data || saved.data.size !== wholeSize) return { ok: false, status: 409 };
        const previousBytes = Buffer.from(await saved.data.arrayBuffer());
        const previousHash = createHash("sha256").update(previousBytes).digest("hex");
        if (previousHash !== hash) return { ok: false, status: 409 };
        if (idx === 0 && !hasAudioHeader(previousBytes, format.mime)) return { ok: false, status: 415 };
        if (!(await hentLydSamtykkeStatus(current.playerId)).tillatt) return { ok: false, status: 403 };
        await tx.sessionRecording.update({ where: { id: recordingId }, data: {
          chunks: existing.map(part => part.idx === idx ? { ...part, sha256: hash, mimeType: format.mime } : part),
        } });
        return confirmed();
      }
      if (previous) return { ok: false, status: 409 };
      const storage = supabaseAdmin().storage.from(BUCKET);
      let bytes = receivedBytes;
      if (fragment) {
        const uploadedPart = await storage.upload(temporaryPaths[fragment.fragmentIdx], receivedBytes, { contentType: format.mime, upsert: true });
        if (uploadedPart.error) throw new Error("Lydfragment er ikke lagret");
        const parts: Buffer[] = [];
        for (let i = 0; i < temporaryPaths.length; i++) {
          const saved = await storage.download(temporaryPaths[i]);
          if (saved.error || !saved.data) return { ok: true, status: 202, chunkComplete: false };
          const expectedPartSize = Math.min(MAX_RECORDING_PART_BYTES, wholeSize - i * MAX_RECORDING_PART_BYTES);
          if (saved.data.size !== expectedPartSize || recordingFormat(saved.data.type)?.mime !== format.mime) return { ok: false, status: 409 };
          parts.push(Buffer.from(await saved.data.arrayBuffer()));
        }
        bytes = Buffer.concat(parts);
        if (bytes.length !== wholeSize || createHash("sha256").update(bytes).digest("hex") !== hash) return { ok: false, status: 409 };
        if (idx === 0 && !hasAudioHeader(bytes, format.mime)) return { ok: false, status: 415 };
        if (!(await hentLydSamtykkeStatus(current.playerId)).tillatt) return { ok: false, status: 403 };
      }
      const uploaded = await storage.upload(path, bytes, { contentType: format.mime, upsert: true });
      if (uploaded.error) throw new Error("Lydopplasting mislyktes");
      if (!(await hentLydSamtykkeStatus(current.playerId)).tillatt) return { ok: false, status: 403 };
      await tx.sessionRecording.update({ where: { id: recordingId }, data: {
        chunks: [...existing, { idx, path, size: bytes.length, mimeType: format.mime, sha256: hash }].sort((a,b) => a.idx-b.idx),
      } });
      return confirmed();
    }, { timeout: 30000 });
    const cleanupPaths = "cleanupPaths" in result ? result.cleanupPaths ?? [] : [];
    if (result.ok && cleanupPaths.length) {
      // Kvitteringen gjelder hele biten; opprydding forsøkes også ved retry.
      // Ny lås etter ledger-commit: også sletting av egne fragmenter serialiseres.
      await prisma.$transaction(async tx => {
        await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "session_recordings" WHERE "id" = ${recordingId} FOR UPDATE`);
        await supabaseAdmin().storage.from(BUCKET).remove(cleanupPaths);
      }, { timeout: 15000 }).catch(() => undefined);
    }
    const chunkComplete = "chunkComplete" in result && result.chunkComplete === true;
    return NextResponse.json({ ok: result.ok, recordingId, chunkIdx: idx, chunkComplete,
      ...(chunkComplete ? { wholeSHA256: hash, wholeSize } : {}),
      ...(result.ok ? {} : { error: "Lyddata eller opptaksstatus er endret. Prøv igjen." }) }, { status: result.status });
  } catch {
    await logError({ context: "recording.upload-chunk", error: new Error("Lydopplasting mislyktes"), meta: { recordingId } });
    return NextResponse.json({ error: "Lydopplasting er ikke bekreftet. Prøv igjen." }, { status: 500 });
  }
}
