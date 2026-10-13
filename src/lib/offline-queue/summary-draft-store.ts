"use client";
import { z } from "zod";
const DB = "akgolf-private-summary-v1", STORE = "drafts", OWNER = "__owner";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const DraftSchema = z.object({ key: z.string(), ownerId: z.string().min(1), sessionId: z.string().min(1),
  note: z.string().max(2000), shareWithCoach: z.boolean(), token: z.string(), updatedAt: z.number() });
export type SummaryDraft = z.infer<typeof DraftSchema>;
const keyFor = (ownerId: string, sessionId: string) => `${encodeURIComponent(ownerId)}:${encodeURIComponent(sessionId)}`;
async function transaction<T>(run: (store: IDBObjectStore, done: (value: T) => void, guard: (fn: () => void) => () => void) => void): Promise<T> {
  if (typeof indexedDB === "undefined") throw new Error("Lokal lagring er ikke tilgjengelig.");
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = request.onblocked = () => reject(new Error("Kunne ikke åpne lokal lagring."));
  });
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); let value: T; let failure: unknown;
    tx.oncomplete = () => { db.close(); resolve(value); };
    tx.onabort = () => { db.close(); reject(failure ?? new Error("Utkastet ble ikke lagret på denne enheten.")); };
    const guard = (fn: () => void) => () => { try { fn(); } catch (error) { failure = error; tx.abort(); } };
    guard(() => run(tx.objectStore(STORE), result => { value = result; }, guard))();
  });
}
export async function activateSummaryDraftOwner(ownerId: string): Promise<void> {
  await transaction<void>((store, done, guard) => {
    const owner = store.get(OWNER); owner.onsuccess = guard(() => {
      if (owner.result?.ownerId !== ownerId) { store.clear(); store.put({ key: OWNER, ownerId }); }
      const all = store.getAll(); all.onsuccess = guard(() => {
        for (const value of all.result) { if (value.key === OWNER) continue;
          const parsed = DraftSchema.safeParse(value);
          if (!parsed.success || parsed.data.ownerId !== ownerId || parsed.data.updatedAt < Date.now() - MAX_AGE) store.delete(value.key);
        } done();
      });
    });
  });
}
async function withOwner<T>(ownerId: string, run: (store: IDBObjectStore, done: (value: T) => void, guard: (fn: () => void) => () => void) => void): Promise<T> {
  return transaction((store, done, guard) => {
    const owner = store.get(OWNER); owner.onsuccess = guard(() => {
      if (owner.result?.ownerId !== ownerId) throw new Error("Innlogget konto er endret. Åpne oppsummeringen på nytt.");
      run(store, done, guard);
    });
  });
}
export async function readSummaryDraft(ownerId: string, sessionId: string): Promise<SummaryDraft | null> {
  return withOwner(ownerId, (store, done, guard) => {
    const request = store.get(keyFor(ownerId, sessionId)); request.onsuccess = guard(() => {
      const parsed = DraftSchema.safeParse(request.result);
      done(parsed.success && parsed.data.updatedAt >= Date.now() - MAX_AGE ? parsed.data : null);
    });
  });
}
export async function writeSummaryDraft(ownerId: string, sessionId: string, token: string | null, note: string, shareWithCoach: boolean): Promise<SummaryDraft> {
  return withOwner(ownerId, (store, done, guard) => {
    const key = keyFor(ownerId, sessionId), request = store.get(key);
    request.onsuccess = guard(() => {
      if ((request.result?.token ?? null) !== token) throw new Error("Utkastet er endret i en annen fane. Teksten her overskriver ikke det andre utkastet.");
      const next = DraftSchema.parse({ key, ownerId, sessionId, note, shareWithCoach, token: crypto.randomUUID(), updatedAt: Date.now() });
      store.put(next); done(next);
    });
  });
}
export async function clearSavedSummaryDraft(ownerId: string, sessionId: string, note: string, shareWithCoach: boolean): Promise<void> {
  await withOwner<void>(ownerId, (store, done, guard) => {
    const key = keyFor(ownerId, sessionId), request = store.get(key); request.onsuccess = guard(() => {
      if (request.result?.note === note && request.result?.shareWithCoach === shareWithCoach) store.delete(key);
      done();
    });
  });
}
export async function clearSummaryDrafts(): Promise<void> {
  await transaction<void>((store, done) => { store.clear(); store.put({ key: OWNER, ownerId: null }); done(); });
}
