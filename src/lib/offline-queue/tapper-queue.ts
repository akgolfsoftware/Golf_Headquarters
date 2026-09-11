"use client";

/**
 * IndexedDB-laget for tapper-offline-køen. Ren I/O — regel/format-logikk
 * (retry-telling, når appen skal gi opp stille retry) ligger i tapper-kladd.ts
 * og er enhetstestet der. Native `indexedDB`-API — ingen ny avhengighet.
 *
 * Nye rader ligger i «tapper-ko-v2», nøkkel = eierId + sessionId. Den gamle
 * eierløse butikken beholdes urørt ved oppgradering, men leses aldri automatisk.
 * Køen trenger kun siste kjente snapshot per bruker og økt.
 */

import { byggKoRad, registrerMislykketForsok, trengerManuellHandling, type TapperKoRad } from "./tapper-kladd";
import { byggEierNokkel, erGyldigEierId, filtrerEideRader } from "./eier-scope";

const DB_NAVN = "akgolf-offline-ko";
const DB_VERSJON = 2;
const BUTIKK = "tapper-ko-v2";

function apneDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAVN, DB_VERSJON);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(BUTIKK)) {
        req.result.createObjectStore(BUTIKK, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    // Blokkert/feilet IndexedDB (privat modus, kvote osv.) skal aldri
    // velte selve tapper-lagringen — bare gjøre offline-køen utilgjengelig.
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
      // db.transaction() kan kaste synkront (f.eks. lukket forbindelse) —
      // skal aldri velte kalleren, bare gjøre køen utilgjengelig denne gangen.
      resolve(null);
    }
  });
}

/** Legger (eller erstatter) siste kjente tellinger for en økt i køen. */
export async function leggIKo(
  eierId: string,
  sessionId: string,
  counts: Array<{ club: string; count: number }>,
): Promise<boolean> {
  if (!erGyldigEierId(eierId)) return false;
  const key = byggEierNokkel(eierId, sessionId);
  const eksisterende = await medButikk<TapperKoRad>("readonly", (b) => b.get(key));
  const rad = eksisterende
    ? { ...eksisterende, counts, sistOppdatert: new Date().toISOString() }
    : byggKoRad(eierId, sessionId, counts, new Date());
  return (await medButikk("readwrite", (b) => b.put(rad))) != null;
}

async function fjernFraKo(eierId: string, sessionId: string): Promise<void> {
  await medButikk("readwrite", (b) => b.delete(byggEierNokkel(eierId, sessionId)));
}

async function alleRader(): Promise<TapperKoRad[]> {
  const rader = await medButikk<TapperKoRad[]>("readonly", (b) => b.getAll());
  return rader ?? [];
}

/** Alle rader i offline-køen (for portal-wide flush). */
export async function listTapperKo(eierId: string): Promise<TapperKoRad[]> {
  if (!erGyldigEierId(eierId)) return [];
  return filtrerEideRader(await alleRader(), eierId);
}

/**
 * Tømmer køen for én økt: prøver å synke via gitt lagringsfunksjon
 * (`saveTapperCounts`, injisert for å holde denne fila fri for
 * server-actions-importer). Suksess → fjernes fra køen. Feil → forsøks-
 * telleren økes og raden blir liggende til neste `tomKo`-kall.
 * Returnerer `"gitt-opp"` når terskelen for stille retry er nådd, slik at
 * kalleren kan vise en tydelig feil i stedet for å late som alt er bra.
 */
export async function tomKo(
  eierId: string,
  sessionId: string,
  lagre: (sessionId: string, counts: Array<{ club: string; count: number }>) => Promise<{ ok: boolean }>,
): Promise<"tom" | "synket" | "feilet" | "gitt-opp"> {
  if (!erGyldigEierId(eierId)) return "feilet";
  const rader = await listTapperKo(eierId);
  const rad = rader.find((r) => r.sessionId === sessionId);
  if (!rad) return "tom";

  const res = await lagre(rad.sessionId, rad.counts).catch(() => ({ ok: false }));
  if (res.ok) {
    await fjernFraKo(eierId, sessionId);
    return "synket";
  }

  const oppdatert = registrerMislykketForsok(rad, new Date());
  await medButikk("readwrite", (b) => b.put(oppdatert));
  return trengerManuellHandling(oppdatert) ? "gitt-opp" : "feilet";
}
