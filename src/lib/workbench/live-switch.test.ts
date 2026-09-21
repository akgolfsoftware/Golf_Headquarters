import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let rows: Record<string, Record<string, unknown>> = {};
let transactions = 0;

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "player", role: "PLAYER" }) } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => false } });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

const workbenchSession = {
  findUnique: async ({ where }: { where: { id: string } }) => rows[where.id] ?? null,
  updateMany: async ({ where, data }: { where: { id: string; status: string }; data: Record<string, unknown> }) => {
    const row = rows[where.id];
    if (!row || row.status !== where.status) return { count: 0 };
    Object.assign(row, data);
    return { count: 1 };
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  workbenchSession,
  $transaction: async (run: (tx: { workbenchSession: typeof workbenchSession }) => Promise<void>) => {
    transactions += 1;
    await run({ workbenchSession });
  },
} } });

let startNextWorkbenchLiveSession: typeof import("./wb-actions").startNextWorkbenchLiveSession;
before(async () => { ({ startNextWorkbenchLiveSession } = await import("./wb-actions")); });
beforeEach(() => {
  transactions = 0;
  const base = { playerId: "player", coachId: "coach", hiddenByPlayer: false, needsPlayerApproval: false,
    approvalStatus: null, date: new Date(0), updatedAt: new Date(0), createdAt: new Date(0), drills: [],
    title: "Økt", pyramid: "TEK", blockType: "OEKT", origin: "COACH", startMinute: 540, durationMinutes: 30 };
  rows = {
    current: { ...base, id: "current", status: "IN_PROGRESS", liveSnapshot: {} },
    next: { ...base, id: "next", status: "PUBLISHED", liveSnapshot: null },
  };
});

test("Live bytter fra pågående til neste publiserte økt samlet", async () => {
  const result = await startNextWorkbenchLiveSession({ currentSessionId: "current", nextSessionId: "next" });
  assert.equal(result.ok, true);
  assert.equal(transactions, 1);
  assert.equal(rows.current.status, "COMPLETED");
  assert.equal(rows.next.status, "IN_PROGRESS");
  assert.ok(rows.next.liveSnapshot);
});

test("Live nekter å bytte mellom ulike spillere", async () => {
  rows.next.playerId = "other";
  const result = await startNextWorkbenchLiveSession({ currentSessionId: "current", nextSessionId: "next" });
  assert.equal(result.ok, false);
  assert.equal(transactions, 0);
});
