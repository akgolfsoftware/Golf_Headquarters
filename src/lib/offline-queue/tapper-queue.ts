"use client";

/**
 * IndexedDB-laget for tapper-offline-køen. Ren I/O — regel/format-logikk
 * (retry-telling, når appen skal gi opp stille retry) ligger i tapper-kladd.ts
 * og er enhetstestet der. Native `indexedDB`-API — ingen ny avhengighet.
 */

import { byggKoRad, registrerMislykketForsok, trengerManuellHandling, type TapperKoRad } from "./tapper-kladd";
import { filtrerEgne, lesNettleserBrukerId, tilhorerBruker } from "./eier";

const DB_NAVN = "akgolf-offline-ko";
const DB_VERSJON = 1;
const BUTIKK = "tapper-ko";

function apneDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAVN, DB_VERSJON);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(BUTIKK)) {
        req.result.createObjectStore(BUTIKK, { keyPath: "sessionId" });
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

export async function leggIKo(
  sessionId: string,
  counts: Array<{ club: string; count: number }>,
): Promise<void> {
  const userId = lesNettleserBrukerId();
  const eksisterende = await medButikk<TapperKoRad>("readonly", (b) => b.get(sessionId));
  if (eksisterende && eksisterende.userId && userId && eksisterende.userId !== userId) return;
  const rad = eksisterende
    ? { ...eksisterende, counts, userId: eksisterende.userId ?? userId, sistOppdatert: new Date().toISOString() }
    : byggKoRad(sessionId, counts, new Date(), userId);
  await medButikk("readwrite", (b) => b.put(rad));
}

async function fjernFraKo(sessionId: string): Promise<void> {
  const eksisterende = await medButikk<TapperKoRad>("readonly", (b) => b.get(sessionId));
  if (eksisterende && !tilhorerBruker(eksisterende, lesNettleserBrukerId())) return;
  await medButikk("readwrite", (b) => b.delete(sessionId));
}

async function alleRader(): Promise<TapperKoRad[]> {
  const rader = await medButikk<TapperKoRad[]>("readonly", (b) => b.getAll());
  return rader ?? [];
}

export async function listTapperKo(): Promise<TapperKoRad[]> {
  return filtrerEgne(await alleRader(), lesNettleserBrukerId());
}

export async function harTapperKoPaaEnheten(): Promise<boolean> {
  return (await alleRader()).length > 0;
}

export async function tomKo(
  sessionId: string,
  lagre: (sessionId: string, counts: Array<{ club: string; count: number }>) => Promise<{ ok: boolean }>,
): Promise<"tom" | "synket" | "feilet" | "gitt-opp"> {
  const rader = await listTapperKo();
  const rad = rader.find((r) => r.sessionId === sessionId);
  if (!rad) return "tom";

  const res = await lagre(rad.sessionId, rad.counts).catch(() => ({ ok: false }));
  if (res.ok) {
    await fjernFraKo(sessionId);
    return "synket";
  }

  const oppdatert = registrerMislykketForsok(rad, new Date());
  await medButikk("readwrite", (b) => b.put(oppdatert));
  return trengerManuellHandling(oppdatert) ? "gitt-opp" : "feilet";
}
