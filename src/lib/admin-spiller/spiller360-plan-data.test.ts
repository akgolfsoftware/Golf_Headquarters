import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import { HELSE_SAMTYKKE_VERSJON } from "@/lib/health/samtykke-regler";

const id = "synthetic-player";
const now = new Date("2026-10-25T12:00:00Z"); // 25-timers Oslo-dag.
let actor = { id: "synthetic-coach", role: "COACH" };
let allowed = true, denied = false, inside = false;
let level: "INGEN" | "STATUS" | "DETALJ" = "INGEN";
let fail = "";
let reads: string[] = [];
const scope = () => ({ id: { in: allowed ? [id] : [] } });
function check(name: string) {
  assert.ok(inside, `${name} utenfor beskyttet transaksjon`); reads.push(name);
  if (fail === name) throw Error("synthetic-read-failure");
}
const tx = {
  user: { findFirst: async (args: Prisma.UserFindFirstArgs) => {
    check("player"); assert.deepEqual(args.where, { AND: [scope(), { id: (args.where?.AND as Prisma.UserWhereInput[])[1].id }] });
    return allowed && (args.where?.AND as Prisma.UserWhereInput[])[1].id === id ? { id } : null;
  } },
  trainingPlanSession: { findMany: async (args: Prisma.TrainingPlanSessionFindManyArgs) => {
    check("draft-filter"); assert.deepEqual(args.where, { plan: { userId: id, status: { in: ["DRAFT", "REJECTED"] } } });
    return [{ id: "synthetic-private-session" }];
  } },
  workbenchSession: { findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => {
    check("week"); const w = args.where!;
    assert.equal(w.playerId, id); assert.equal(w.isTemplate, false); assert.equal(w.hiddenByPlayer, false); assert.equal(w.needsPlayerApproval, false);
    assert.deepEqual(w.OR, [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }]);
    const status = w.status as { in: string[] };
    assert.ok(!status.in.includes("DRAFT")); assert.ok(!status.in.includes("SCHEDULED"));
    assert.deepEqual(w.date, { gte: new Date("2026-10-19T00:00:00Z"), lt: new Date("2026-10-26T00:00:00Z") });
    return [{ id: "wb", date: new Date("2026-10-25"), title: "Syntetisk økt", pyramid: "TEK", durationMinutes: 60, status: "SKIPPED" }];
  } },
  trainingPlan: { findFirst: async (args: Prisma.TrainingPlanFindFirstArgs) => {
    check("active-plan"); assert.deepEqual(args.where, { userId: id, isActive: true, status: { notIn: ["DRAFT", "REJECTED"] } });
    return { name: "Syntetisk plan", startDate: now, endDate: null, sessions: [{ status: "COMPLETED" }, { status: "PLANNED" }] };
  } },
  planAction: { findFirst: async (args: Prisma.PlanActionFindFirstArgs) => {
    check("proposal"); assert.deepEqual(args.where?.OR, [{ coachId: actor.id }, { coachId: null }]); return null;
  } },
  helseSamtykke: { findMany: async (args: Prisma.HelseSamtykkeFindManyArgs) => {
    check("health-permission"); assert.equal(args.where?.userId, id);
    return (level === "INGEN" ? [] : level === "DETALJ" ? ["MANUELL_HELSE", "COACH_INNSYN", "COACH_DETALJ"] : ["MANUELL_HELSE", "COACH_INNSYN"]).map(type => ({ type, gitt: true, tekstVersjon: HELSE_SAMTYKKE_VERSJON, createdAt: now }));
  } },
  leave: { findMany: async (args: Prisma.LeaveFindManyArgs) => {
    check("leave"); assert.equal(args.where?.userId, id); assert.equal(args.take, 10); assert.ok(args.select);
    return [{ id: "leave", reason: "SKADE", startAt: now, endAt: null, returnedAt: null, isInjury: true, description: "Syntetisk helsebeskrivelse" }];
  } },
  seasonPlan: { findFirst: async () => { check("season"); return null; } },
  tournamentEntry: { findMany: async (args: Prisma.TournamentEntryFindManyArgs) => {
    check("tournament"); assert.equal(args.where?.userId, id); assert.equal(args.where?.withdrawnAt, null); return [];
  } },
  $queryRaw: async (query: TemplateStringsArray, ...values: unknown[]) => {
    check("profile-history"); assert.match(query.join("?"), /dashboard.player_profile_for_user/); assert.deepEqual(values, [id, false]); return [{ r: null }];
  },
  trainingSessionV2: {
    findMany: async (args: Prisma.TrainingSessionV2FindManyArgs) => {
      check("today"); const and = args.where?.AND as Prisma.TrainingSessionV2WhereInput[];
      assert.equal(and[0].studentId, id); assert.ok(JSON.stringify(and[0]).includes("synthetic-private-session"));
      assert.deepEqual(and[1], { startTime: { gte: new Date("2026-10-24T22:00:00Z"), lt: new Date("2026-10-25T23:00:00Z") }, status: { not: "CANCELLED" } });
      return [{ id: "v2", title: "Syntetisk dagens", startTime: now, practiceType: "BLOKK", location: null }];
    },
    findFirst: async (args: Prisma.TrainingSessionV2FindFirstArgs) => {
      check("now"); const and = args.where?.AND as Prisma.TrainingSessionV2WhereInput[];
      assert.equal(and[0].studentId, id); assert.ok(JSON.stringify(and[0]).includes("synthetic-private-session")); return null;
    },
  },
};
mock.module("next/navigation", { namedExports: { redirect() { throw Error("navigation"); }, notFound() { throw Error("not found"); } } });
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, { get() { throw Error("global database forbidden"); } }) } });
type Port = typeof import("@/lib/deling/ak-profil-lesing").medAkProfiler;
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (viewer: Parameters<Port>[0], read: Parameters<Port>[1]) => {
  assert.deepEqual(viewer, actor);
  if (denied) return null;
  inside = true;
  try { return await read(tx as unknown as Prisma.TransactionClient, scope(), []); }
  finally { inside = false; }
} } });

for (const role of ["ADMIN", "COACH"]) test(`Plan: fersk deling, minimal lesing og separat helseinnsyn for ${role}`, async t => {
  t.mock.timers.enable({ apis: ["Date"], now });
  const { lastSpiller360Fane } = await import("./spiller360-data");
  const read = (player = id) => lastSpiller360Fane(actor, player, "plan");
  actor = { ...actor, role }; allowed = true; denied = false; level = "INGEN"; reads = []; fail = "";
  const result = await read(); assert.equal(result?.fane, "plan");
  if (result?.fane !== "plan") throw Error("missing plan");
  assert.equal(result.data.uke[0].status, "SKIPPED"); assert.equal(result.data.uke[0].dag.slice(0, 3), "søn");
  assert.equal(result.data.aktivPlan?.okter, "1 av 2");
  assert.equal(result.data.iDag[0].klokke, "13:00");
  assert.equal(result.data.permisjoner[0].aarsak, "FRAVAER");
  assert.ok(!JSON.stringify(result).includes("Syntetisk helsebeskrivelse"));
  for (const [value, reason, detail] of [["STATUS", "HELSEBEGRENSNING", false], ["DETALJ", "SKADE", true], ["INGEN", "FRAVAER", false]] as const) {
    level = value;
    const data = await read(); assert.equal(data?.fane, "plan");
    if (data?.fane !== "plan") throw Error("missing plan");
    assert.equal(data.data.permisjoner[0].aarsak, reason);
    assert.equal(JSON.stringify(data).includes("Syntetisk helsebeskrivelse"), detail);
  }
  reads = []; assert.equal(await read("foreign-player"), null); assert.deepEqual(reads, ["player"]);
  allowed = false; reads = []; assert.equal(await read(), null); assert.deepEqual(reads, ["player"]);
  allowed = true; assert.ok(await read(), "nytt ja leses på nytt");
  denied = true; reads = []; assert.equal(await read(), null); assert.deepEqual(reads, []); denied = false;
  for (const source of ["draft-filter", "health-permission", "week", "profile-history", "leave"]) {
    fail = source; await assert.rejects(read(), /synthetic-read-failure/);
  }
  fail = "";
});
