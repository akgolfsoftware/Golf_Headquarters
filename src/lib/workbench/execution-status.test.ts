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
