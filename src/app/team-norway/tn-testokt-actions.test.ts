/**
 * Testøkt uten testdag (§TRACKMAN I TEAM NORWAY-TESTENE punkt 1, Anders 22.10.2026): en trener kan føre
 * Driver Basic for én spiller som har delt, uten testdag, og ikke for en som ikke har delt. Delingslåsen
 * (`medTnSpillerData`) og Prisma er mocket — ingen ekte database.
 */
import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const TRENER = { id: "trener-a", name: "Eva Lie", role: "COACH" };
const SPILLER_DELT = "spiller-delt";
const SPILLER_IKKE_DELT = "spiller-ikke-delt";

let viewer: { id: string; name: string; role: string } = TRENER;
let gruppeRolle = "COACH";
let sessionRad: Record<string, unknown> | null = null;
let resultat: Record<string, unknown> | null = null;

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/talent/test-sync", { namedExports: { syncTalentEtterTest: async () => {} } });

const tx = {
  testSession: {
    findUnique: async () => sessionRad,
    create: async ({ data }: { data: Record<string, unknown> }) => { sessionRad = { ...data, status: "IN_PROGRESS" }; return sessionRad; },
    updateMany: async () => ({ count: 1 }),
    update: async ({ data }: { data: Record<string, unknown> }) => { sessionRad = { ...sessionRad, ...data }; return sessionRad; },
  },
  testDayParticipant: { findFirst: async () => null },
  testDefinition: { upsert: async () => ({}) },
  testResult: { create: async ({ data }: { data: Record<string, unknown> }) => { resultat = { id: "res-1", ...data }; return { id: "res-1" }; } },
};

mock.module("@/lib/domain/tn-arbeidsflate", {
  namedExports: {
    hentTnArbeidskontekst: async () => ({ gruppe: { id: "tn", name: "Team Norway" }, rolle: gruppeRolle, erSpiller: gruppeRolle === "PLAYER", kanAdministrere: gruppeRolle === "COACH" }),
    // Delingslåsen: bare spilleren som har delt slipper gjennom.
    medTnSpillerData: async (_b: unknown, spillerId: string, les: (t: unknown, tilgang: unknown) => Promise<unknown>) =>
      spillerId === SPILLER_DELT ? les(tx, { spillerId, spillerNavn: "Jørn Johnsen" }) : null,
  },
});

/** Driver Basic 220 m: fem slag med carry og side. */
function driverBasic(spillerId: string, intent: "draft" | "complete" = "complete") {
  const values: Record<string, Record<string, number>> = {};
  for (let i = 1; i <= 5; i++) values[String(i)] = { carry: 212 + i, side: i - 3 };
  return { spillerId, sessionId: crypto.randomUUID(), protocolId: "driver-220", count: 5, revision: 0, values, notes: "", intent };
}

beforeEach(() => {
  viewer = TRENER;
  gruppeRolle = "COACH";
  sessionRad = null;
  resultat = null;
});

test("trener fører Driver Basic for en spiller som har delt, uten testdag", async () => {
  const { saveTnTestForSpiller } = await import("./tn-testokt-actions");
  const svar = await saveTnTestForSpiller(driverBasic(SPILLER_DELT));
  assert.equal(svar.ok, true);
  assert.equal(resultat?.userId, SPILLER_DELT);
  assert.equal(resultat?.recordedById, TRENER.id);
  assert.equal(sessionRad?.status, "COMPLETED");
});

test("trener kan ikke føre for en spiller som ikke har delt", async () => {
  const { saveTnTestForSpiller } = await import("./tn-testokt-actions");
  const svar = await saveTnTestForSpiller(driverBasic(SPILLER_IKKE_DELT));
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /ikke delt/i);
  assert.equal(resultat, null);
  assert.equal(sessionRad, null);
});

test("Assist Coach kan ikke føre", async () => {
  gruppeRolle = "ASSISTANT";
  const { saveTnTestForSpiller } = await import("./tn-testokt-actions");
  const svar = await saveTnTestForSpiller(driverBasic(SPILLER_DELT));
  assert.equal(svar.ok, false);
  assert.equal(resultat, null);
});

test("en test spilleren fører selv (Putt 1–3 m) avvises for trener", async () => {
  const { saveTnTestForSpiller } = await import("./tn-testokt-actions");
  const svar = await saveTnTestForSpiller({ ...driverBasic(SPILLER_DELT, "draft"), protocolId: "putt-1-3m", count: 1, values: {} });
  assert.equal(svar.ok, false);
  assert.equal(sessionRad, null);
});

test("utkast lagres uten resultat", async () => {
  const { saveTnTestForSpiller } = await import("./tn-testokt-actions");
  const input = driverBasic(SPILLER_DELT, "draft");
  input.values = { "1": { carry: 214, side: -2 } };
  const svar = await saveTnTestForSpiller(input);
  assert.equal(svar.ok, true);
  assert.equal(resultat, null);
  assert.equal(sessionRad?.status, "IN_PROGRESS");
});
