/**
 * Ren logikk for lydchunk offline-kø (FØR/UNDER/ETTER fangst).
 * IDB-lag i recording-chunk-queue.ts.
 */

export type RecordingChunkMeta = {
  /** `${recordingId}:${index}` */
  key: string;
  recordingId: string;
  index: number;
  createdAt: string;
  forsokAntall: number;
  userId?: string | null;
};

const MAKS_STILLE_FORSOK = 8;

export function byggChunkKey(recordingId: string, index: number): string {
  return `${recordingId}:${index}`;
}

export function byggChunkMeta(
  recordingId: string,
  index: number,
  naa: Date,
  userId?: string | null,
): RecordingChunkMeta {
  return {
    key: byggChunkKey(recordingId, index),
    recordingId,
    index,
    createdAt: naa.toISOString(),
    forsokAntall: 0,
    userId: userId ?? null,
  };
}

export function registrerMislykketChunkForsok(
  meta: RecordingChunkMeta,
  _naa: Date,
): RecordingChunkMeta {
  return {
    ...meta,
    forsokAntall: meta.forsokAntall + 1,
  };
}

export function trengerManuellChunkHandling(meta: RecordingChunkMeta): boolean {
  return meta.forsokAntall >= MAKS_STILLE_FORSOK;
}

export function tellVentendeChunks(
  rader: RecordingChunkMeta[],
  recordingId: string,
): number {
  return rader.filter((r) => r.recordingId === recordingId).length;
}
