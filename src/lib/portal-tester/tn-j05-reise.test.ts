import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { tnProtocol } from "./tn-catalog";
import { tnHistorikkForVariant, tnHistorikkRader } from "./tn-historikk";

const SPILLER = { id: "player-a", name: "Syn spiller", role: "PLAYER" };
const COACH = { id: "coach-a", name: "Syn coach", role: "COACH" };
const ANNEN = { id: "player-b", name: "Annen spiller", role: "PLAYER" };
const UTKAST = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FORSTE = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ANDRE = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

type Def = { id: string; name: string; isCustom: boolean; visibility: string; createdById: string | null };
type Assignment = { id: string; playerId: string; coachId: string; testId: string; status: string; completedResultId?: string };
type Session = { id: string; userId: string; testId: string; status: string; scoringData: object; testResultId?: string };
type Result = { id: string; userId: string; testId: string; score: number; details: unknown; takenAt: Date; notes?: string | null };

let viewer: { id: string; name: string; role: string } = COACH;
let definitions: Record<string, Def> = {};
let assignments: Assignment[] = [];
let sessions: Record<string, Session> = {};
let results: Result[] = [];
let notices: Array<{ userId: string; title: string; link?: string }> = [];

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => viewer },
});
mock.module("@/lib/auth/coached", {
  namedExports: { coachScopedPlayerWhere: () => ({ id: SPILLER.id }) },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/talent/test-sync", { namedExports: { syncTalentEtterTest: async () => {} } });
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async (input: { userId: string; title: string; link?: string }) => {
      notices.push({ userId: input.userId, title: input.title, link: input.link });
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findFirst: async ({ where }: { where: { AND: Array<{ id?: string }> } }) => {
          const ids = where.AND.flatMap((part) => (part.id ? [part.id] : []));
          return ids.length > 0 && ids.every((id) => id === SPILLER.id) ? { id: SPILLER.id } : null;
        },
      },
      testDefinition: {
        findUnique: async ({ where }: { where: { id: string } }) => definitions[where.id] ?? null,
        upsert: async ({
          where,
          create,
        }: {
          where: { id: string };
          create: { id: string; name: string };
        }) => {
          if (!definitions[where.id]) {
            definitions[where.id] = {
              id: create.id,
              name: create.name,
              isCustom: false,
              visibility: "PRIVATE",
              createdById: null,
            };
          }
          return { id: definitions[where.id]!.id, name: definitions[where.id]!.name };
        },
      },
      testAssignment: {
        create: async ({ data }: { data: Omit<Assignment, "id" | "status"> }) => {
          const row = { id: `asg-${assignments.length + 1}`, status: "OPEN", ...data };
          assignments.push(row);
          return row;
        },
      },
      $transaction: async (run: (tx: object) => Promise<unknown>) => {
        const next = structuredClone(sessions);
        const records = [...results];
        const assignmentState = assignments.map((row) => ({ ...row }));
        const out = await run({
          testAssignment: {
            findFirst: async ({
              where,
            }: {
              where: { playerId: string; testId: string; status: string };
            }) =>
              assignmentState.find(
                (row) =>
                  row.playerId === where.playerId &&
                  row.testId === where.testId &&
                  row.status === where.status,
              ) ?? null,
            updateMany: async ({
              where,
              data,
            }: {
              where: { id: string; playerId: string; status: string };
              data: { status: string; completedResultId: string };
            }) => {
              const row = assignmentState.find(
                (item) =>
                  item.id === where.id &&
                  item.playerId === where.playerId &&
                  item.status === where.status,
              );
              if (!row) return { count: 0 };
              row.status = data.status;
              row.completedResultId = data.completedResultId;
              return { count: 1 };
            },
          },
          notification: {
            create: async ({ data }: { data: { userId: string; title: string; link?: string } }) => {
              notices.push({ userId: data.userId, title: data.title, link: data.link });
            },
          },
          testDefinition: { upsert: async () => ({}) },
          testSession: {
            findUnique: async ({ where }: { where: { id: string } }) => next[where.id] ?? null,
            create: async ({ data }: { data: Session }) => {
              next[data.id] = { ...data, status: "IN_PROGRESS" };
              return next[data.id];
            },
            updateMany: async ({
              where,
              data,
            }: {
              where: { id: string };
              data: object;
            }) => {
              Object.assign(next[where.id]!, data);
              return { count: 1 };
            },
            update: async ({ where, data }: { where: { id: string }; data: object }) =>
              Object.assign(next[where.id]!, data),
          },
          testResult: {
            create: async ({ data }: { data: Result }) => {
              const row = { ...data, id: `result-${records.length + 1}`, takenAt: data.takenAt ?? new Date() };
              records.push(row);
              return { id: row.id };
            },
          },
        });
        sessions = next;
        results = records;
        assignments = assignmentState;
        return out;
      },
    },
  },
});

let assign: typeof import("@/app/admin/(legacy)/tester/tildel/[spillerId]/actions").tildelTest;
let save: typeof import("@/app/portal/tren/tester/team-norway/actions").saveTnTest;

before(async () => {
  assign = (await import("@/app/admin/(legacy)/tester/tildel/[spillerId]/actions")).tildelTest;
  save = (await import("@/app/portal/tren/tester/team-norway/actions")).saveTnTest;
});

beforeEach(() => {
  viewer = COACH;
  definitions = {
    "old-tn": {
      id: "old-tn",
      name: "Putt 1–3 m",
      isCustom: false,
      visibility: "PRIVATE",
      createdById: null,
    },
  };
  assignments = [];
  sessions = {};
  results = [];
  notices = [];
});

function puttValues(first = 1) {
  return Object.fromEntries(
    tnProtocol("putt-1-3m")!.rows.map((_, i) => [String(i + 1), { strokes: i === 0 ? first : 1 }]),
  );
}

test("J05: tildeling → utkastkorrigering → angre → fullføring → historikk uten overskriving", async () => {
  const tildelt = await assign({ spillerId: SPILLER.id, testId: "tn-v3-putt-1-3m" });
  assert.equal(tildelt.ok, true);
  assert.equal(assignments.length, 1);
  assert.equal(assignments[0]?.testId, "tn-v3-putt-1-3m");
  assert.equal(assignments[0]?.status, "OPEN");
  assert.equal(notices[0]?.userId, SPILLER.id);
  assert.equal(notices[0]?.link, "/portal/tren/tester/team-norway?test=putt-1-3m");

  viewer = SPILLER;
  const draft = await save({
    sessionId: UTKAST,
    protocolId: "putt-1-3m",
    count: 25,
    revision: 0,
    intent: "draft",
    values: puttValues(2),
  });
  assert.equal(draft.ok, true);
  const korrigert = await save({
    sessionId: UTKAST,
    protocolId: "putt-1-3m",
    count: 25,
    revision: 1,
    intent: "draft",
    values: puttValues(1),
  });
  assert.equal(korrigert.ok, true);
  const angret = await save({
    sessionId: UTKAST,
    protocolId: "putt-1-3m",
    count: 25,
    revision: 2,
    intent: "abort",
    values: puttValues(1),
  });
  assert.equal(angret.ok, true);
  assert.equal(sessions[UTKAST]?.status, "ABORTED");
  assert.equal(results.length, 0);
  assert.equal(assignments[0]?.status, "OPEN");

  const fullfort = await save({
    sessionId: FORSTE,
    protocolId: "putt-1-3m",
    count: 25,
    revision: 0,
    intent: "complete",
    values: puttValues(1),
  });
  assert.equal(fullfort.ok, true);
  assert.equal(results.length, 1);
  assert.equal(results[0]?.score, 25);
  assert.equal(assignments[0]?.status, "COMPLETED");
  assert.equal(assignments[0]?.completedResultId, results[0]?.id);

  const overskriv = await save({
    sessionId: FORSTE,
    protocolId: "putt-1-3m",
    count: 25,
    revision: 1,
    intent: "complete",
    values: puttValues(2),
  });
  assert.equal(overskriv.ok, false);
  assert.equal(results.length, 1);
  assert.equal(results[0]?.score, 25);

  const nyttForsok = await save({
    sessionId: ANDRE,
    protocolId: "putt-1-3m",
    count: 25,
    revision: 0,
    intent: "complete",
    values: puttValues(2),
  });
  assert.equal(nyttForsok.ok, true);
  assert.equal(results.length, 2);
  assert.equal(results[0]?.score, 25);
  assert.equal(results[1]?.score, 26);
  assert.equal(assignments[0]?.completedResultId, results[0]?.id);

  const historikk = tnHistorikkForVariant(tnHistorikkRader(results), "putt-1-3m", 25);
  assert.deepEqual(historikk.map((rad) => rad.score), [25, 26]);
});

test("uavklart protokoll, gammel TN-rad og spiller utenfor omfang tildeles ikke", async () => {
  assert.equal((await assign({ spillerId: SPILLER.id, testId: "tn-v3-naerspill-gate" })).ok, false);
  assert.equal((await assign({ spillerId: SPILLER.id, testId: "old-tn" })).ok, false);
  assert.equal((await assign({ spillerId: ANNEN.id, testId: "tn-v3-putt-1-3m" })).ok, false);
  assert.equal(assignments.length, 0);
  assert.equal(notices.length, 0);
});

test("uvedkommende spiller kan ikke føre den tildelte økta eller lukke tildelingen", async () => {
  assert.equal((await assign({ spillerId: SPILLER.id, testId: "tn-v3-putt-1-3m" })).ok, true);
  viewer = SPILLER;
  assert.equal(
    (
      await save({
        sessionId: UTKAST,
        protocolId: "putt-1-3m",
        count: 25,
        revision: 0,
        intent: "draft",
        values: puttValues(1),
      })
    ).ok,
    true,
  );
  viewer = ANNEN;
  assert.equal(
    (
      await save({
        sessionId: UTKAST,
        protocolId: "putt-1-3m",
        count: 25,
        revision: 1,
        intent: "complete",
        values: puttValues(1),
      })
    ).ok,
    false,
  );
  assert.equal(
    (
      await save({
        sessionId: ANDRE,
        protocolId: "putt-1-3m",
        count: 25,
        revision: 0,
        intent: "complete",
        values: puttValues(1),
      })
    ).ok,
    true,
  );
  assert.equal(sessions[UTKAST]?.userId, SPILLER.id);
  assert.equal(sessions[UTKAST]?.status, "IN_PROGRESS");
  assert.equal(results.length, 1);
  assert.equal(results[0]?.userId, ANNEN.id);
  assert.equal(assignments[0]?.status, "OPEN");
});
