/**
 * R-I: admin/(legacy)/tester/tildel/[spillerId]/actions.ts. Filens egen
 * kommentar dokumenterer motivasjonen: «rolle-sjekk alene lot en coach
 * tildele test — og sende varsel — til en hvilken som helst bruker-id.»
 * Dekker eierskapsporten (`coachScopedPlayerWhere`) pluss tre
 * forretningsregler: en blokkert TN-protokoll avvises med sin egen
 * melding, en PRIVATE custom-test opprettet av en ANNEN coach avvises for
 * COACH (men ikke ADMIN), og en ugyldig frist avvises.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Alle spillere i coaching-sporet (synlig for ADMIN). */
const alleCoachedeSpillere = new Set(["spiller-a"]);
/** Delmengden coach-a faktisk eier. */
let coachensSpillere = new Set(["spiller-a"]);

function harEierskap(spillerId: string): boolean {
  if (!bruker) return false;
  if (!alleCoachedeSpillere.has(spillerId)) return false;
  if (bruker.role === "ADMIN") return true;
  return coachensSpillere.has(spillerId);
}

const testDefinisjoner: Record<string, { id: string; name: string; isCustom: boolean; visibility: string; createdById: string }> = {
  "test-standard": { id: "test-standard", name: "Standard test", isCustom: false, visibility: "PUBLIC", createdById: "coach-a" },
  "test-privat-annen": { id: "test-privat-annen", name: "Privat test", isCustom: true, visibility: "PRIVATE", createdById: "coach-b" },
  "test-privat-egen": { id: "test-privat-egen", name: "Min private test", isCustom: true, visibility: "PRIVATE", createdById: "coach-a" },
};

/** Simulerer en blokkert TN-protokoll for testId "tn-blokkert". */
let blokkertProtokollMelding: string | null = null;

let assignmentCreates: Array<{ playerId: string; coachId: string; testId: string }> = [];
let notifyKall: Array<{ userId: string }> = [];
let testDefinitionUpserts: unknown[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  blokkertProtokollMelding = null;
  assignmentCreates = [];
  notifyKall = [];
  testDefinitionUpserts = [];
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
    coachScopedPlayerWhere: (coach: { id: string; role: string }) => ({ __coach: coach.id }),
  },
});
mock.module("@/lib/portal-tester/tn-integration", {
  namedExports: {
    tnFromDefinitionId: (id: string) => {
      if (id === "tn-blokkert") return { blocked: blokkertProtokollMelding ?? "Protokollen er ikke tilgjengelig." };
      if (id === "tn-gyldig") return { id: "tn-gyldig", name: "TN-protokoll", rows: [1, 2], variableCount: false };
      return undefined;
    },
    tnDefinitionData: (p: { id: string; name: string }) => ({
      id: p.id, name: p.name, description: "TN", pyramidArea: "SLAG", erCanon: false,
    }),
  },
});
mock.module("@/lib/portal-tester/tn-catalog", {
  namedExports: {
    isTnTestName: (name: string) => name === "TN-navngitt-uten-protokoll",
  },
});
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async (input: { userId: string }) => {
      notifyKall.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findFirst: async ({ where }: { where: { AND: [unknown, { id: string }] } }) => {
      const spillerId = where.AND[1].id;
      return harEierskap(spillerId) ? { id: spillerId } : null;
    },
  },
  testDefinition: {
    findUnique: async ({ where }: { where: { id: string } }) => testDefinisjoner[where.id] ?? null,
    upsert: async ({ create }: { create: { id: string; name: string } }) => {
      testDefinitionUpserts.push(create);
      return { id: create.id, name: create.name };
    },
  },
  testAssignment: {
    create: async ({ data }: { data: { playerId: string; coachId: string; testId: string } }) => {
      assignmentCreates.push(data);
      return { id: "assignment-ny" };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("tildelTest avviser PLAYER uten å tildele", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { tildelTest } = await actions();
  await assert.rejects(() => tildelTest({ spillerId: "spiller-a", testId: "test-standard" }));
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest avviser uinnlogget uten å tildele", async () => {
  bruker = null;
  const { tildelTest } = await actions();
  await assert.rejects(() => tildelTest({ spillerId: "spiller-a", testId: "test-standard" }));
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest avviser tomt input med ok:false", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "", testId: "" });
  assert.equal(svar.ok, false);
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest avviser blokkert TN-protokoll med sin egen melding", async () => {
  blokkertProtokollMelding = "Denne protokollen er trukket tilbake.";
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "tn-blokkert" });
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Denne protokollen er trukket tilbake.");
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest avviser COACH uten eierskap til spilleren (IDOR)", async () => {
  coachensSpillere = new Set();
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "test-standard" });
  assert.equal(svar.ok, false);
  assert.equal(assignmentCreates.length, 0);
  assert.equal(notifyKall.length, 0);
});

test("tildelTest avviser ukjent test uten protokoll", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "finnes-ikke" });
  assert.equal(svar.ok, false);
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest avviser en PRIVATE test opprettet av en ANNEN coach", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "test-privat-annen" });
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Denne testen er privat.");
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest lar ADMIN tildele en annen coachs PRIVATE test", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "test-privat-annen" });
  assert.equal(svar.ok, true);
  assert.equal(assignmentCreates.length, 1);
});

test("tildelTest tildeler egen PRIVATE test for COACH", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "test-privat-egen" });
  assert.equal(svar.ok, true);
  assert.equal(assignmentCreates.length, 1);
});

test("tildelTest avviser ugyldig frist", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "test-standard", dueDate: "ikke-en-dato" });
  assert.equal(svar.ok, false);
  assert.equal(assignmentCreates.length, 0);
});

test("tildelTest tildeler standardtest og varsler spilleren", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "test-standard", note: "Fokuser på tempo" });
  assert.equal(svar.ok, true);
  assert.equal(assignmentCreates.length, 1);
  assert.equal(assignmentCreates[0]?.coachId, "coach-a");
  assert.deepEqual(notifyKall.map((n) => n.userId), ["spiller-a"]);
});

test("tildelTest oppretter TN-protokoll-definisjonen ved behov og tildeler", async () => {
  const { tildelTest } = await actions();
  const svar = await tildelTest({ spillerId: "spiller-a", testId: "tn-gyldig" });
  assert.equal(svar.ok, true);
  assert.equal(testDefinitionUpserts.length, 1);
  assert.equal(assignmentCreates.length, 1);
});
