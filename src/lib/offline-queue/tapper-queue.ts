"use client";

/** Slagtellerkladd og ventende sendinger i en brukeravgrenset IndexedDB-butikk.
 * En kvittering markerer bare versjonen som faktisk ble sendt. Kladden
 * beholdes etter synk, slik at tellinger og repetisjonstype kan gjenopptas.
 * Den gamle eierløse butikken beholdes urørt, men leses aldri automatisk. */
import { byggKoRad, trengerManuellHandling, type TapperKoRad, type TapperCount } from "./tapper-kladd";
import { byggEierNokkel, erGyldigEierId, filtrerEideRader } from "./eier-scope";

const DB_NAVN = "akgolf-offline-ko";
const DB_VERSJON = 2;
const BUTIKK = "tapper-ko-v2";
export type TapperLagreFn = (sessionId: string, counts: TapperCount[]) => Promise<{ ok: boolean; serverUpdatedAt?: string }>;
export type TapperSyncResult = "tom" | "synket" | "venter" | "feilet" | "gitt-opp";

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

export async function lesTapperUtkast(eierId: string, sessionId: string): Promise<TapperKoRad | null> {
  if (!erGyldigEierId(eierId)) return null;
  return transaksjon("readonly", (store, result) => {
    const req = store.get(byggEierNokkel(eierId, sessionId));
    req.onsuccess = () => result(req.result ?? null);
  });
}

export async function leggIKo(eierId: string, sessionId: string, counts: TapperCount[]): Promise<boolean> {
  if (!erGyldigEierId(eierId)) return false;
  const saved = await transaksjon<boolean>("readwrite", (store, result) => {
    const req = store.get(byggEierNokkel(eierId, sessionId));
    req.onsuccess = () => {
      const previous: TapperKoRad | undefined = req.result;
      const changed = !previous || JSON.stringify(previous.counts) !== JSON.stringify(counts);
      const row: TapperKoRad = {
        ...(previous ?? byggKoRad(eierId, sessionId, counts, new Date())),
        counts,
        revision: (previous?.revision ?? 0) + (changed ? 1 : 0),
        sistOppdatert: new Date().toISOString(),
      };
      store.put(row); result(true);
    };
  });
  return saved === true;
}

export async function slettTapperUtkast(eierId: string, sessionId: string): Promise<void> {
  if (!erGyldigEierId(eierId)) return;
  await transaksjon("readwrite", (store, result) => { store.delete(byggEierNokkel(eierId, sessionId)); result(true); });
}

/** Bare usendte versjoner vises i portalens felles kø. */
export async function listTapperKo(eierId: string): Promise<TapperKoRad[]> {
  if (!erGyldigEierId(eierId)) return [];
  const rows = await transaksjon<TapperKoRad[]>("readonly", (store, result) => {
    const req = store.getAll(); req.onsuccess = () => result(req.result);
  });
  return filtrerEideRader(rows ?? [], eierId).filter((row) => row.synketRevision == null || row.synketRevision !== row.revision);
}

const sending = new Map<string, Promise<TapperSyncResult>>();
/** Ordnet sending i denne fanen. En eldre kvittering sletter aldri nyere data. */
export function tomKo(eierId: string, sessionId: string, save: TapperLagreFn): Promise<TapperSyncResult> {
  if (!erGyldigEierId(eierId)) return Promise.resolve("feilet");
  const sendingKey = byggEierNokkel(eierId, sessionId);
  const previous = sending.get(sendingKey) ?? Promise.resolve("tom" as const);
  const run = async (): Promise<TapperSyncResult> => {
    const row = await lesTapperUtkast(eierId, sessionId);
    if (!row || (row.synketRevision != null && row.synketRevision === row.revision)) return "tom";
    const response = await save(row.sessionId, row.counts).catch(() => ({ ok: false }));
    return await transaksjon<TapperSyncResult>("readwrite", (store, result) => {
      const req = store.get(sendingKey);
      req.onsuccess = () => {
        const current: TapperKoRad | undefined = req.result;
        if (!current) { result("tom"); return; }
        if (current.revision !== row.revision || JSON.stringify(current.counts) !== JSON.stringify(row.counts)) { result("venter"); return; }
        const updated = response.ok ? { ...current, synketRevision: current.revision ?? 0, revision: current.revision ?? 0, forsokAntall: 0, serverUpdatedAt: "serverUpdatedAt" in response ? response.serverUpdatedAt : undefined } : { ...current, forsokAntall: current.forsokAntall + 1 };
        store.put(updated);
        result(response.ok ? "synket" : trengerManuellHandling(updated) ? "gitt-opp" : "feilet");
      };
    }) ?? "feilet";
  };
  const next = previous.catch(() => "feilet" as const).then(async (): Promise<TapperSyncResult> =>
    typeof navigator !== "undefined" && navigator.locks
      ? await navigator.locks.request(`akgolf-tapper-${sendingKey}`, run)
      : await run(),
  );
  sending.set(sendingKey, next);
  const clean = () => { if (sending.get(sendingKey) === next) sending.delete(sendingKey); };
  void next.then(clean, clean);
  return next;
}
