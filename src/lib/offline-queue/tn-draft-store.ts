"use client";

import { TnDraftSchema, tnDraftKey, type TnDraft } from "@/lib/portal-tester/tn-draft";
const DB = "akgolf-testbatteri-v1";
const STORE = "drafts";
const OWNER = "__active-owner";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const TN_LOGOUT_EVENT = "akgolf-testbatteri-logout";
export class TnLocalConflict extends Error {}

async function transaction<T>(run: (store: IDBObjectStore, result: (value: T) => void, guard: (callback: () => void) => () => void) => void): Promise<T> {
  if (typeof indexedDB === "undefined") throw new Error("Lokal lagring er ikke tilgjengelig i denne nettleseren.");
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "key" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error("Kunne ikke åpne lokal lagring."));
    req.onblocked = () => reject(new Error("Lokal lagring er opptatt i en annen fane."));
  });
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); let result: T; let failure: unknown;
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onabort = () => { db.close(); reject(failure ?? new Error("Kunne ikke lagre på denne enheten. Ikke lukk fanen.")); };
    const store = tx.objectStore(STORE);
    const guard = (callback: () => void) => () => { try { callback(); } catch (e) { failure = e; tx.abort(); } };
    guard(() => run(store, value => { result = value; }, guard))();
  });
}

/** Called only when the authenticated provider mounts/changes owner, never by a retry. */
export async function activateTnDraftOwner(ownerId: string): Promise<void> {
  let changedOwner = false;
  await transaction<void>((store, done, guard) => {
    const req = store.get(OWNER);
    req.onsuccess = guard(() => {
      if (req.result?.ownerId !== ownerId) { changedOwner = !!req.result?.ownerId; store.clear(); store.put({ key: OWNER, ownerId }); }
      const all = store.getAll(); all.onsuccess = guard(() => {
        for (const value of all.result) {
          if (value.key === OWNER) continue;
          const parsed = TnDraftSchema.safeParse(value);
          if (!parsed.success || parsed.data.ownerId !== ownerId || parsed.data.updatedAt < Date.now() - MAX_AGE) store.delete(value.key);
        }
        done();
      });
    });
  });
  if (changedOwner) notifyLogout();
}
function notifyLogout() {
  window.dispatchEvent(new Event(TN_LOGOUT_EVENT));
  try { localStorage.setItem(TN_LOGOUT_EVENT, crypto.randomUUID()); } catch { /* The owner check in IDB still prevents writes. */ }
}
export async function clearTnDrafts(): Promise<void> {
  // Notify mounted scorecards in this tab and other tabs before clearing.
  notifyLogout();
  await transaction<void>((store, done) => { store.clear(); store.put({ key: OWNER, ownerId: null }); done(); });
}
export async function listTnDrafts(ownerId: string): Promise<TnDraft[]> {
  return transaction((store, done, guard) => {
    const owner = store.get(OWNER); owner.onsuccess = guard(() => {
      if (owner.result?.ownerId !== ownerId) throw new TnLocalConflict("Innlogget konto er endret. Åpne testen på nytt.");
      const req = store.getAll(); req.onsuccess = guard(() => done(req.result.flatMap(value => {
        const parsed = TnDraftSchema.safeParse(value);
        return parsed.success && parsed.data.ownerId === ownerId && parsed.data.updatedAt >= Date.now() - MAX_AGE ? [parsed.data] : [];
      })));
    });
  });
}
export async function updateTnDraft(ownerId: string, sessionId: string, expectedToken: string | null, transform: (draft: TnDraft | null) => TnDraft): Promise<TnDraft> {
  return transaction((store, done, guard) => {
    const owner = store.get(OWNER); owner.onsuccess = guard(() => {
      if (owner.result?.ownerId !== ownerId) throw new TnLocalConflict("Innlogget konto er endret. Åpne testen på nytt.");
      const key = tnDraftKey(ownerId, sessionId); const req = store.get(key);
      req.onsuccess = guard(() => {
        const old = req.result == null ? null : TnDraftSchema.parse(req.result);
        if ((old?.token ?? null) !== expectedToken) throw new TnLocalConflict("Dette utkastet er endret i en annen fane. Registreringene her overskriver ikke den andre fanen.");
        const next = TnDraftSchema.parse({ ...transform(old), token: crypto.randomUUID(), updatedAt: Date.now() });
        if (next.ownerId !== ownerId || next.sessionId !== sessionId || next.key !== key) throw new Error("Ugyldig eier av utkast.");
        store.put(next); done(next);
      });
    });
  });
}
