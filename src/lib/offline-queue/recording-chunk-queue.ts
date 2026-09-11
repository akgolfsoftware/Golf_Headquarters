"use client";

/**
 * Brukeravgrenset IndexedDB-kø for lydchunks under fangst. Mistet dekning
 * skal ikke miste bit. Den gamle eierløse butikken beholdes urørt, men leses
 * aldri automatisk.
 */

import {
  byggChunkMeta,
  registrerMislykketChunkForsok,
  tellVentendeChunks,
  trengerManuellChunkHandling,
  type RecordingChunkMeta,
} from "./recording-chunk-kladd";
import { erGyldigEierId, filtrerEideRader } from "./eier-scope";

const DB_NAVN = "akgolf-recording-chunks";
const DB_VERSJON = 2;
const BUTIKK = "chunks-v2";

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
    req.onblocked = () => resolve(null);
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
  eierId: string,
  recordingId: string,
  index: number,
  blob: Blob,
): Promise<boolean> {
  if (!erGyldigEierId(eierId)) return false;
  const meta = byggChunkMeta(eierId, recordingId, index, new Date());
  const dataBase64 = await blobTilBase64(blob);
  const rad: RecordingChunkRad = {
    ...meta,
    dataBase64,
    mimeType: blob.type || "audio/webm",
  };
  return (await medButikk("readwrite", (b) => b.put(rad))) != null;
}

export async function fjernChunkFraKo(
  eierId: string,
  recordingId: string,
  index: number,
): Promise<void> {
  if (!erGyldigEierId(eierId)) return;
  const key = `${encodeURIComponent(eierId)}:${recordingId}:${index}`;
  await medButikk("readwrite", (b) => b.delete(key));
}

async function alleRader(eierId: string): Promise<RecordingChunkRad[]> {
  if (!erGyldigEierId(eierId)) return [];
  const rader = await medButikk<RecordingChunkRad[]>("readonly", (b) =>
    b.getAll(),
  );
  return filtrerEideRader(rader ?? [], eierId);
}

export async function antallVentendeChunks(
  eierId: string,
  recordingId: string,
): Promise<number> {
  const rader = await alleRader(eierId);
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
  eierId: string,
  recordingId: string,
  lastOpp: ChunkUploadFn,
): Promise<{ gjenstaar: number; gittOpp: boolean }> {
  const rader = (await alleRader(eierId)).filter(
    (r) => r.recordingId === recordingId,
  );
  let gittOpp = false;
  for (const rad of rader.sort((a, b) => a.index - b.index)) {
    const blob = base64TilBlob(rad.dataBase64, rad.mimeType);
    const res = await lastOpp(rad.recordingId, rad.index, blob).catch(() => ({
      ok: false,
    }));
    if (res.ok) {
      await fjernChunkFraKo(eierId, rad.recordingId, rad.index);
      continue;
    }
    const oppdatert: RecordingChunkRad = {
      ...rad,
      ...registrerMislykketChunkForsok(rad, new Date()),
    };
    await medButikk("readwrite", (b) => b.put(oppdatert));
    if (trengerManuellChunkHandling(oppdatert)) gittOpp = true;
  }
  const gjenstaar = await antallVentendeChunks(eierId, recordingId);
  return { gjenstaar, gittOpp };
}
