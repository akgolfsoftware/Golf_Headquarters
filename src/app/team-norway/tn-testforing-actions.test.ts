/**
 * Målrettede tester for saveTnTestSomCoach — status/idempotens, avsluttet
 * medlemskap, protokollversjon og en samtidig fullførings-kollisjon. Mocket
 * Prisma/auth (node:test) — ingen ekte database. Se review 14.09.2026.
 */
import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

const COACH = { id: "coach-a", name: "Syn coach", role: "COACH" };
const SPILLER = { id: "player-a", name: "Syn spiller", role: "PLAYER" };
const TN_GROUP_ID = "group-tn";
const DEFINITION_ID = "tn-v3-putt-1-3m";

let viewer: { id: string; name: string; role: string } = COACH;
let deltakerRad: Record<string, unknown> | null;
let coachMedlem: Record<string, unknown> | null;
let spillerMedlem: Record<string, unknown> | null;
let sessionRad: Record<string, unknown> | null;
let resultatRad: Record<string, unknown> | null;
let participantUpdateManyCount = 1;
let sessionUpdateManyCount = 1;
let notices: unknown[] = [];

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/talent/test-sync", { namedExports: { syncTalentEtterTest: async () => {} } });

const tx = {
  testDayParticipant: {
    findUnique: async () => deltakerRad,
    updateMany: async () => ({ count: participantUpdateManyCount }),
  },
  groupMember: {
    findFirst: async ({ where }: { where: { role: string; userId: string } }) =>
      where.role === "COACH" ? coachMedlem : spillerMedlem,
  },
  testSession: {
    findUnique: async () => sessionRad,
    create: async ({ data }: { data: Record<string, unknown> }) => {
      sessionRad = { ...data, status: "IN_PROGRESS" };
      return sessionRad;
    },
    updateMany: async () => ({ count: sessionUpdateManyCount }),
    update: async ({ data }: { data: Record<string, unknown> }) => {
      sessionRad = { ...sessionRad, ...data };
      return sessionRad;
    },
  },
  testResult: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      resultatRad = { id: "result-1", ...data };
      return { id: "result-1" };
    },
    findUnique: async () => resultatRad,
  },
};

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(tx),
      testDayParticipant: { findUnique: async () => deltakerRad },
    },
  },
});

function basisDeltaker(overstyr: Record<string, unknown> = {}) {
  return {
    id: "deltaker-1",
    testDayId: "dag-1",
    playerId: SPILLER.id,
    order: 0,
    status: "PENDING",
    sessionId: null,
    resultId: null,
    testDay: {
      id: "dag-1",
      groupId: TN_GROUP_ID,
      status: "ACTIVE",
      testDefinitionId: DEFINITION_ID,
      group: { slug: "team-norway" },
      testDefinition: { id: DEFINITION_ID, name: "Putt 1-3 m", scoringRule: "tn-excel-v3-2026-09-10", protocol: { protocolId: "putt-1-3m", version: "tn-excel-v3-2026-09-10" } },
    },
    ...overstyr,
  };
}

function verdierForAlleForsok(strokes: number) {
  const values: Record<string, Record<string, number>> = {};
  for (let i = 1; i <= 25; i++) values[String(i)] = { strokes };
  return values;
}

before(async () => {
  await import("@/lib/portal-tester/tn-catalog");
});

beforeEach(() => {
  viewer = COACH;
  deltakerRad = basisDeltaker();
  coachMedlem = { id: "m1" };
  spillerMedlem = { id: "m2" };
  sessionRad = null;
  resultatRad = null;
  participantUpdateManyCount = 1;
  sessionUpdateManyCount = 1;
  notices = [];
});

test("avviser når coachen ikke har aktivt COACH-medlemskap i Team Norway-gruppen", async () => {
  coachMedlem = null;
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /aktiv trener/i);
});

test("avviser når spilleren ikke har aktivt medlemskap (utmeldt) i Team Norway-gruppen", async () => {
  spillerMedlem = null;
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /ikke lenger et aktivt medlem/i);
});

test("avviser protokollversjon som er utdatert mot dagens TN_VERSION", async () => {
  deltakerRad = basisDeltaker({
    testDay: { ...basisDeltaker().testDay, testDefinition: { id: DEFINITION_ID, name: "Putt 1-3 m", scoringRule: "tn-excel-v2-gammel", protocol: { protocolId: "putt-1-3m" } } },
  });
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /utdatert/i);
});

test("fullført deltaker med SAMME verdier er idempotent (returnerer ok uten ny skriving)", async () => {
  deltakerRad = basisDeltaker({ status: "DONE", resultId: "result-1", sessionId: "sess-1" });
  sessionRad = { id: "sess-1", userId: SPILLER.id, scoringData: { version: "tn-excel-v3-2026-09-10", protocolId: "putt-1-3m", count: 25, revision: 1, values: verdierForAlleForsok(2), notes: "" } };
  resultatRad = { id: "result-1", notes: "" };
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 1, values: verdierForAlleForsok(2), notes: "", intent: "complete" });
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.resultId, "result-1");
});

test("fullført deltaker med ANDRE verdier avvises — kan ikke overskrive resultatet", async () => {
  deltakerRad = basisDeltaker({ status: "DONE", resultId: "result-1", sessionId: "sess-1" });
  sessionRad = { id: "sess-1", userId: SPILLER.id, scoringData: { version: "tn-excel-v3-2026-09-10", protocolId: "putt-1-3m", count: 25, revision: 1, values: verdierForAlleForsok(2), notes: "" } };
  resultatRad = { id: "result-1", notes: "" };
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 1, values: verdierForAlleForsok(3), notes: "", intent: "complete" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /allerede fullført/i);
});

test("fullført deltaker avviser draft/abort — kan ikke starte en ny økt over et fullført resultat", async () => {
  deltakerRad = basisDeltaker({ status: "DONE", resultId: "result-1", sessionId: "sess-1" });
  sessionRad = { id: "sess-1", userId: SPILLER.id, scoringData: { version: "tn-excel-v3-2026-09-10", protocolId: "putt-1-3m", count: 25, revision: 1, values: verdierForAlleForsok(2), notes: "" } };
  resultatRad = { id: "result-1", notes: "" };
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 1, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, false);
});

test("hoppet-over-deltaker avviser føring før den er satt tilbake til køen", async () => {
  deltakerRad = basisDeltaker({ status: "SKIPPED" });
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /hoppet over/i);
});

test("samtidig fullføring: to forsøk kan ikke begge vinne — den andre får en tydelig kollisjonsfeil", async () => {
  participantUpdateManyCount = 0; // simulerer at en annen transaksjon allerede tok deltakeren til DONE
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "complete" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /samtidig/i);
});

test("dagen er ikke ACTIVE (avsluttet/kansellert) — avviser nye registreringer", async () => {
  deltakerRad = basisDeltaker({ testDay: { ...basisDeltaker().testDay, status: "COMPLETED" } });
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /ikke aktiv/i);
});

test("fullført resultat lagres med recordedById = coachen, aldri spilleren", async () => {
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "merknad", intent: "complete" });
  assert.equal(svar.ok, true);
  assert.ok(resultatRad);
  assert.equal((resultatRad as { recordedById?: string; userId?: string }).recordedById, COACH.id);
  assert.equal((resultatRad as { recordedById?: string; userId?: string }).userId, SPILLER.id);
});

test("ADMIN uten eget gruppemedlemskap kan likevel føre (samme unntak som resten av produktet)", async () => {
  viewer = { id: "admin-1", name: "Admin", role: "ADMIN" };
  coachMedlem = null;
  const { saveTnTestSomCoach } = await import("./tn-testforing-actions");
  const svar = await saveTnTestSomCoach({ testDayParticipantId: "deltaker-1", revision: 0, values: verdierForAlleForsok(2), notes: "", intent: "draft" });
  assert.equal(svar.ok, true);
});
