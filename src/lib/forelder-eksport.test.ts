import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let active = true;
let pendingConsent = false;
let trainingReads = 0;
const date = new Date("2026-10-12T12:00:00Z");
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async ({ where, select }: { where: { id: string; parentRelations?: { some: { parentId: string; approved: boolean } } }; select: Record<string, unknown> }) => {
    if (where.parentRelations) { assert.equal(where.parentRelations.some.parentId, "parent"); assert.equal(where.parentRelations.some.approved, true); if (!active) return null; }
    assert.equal(select.rounds, undefined);
    return { id: where.id, name: "Syntetisk", email: "syntetisk@example.invalid", phone: null, homeClub: "Klubb", hcp: 12, school: null, dateOfBirth: null, createdAt: date,
      preferences: { fotoBruk: true, privateReflection: "HEMMELIG", onboarding: { privat: "HEMMELIG" }, dgBaseline: { value: 8 } }, requiresGuardianConsent: pendingConsent, guardianConsentGivenAt: null };
  } },
  parentRelation: { findMany: async () => [{ childId: "child", relationship: "Foresatt" }] },
  booking: { findMany: async () => [] }, payment: { findMany: async () => [] }, notification: { findMany: async () => [] },
  trainingPlanSessionLog: { findMany: async ({ select }: { select: Record<string, unknown> }) => { trainingReads++; assert.equal(select.rating, undefined); assert.equal(select.notes, undefined); assert.equal(select.liveSnapshot, undefined); return [{ id: "log", startedAt: date, completedAt: date, session: { title: "Gjennomført økt" } }]; } },
  round: { findMany: async () => { throw new Error("Rå SG skal ikke leses"); } }, roundDraft: { findMany: async () => { throw new Error("Private utkast skal ikke leses"); } },
} } });
let load: typeof import("./forelder-eksport").lastForelderEksport;
before(async () => { load = (await import("./forelder-eksport")).lastForelderEksport; });
beforeEach(() => { active = true; pendingConsent = false; trainingReads = 0; });
test("foreldreeksport utelater rå prefs, private refleksjoner, utkast og DG", async () => {
  const data = await load("parent");
  assert.equal(data.barn[0].profil.samtykker.fotoBruk, true);
  assert.doesNotMatch(JSON.stringify(data), /HEMMELIG|privateReflection|dgBaseline|onboarding|sgTotal/);
  assert.equal(data.barn[0].treningsokter.length, 1);
});
test("bortfalt foreldrelink gjør at barnets detaljdata ikke eksporteres", async () => {
  active = false; const data = await load("parent"); assert.deepEqual(data.barn, []); assert.equal(trainingReads, 0);
});
test("ventende foreldresamtykke gir ingen treningshistorikk", async () => {
  pendingConsent = true; const data = await load("parent"); assert.deepEqual(data.barn[0].treningsokter, []); assert.equal(trainingReads, 0);
});
