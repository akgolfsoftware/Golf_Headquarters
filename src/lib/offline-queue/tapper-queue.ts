"use client";

/**
 * IndexedDB-laget for tapper-offline-køen. Ren I/O — regel/format-logikk
 * (retry-telling, når appen skal gi opp stille retry) ligger i tapper-kladd.ts
 * og er enhetstestet der. Native `indexedDB`-API — ingen ny avhengighet.
 *
 * Én butikk («tapper-ko»), nøkkel = sessionId — køen trenger kun siste
 * kjente snapshot per økt (saveTapperCounts er idempotent på absolutt
 * telling), ikke en voksende hendelseslogg.
 */

import { byggKoRad, registrerMislykketForsok, trengerManuellHandling, type TapperKoRad } from "./tapper-kladd";

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
    // Blokkert/feilet IndexedDB (privat modus, kvote osv.) skal aldri
    // velte selve tapper-lagringen — bare gjøre offline-køen utilgjengelig.
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
      // db.transaction() kan kaste synkront (f.eks. lukket forbindelse) —
      // skal aldri velte kalleren, bare gjøre køen utilgjengelig denne gangen.
      resolve(null);
    }
  });
}

/** Legger (eller erstatter) siste kjente tellinger for en økt i køen. */
export async function leggIKo(
  sessionId: string,
  counts: Array<{ club: string; count: number }>,
): Promise<void> {
  const eksisterende = await medButikk<TapperKoRad>("readonly", (b) => b.get(sessionId));
  const rad = eksisterende
    ? { ...eksisterende, counts, sistOppdatert: new Date().toISOString() }
    : byggKoRad(sessionId, counts, new Date());
  await medButikk("readwrite", (b) => b.put(rad));
}

async function fjernFraKo(sessionId: string): Promise<void> {
  await medButikk("readwrite", (b) => b.delete(sessionId));
}

async function alleRader(): Promise<TapperKoRad[]> {
  const rader = await medButikk<TapperKoRad[]>("readonly", (b) => b.getAll());
  return rader ?? [];
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
  sessionId: string,
  lagre: (sessionId: string, counts: Array<{ club: string; count: number }>) => Promise<{ ok: boolean }>,
): Promise<"tom" | "synket" | "feilet" | "gitt-opp"> {
  const rader = await alleRader();
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
