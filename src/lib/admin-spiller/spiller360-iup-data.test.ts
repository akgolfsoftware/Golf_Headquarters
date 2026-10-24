import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

const id = "synthetic-player", group = "synthetic-school";
let actor = { id: "synthetic-coach", role: "COACH" };
let identity = actor.id, authError = "", allowed = true, named = true, inside = false, failure = "";
let reads: string[] = [];
function check(source: string) { assert.ok(inside); reads.push(source); if (failure === source) throw Error("synthetic failure"); }
const tx = {
  $queryRaw: async (sql: TemplateStringsArray) => { assert.ok(inside); assert.match(sql.join("?"), /ORDER BY id FOR SHARE/); return []; },
  user: {
    findFirst: async (args: Prisma.UserFindFirstArgs) => {
      check(args.select?.name ? "profile" : "scope");
      assert.deepEqual(args.where, { AND: [{ id: { in: allowed ? [id] : [] } }, args.select?.name ? { id, role: "PLAYER" } : { id }] });
      if (!allowed) return null;
      if (!args.select?.name) return { id };
      assert.equal(args.select?.groupMemberships, undefined);
      assert.deepEqual((args.select.childRelations as Prisma.User$childRelationsArgs).where,
        { approved: true, parent: { role: "PARENT", deletedAt: null, anonymisertAt: null } });
      return { name: "Syntetisk spiller", email: "synthetic@example.test", phone: null, dateOfBirth: null,
        hcp: 10, homeClub: null, playingYears: 2, ambition: null, primaryCoachId: null, childRelations: [],
        goals: [{ id: "goal", userId: id, type: "SG_AREA", category: "PROCESS", title: "Syntetisk SG-mål",
          targetDate: null, targetValue: 1, linkedPyramidArea: null, linkedTestId: null, payload: { sgOmrade: "APP", sgStart: -1 } }] };
    },
  },
  group: { findUniqueOrThrow: async (args: Prisma.GroupFindUniqueOrThrowArgs) => {
    check("group"); assert.deepEqual(args.where, { id: group }); return { name: "Valgt syntetisk skole", program: "WANG_TOPPIDRETT" };
  } },
  wagrSnapshot: { findUnique: async () => { check("wagr"); return null; } },
  seasonPlan: { findFirst: async () => { check("season"); return null; } },
  testResult: { findMany: async () => { check("tests"); return []; } },
  technicalPlan: { findMany: async () => { check("technical"); return []; } },
  round: { findMany: async (args: Prisma.RoundFindManyArgs) => {
    check("sg"); assert.deepEqual(args.where, { userId: id }); return [{ sgOtt: 0, sgApp: 0, sgArg: 0, sgPutt: 0 }];
  } },
  workbenchSession: { findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => {
    check("sessions"); assert.equal(args.where?.playerId, id); assert.equal(args.where?.hiddenByPlayer, false);
    assert.equal(args.where?.needsPlayerApproval, false); assert.equal(args.where?.isTemplate, false);
    assert.deepEqual(args.where?.OR, [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }]); return [];
  } },
};
mock.module("next/navigation", { namedExports: { redirect() { throw Error("navigation"); }, notFound() { throw Error("not found"); } } });
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, { get() { throw Error("global database forbidden"); } }) } });
mock.module("@/lib/deling/navngitt", { namedExports: {
  krevNavngittTrener: async () => { if (authError) throw Error(authError); return { id: identity, epost: "synthetic@wang.no" }; },
  navngittTrenerHarTilgang: async (db: unknown, trainer: { id: string }, player: string, school: string) => {
    check("named"); assert.equal(db, tx); assert.equal(trainer.id, actor.id); assert.equal(player, id);
    return named && school === group;
  },
} });
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (viewer: unknown, read: (db: unknown, scope: unknown) => unknown) => {
  assert.deepEqual(viewer, actor); inside = true;
  try { return await read(tx, { id: { in: allowed ? [id] : [] } }); } finally { inside = false; }
} } });
mock.module("@/lib/portal/turneringshistorikk-data", { namedExports: { hentTurneringshistorikk: async (player: string, db: unknown) => {
  check("tournaments"); assert.equal(db, tx); assert.equal(player, id); return { aar: [] };
} } });

for (const role of ["COACH", "ADMIN"]) test(`IUP krever begge delinger og uttrykkelig miljø, ${role}`, async () => {
  actor = { ...actor, role }; identity = actor.id; allowed = true; named = true; failure = ""; authError = ""; reads = [];
  const { lastSpiller360Fane } = await import("./spiller360-data");
  const read = (school?: string) => lastSpiller360Fane(actor, id, "iup", school);
  assert.equal(await read(), null); assert.equal(await read(" "), null); assert.deepEqual(reads, []);
  assert.equal(await read("other-school"), null); assert.deepEqual(reads, ["scope", "named"]);
  reads = []; const result = await read(group); assert.equal(result?.fane, "iup");
  if (result?.fane !== "iup") throw Error("missing IUP");
  assert.deepEqual(result.data.person.grupper, ["Valgt syntetisk skole"]);
  assert.equal(result.data.person.skole, "Valgt syntetisk skole"); assert.equal(result.data.ak, false);
  assert.equal(result.data.prosessmaal[0].pct, 50);
  assert.ok(reads.indexOf("named") < reads.indexOf("profile"));
  assert.deepEqual([...new Set(reads)].sort(), ["scope", "named", "profile", "group", "wagr", "season", "tests", "technical", "sessions", "tournaments", "sg"].sort());
  named = false; reads = []; assert.equal(await read(group), null); assert.deepEqual(reads, ["scope", "named"]);
  named = true; allowed = false; reads = []; assert.equal(await read(group), null); assert.deepEqual(reads, ["scope"]);
  allowed = true; assert.ok(await read(group));
  identity = "different-actor"; reads = []; assert.equal(await read(group), null); assert.deepEqual(reads, []); identity = actor.id;
  for (const error of ["forbidden", "unauthenticated"]) { authError = error; assert.equal(await read(group), null); }
  authError = "synthetic auth failure"; await assert.rejects(read(group), /synthetic auth failure/); authError = "";
  for (const source of ["named", "group", "profile", "wagr", "season", "tests", "technical", "sessions", "tournaments", "sg"]) {
    failure = source; await assert.rejects(read(group), /synthetic failure/);
  }
  failure = "";
});
