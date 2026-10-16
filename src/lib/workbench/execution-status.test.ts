import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let row: Record<string, unknown>;
let writes = 0;
let collision = false;
let viewer = "player";
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: viewer, role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", { namedExports: { prisma: { workbenchSession: {
  findUnique: async () => row,
  updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    writes++;
    assert.equal(where.playerId, "player");
    assert.equal(where.updatedAt, row.updatedAt);
    assert.equal(where.hiddenByPlayer, false);
    assert.equal(where.needsPlayerApproval, false);
    if (collision) return { count: 0 };
    Object.assign(row, data); return { count: 1 };
  },
} } } });
let actions: typeof import("./wb-actions");
before(async () => { actions = await import("./wb-actions"); });
beforeEach(() => {
  viewer = "player"; writes = 0; collision = false;
  row = { id: "session", playerId: "player", coachId: "coach", status: "PUBLISHED", hiddenByPlayer: false,
    needsPlayerApproval: false, approvalStatus: null, date: new Date(0), updatedAt: new Date(0), createdAt: new Date(0),
    drills: [], title: "Testøkt", pyramid: "TEK", blockType: "OEKT", origin: "COACH", startMinute: 540, durationMinutes: 30 };
});
test("start og fullfør; gjentatt fullføring skriver ikke igjen", async () => {
  assert.equal((await actions.startSession("session")).ok, true);
  assert.equal(row.status, "IN_PROGRESS");
  assert.equal((await actions.completeSession("session")).ok, true);
  assert.equal((await actions.completeSession("session")).ok, true);
  assert.equal(writes, 2);
  assert.equal((await actions.startSession("session")).ok, false);
  assert.equal(row.status, "COMPLETED");
});
test("utkast, skjulte og ubesvarte/avviste forslag kan ikke gjennomføres", async () => {
  const patches = [{ status: "DRAFT" }, { status: "CANCELLED" }, { status: "SKIPPED" }, { hiddenByPlayer: true }, { needsPlayerApproval: true }, { approvalStatus: "REJECTED" }];
  const initial = { ...row };
  for (const patch of patches) {
    row = { ...initial, ...patch };
    assert.equal((await actions.startSession("session")).ok, false);
    assert.equal((await actions.completeSession("session")).ok, false);
  }
  assert.equal(writes, 0);
});
test("annen spiller og samtidig endring avvises", async () => {
  viewer = "other";
  assert.equal((await actions.startSession("session")).ok, false);
  assert.equal(writes, 0);
  viewer = "player"; collision = true;
  assert.equal((await actions.startSession("session")).ok, false);
  assert.equal(row.status, "PUBLISHED");
});

test("fullføring med innsats følger samme statusregler og bevarer historikk ved nytt forsøk", async () => {
  const initial = { ...row };
  for (const status of ["DRAFT", "SCHEDULED", "SKIPPED", "CANCELLED"]) {
    row = { ...initial, status };
    assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", perceivedEffort: 5 })).ok, false);
  }
  assert.equal(writes, 0);
  row = { ...initial };
  assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", perceivedEffort: 5, actualMinutes: 23 })).ok, true);
  assert.equal(row.status, "COMPLETED");
  assert.equal(row.perceivedEffort, 5);
  assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", perceivedEffort: 9, actualMinutes: 99 })).ok, true);
  assert.equal(row.perceivedEffort, 5);
  assert.equal(row.actualMinutes, 23);
  assert.equal(writes, 1);
});

test("fullføring med innsats avviser fremmed spiller og samtidig endring", async () => {
  viewer = "other";
  assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", actualMinutes: 30 })).ok, false);
  assert.equal(writes, 0);
  viewer = "player"; collision = true;
  assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", actualMinutes: 30 })).ok, false);
  assert.equal(row.status, "PUBLISHED");
});

test("fullføring tillater null minutter og skiller det fra ukjent tidsbruk", async () => {
  assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", actualMinutes: 0, perceivedEffort: 1 })).ok, true);
  assert.equal(row.actualMinutes, 0);
  assert.equal(row.perceivedEffort, 1);
  assert.equal(row.status, "COMPLETED");
});

test("maler kan ikke startes eller fullføres via direkte handling", async () => {
  row.isTemplate = true;
  assert.equal((await actions.startSession("session")).ok, false);
  assert.equal((await actions.completeSession("session")).ok, false);
  assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", actualMinutes: 0 })).ok, false);
  assert.equal((await actions.startNextWorkbenchLiveSession({ nextSessionId: "session" })).ok, false);
  assert.equal(writes, 0);
  assert.equal(row.status, "PUBLISHED");
});

test("innsats avviser negative, ikke-endelige, brøkdels- og for store minutter", async () => {
  for (const actualMinutes of [-1, NaN, Infinity, 0.5, 1441]) {
    assert.equal((await actions.updateSessionEffort({ sessionId: "session", actualMinutes })).ok, false);
    assert.equal((await actions.completeSessionWithEffort({ sessionId: "session", actualMinutes })).ok, false);
  }
  for (const perceivedEffort of [0, 11, NaN, 1.5]) {
    assert.equal((await actions.updateSessionEffort({ sessionId: "session", actualMinutes: 0, perceivedEffort })).ok, false);
  }
  assert.equal(writes, 0);
});
