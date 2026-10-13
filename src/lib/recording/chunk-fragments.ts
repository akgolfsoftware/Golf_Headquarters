import { z } from "zod";
import { MAX_RECORDING_PART_BYTES, recordingFormat, splitRecordingBlob } from "./chunk-contract";

export const MAX_WHOLE_RECORDING_CHUNK_BYTES = 10 * 1024 * 1024;
const fragmentFields = ["fragmentIdx", "fragmentCount", "wholeSize", "wholeSHA256"] as const;
const FragmentSchema = z.object({
  fragmentIdx: z.number().int().min(0).max(3),
  fragmentCount: z.number().int().min(2).max(4),
  wholeSize: z.number().int().min(MAX_RECORDING_PART_BYTES + 1).max(MAX_WHOLE_RECORDING_CHUNK_BYTES),
  wholeSHA256: z.string().regex(/^[a-f0-9]{64}$/),
});
export type RecordingChunkFragment = z.infer<typeof FragmentSchema>;
export type RecordingChunkUploadResult = { ok: boolean; chunkComplete?: boolean };

export function recordingChunkUploadConfirmed(result: RecordingChunkUploadResult): boolean {
  return result.ok === true && result.chunkComplete === true;
}

/** Fravær av alle fragmentfelt er vanlig opplasting; delvise/ugyldige felt avvises. */
export function readRecordingChunkFragment(form: FormData, partBytes: number): RecordingChunkFragment | null {
  if (fragmentFields.every(key => !form.has(key))) return null;
  const integer = (key: string) => {
    const raw = form.get(key);
    return typeof raw === "string" && /^(0|[1-9]\d{0,7})$/.test(raw) ? Number(raw) : NaN;
  };
  const value = FragmentSchema.parse({ fragmentIdx: integer("fragmentIdx"), fragmentCount: integer("fragmentCount"),
    wholeSize: integer("wholeSize"), wholeSHA256: form.get("wholeSHA256") });
  const expectedSize = Math.min(MAX_RECORDING_PART_BYTES, value.wholeSize - value.fragmentIdx * MAX_RECORDING_PART_BYTES);
  if (value.fragmentCount !== Math.ceil(value.wholeSize / MAX_RECORDING_PART_BYTES)
    || value.fragmentIdx >= value.fragmentCount || partBytes !== expectedSize) throw new Error("Ugyldig lydfragment");
  return value;
}

/** Rene metadata og byte-deler: den opprinnelige lydbitens indeks beholdes. */
export async function recordingChunkUploadForms(recordingId: string, idx: number, blob: Blob) {
  const format = recordingFormat(blob.type);
  if (!format || blob.size < 1 || blob.size > MAX_WHOLE_RECORDING_CHUNK_BYTES) throw new Error("Ugyldig lydbit");
  const hashBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()));
  const wholeSHA256 = Array.from(hashBytes, byte => byte.toString(16).padStart(2, "0")).join("");
  const parts = splitRecordingBlob(blob);
  const forms = parts.map((part, fragmentIdx) => {
    const form = new FormData();
    form.append("recordingId", recordingId); form.append("chunkIdx", String(idx));
    form.append("chunk", part, `chunk-${idx}.${format.extension}`);
    if (parts.length > 1) {
      form.append("fragmentIdx", String(fragmentIdx)); form.append("fragmentCount", String(parts.length));
      form.append("wholeSize", String(blob.size)); form.append("wholeSHA256", wholeSHA256);
    }
    return form;
  });
  return { forms, wholeSHA256, wholeSize: blob.size };
}
