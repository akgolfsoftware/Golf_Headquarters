import { z } from "zod";
export const RecordingChunkSchema = z.object({ idx: z.number().int().min(0).max(1440), path: z.string().min(1),
  size: z.number().int().min(1).max(10 * 1024 * 1024), mimeType: z.enum(["audio/webm", "audio/mp4"]).optional(), sha256: z.string().regex(/^[a-f0-9]{64}$/).optional() });
export type RecordingChunk = z.infer<typeof RecordingChunkSchema>;
export function recordingFormat(mime: string) {
  const base = mime.toLowerCase().split(";")[0].trim();
  return base === "audio/mp4" ? { mime: "audio/mp4" as const, extension: "m4a" as const }
    : base === "audio/webm" ? { mime: "audio/webm" as const, extension: "webm" as const } : null;
}
export function chooseRecordingMime(isSupported: (mime: string) => boolean): string | null {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(isSupported) ?? null;
}
export function hasAudioHeader(bytes: Uint8Array, mime: string): boolean {
  if (recordingFormat(mime)?.mime === "audio/webm") return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  return recordingFormat(mime)?.mime === "audio/mp4" && bytes.length >= 12
    && String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp";
}
/** Fullføring krever sammenhengende deler og samsvar med klientens registrerte antall. */
export function checkedRecordingChunks(value: unknown, ownerId: string, recordingId: string, expected?: number): RecordingChunk[] | null {
  const parsed = z.array(RecordingChunkSchema).min(1).max(1441).safeParse(value);
  if (!parsed.success) return null;
  const rows = parsed.data.toSorted((a, b) => a.idx - b.idx);
  if (expected !== undefined && rows.length !== expected) return null;
  const format = recordingFormat(rows[0].mimeType ?? "audio/webm");
  if (!format || rows.reduce((sum, row) => sum + row.size, 0) > 256 * 1024 * 1024) return null;
  if (rows.some((row, i) => row.idx !== i || (row.mimeType ?? "audio/webm") !== format.mime
    || row.path !== `${ownerId}/${recordingId}/chunk-${String(i).padStart(5, "0")}.${format.extension}`)) return null;
  return rows;
}
export function recordingElapsedMs(accumulatedMs: number, runningSince: number | null, now: number): number {
  return Math.max(0, accumulatedMs) + (runningSince === null ? 0 : Math.max(0, now - runningSince));
}
