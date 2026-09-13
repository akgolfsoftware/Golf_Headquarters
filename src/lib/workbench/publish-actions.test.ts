/**
 * O02: eksporterte Workbench-publiseringshandlinger.
 * Rolle alene er ikke nok; uvedkommende skriver ikke, og publisering
 * lager ikke nye økter.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mock, test } from "node:test";
import { mondayOf } from "@/lib/workbench/session-move-math";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker = { id: "spiller-a", role: "PLAYER" as Rolle };
let tillatteSpillere = new Set<string>(["spiller-a"]);
let planStatus = "DRAFT";
let planEier = "spiller-a";
let planId = "plan-a";
let sessions: Array<{
  id: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: string;
}> = [];
let oppdateringer: Array<Record<string, unknown>> = [];
let oppdaterMange = 0;
let opprettetOkter = 0;
let varsler: Array<Record<string, unknown>> = [];
let lesinger = 0;

function redirectFor(role: Rolle): string {
  if (role === "PARENT") return "/forelder";
  if (role === "ADMIN" || role === "COACH") return "/admin";
  return "/portal";
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] } = {}) => {
      const allow = options.allow
        ? Array.isArray(options.allow)
          ? options.allow
          : [options.allow]
        : null;
      if (allow && !allow.includes(bruker.role)) {
        throw new Error(`REDIRECT:${redirectFor(bruker.role)}`);
      }
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async (_viewer: unknown, playerId: string) =>
      tillatteSpillere.has(playerId),
  },
});
mock.module("@/lib/push/send", {
  namedExports: { sendPush: async () => undefined },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingPlan: {
        findFirst: async ({
          where,
          select,
        }: {
          where: { userId?: string; status?: string };
          select?: { sessions?: { where?: { scheduledAt?: { gte?: Date } } } };
        }) => {
          lesinger += 1;
          if (where.userId && where.userId !== planEier) return null;
          if (where.status && where.status !== planStatus) return null;
          const gte = select?.sessions?.where?.scheduledAt?.gte;
          const valgte = gte
            ? sessions.filter((s) => s.scheduledAt.getTime() >= gte.getTime())
            : sessions;
          return {
            id: planId,
            name: "Ukeplan",
            status: planStatus,
            userId: planEier,
            publishedSnapshot: null,
            sessions: valgte,
          };
        },
        update: async ({ data }: { data: Record<string, unknown> }) => {
          oppdateringer.push(data);
          if (typeof data.status === "string") planStatus = data.status;
          return { id: planId };
        },
        updateMany: async () => {
          oppdaterMange += 1;
          return { count: 0 };
        },
      },
      trainingPlanSession: {
        create: async () => {
          opprettetOkter += 1;
          return { id: "ny-okt" };
        },
      },
      notification: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          varsler.push(data);
          return { id: "varsel" };
        },
      },
    },
  },
});

async function actions() {
  return import("./publish-actions");
}

function ukesokt(id: string, offsetMs = 0) {
  return {
    id,
    title: id,
    scheduledAt: new Date(mondayOf(new Date()).getTime() + offsetMs),
    durationMin: 60,
    pyramidArea: "TEK",
  };
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  tillatteSpillere = new Set(["spiller-a"]);
  planStatus = "DRAFT";
  planEier = "spiller-a";
  planId = "plan-a";
  sessions = [ukesokt("okt-1")];
  oppdateringer = [];
  oppdaterMange = 0;
  opprettetOkter = 0;
  varsler = [];
  lesinger = 0;
});

test("kilde bruker Oslo-mandag for publiseringsvinduet", () => {
  const kilde = readFileSync(new URL("./publish-actions.ts", import.meta.url), "utf8");
  assert.match(kilde, /mondayOf\(new Date\(\)\)/);
  assert.doesNotMatch(kilde, /function mandagDenneUka/);
  assert.doesNotMatch(kilde, /d\.getDay\(\)/);
});

test("coach uten stalltilgang publiserer ikke andres plan og skriver ingenting", async () => {
  const { publishWorkbenchPlan } = await actions();
  bruker = { id: "coach-fremmed", role: "COACH" };
  tillatteSpillere = new Set();
  const svar = await publishWorkbenchPlan("spiller-a");
  assert.deepEqual(svar, { ok: false, error: "Du har ikke tilgang til denne spilleren." });
  assert.equal(oppdateringer.length, 0);
  assert.equal(opprettetOkter, 0);
  assert.equal(varsler.length, 0);
  assert.equal(lesinger, 0);
});

test("spiller kan ikke sende playerId for å publisere andres plan", async () => {
  const { publishWorkbenchPlan } = await actions();
  await assert.rejects(() => publishWorkbenchPlan("spiller-b"), /REDIRECT:\/portal/);
  assert.equal(oppdateringer.length, 0);
  assert.equal(opprettetOkter, 0);
});

test("egen plan publiseres uten å opprette økter, og snapshot hopper over forrige uke", async () => {
  const { publishWorkbenchPlan } = await actions();
  const mandag = mondayOf(new Date());
  const forrigeSondag = new Date(mandag.getTime() - 60 * 60 * 1000);
  sessions = [ukesokt("okt-denne"), { ...ukesokt("okt-forrige"), scheduledAt: forrigeSondag }];
  const svar = await publishWorkbenchPlan();
  assert.equal(svar.ok, true);
  assert.equal(svar.status, "PENDING_PLAYER");
  assert.equal(opprettetOkter, 0);
  assert.equal(oppdateringer.length, 1);
  const snapshot = oppdateringer[0]?.publishedSnapshot as Array<{ id: string }>;
  assert.deepEqual(
    snapshot.map((s) => s.id),
    ["okt-denne"],
  );
  assert.equal(planStatus, "PENDING_PLAYER");
});

test("tillatt coach publiserer spillerens plan én gang, uten dublettøkt", async () => {
  const { publishWorkbenchPlan } = await actions();
  bruker = { id: "coach-a", role: "COACH" };
  tillatteSpillere = new Set(["spiller-a"]);
  const svar = await publishWorkbenchPlan("spiller-a");
  assert.equal(svar.ok, true);
  assert.equal(oppdateringer.length, 1);
  assert.equal(opprettetOkter, 0);
  assert.equal(varsler.length, 1);
  assert.equal(varsler[0]?.userId, "spiller-a");
});

test("plan som ikke kan publiseres skrives ikke", async () => {
  const { publishWorkbenchPlan } = await actions();
  planStatus = "PENDING_PLAYER";
  const svar = await publishWorkbenchPlan();
  assert.deepEqual(svar, { ok: false, error: "Planen kan ikke publiseres i denne statusen" });
  assert.equal(oppdateringer.length, 0);
});

test("hentPubliserDiff avviser coach uten tilgang uten å lese planen", async () => {
  const { hentPubliserDiff } = await actions();
  bruker = { id: "coach-fremmed", role: "COACH" };
  tillatteSpillere = new Set();
  const svar = await hentPubliserDiff("spiller-a");
  assert.deepEqual(svar, { ok: false, error: "Du har ikke tilgang til denne spilleren." });
  assert.equal(lesinger, 0);
});

test("spiller godtar bare egen ventende plan", async () => {
  const { acceptWorkbenchPlan } = await actions();
  planStatus = "PENDING_PLAYER";
  const svar = await acceptWorkbenchPlan();
  assert.equal(svar.ok, true);
  assert.equal(svar.status, "ACTIVE");
  assert.equal(oppdateringer.length, 1);
  assert.equal(oppdaterMange, 1);
  assert.equal(opprettetOkter, 0);
});

test("spiller godtar ikke en plan som tilhører en annen", async () => {
  const { acceptWorkbenchPlan } = await actions();
  planEier = "spiller-b";
  planStatus = "PENDING_PLAYER";
  const svar = await acceptWorkbenchPlan();
  assert.deepEqual(svar, { ok: false, error: "Ingen plan venter på godkjenning." });
  assert.equal(oppdateringer.length, 0);
  assert.equal(oppdaterMange, 0);
});

test("avvisning av andres plan skriver ingenting", async () => {
  const { rejectWorkbenchPlan } = await actions();
  planEier = "spiller-b";
  planStatus = "PENDING_PLAYER";
  const svar = await rejectWorkbenchPlan("Tidspunktet passer ikke denne uken");
  assert.deepEqual(svar, { ok: false, error: "Ingen plan venter på godkjenning." });
  assert.equal(oppdateringer.length, 0);
});
