/**
 * R-I: admin/(legacy)/settings/calendar/actions.ts. Alt er selv-scopet
 * (alltid `user.id`, aldri en id fra klienten) — men
 * `oppdaterSubscriptions` har i tillegg et eksplisitt eierskapsvern: hver
 * subscription-id i input MÅ finnes i den innloggede brukerens EGEN
 * `GoogleCalendarConnection` («Forsøkte å endre subscription du ikke
 * eier»). Testen dekker rollegrensen for alle tre handlinger, dette
 * IDOR-vernet, og at watch-oppsett/stopp styres av `(syncPull ELLER
 * visIKalender) OG active`.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const tilkoblinger: Record<string, { id: string; userId: string; subs: Array<{ id: string; watchChannelId: string | null }> }> = {
  "coach-a": { id: "conn-a", userId: "coach-a", subs: [{ id: "sub-1", watchChannelId: null }, { id: "sub-2", watchChannelId: "watch-2" }] },
};

let subUpdates: Array<{ id: string; data: unknown }> = [];
let connDeletes: string[] = [];
let watchStartKall: string[] = [];
let watchStopKall: string[] = [];
let auditWrites: Array<{ action: string; metadata?: Record<string, unknown> }> = [];
let simulerSyncFeil: string | null = null;
let syncResultat = { found: 3, upserted: 2, skipped: 1 };

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  subUpdates = [];
  connDeletes = [];
  watchStartKall = [];
  watchStopKall = [];
  auditWrites = [];
  simulerSyncFeil = null;
  syncResultat = { found: 3, upserted: 2, skipped: 1 };
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; metadata?: Record<string, unknown> }) => {
      auditWrites.push(input);
    },
  },
});
mock.module("@/lib/google-calendar", {
  namedExports: {
    setupWatchForSubscription: async (id: string) => {
      watchStartKall.push(id);
    },
    stopWatchForSubscription: async (id: string) => {
      watchStopKall.push(id);
    },
    syncCalendarList: async (_connId: string) => {
      if (simulerSyncFeil) throw new Error(simulerSyncFeil);
      return syncResultat;
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  googleCalendarConnection: {
    findUnique: async (
      { where, include }: {
        where: { userId: string };
        include?: { subscriptions?: true | { where: { watchChannelId: { not: null } } } };
      },
    ) => {
      const conn = tilkoblinger[where.userId];
      if (!conn) return null;
      const filtrerKunWatch =
        include?.subscriptions && include.subscriptions !== true;
      const subs = filtrerKunWatch
        ? conn.subs.filter((s) => s.watchChannelId !== null)
        : conn.subs;
      return { id: conn.id, subscriptions: subs };
    },
    deleteMany: async ({ where }: { where: { userId: string } }) => {
      connDeletes.push(where.userId);
      return { count: tilkoblinger[where.userId] ? 1 : 0 };
    },
  },
  googleCalendarSubscription: {
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      subUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("disconnectGoogleCalendar avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { disconnectGoogleCalendar } = await actions();
  await assert.rejects(() => disconnectGoogleCalendar());
  assert.equal(connDeletes.length, 0);
});

test("disconnectGoogleCalendar avviser uinnlogget", async () => {
  bruker = null;
  const { disconnectGoogleCalendar } = await actions();
  await assert.rejects(() => disconnectGoogleCalendar());
  assert.equal(connDeletes.length, 0);
});

test("disconnectGoogleCalendar stopper watch-kanaler og sletter egen tilkobling for COACH", async () => {
  const { disconnectGoogleCalendar } = await actions();
  await disconnectGoogleCalendar();
  assert.deepEqual(watchStopKall, ["sub-2"]); // kun sub-2 har watchChannelId
  assert.deepEqual(connDeletes, ["coach-a"]);
  assert.equal(auditWrites.at(-1)?.action, "google-calendar.disconnect");
});

test("oppdaterSubscriptions avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { oppdaterSubscriptions } = await actions();
  await assert.rejects(() => oppdaterSubscriptions([]));
  assert.equal(subUpdates.length, 0);
});

test("oppdaterSubscriptions avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { oppdaterSubscriptions } = await actions();
  await assert.rejects(() => oppdaterSubscriptions([]));
  assert.equal(subUpdates.length, 0);
});

test("oppdaterSubscriptions avviser ugyldig input", async () => {
  const { oppdaterSubscriptions } = await actions();
  const svar = await oppdaterSubscriptions([{ id: "sub-1" } as never]);
  assert.equal(svar.ok, false);
  assert.equal(subUpdates.length, 0);
});

test("oppdaterSubscriptions avviser når brukeren mangler Google-tilkobling", async () => {
  bruker = { id: "coach-uten-tilkobling", role: "COACH", name: "Coach Uten" };
  const { oppdaterSubscriptions } = await actions();
  const svar = await oppdaterSubscriptions([
    { id: "sub-1", syncPush: true, syncPull: true, visIKalender: true, active: true },
  ]);
  assert.equal(svar.ok, false);
  assert.equal(subUpdates.length, 0);
});

test("oppdaterSubscriptions avviser en subscription-id COACH ikke eier (IDOR)", async () => {
  const { oppdaterSubscriptions } = await actions();
  const svar = await oppdaterSubscriptions([
    { id: "sub-annen-coach", syncPush: true, syncPull: true, visIKalender: true, active: true },
  ]);
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /ikke eier/);
  assert.equal(subUpdates.length, 0);
});

test("oppdaterSubscriptions setter opp watch når pull/vis+active blir sant og watch mangler", async () => {
  const { oppdaterSubscriptions } = await actions();
  const svar = await oppdaterSubscriptions([
    { id: "sub-1", syncPush: false, syncPull: true, visIKalender: false, active: true },
  ]);
  assert.equal(svar.ok, true);
  assert.equal(subUpdates.length, 1);
  assert.deepEqual(watchStartKall, ["sub-1"]);
  assert.equal(auditWrites.at(-1)?.metadata?.antall, 1);
});

test("oppdaterSubscriptions stopper watch når active settes til false", async () => {
  const { oppdaterSubscriptions } = await actions();
  const svar = await oppdaterSubscriptions([
    { id: "sub-2", syncPush: false, syncPull: true, visIKalender: false, active: false },
  ]);
  assert.equal(svar.ok, true);
  assert.deepEqual(watchStopKall, ["sub-2"]);
});

test("refreshCalendarList avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { refreshCalendarList } = await actions();
  await assert.rejects(() => refreshCalendarList());
});

test("refreshCalendarList avviser uinnlogget", async () => {
  bruker = null;
  const { refreshCalendarList } = await actions();
  await assert.rejects(() => refreshCalendarList());
});

test("refreshCalendarList avviser når brukeren mangler Google-tilkobling", async () => {
  bruker = { id: "coach-uten-tilkobling", role: "COACH", name: "Coach Uten" };
  const { refreshCalendarList } = await actions();
  const svar = await refreshCalendarList();
  assert.equal(svar.ok, false);
});

test("refreshCalendarList synker og logger for COACH med tilkobling", async () => {
  const { refreshCalendarList } = await actions();
  const svar = await refreshCalendarList();
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.upserted, 2);
  assert.equal(auditWrites.at(-1)?.action, "google-calendar.list.refreshed");
});

test("refreshCalendarList fanger feil fra sync som ok:false", async () => {
  simulerSyncFeil = "Google API nede";
  const { refreshCalendarList } = await actions();
  const svar = await refreshCalendarList();
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.equal(svar.error, "Google API nede");
});
