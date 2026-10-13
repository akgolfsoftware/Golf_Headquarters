import { MAX_RECORDING_PART_BYTES } from "./chunk-contract";
import { MAX_WHOLE_RECORDING_CHUNK_BYTES } from "./chunk-fragments";

export function recordingStoragePrefix(uploadedById: string, recordingId: string): string {
  if (![uploadedById, recordingId].every(id => /^[a-zA-Z0-9_-]+$/.test(id))) throw new Error("Ugyldig opptaksprefiks");
  return `${uploadedById}/${recordingId}`;
}

export function isRecordingAudioName(name: string): boolean {
  if (/^final(?:-\d+)?\.(webm|m4a)$/.test(name)) return true;
  const chunk = /^chunk-(\d{5})\.(webm|m4a)$/.exec(name);
  return !!chunk && Number(chunk[1]) <= 1440;
}

export function recordingFragmentFolder(name: string): { count: number; extension: string } | null {
  const match = /^chunk-(\d{5})-([a-f0-9]{64})-([1-9]\d{0,7})-([2-4])\.(webm|m4a)$/.exec(name);
  if (!match) return null;
  const size = Number(match[3]), count = Number(match[4]);
  if (Number(match[1]) > 1440 || size <= MAX_RECORDING_PART_BYTES || size > MAX_WHOLE_RECORDING_CHUNK_BYTES
    || count !== Math.ceil(size / MAX_RECORDING_PART_BYTES)) return null;
  return { count, extension: match[5] };
}

export function isRecordingFragmentName(name: string, folder: { count: number; extension: string }): boolean {
  const match = /^part-([0-3])\.(webm|m4a)$/.exec(name);
  return !!match && Number(match[1]) < folder.count && match[2] === folder.extension;
}

/** Henvisninger kan aldri autorisere sletting utenfor opptakets serverbygde prefiks. */
export function checkedRecordingAudioPath(prefix: string, path: string): string {
  if (!path.startsWith(`${prefix}/`) || !isRecordingAudioName(path.slice(prefix.length + 1))) {
    throw new Error("Ugyldig lagringshenvisning i opptaket");
  }
  return path;
}
