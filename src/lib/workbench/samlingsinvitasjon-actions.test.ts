import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Actor = { id: string; role: "COACH" | "PLAYER" | "ADMIN"; email: string };
let actor: Actor = { id: "coach-a", role: "COACH", email: "coach@example.test" };
const actions = new Map<string, Record<string, unknown>>();
const copiedSessions = new Map<string, Record<string, unknown>>();
const copiedDrills = new Map<string, Record<string, unknown>>();
const notifications: Record<string, unknown>[] = [];
const sourceDrill = {
  id: "drill-a", title: "Treffpunkt", description: "Syntetisk øvelse", durationMinutes: 30,
  akFormel: { pyramid: "TEK", area: "TEE_TOTAL", label: "Treffpunkt", historicalField: "preserved" },
  techniqueFocus: "Oppstilling", sortOrder: 0, sourceId: null, exerciseId: null, positionTaskId: null,
  repType: "SETT_REPS", repAntall: null, repMinutter: null, repSett: 3, repReps: 8,
  planRepsUtenBall: 12, planRepsLavFart: 8, planRepsAuto: 4,
};
const sourceSession = {
  id: "wb-group-source-a", updatedAt: new Date("2026-10-02T10:00:00Z"), date: new Date("2099-04-08T00:00:00Z"),
  startMinute: 540, durationMinutes: 90, title: "Syntetisk samlingsøkt", pyramid: "TEK", blockType: "OEKT",
  environment: "RANGE", practiceType: "BLOKK", location: "Treningsfelt", maalsetning: "Treffpunkt",
  skillArea: "Tee", pressureLevel: "Konkurranse", pPosisjoner: ["Tee 1"],
  coachId: "coach-a", drills: [sourceDrill],
};
const schedule = {
  id: "schedule-a", groupId: "group-a", title: "Vårsamling", description: "Syntetisk samling", location: "GFGK",
  startAt: new Date("2099-04-08T08:00:00Z"), endAt: new Date("2099-04-10T17:00:00Z"),
  kind: "SAMLING", updatedAt: new Date("2026-10-02T10:00:00Z"),
};
const tx = {
  groupSchedule: { findFirst: async () => schedule },
  workbenchSession: {
    findMany: async ({ where }: { where: Record<string, unknown> }) => where.groupId ? [sourceSession] : [],
    findUnique: async ({ where }: { where: { id: string } }) => copiedSessions.get(where.id) ?? null,
    create: async ({ data }: { data: Record<string, unknown> }) => { copiedSessions.set(String(data.id), data); return data; },
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = { ...copiedSessions.get(where.id), ...data };
      copiedSessions.set(where.id, row); return row;
    },
    updateMany: async () => ({ count: 0 }),
  },
  workbenchDrill: {
    upsert: async ({ where, create, update }: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }) => {
      const row = copiedDrills.get(where.id) ? { ...copiedDrills.get(where.id), ...update } : create;
      copiedDrills.set(where.id, row); return row;
    },
    deleteMany: async () => ({ count: 0 }),
  },
  groupMember: {
    findMany: async ({ where }: { where: Record<string, unknown> }) => where.userId
      ? [{ groupId: "group-a" }]
      : [{ userId: "player-a" }, { userId: "player-b" }],
    findFirst: async () => ({ id: "membership-a" }),
  },
  group: { findMany: async () => [{ id: "group-a" }] },
  planAction: {
    findMany: async ({ where }: { where: Record<string, unknown> }) => {
      const ids = (where.id as { in?: string[] } | undefined)?.in;
      if (ids) return [...actions.values()].filter(row => ids.includes(String(row.id)));
      const excluded = new Set((where.id as { notIn?: string[] } | undefined)?.notIn ?? []);
      return [...actions.values()].filter(row => !excluded.has(String(row.id)) && row.status === where.status && row.actionType === where.actionType);
    },
    createMany: async ({ data }: { data: Record<string, unknown>[] }) => {
      let count = 0;
      for (const row of data) if (!actions.has(String(row.id))) { actions.set(String(row.id), row); count++; }
      return { count };
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const row = actions.get(String(where.id));
      return row && row.userId === where.userId && row.status === where.status && row.actionType === where.actionType ? row : null;
    },
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const row = actions.get(String(where.id));
      if (!row || row.status !== where.status || (where.userId && row.userId !== where.userId)) return { count: 0 };
      Object.assign(row, data); return { count: 1 };
    },
  },
  notification: { createMany: async ({ data }: { data: Record<string, unknown>[] }) => { notifications.push(...data); return { count: data.length }; } },
  $executeRaw: async () => 1,
};

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => actor } });
mock.module("@/lib/auth/action-guards", { namedExports: { requireSpillerActionUser: async () => actor } });
mock.module("@/lib/auth/effective-capabilities", { namedExports: { assertCapability: async () => undefined } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/domain/grupper", { namedExports: { aktivtSpillerMedlemskapWhere: () => ({ endedAt: null }) } });
mock.module("@/lib/workbench/group-scope", { namedExports: { canEditGroup: async () => true } });
mock.module("@/lib/workbench/plan-kalender-data", { namedExports: { lastPlanKalenderBlokker: async () => Array.from({ length: 7 }, () => []) } });
mock.module("@/lib/prisma", { namedExports: { prisma: { ...tx, $transaction: async (run: (client: typeof tx) => Promise<unknown>) => run(tx) } } });

async function mod() { return import("./samlingsinvitasjon-actions"); }
function reset() {
  actor = { id: "coach-a", role: "COACH", email: "coach@example.test" };
  actions.clear(); copiedSessions.clear(); copiedDrills.clear(); notifications.length = 0;
  sourceSession.updatedAt = new Date("2026-10-02T10:00:00Z");
}

test("publisering er idempotent; spilleren godkjenner én komplett øktkopi", async () => {
  reset();
  const { publiserSamlingsprogram, svarPaSamlingsinvitasjon } = await mod();
  const published = await publiserSamlingsprogram({ id: schedule.id });
  assert.equal(published.ok, true);
  if (!published.ok) return;
  assert.equal(published.nye, 2);
  assert.equal(notifications.length, 2);

  const retry = await publiserSamlingsprogram({ id: schedule.id });
  assert.equal(retry.ok, true);
  if (retry.ok) assert.equal(retry.nye, 0);
  assert.equal(notifications.length, 2);

  actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const playerInvite = [...actions.values()].find(row => row.userId === "player-a");
  assert.ok(playerInvite);
  const answer = await svarPaSamlingsinvitasjon({ id: String(playerInvite?.id), beslutning: "ACCEPTED" });
  assert.equal(answer.ok, true);
  assert.equal(copiedSessions.size, 1);
  assert.equal(copiedDrills.size, 1);
  assert.equal([...copiedDrills.values()][0]?.planRepsLavFart, 8);
  assert.equal(([...copiedDrills.values()][0]?.akFormel as { historicalField?: string }).historicalField, "preserved");
  const repeated = await svarPaSamlingsinvitasjon({ id: String(playerInvite?.id), beslutning: "ACCEPTED" });
  assert.equal(repeated.ok, false);
  assert.equal(copiedSessions.size, 1);
});

test("avslag legger ingen økt i Workbench", async () => {
  reset();
  const { publiserSamlingsprogram, svarPaSamlingsinvitasjon } = await mod();
  await publiserSamlingsprogram({ id: schedule.id });
  const invite = [...actions.values()].find(row => row.userId === "player-b" && row.status === "PENDING");
  assert.ok(invite);
  actor = { id: "player-b", role: "PLAYER", email: "player-b@example.test" };
  const result = await svarPaSamlingsinvitasjon({ id: String(invite?.id), beslutning: "REJECTED" });
  assert.equal(result.ok, true);
  assert.equal(copiedSessions.size, 0);
});

test("foreldet samlingsprogram kan ikke kopieres til spillerens Workbench", async () => {
  reset();
  const { publiserSamlingsprogram, svarPaSamlingsinvitasjon } = await mod();
  await publiserSamlingsprogram({ id: schedule.id });
  const invite = [...actions.values()].find(row => row.userId === "player-a" && row.status === "PENDING");
  assert.ok(invite);
  sourceSession.updatedAt = new Date("2026-10-02T10:01:00Z");
  actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const result = await svarPaSamlingsinvitasjon({ id: String(invite?.id), beslutning: "ACCEPTED" });
  assert.equal(result.ok, false);
  assert.equal(copiedSessions.size, 0);
  assert.equal(invite?.status, "CONFLICT");
});
