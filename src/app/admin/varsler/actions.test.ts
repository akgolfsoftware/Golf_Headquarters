/**
 * R-I: admin/varsler/actions.ts. To ulike vernlag testes her:
 * (1) rollegrensen (`requirePortalUser`: PLAYER/uinnlogget avvist på alle
 * tre handlinger), og (2) ekte per-coach eierskap på PlanAction — en COACH
 * uten tilgang til spilleren (`harCoachTilgangTilSpiller`), eller der
 * `coachId` peker på en ANNEN coach, skal avvises selv om hen er COACH.
 * ADMIN er unntatt eierskapssjekken (line 18 i actions.ts) og skal derfor
 * kunne godta/avvise uavhengig av coachId/tilgang. `markerVarselLest`
 * skoper sin `updateMany` til `userId: user.id` — testen verifiserer at en
 * annen brukers notifikasjon aldri røres.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const planActions: Record<string, { id: string; userId: string; coachId: string | null; status: string }> = {
  "pa-1": { id: "pa-1", userId: "spiller-a", coachId: "coach-a", status: "PENDING" },
  "pa-annen-coach": { id: "pa-annen-coach", userId: "spiller-b", coachId: "coach-b", status: "PENDING" },
  "pa-uten-coach": { id: "pa-uten-coach", userId: "spiller-a", coachId: null, status: "PENDING" },
  "pa-avgjort": { id: "pa-avgjort", userId: "spiller-a", coachId: "coach-a", status: "APPROVED" },
};

const notifications: Record<string, { id: string; userId: string; readAt: Date | null }> = {
  "notif-a": { id: "notif-a", userId: "coach-a", readAt: null },
  "notif-b": { id: "notif-b", userId: "coach-b", readAt: null },
};

/** Spillere coach-a faktisk har tilgang til (mocket eierskap). */
let coachensSpillere = new Set(["spiller-a"]);

let acceptKall: string[] = [];
let planActionUpdates: Array<{ where: unknown; data: unknown }> = [];
let notificationUpdates: Array<{ where: unknown; data: unknown }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  acceptKall = [];
  planActionUpdates = [];
  notificationUpdates = [];
  planActions["pa-1"].status = "PENDING";
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
mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async (
      _viewer: unknown,
      playerId: string,
    ) => coachensSpillere.has(playerId),
  },
});
mock.module("@/lib/agents/accept-plan-action", {
  namedExports: {
    acceptAndApplyPlanAction: async (actionId: string) => {
      acceptKall.push(actionId);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  planAction: {
    findUnique: async ({ where }: { where: { id: string } }) => planActions[where.id] ?? null,
    updateMany: async (input: { where: unknown; data: unknown }) => {
      planActionUpdates.push(input);
      return { count: 1 };
    },
  },
  notification: {
    updateMany: async (input: { where: { id: string; userId: string; readAt: null }; data: unknown }) => {
      notificationUpdates.push(input);
      const notif = notifications[input.where.id];
      const treff = notif && notif.userId === input.where.userId && notif.readAt === null;
      return { count: treff ? 1 : 0 };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("godtaPlanAction avviser PLAYER uten å kjøre executor", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { godtaPlanAction } = await actions();
  await assert.rejects(() => godtaPlanAction("pa-1"));
  assert.equal(acceptKall.length, 0);
});

test("godtaPlanAction avviser uinnlogget uten å kjøre executor", async () => {
  bruker = null;
  const { godtaPlanAction } = await actions();
  await assert.rejects(() => godtaPlanAction("pa-1"));
  assert.equal(acceptKall.length, 0);
});

test("godtaPlanAction avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { godtaPlanAction } = await actions();
  await assert.rejects(() => godtaPlanAction("pa-1"), /forbidden/);
  assert.equal(acceptKall.length, 0);
});

test("godtaPlanAction avviser COACH når coachId peker på en annen coach", async () => {
  const { godtaPlanAction } = await actions();
  await assert.rejects(() => godtaPlanAction("pa-annen-coach"), /forbidden/);
  assert.equal(acceptKall.length, 0);
});

test("godtaPlanAction kjører executor for COACH med tilgang og riktig coachId", async () => {
  const { godtaPlanAction } = await actions();
  const svar = await godtaPlanAction("pa-1");
  assert.equal(svar.ok, true);
  assert.deepEqual(acceptKall, ["pa-1"]);
});

test("godtaPlanAction lar ADMIN godta uavhengig av coachId/tilgang", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  coachensSpillere = new Set(); // ADMIN skal ikke rammes av dette
  const { godtaPlanAction } = await actions();
  const svar = await godtaPlanAction("pa-annen-coach");
  assert.equal(svar.ok, true);
  assert.deepEqual(acceptKall, ["pa-annen-coach"]);
});

test("avvisPlanAction avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avvisPlanAction } = await actions();
  await assert.rejects(() => avvisPlanAction("pa-1"));
  assert.equal(planActionUpdates.length, 0);
});

test("avvisPlanAction avviser uinnlogget uten å endre status", async () => {
  bruker = null;
  const { avvisPlanAction } = await actions();
  await assert.rejects(() => avvisPlanAction("pa-1"));
  assert.equal(planActionUpdates.length, 0);
});

test("avvisPlanAction avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { avvisPlanAction } = await actions();
  await assert.rejects(() => avvisPlanAction("pa-1"), /forbidden/);
  assert.equal(planActionUpdates.length, 0);
});

test("avvisPlanAction setter REJECTED for COACH med tilgang", async () => {
  const { avvisPlanAction } = await actions();
  const svar = await avvisPlanAction("pa-1");
  assert.equal(svar.ok, true);
  assert.equal(planActionUpdates.length, 1);
  assert.equal((planActionUpdates[0]?.data as { status: string }).status, "REJECTED");
});

test("avvisPlanAction gjør ingen skriving når handlingen ikke lenger er PENDING", async () => {
  const { avvisPlanAction } = await actions();
  const svar = await avvisPlanAction("pa-avgjort");
  assert.equal(svar.ok, true);
  assert.equal(planActionUpdates.length, 0);
});

test("markerVarselLest avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { markerVarselLest } = await actions();
  await assert.rejects(() => markerVarselLest("notif-a"));
  assert.equal(notificationUpdates.length, 0);
});

test("markerVarselLest avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { markerVarselLest } = await actions();
  await assert.rejects(() => markerVarselLest("notif-a"));
  assert.equal(notificationUpdates.length, 0);
});

test("markerVarselLest markerer coachens EGEN notifikasjon", async () => {
  const { markerVarselLest } = await actions();
  const svar = await markerVarselLest("notif-a");
  assert.equal(svar.ok, true);
  const where = notificationUpdates[0]?.where as { userId: string } | undefined;
  assert.equal(where?.userId, "coach-a");
});

test("markerVarselLest kan ikke merke en annen brukers notifikasjon (scoped where)", async () => {
  const { markerVarselLest } = await actions();
  await markerVarselLest("notif-b"); // coach-a prøver å merke coach-b sitt varsel
  assert.equal(notifications["notif-b"].readAt, null, "notif-b skal forbli ulest");
});
