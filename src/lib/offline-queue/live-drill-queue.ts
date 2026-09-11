"use client";

/** Live-kladd og ventende sendinger i samme eksisterende IndexedDB-butikk.
 * En kvittering markerer bare versjonen som faktisk ble sendt. Kladden
 * beholdes etter synk, slik at klokke, pause og øvelsesstatus kan gjenopptas. */
import { byggLiveDrillKoRad, tilhoererBrukerLive, trengerManuellLiveHandling, type LiveDrillKoRad, type LiveDrillReps } from "./live-drill-kladd";

const DB_NAVN = "akgolf-live-drill-ko";
const BUTIKK = "live-drill-ko";
export type LiveDrillLagreFn = (sessionId: string, drills: LiveDrillReps[]) => Promise<{ ok: boolean }>;
export type LiveSyncResult = "tom" | "synket" | "venter" | "feilet" | "gitt-opp";

function apneDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let req: IDBOpenDBRequest;
    try { req = indexedDB.open(DB_NAVN, 1); } catch { resolve(null); return; }
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(BUTIKK)) req.result.createObjectStore(BUTIKK, { keyPath: "sessionId" }); };
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

export async function lesLiveDrillUtkast(sessionId: string): Promise<LiveDrillKoRad | null> {
  return transaksjon("readonly", (store, result) => {
    const req = store.get(sessionId);
    req.onsuccess = () => result(req.result ?? null);
  });
}

export async function lagreLiveDrillUtkast(sessionId: string, drills: LiveDrillReps[], totalSec: number, userId: string, clock?: { paused: boolean; drillSec: number }): Promise<boolean> {
  const saved = await transaksjon<boolean>("readwrite", (store, result) => {
    const req = store.get(sessionId);
    req.onsuccess = () => {
      const previous: LiveDrillKoRad | undefined = req.result;
      const changed = !previous || JSON.stringify(previous.drills) !== JSON.stringify(drills);
      const row: LiveDrillKoRad = {
        ...(previous ?? byggLiveDrillKoRad(sessionId, drills, totalSec, new Date(), userId)),
        drills, totalSec, userId, ...clock,
        revision: (previous?.revision ?? 0) + (changed ? 1 : 0),
        sistOppdatert: new Date().toISOString(),
      };
      store.put(row); result(true);
    };
  });
  return saved === true;
}

export async function slettLiveDrillUtkast(sessionId: string): Promise<void> {
  await transaksjon("readwrite", (store, result) => { store.delete(sessionId); result(true); });
}

/**
 * Bare usendte versjoner for DENNE brukeren vises i portalens felles kø
 * (R-C, 2026-09-11) — se `listTapperKo` (tapper-queue.ts) for full
 * begrunnelse: uten brukerfilteret ville en stale rad fra en tidligere
 * bruker på samme enhet blitt forsøkt sendt under neste brukers sesjon.
 */
export async function listLiveDrillKo(userId: string): Promise<LiveDrillKoRad[]> {
  const rows = await transaksjon<LiveDrillKoRad[]>("readonly", (store, result) => {
    const req = store.getAll(); req.onsuccess = () => result(req.result);
  });
  return (rows ?? []).filter(
    (row) =>
      tilhoererBrukerLive(row, userId) &&
      (row.synketRevision == null || row.synketRevision !== row.revision),
  );
}

const sending = new Map<string, Promise<LiveSyncResult>>();
/** Ordnet sending i denne fanen. En eldre kvittering sletter aldri nyere data. */
export function synkLiveDrillKo(sessionId: string, save: LiveDrillLagreFn): Promise<LiveSyncResult> {
  const previous = sending.get(sessionId) ?? Promise.resolve("tom" as const);
  const run = async (): Promise<LiveSyncResult> => {
    const row = await lesLiveDrillUtkast(sessionId);
    if (!row || (row.synketRevision != null && row.synketRevision === row.revision)) return "tom";
    const response = await save(row.sessionId, row.drills).catch(() => ({ ok: false }));
    return await transaksjon<LiveSyncResult>("readwrite", (store, result) => {
      const req = store.get(sessionId);
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
      ? await navigator.locks.request(`akgolf-live-${sessionId}`, run)
      : await run(),
  );
  sending.set(sessionId, next);
  const clean = () => { if (sending.get(sessionId) === next) sending.delete(sessionId); };
  void next.then(clean, clean);
  return next;
}
