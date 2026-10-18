"use client";

import { byggKoRad, registrerMislykketForsok, trengerManuellHandling, sammeTapperSnapshot, type TapperKoRad } from "./tapper-kladd";
import { byggEierNokkel, erGyldigEierId, filtrerEideRader } from "./eier-scope";

const DB_NAVN = "akgolf-offline-ko";
const DB_VERSJON = 2;
const BUTIKK = "tapper-ko-v2";
export type TapperSyncResult = "tom" | "synket" | "venter" | "feilet" | "gitt-opp";
function apneDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let req: IDBOpenDBRequest;
    try { req = indexedDB.open(DB_NAVN, DB_VERSJON); } catch { resolve(null); return; }
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(BUTIKK)) req.result.createObjectStore(BUTIKK, { keyPath: "key" }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null); req.onblocked = () => resolve(null);
  });
}

/** Les/endring er én transaksjon, og lokal lagring bekreftes først ved commit. */
async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T | null> {
  const db = await apneDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(BUTIKK, mode);
      let value: T | null = null;
      tx.oncomplete = () => { db.close(); resolve(value); };
      tx.onabort = () => { db.close(); resolve(null); };
      operation(tx.objectStore(BUTIKK), (next) => { value = next; });
    } catch { db.close(); resolve(null); }
  });
}

export async function leggIKo(eierId: string, sessionId: string, counts: Array<{ club: string; count: number }>): Promise<boolean> {
  if (!erGyldigEierId(eierId)) return false;
  const key = byggEierNokkel(eierId, sessionId);
  const snapshot = counts.map((item) => ({ ...item }));
  return await transaction<boolean>("readwrite", (store, result) => {
    const req = store.get(key);
    req.onsuccess = () => {
      const previous: TapperKoRad | undefined = req.result;
      const changed = !previous || JSON.stringify(previous.counts) !== JSON.stringify(snapshot);
      const row: TapperKoRad = { ...(previous ?? byggKoRad(eierId, sessionId, snapshot, new Date())),
        counts: snapshot, revision: (previous?.revision ?? 0) + (changed ? 1 : 0),
        forsokAntall: changed ? 0 : previous?.forsokAntall ?? 0, sistOppdatert: new Date().toISOString() };
      store.put(row); result(true);
    };
  }) === true;
}

export async function listTapperKo(eierId: string): Promise<TapperKoRad[]> {
  if (!erGyldigEierId(eierId)) return [];
  const rows = await transaction<TapperKoRad[]>("readonly", (store, result) => {
    const req = store.getAll(); req.onsuccess = () => result(req.result);
  });
  return filtrerEideRader(rows ?? [], eierId);
}
const sending = new Map<string, Promise<TapperSyncResult>>();
/** Ordnet sending. En eldre kvittering verken sletter eller overskriver nyere tellinger. */
export function tomKo(eierId: string, sessionId: string,
  save: (sessionId: string, counts: Array<{ club: string; count: number }>) => Promise<{ ok: boolean }>,
): Promise<TapperSyncResult> {
  if (!erGyldigEierId(eierId)) return Promise.resolve("feilet");
  const key = byggEierNokkel(eierId, sessionId);
  const run = async (): Promise<TapperSyncResult> => {
    const row = (await listTapperKo(eierId)).find((item) => item.sessionId === sessionId);
    if (!row) return "tom";
    const response = await save(row.sessionId, row.counts).catch(() => ({ ok: false }));
    return await transaction<TapperSyncResult>("readwrite", (store, result) => {
      const req = store.get(key);
      req.onsuccess = () => {
        const current: TapperKoRad | undefined = req.result;
        if (!current) { result("tom"); return; }
        if (!sammeTapperSnapshot(current, row)) { result("venter"); return; }
        if (response.ok) { store.delete(key); result("synket"); return; }
        const updated = registrerMislykketForsok(current, new Date());
        store.put(updated); result(trengerManuellHandling(updated) ? "gitt-opp" : "feilet");
      };
    }) ?? "feilet";
  };
  const prior = sending.get(key) ?? Promise.resolve("tom" as const);
  const next = prior.catch(() => "feilet" as const).then(async () => typeof navigator !== "undefined" && navigator.locks
    ? await navigator.locks.request("akgolf-tapper-" + key, run) : await run());
  sending.set(key, next);
  const clean = () => { if (sending.get(key) === next) sending.delete(key); };
  void next.then(clean, clean);
  return next;
}
