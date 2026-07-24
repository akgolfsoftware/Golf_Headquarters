"use client";

/**
 * IndexedDB for live-drill offline-kø. Speiler tapper-queue-mønsteret.
 * Synk via injisert lagre-funksjon (logDrillReps per drill) for å holde
 * denne fila fri for server-action-importer.
 */

import {
  byggLiveDrillKoRad,
  registrerMislykketLiveForsok,
  trengerManuellLiveHandling,
  type LiveDrillKoRad,
  type LiveDrillReps,
} from "./live-drill-kladd";

const DB_NAVN = "akgolf-live-drill-ko";
const DB_VERSJON = 1;
const BUTIKK = "live-drill-ko";

export type LiveDrillLagreFn = (
  sessionId: string,
  drills: LiveDrillReps[],
) => Promise<{ ok: boolean }>;

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

export async function lesLiveDrillUtkast(sessionId: string): Promise<LiveDrillKoRad | null> {
  return medButikk<LiveDrillKoRad>("readonly", (b) => b.get(sessionId));
}

export async function lagreLiveDrillUtkast(
  sessionId: string,
  drills: LiveDrillReps[],
  totalSec: number,
): Promise<void> {
  const eksisterende = await lesLiveDrillUtkast(sessionId);
  const rad = eksisterende
    ? {
        ...eksisterende,
        drills,
        totalSec,
        sistOppdatert: new Date().toISOString(),
      }
    : byggLiveDrillKoRad(sessionId, drills, totalSec, new Date());
  await medButikk("readwrite", (b) => b.put(rad));
}

async function fjernFraKo(sessionId: string): Promise<void> {
  await medButikk("readwrite", (b) => b.delete(sessionId));
}

/**
 * Synker utkast til server. Suksess → slett lokal rad.
 * Feil → øk forsøkstelller; «gitt-opp» etter terskel.
 */
export async function synkLiveDrillKo(
  sessionId: string,
  lagre: LiveDrillLagreFn,
): Promise<"tom" | "synket" | "feilet" | "gitt-opp"> {
  const rad = await lesLiveDrillUtkast(sessionId);
  if (!rad) return "tom";

  const res = await lagre(rad.sessionId, rad.drills).catch(() => ({ ok: false }));
  if (res.ok) {
    await fjernFraKo(sessionId);
    return "synket";
  }

  const oppdatert = registrerMislykketLiveForsok(rad, new Date());
  await medButikk("readwrite", (b) => b.put(oppdatert));
  return trengerManuellLiveHandling(oppdatert) ? "gitt-opp" : "feilet";
}

export async function slettLiveDrillUtkast(sessionId: string): Promise<void> {
  await fjernFraKo(sessionId);
}
