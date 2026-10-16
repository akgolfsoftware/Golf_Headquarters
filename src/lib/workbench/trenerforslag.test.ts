import assert from "node:assert/strict";
import { mock, test } from "node:test";

let actor: { id: string; role: "COACH" | "PLAYER"; email: string } = { id: "coach-a", role: "COACH", email: "coach@example.test" };
let shareAllowed = true;
let action: { id: string; userId: string; coachId: string; actionType: string; suggestion: unknown; status: string } | null = null;
let session: { id: string; playerId: string; date: Date; startMinute: number; durationMinutes: number; title: string; pyramid: string; location: string | null; status: string; updatedAt: Date; sourceGroupSessionId: string | null; groupId: string | null; planActionId?: string | null } | null = null;
let createdSessions: unknown[] = [];
let sessionUpdates: unknown[] = [];
let goals: { id: string; userId: string; periodBlockId: string; akse: string; tittel: string; egentidMinUke: number; maalemetode: string | null;
  status: string; egenvurdering: number | null; trenervurdering: number | null; kommentar: string | null; updatedAt: Date }[] = [];
let goalCreates: unknown[] = [];
let idSequence = 0;

const tx = {
  planAction: {
    create: async ({ data }: { data: { userId: string; coachId: string; actionType: string; suggestion: unknown; status: string } }) => {
      action = { id: `proposal-${++idSequence}`, ...data };
      return { id: action.id };
    },
    findFirst: async ({ where }: { where: { id: string; userId: string; status: string; actionType: string } }) =>
      action && action.id === where.id && action.userId === where.userId && action.status === where.status && action.actionType === where.actionType ? action : null,
    updateMany: async ({ where, data }: { where: { id: string; userId?: string; status: string }; data: { status: string; decidedAt: Date; decidedById: string } }) => {
      if (!action || action.id !== where.id || action.status !== where.status || (where.userId && action.userId !== where.userId)) return { count: 0 };
      action.status = data.status; return { count: 1 };
    },
    findMany: async () => action ? [action] : [],
  },
  workbenchSession: {
    findFirst: async ({ where }: { where: { id: string; playerId: string } }) => session && session.id === where.id && session.playerId === where.playerId ? session : null,
    create: async ({ data }: { data: Record<string, unknown> }) => { createdSessions.push(data); return data; },
    updateMany: async ({ where, data }: { where: { id: string; playerId: string; updatedAt: Date }; data: Record<string, unknown> }) => {
      if (!session || session.id !== where.id || session.playerId !== where.playerId || session.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
      sessionUpdates.push(data); Object.assign(session, data, { updatedAt: new Date(session.updatedAt.getTime() + 1000) }); return { count: 1 };
    },
  },
  groupPeriodGoal: {
    findMany: async () => goals.map(({ userId: _userId, ...goal }) => goal),
    deleteMany: async () => { goals = []; return { count: 1 }; },
    createMany: async ({ data }: { data: unknown[] }) => { goalCreates.push(...data); return { count: data.length }; },
  },
  groupPeriodBlock: { findFirst: async () => ({ id: "period-next" }) },
  group: { findFirst: async () => ({ id: "group-wang" }) },
};

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", { namedExports: {
  requireCoachActionUser: async () => actor,
  requireSpillerActionUser: async () => actor,
} });
mock.module("@/lib/domain/grupper", { namedExports: {
  aktivtTrenerMedlemskapWhere: () => ({ endedAt: null }), TEAM_NORWAY_SLUG: "team-norway",
} });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/deling/profil-lesing", { namedExports: {
  medNavngittProfil: async (_coachId: string, _playerId: string, _groupId: string, read: (client: typeof tx) => Promise<unknown>) => shareAllowed ? read(tx) : null,
} });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  group: { findFirst: async () => ({ id: "group-named-share" }) },
  groupMember: { findFirst: async () => ({ id: "coach-membership" }) },
  user: { findMany: async () => [{ id: "coach-a", name: "Trener A" }] },
  $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
  planAction: tx.planAction,
} } });

function reset() {
  actor = { id: "coach-a", role: "COACH", email: "coach@example.test" };
  shareAllowed = true; action = null; session = null; createdSessions = []; sessionUpdates = []; goals = []; goalCreates = []; idSequence = 0;
}
async function mod() { return import("./trenerforslag"); }
const add = { organisasjon: "TEAM_NORWAY", spillerId: "player-a", handling: "ADD", etter: { date: "2099-01-01", startMinute: 540, durationMinutes: 60, title: "Teknikk", pyramid: "TEK", location: null }, begrunnelse: "Arbeid med presisjon." };

test("opprettelse lagrer et forslag, men rører ikke spillerens aktive plan", async () => {
  reset(); const { lagTrenerforslag } = await mod();
  const result = await lagTrenerforslag(add);
  assert.equal(result.ok, true); assert.equal(action?.status, "PENDING"); assert.equal(createdSessions.length, 0); assert.equal(sessionUpdates.length, 0);
});

test("avvisning bevarer planen; godkjenning legger til én økt og kan ikke gjentas", async () => {
  reset(); const { lagTrenerforslag, svarPaTrenerforslag } = await mod();
  const rejected = await lagTrenerforslag(add); actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const no = await svarPaTrenerforslag({ actionId: rejected.ok ? rejected.id : "", beslutning: "REJECTED" });
  assert.equal(no.ok, true); assert.equal(createdSessions.length, 0);
  reset(); const added = await lagTrenerforslag(add); actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const yes = await svarPaTrenerforslag({ actionId: added.ok ? added.id : "", beslutning: "ACCEPTED" });
  assert.equal(yes.ok, true); assert.equal(createdSessions.length, 1); assert.equal((createdSessions[0] as { planActionId: string }).planActionId, added.ok ? added.id : "");
  const again = await svarPaTrenerforslag({ actionId: added.ok ? added.id : "", beslutning: "ACCEPTED" });
  assert.equal(again.ok, false); assert.equal(createdSessions.length, 1);
});

test("oppdatert økt gir konflikt og blir ikke overskrevet", async () => {
  reset();
  session = { id: "session-a", playerId: "player-a", date: new Date("2099-01-01T00:00:00Z"), startMinute: 540, durationMinutes: 60,
    title: "Spillerens nyere økt", pyramid: "TEK", location: null, status: "SCHEDULED", updatedAt: new Date("2026-10-02T10:00:00Z"), sourceGroupSessionId: null, groupId: null };
  const { lagTrenerforslag, svarPaTrenerforslag } = await mod();
  const created = await lagTrenerforslag({ organisasjon: "TEAM_NORWAY", spillerId: "player-a", handling: "UPDATE", sessionId: "session-a",
    etter: { date: "2099-01-02", startMinute: 600, durationMinutes: 60, title: "Trenerens versjon", pyramid: "TEK", location: null }, begrunnelse: "Flytt økten litt." });
  assert.equal(created.ok, true); session.title = "Spillerens samtidige endring"; session.updatedAt = new Date("2026-10-02T10:01:00Z");
  actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const result = await svarPaTrenerforslag({ actionId: created.ok ? created.id : "", beslutning: "ACCEPTED" });
  assert.equal(result.ok, false); assert.equal(session.title, "Spillerens samtidige endring"); assert.equal(action?.status, "CONFLICT"); assert.equal(sessionUpdates.length, 0);
});

test("tilbaketrukket deling blokkerer nytt forslag", async () => {
  reset(); shareAllowed = false; const { lagTrenerforslag } = await mod();
  const result = await lagTrenerforslag(add);
  assert.equal(result.ok, false); assert.equal(action, null);
});

test("forslag til en utløpt dato lagres ikke", async () => {
  reset(); const { lagTrenerforslag } = await mod();
  const result = await lagTrenerforslag({ ...add, etter: { ...add.etter, date: "2000-01-01" } });
  assert.equal(result.ok, false); assert.equal(action, null);
});

function makeIupAction() {
  const updatedAt = new Date("2026-10-02T10:00:00.000Z");
  goals = [{ id: "goal-before", userId: "player-a", periodBlockId: "period-next", akse: "TEK", tittel: "Innspill", egentidMinUke: 60,
    maalemetode: null, status: "IKKE_STARTET", egenvurdering: null, trenervurdering: null, kommentar: null, updatedAt }];
  action = { id: "iup-proposal", userId: "player-a", coachId: "coach-a", actionType: "WORKBENCH_COACH_PROPOSAL", status: "PENDING",
    suggestion: { versjon: 1, kind: "IUP_FOCUS", organisasjon: "WANG", periodBlockId: "period-next", periodName: "Vår", expected: goals.map(({ userId: _userId, ...g }) => ({ ...g, updatedAt: updatedAt.toISOString() })),
      etter: [{ akse: "SPILL", tittel: "Beslutninger", egentidMinUke: 90, maalemetode: "Refleksjon etter økt" }], begrunnelse: "Fra samtalen" } } as typeof action;
}

test("IUP-fokus forblir uendret ved avslag og erstattes først én gang ved godkjenning", async () => {
  reset(); makeIupAction(); const { svarPaTrenerforslag } = await mod();
  actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const rejected = await svarPaTrenerforslag({ actionId: "iup-proposal", beslutning: "REJECTED" });
  assert.equal(rejected.ok, true, JSON.stringify(rejected)); assert.equal(goals[0]?.id, "goal-before"); assert.equal(goalCreates.length, 0);

  reset(); makeIupAction(); actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const accepted = await svarPaTrenerforslag({ actionId: "iup-proposal", beslutning: "ACCEPTED" });
  assert.equal(accepted.ok, true); assert.equal(goals.length, 0); assert.equal(goalCreates.length, 1); assert.equal(action?.status, "ACCEPTED");
  const again = await svarPaTrenerforslag({ actionId: "iup-proposal", beslutning: "ACCEPTED" });
  assert.equal(again.ok, false); assert.equal(goalCreates.length, 1);
});

test("IUP-fokus i endret periode blir konflikt uten å skrive over elevens endring", async () => {
  reset(); makeIupAction(); goals[0]!.tittel = "Elevens nyere fokus";
  actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const { svarPaTrenerforslag } = await mod();
  const result = await svarPaTrenerforslag({ actionId: "iup-proposal", beslutning: "ACCEPTED" });
  assert.equal(result.ok, false); assert.equal(goals[0]?.tittel, "Elevens nyere fokus"); assert.equal(goalCreates.length, 0); assert.equal(action?.status, "CONFLICT");
});

test("IUP-fokus kan ikke fjerne lagret oppfølging fra før-perioden", async () => {
  reset(); makeIupAction(); goals[0]!.status = "PAA_VEI";
  if (action && typeof action.suggestion === "object" && action.suggestion !== null) {
    action.suggestion = { ...action.suggestion, expected: goals.map(({ userId: _userId, ...g }) => ({ ...g, updatedAt: g.updatedAt.toISOString() })) };
  }
  actor = { id: "player-a", role: "PLAYER", email: "player@example.test" };
  const { svarPaTrenerforslag } = await mod();
  const result = await svarPaTrenerforslag({ actionId: "iup-proposal", beslutning: "ACCEPTED" });
  assert.equal(result.ok, false); assert.equal(goals[0]?.status, "PAA_VEI"); assert.equal(goalCreates.length, 0); assert.equal(action?.status, "CONFLICT");
});
