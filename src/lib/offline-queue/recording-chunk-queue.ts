"use client";

/**
 * IndexedDB-kø for lydchunks under fangst. Mistet dekning skal ikke miste bit.
 * Speiler tapper/live-drill-mønsteret.
 */

import {
  byggChunkMeta,
  registrerMislykketChunkForsok,
  tellVentendeChunks,
  trengerManuellChunkHandling,
  type RecordingChunkMeta,
} from "./recording-chunk-kladd";

const DB_NAVN = "akgolf-recording-chunks";
const DB_VERSJON = 1;
const BUTIKK = "chunks";

export type RecordingChunkRad = RecordingChunkMeta & {
  /** Base64 av chunk — Blob er ikke alltid stabilt på tvers av IDB-browsere. */
  dataBase64: string;
  mimeType: string;
};

function apneDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAVN, DB_VERSJON);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(BUTIKK)) {
        const store = req.result.createObjectStore(BUTIKK, { keyPath: "key" });
        store.createIndex("recordingId", "recordingId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function medButikk<T>(
  modus: IDBTransactionMode,
  gjor: (butikk: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  const db = await apneDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(BUTIKK, modus);
      const req = gjor(tx.objectStore(BUTIKK));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function blobTilBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result ?? "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function base64TilBlob(b64: string, mimeType: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mimeType || "audio/webm" });
}

/** Lagre chunk lokalt FØR opplasting. */
export async function leggChunkIKo(
  recordingId: string,
  index: number,
  blob: Blob,
): Promise<void> {
  const meta = byggChunkMeta(recordingId, index, new Date());
  const dataBase64 = await blobTilBase64(blob);
  const rad: RecordingChunkRad = {
    ...meta,
    dataBase64,
    mimeType: blob.type || "audio/webm",
  };
  await medButikk("readwrite", (b) => b.put(rad));
}

export async function fjernChunkFraKo(
  recordingId: string,
  index: number,
): Promise<void> {
  const key = `${recordingId}:${index}`;
  await medButikk("readwrite", (b) => b.delete(key));
}

async function alleRader(): Promise<RecordingChunkRad[]> {
  const rader = await medButikk<RecordingChunkRad[]>("readonly", (b) =>
    b.getAll(),
  );
  return rader ?? [];
}

export async function antallVentendeChunks(
  recordingId: string,
): Promise<number> {
  const rader = await alleRader();
  return tellVentendeChunks(rader, recordingId);
}

export type ChunkUploadFn = (
  recordingId: string,
  index: number,
  blob: Blob,
) => Promise<{ ok: boolean }>;

/**
 * Prøv å laste opp alle ventende chunks for en recording.
 * Returnerer antall som fortsatt venter, og om manuell handling trengs.
 */
export async function tomChunkKo(
  recordingId: string,
  lastOpp: ChunkUploadFn,
): Promise<{ gjenstaar: number; gittOpp: boolean }> {
  const rader = (await alleRader()).filter(
    (r) => r.recordingId === recordingId,
  );
  let gittOpp = false;
  for (const rad of rader.sort((a, b) => a.index - b.index)) {
    const blob = base64TilBlob(rad.dataBase64, rad.mimeType);
    const res = await lastOpp(rad.recordingId, rad.index, blob).catch(() => ({
      ok: false,
    }));
    if (res.ok) {
      await fjernChunkFraKo(rad.recordingId, rad.index);
      continue;
    }
    const oppdatert: RecordingChunkRad = {
      ...rad,
      ...registrerMislykketChunkForsok(rad, new Date()),
    };
    await medButikk("readwrite", (b) => b.put(oppdatert));
    if (trengerManuellChunkHandling(oppdatert)) gittOpp = true;
  }
  const gjenstaar = await antallVentendeChunks(recordingId);
  return { gjenstaar, gittOpp };
}
