"use client";

/** Live-kladd og ventende sendinger i en brukeravgrenset IndexedDB-butikk.
 * En kvittering markerer bare versjonen som faktisk ble sendt. Kladden
 * beholdes etter synk, slik at klokke, pause og øvelsesstatus kan gjenopptas.
 * Den gamle eierløse butikken beholdes urørt, men leses aldri automatisk. */
import { byggLiveDrillKoRad, trengerManuellLiveHandling, type LiveDrillKoRad, type LiveDrillReps } from "./live-drill-kladd";
import { byggEierNokkel, erGyldigEierId, filtrerEideRader } from "./eier-scope";

const DB_NAVN = "akgolf-live-drill-ko";
const DB_VERSJON = 2;
const BUTIKK = "live-drill-ko-v2";
export type LiveDrillLagreFn = (sessionId: string, drills: LiveDrillReps[]) => Promise<{ ok: boolean }>;
export type LiveSyncResult = "tom" | "synket" | "venter" | "feilet" | "gitt-opp";

function apneDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let req: IDBOpenDBRequest;
    try { req = indexedDB.open(DB_NAVN, DB_VERSJON); } catch { resolve(null); return; }
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(BUTIKK)) req.result.createObjectStore(BUTIKK, { keyPath: "key" }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
}

/** Vent på transaksjonen, ikke bare put-requesten. Les/endre er atomisk. */
async function transaksjon<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T | null> {
  const db = await apneDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(BUTIKK, mode);
      let value: T | null = null;
      tx.oncomplete = () => { db.close(); resolve(value); };
      tx.onabort = () => { db.close(); resolve(null); };
      tx.onerror = () => { /* onabort returnerer feilen */ };
      operation(tx.objectStore(BUTIKK), (next) => { value = next; });
    } catch { db.close(); resolve(null); }
  });
}

export async function lesLiveDrillUtkast(eierId: string, sessionId: string): Promise<LiveDrillKoRad | null> {
  if (!erGyldigEierId(eierId)) return null;
  return transaksjon("readonly", (store, result) => {
    const req = store.get(byggEierNokkel(eierId, sessionId));
    req.onsuccess = () => result(req.result ?? null);
  });
}

export async function lagreLiveDrillUtkast(eierId: string, sessionId: string, drills: LiveDrillReps[], totalSec: number, clock?: { paused: boolean; drillSec: number }): Promise<boolean> {
  if (!erGyldigEierId(eierId)) return false;
  const saved = await transaksjon<boolean>("readwrite", (store, result) => {
    const req = store.get(byggEierNokkel(eierId, sessionId));
    req.onsuccess = () => {
      const previous: LiveDrillKoRad | undefined = req.result;
      const changed = !previous || JSON.stringify(previous.drills) !== JSON.stringify(drills);
      const row: LiveDrillKoRad = {
        ...(previous ?? byggLiveDrillKoRad(eierId, sessionId, drills, totalSec, new Date())),
        drills, totalSec, ...clock,
        revision: (previous?.revision ?? 0) + (changed ? 1 : 0),
        sistOppdatert: new Date().toISOString(),
      };
      store.put(row); result(true);
    };
  });
  return saved === true;
}

export async function slettLiveDrillUtkast(eierId: string, sessionId: string): Promise<void> {
  if (!erGyldigEierId(eierId)) return;
  await transaksjon("readwrite", (store, result) => { store.delete(byggEierNokkel(eierId, sessionId)); result(true); });
}

/** Bare usendte versjoner vises i portalens felles kø. */
export async function listLiveDrillKo(eierId: string): Promise<LiveDrillKoRad[]> {
  if (!erGyldigEierId(eierId)) return [];
  const rows = await transaksjon<LiveDrillKoRad[]>("readonly", (store, result) => {
    const req = store.getAll(); req.onsuccess = () => result(req.result);
  });
  return filtrerEideRader(rows ?? [], eierId).filter((row) => row.synketRevision == null || row.synketRevision !== row.revision);
}

const sending = new Map<string, Promise<LiveSyncResult>>();
/** Ordnet sending i denne fanen. En eldre kvittering sletter aldri nyere data. */
export function synkLiveDrillKo(eierId: string, sessionId: string, save: LiveDrillLagreFn): Promise<LiveSyncResult> {
  if (!erGyldigEierId(eierId)) return Promise.resolve("feilet");
  const sendingKey = byggEierNokkel(eierId, sessionId);
  const previous = sending.get(sendingKey) ?? Promise.resolve("tom" as const);
  const run = async (): Promise<LiveSyncResult> => {
    const row = await lesLiveDrillUtkast(eierId, sessionId);
    if (!row || (row.synketRevision != null && row.synketRevision === row.revision)) return "tom";
    const response = await save(row.sessionId, row.drills).catch(() => ({ ok: false }));
    return await transaksjon<LiveSyncResult>("readwrite", (store, result) => {
      const req = store.get(sendingKey);
      req.onsuccess = () => {
        const current: LiveDrillKoRad | undefined = req.result;
        if (!current) { result("tom"); return; }
        if (current.revision !== row.revision || JSON.stringify(current.drills) !== JSON.stringify(row.drills)) { result("venter"); return; }
        const updated = response.ok ? { ...current, synketRevision: current.revision ?? 0, revision: current.revision ?? 0, forsokAntall: 0 } : { ...current, forsokAntall: current.forsokAntall + 1 };
        store.put(updated);
        result(response.ok ? "synket" : trengerManuellLiveHandling(updated) ? "gitt-opp" : "feilet");
      };
    }) ?? "feilet";
  };
  const next = previous.catch(() => "feilet" as const).then(async (): Promise<LiveSyncResult> =>
    typeof navigator !== "undefined" && navigator.locks
      ? await navigator.locks.request(`akgolf-live-${sendingKey}`, run)
      : await run(),
  );
  sending.set(sendingKey, next);
  const clean = () => { if (sending.get(sendingKey) === next) sending.delete(sendingKey); };
  void next.then(clean, clean);
  return next;
}
