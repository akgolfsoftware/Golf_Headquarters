/** Tørrkjøring må være lesende; ekstern feil må kunne prøves igjen. */
import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { tommeUkeplandetaljer, UKEPLAN_OMRADER } from "@/lib/workbench/ukeplan-schema";

let writes: string[] = [];
let externalErrors: string[] = [];
let markedComplete = false;
let kontoFinnes = true;
let ukeplaner: { id: string; playerId: string; customNotes: string | null; planningDetails: unknown; plannedHoursFys: number; repTargetDry: number }[] = [];
const ukeplanLesinger: { playerId: string }[] = [];
const ukeplanSkrivinger: { id: string; playerId: string }[] = [];
const updateMany = async () => { writes.push("data"); return { count: 1 }; };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: {
    findUnique: async () => kontoFinnes ? ({ id: "synthetic", publicPlayerId: null }) : null,
    update: async ({ data }: { data: { anonymisertAt?: Date | null } }) => {
      writes.push("user");
      markedComplete = Boolean(data.anonymisertAt);
      return {};
    },
  },
  round: { findMany: async () => [{ score: 75 }], updateMany },
  shot: { updateMany: async ({ data }: { data: Record<string, unknown> }) => {
    assert.equal(data.startX, null);
    assert.equal(data.endY, null);
    assert.equal(data.targetX, null);
    assert.equal(data.mentalScore, null);
    assert.equal(data.notes, null);
    writes.push("shot");
    return { count: 1 };
  } },
  roundDraft: { deleteMany: async () => { writes.push("roundDraft"); return { count: 1 }; } },
  trainingSessionV2: { findMany: async () => [{ id: "session" }], updateMany },
  trainingDrillV2: { updateMany }, drillLogV2: { updateMany }, fysOvelseRad: { updateMany },
  iupBesvarelse: { deleteMany: async ({ where }: { where: { userId: string } }) => {
    assert.equal(where.userId, "synthetic"); writes.push("iup"); return { count: 1 };
  } },
  weekPlan: {
    findMany: async ({ where }: { where: { playerId: string } }) => {
      ukeplanLesinger.push(where);
      return ukeplaner.filter(p => p.playerId === where.playerId).map(p => ({ id: p.id, planningDetails: p.planningDetails }));
    },
    updateMany: async ({ where, data }: { where: { id: string; playerId: string }; data: { customNotes: null; planningDetails: unknown } }) => {
      ukeplanSkrivinger.push(where); writes.push("ukeplan");
      const rows = ukeplaner.filter(p => p.id === where.id && p.playerId === where.playerId);
      for (const p of rows) {
        p.customNotes = data.customNotes;
        p.planningDetails = data.planningDetails === Prisma.DbNull ? null : data.planningDetails;
      }
      return { count: rows.length };
    },
  },
  $transaction: async (calls: Promise<unknown>[]) => Promise.all(calls),
} } });
mock.module("./slett-eksterne-data", { namedExports: {
  slettEksterneBrukerdata: async (_id: string, opts?: { dryRun?: boolean }) => ({
    authSlettet: false, stripeKundeSlettet: false, storageFilerFjernet: 0,
    bookingerGjestevasket: 0, feil: externalErrors, dryRun: Boolean(opts?.dryRun), plan: ["syntetisk plan"],
  }),
} });
test.beforeEach(() => {
  writes = []; externalErrors = []; markedComplete = false; kontoFinnes = true;
  ukeplaner = []; ukeplanLesinger.length = 0; ukeplanSkrivinger.length = 0;
});

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
  assert.ok(writes.includes("shot"));
  assert.ok(writes.includes("roundDraft"));
  assert.ok(writes.includes("iup"));
});


test("anonymisering vasker bare valgt eiers ukeplaner og bevarer trygge budsjett idempotent", async () => {
  const details = tommeUkeplandetaljer(); details.weekType = "tmed"; details.location = "Syntetisk opphold";
  for (const area of UKEPLAN_OMRADER) details.areas[area] = {
    priority: "VEDLIKEHOLDE", sessionBudget: area === "TURN" ? 0 : 2, focus: `Syntetisk fritekst ${area}`,
  };
  const row = (id: string, playerId: string, planningDetails: unknown) => ({
    id, playerId, customNotes: "Syntetisk ukenotat", planningDetails, plannedHoursFys: 2.5, repTargetDry: 40,
  });
  ukeplaner = [row("egen-v1", "synthetic", details), row("egen-ukjent", "synthetic", { version: 2, location: "Tekst" }),
    row("egen-ekstra", "synthetic", { ...details, ukjentTekst: "Tekst" }), row("annen-eier", "syntetisk-fremmed", details)];
  const original = structuredClone(ukeplaner);
  const { anonymiserBruker } = await import("./anonymiser-bruker");
  const result = await anonymiserBruker("synthetic");
  assert.equal(result.vasket.ukeplaner, 3);
  assert.deepEqual(ukeplanLesinger, [{ playerId: "synthetic" }]);
  assert.deepEqual(ukeplanSkrivinger, ukeplaner.slice(0, 3).map(p => ({ id: p.id, playerId: "synthetic" })));
  const expected = structuredClone(details); expected.location = null;
  for (const area of UKEPLAN_OMRADER) expected.areas[area].focus = null;
  assert.deepEqual(ukeplaner[0].planningDetails, expected);
  for (const p of ukeplaner.slice(0, 3)) {
    assert.equal(p.customNotes, null); assert.equal(p.plannedHoursFys, 2.5); assert.equal(p.repTargetDry, 40);
  }
  assert.equal(ukeplaner[1].planningDetails, null); assert.equal(ukeplaner[2].planningDetails, null);
  assert.deepEqual(ukeplaner[3], original[3]);
  const first = structuredClone(ukeplaner);
  await anonymiserBruker("synthetic");
  assert.deepEqual(ukeplaner, first); assert.ok(markedComplete);
});

test("tørrkjøring og manglende konto verken leser eller vasker ukeplaner", async () => {
  const { anonymiserBruker } = await import("./anonymiser-bruker");
  await anonymiserBruker("synthetic", new Date(), { dryRun: true });
  assert.equal(ukeplanLesinger.length, 0); assert.equal(ukeplanSkrivinger.length, 0);
  kontoFinnes = false;
  const result = await anonymiserBruker("synthetic");
  assert.equal(result.brukerFantes, false); assert.equal(result.vasket.ukeplaner, 0);
  assert.equal(ukeplanLesinger.length, 0); assert.equal(ukeplanSkrivinger.length, 0);
});
