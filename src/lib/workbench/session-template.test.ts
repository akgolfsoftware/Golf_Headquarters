import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { WbRow } from "./wb-map";
let viewer = { id: "syntetisk-spiller", role: "PLAYER" };
let writes = 0, attempts = 0, race = false;
let row: WbRow;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath() {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: { workbenchSession: {
  findUnique: async () => ({ ...row }),
  updateMany: async ({ where, data }: { where: { id: string; playerId: string; status: string; updatedAt: Date }; data: { isTemplate: boolean } }) => {
    attempts++;
    assert.equal(where.id, row.id); assert.equal(where.playerId, row.playerId);
    assert.ok(where.updatedAt instanceof Date); assert.equal(where.status, "PUBLISHED" === row.status ? "PUBLISHED" : row.status);
    if (race) row = { ...row, status: "IN_PROGRESS", updatedAt: new Date(1) };
    if (where.status !== row.status || where.updatedAt.getTime() !== row.updatedAt.getTime()) return { count: 0 };
    row = { ...row, ...data }; writes++; return { count: 1 };
  },
} } } });
let action: typeof import("./wb-actions").setSessionTemplate;
before(async () => { action = (await import("./wb-actions")).setSessionTemplate; });
beforeEach(() => {
  viewer = { id: "syntetisk-spiller", role: "PLAYER" }; writes = 0; attempts = 0; race = false;
  row = { id: "syntetisk-okt", playerId: viewer.id, coachId: "syntetisk-coach", status: "PUBLISHED", updatedAt: new Date(0), createdAt: new Date(0), date: new Date("2026-10-02"), startMinute: 600, durationMinutes: 60, title: "Syntetisk", pyramid: "TEK", blockType: "OEKT", origin: "PLAYER", isTemplate: false, drills: [], hiddenByPlayer: false, needsPlayerApproval: false,
    groupId: null, sourceGroupSessionId: null, environment: null, practiceType: null, location: null, notes: null,
    approvalStatus: null, localOverride: false, publishedAt: null, publishedBy: null, isAgentProposal: false,
    planActionId: null, createdBy: "PLAYER", seriesId: null, seriesIndex: null, planId: null, rationale: null,
    skillArea: null, pressureLevel: null, pPosisjoner: [], maalsetning: null, liveSnapshot: null,
    lFase: null, miljo: null, csNivaa: null, migrertFraTrainingPlanSessionId: null, perceivedEffort: null, actualMinutes: null };

});
test("økt før start kan merkes som mal under eier- og versjonsfilter", async () => { assert.equal((await action(row.id, true)).ok, true); assert.equal(writes, 1); assert.equal(row.isTemplate, true); });
test("pågående økt avvises før skriving", async () => { row.status = "IN_PROGRESS"; assert.equal((await action(row.id, true)).ok, false); assert.equal(attempts, 0); assert.equal(writes, 0); assert.equal(row.isTemplate, false); });
test("samtidig start avvises atomisk uten konvertering", async () => { race = true; assert.equal((await action(row.id, true)).ok, false); assert.equal(attempts, 1); assert.equal(writes, 0); assert.equal(row.status, "IN_PROGRESS"); assert.equal(row.isTemplate, false); });
test("historisk pågående mal kan få malflagget fjernet", async () => { row.status = "IN_PROGRESS"; row.isTemplate = true; assert.equal((await action(row.id, false)).ok, true); assert.equal(row.isTemplate, false); assert.equal(row.status, "IN_PROGRESS"); });
test("fremmed spiller beholder eksisterende avvisning", async () => { viewer.id = "syntetisk-fremmed"; assert.equal((await action(row.id, true)).ok, false); assert.equal(attempts, 0); });
