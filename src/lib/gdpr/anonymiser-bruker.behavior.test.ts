/** Tørrkjøring må være lesende; ekstern feil må kunne prøves igjen. */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let writes: string[] = [];
let externalErrors: string[] = [];
let markedComplete = false;
const updateMany = async () => { writes.push("data"); return { count: 1 }; };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: {
    findUnique: async () => ({ id: "synthetic", publicPlayerId: null }),
    update: async ({ data }: { data: { anonymisertAt?: Date | null } }) => {
      writes.push("user");
      markedComplete = Boolean(data.anonymisertAt);
      return {};
    },
  },
  round: { findMany: async () => [{ score: 75 }], updateMany },
  trainingSessionV2: { findMany: async () => [{ id: "session" }], updateMany },
  trainingDrillV2: { updateMany }, drillLogV2: { updateMany }, fysOvelseRad: { updateMany },
  iupBesvarelse: { deleteMany: async ({ where }: { where: { userId: string } }) => {
    assert.equal(where.userId, "synthetic"); writes.push("iup"); return { count: 1 };
  } },
  $transaction: async (calls: Promise<unknown>[]) => Promise.all(calls),
} } });
mock.module("./slett-eksterne-data", { namedExports: {
  slettEksterneBrukerdata: async (_id: string, opts?: { dryRun?: boolean }) => ({
    authSlettet: false, stripeKundeSlettet: false, storageFilerFjernet: 0,
    bookingerGjestevasket: 0, feil: externalErrors, dryRun: Boolean(opts?.dryRun), plan: ["syntetisk plan"],
  }),
} });
test.beforeEach(() => { writes = []; externalErrors = []; markedComplete = false; });

test("tørrkjøring endrer ingen profil eller treningsdata", async () => {
  const { anonymiserBruker } = await import("./anonymiser-bruker");
  const result = await anonymiserBruker("synthetic", new Date(), { dryRun: true });
  assert.equal(result.dryRun, true);
  assert.ok(result.plan?.length);
  assert.deepEqual(writes, []);
});

test("ekstern feil markerer ikke kontoen ferdig før vellykket gjenforsøk", async () => {
  const { anonymiserBruker } = await import("./anonymiser-bruker");
  externalErrors = ["storage utilgjengelig"];
  await assert.rejects(() => anonymiserBruker("synthetic"), /ekstern/i);
  assert.equal(markedComplete, false);
  externalErrors = [];
  await anonymiserBruker("synthetic");
  assert.equal(markedComplete, true);
  assert.ok(writes.includes("iup"));
});
