/**
 * R-I: admin/agents/[agentId]/run-actions.ts. To vernlag for begge
 * handlinger: `Capability.USE_AGENTS` (G6, ikke fanget i try/catch — kastes
 * ufanget hvis COACH mangler grant) og ekte per-coach eierskap
 * (`harCoachTilgangTilSpiller`, fanget og returnert som `{ok:false}`). En
 * COACH uten tilgang til spilleren som eier planen/turneringen skal
 * avvises selv om capability-gaten er bestått. Testen dekker også at et
 * unntak fra selve agent-kjøringen fanges som `{ok:false}` med
 * feilmeldingen, ikke krasjer.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Simulerer effektiv USE_AGENTS-tilgang for den innloggede coachen. */
let coachHarUseAgents = true;
/** Spillere coach-a faktisk har tilgang til (mocket eierskap). */
let coachensSpillere = new Set(["spiller-a"]);

const planer: Record<string, { id: string; userId: string }> = {
  "plan-a": { id: "plan-a", userId: "spiller-a" },
};

let kjorPlanRevisjonKall: unknown[] = [];
let kjorPeakingKall: unknown[] = [];
let kastFraAgent: string | null = null;

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarUseAgents = true;
  coachensSpillere = new Set(["spiller-a"]);
  kjorPlanRevisjonKall = [];
  kjorPeakingKall = [];
  kastFraAgent = null;
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
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: {
    assertCapability: async (user: { role: Rolle }) => {
      if (user.role === "ADMIN") return;
      if (!coachHarUseAgents) throw new Error("forbidden");
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async (_viewer: unknown, spillerId: string) => coachensSpillere.has(spillerId),
  },
});
mock.module("@/lib/agents/plan-revisjon-agent", {
  namedExports: {
    runPlanRevisjon: async (input: unknown) => {
      if (kastFraAgent) throw new Error(kastFraAgent);
      kjorPlanRevisjonKall.push(input);
      return { oppsummering: "Forslag generert" };
    },
  },
});
mock.module("@/lib/agents/peaking-agent", {
  namedExports: {
    runPeaking: async (input: unknown) => {
      if (kastFraAgent) throw new Error(kastFraAgent);
      kjorPeakingKall.push(input);
      return { uker: [] };
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  trainingPlan: {
    findUnique: async ({ where }: { where: { id: string } }) => planer[where.id] ?? null,
  },
});

async function actions() {
  return import("./run-actions");
}

test.beforeEach(() => {
  nullstill();
});

test("kjorPlanRevisjon avviser PLAYER uten å kjøre agenten", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { kjorPlanRevisjon } = await actions();
  await assert.rejects(() => kjorPlanRevisjon("plan-a", "siste-runde"));
  assert.equal(kjorPlanRevisjonKall.length, 0);
});

test("kjorPlanRevisjon avviser uinnlogget uten å kjøre agenten", async () => {
  bruker = null;
  const { kjorPlanRevisjon } = await actions();
  await assert.rejects(() => kjorPlanRevisjon("plan-a", "siste-runde"));
  assert.equal(kjorPlanRevisjonKall.length, 0);
});

test("kjorPlanRevisjon avviser COACH uten USE_AGENTS-tilgang", async () => {
  coachHarUseAgents = false;
  const { kjorPlanRevisjon } = await actions();
  await assert.rejects(() => kjorPlanRevisjon("plan-a", "siste-runde"), /forbidden/);
  assert.equal(kjorPlanRevisjonKall.length, 0);
});

test("kjorPlanRevisjon avviser manglende planId med ok:false", async () => {
  const { kjorPlanRevisjon } = await actions();
  const svar = await kjorPlanRevisjon("", "siste-runde");
  assert.equal(svar.ok, false);
});

test("kjorPlanRevisjon avviser ugyldig trigger med ok:false", async () => {
  const { kjorPlanRevisjon } = await actions();
  const svar = await kjorPlanRevisjon("plan-a", "ukjent-trigger");
  assert.equal(svar.ok, false);
  assert.equal(kjorPlanRevisjonKall.length, 0);
});

test("kjorPlanRevisjon avviser ukjent plan med ok:false", async () => {
  const { kjorPlanRevisjon } = await actions();
  const svar = await kjorPlanRevisjon("finnes-ikke", "siste-runde");
  assert.equal(svar.ok, false);
});

test("kjorPlanRevisjon avviser COACH uten tilgang til spilleren som eier planen", async () => {
  coachensSpillere = new Set();
  const { kjorPlanRevisjon } = await actions();
  const svar = await kjorPlanRevisjon("plan-a", "siste-runde");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.melding, /ikke tilgang/i);
  assert.equal(kjorPlanRevisjonKall.length, 0);
});

test("kjorPlanRevisjon kjører agenten for COACH med tilgang og USE_AGENTS", async () => {
  const { kjorPlanRevisjon } = await actions();
  const svar = await kjorPlanRevisjon("plan-a", "siste-runde");
  assert.equal(svar.ok, true);
  assert.equal(kjorPlanRevisjonKall.length, 1);
});

test("kjorPlanRevisjon fanger unntak fra agent-kjøringen som ok:false", async () => {
  kastFraAgent = "AI-tjenesten er nede";
  const { kjorPlanRevisjon } = await actions();
  const svar = await kjorPlanRevisjon("plan-a", "siste-runde");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.equal(svar.melding, "AI-tjenesten er nede");
});

test("kjorPeaking avviser PLAYER uten å kjøre agenten", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { kjorPeaking } = await actions();
  await assert.rejects(() => kjorPeaking("spiller-a", "t-1"));
  assert.equal(kjorPeakingKall.length, 0);
});

test("kjorPeaking avviser uinnlogget uten å kjøre agenten", async () => {
  bruker = null;
  const { kjorPeaking } = await actions();
  await assert.rejects(() => kjorPeaking("spiller-a", "t-1"));
  assert.equal(kjorPeakingKall.length, 0);
});

test("kjorPeaking avviser COACH uten USE_AGENTS-tilgang", async () => {
  coachHarUseAgents = false;
  const { kjorPeaking } = await actions();
  await assert.rejects(() => kjorPeaking("spiller-a", "t-1"), /forbidden/);
  assert.equal(kjorPeakingKall.length, 0);
});

test("kjorPeaking avviser manglende spiller eller turnering med ok:false", async () => {
  const { kjorPeaking } = await actions();
  const svar = await kjorPeaking("", "t-1");
  assert.equal(svar.ok, false);
  assert.equal(kjorPeakingKall.length, 0);
});

test("kjorPeaking avviser COACH uten tilgang til spilleren", async () => {
  coachensSpillere = new Set();
  const { kjorPeaking } = await actions();
  const svar = await kjorPeaking("spiller-a", "t-1");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.melding, /ikke tilgang/i);
  assert.equal(kjorPeakingKall.length, 0);
});

test("kjorPeaking kjører agenten for COACH med tilgang", async () => {
  const { kjorPeaking } = await actions();
  const svar = await kjorPeaking("spiller-a", "t-1");
  assert.equal(svar.ok, true);
  assert.equal(kjorPeakingKall.length, 1);
});

test("kjorPeaking fanger unntak fra agent-kjøringen som ok:false", async () => {
  kastFraAgent = "Manglende data";
  const { kjorPeaking } = await actions();
  const svar = await kjorPeaking("spiller-a", "t-1");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.equal(svar.melding, "Manglende data");
});
