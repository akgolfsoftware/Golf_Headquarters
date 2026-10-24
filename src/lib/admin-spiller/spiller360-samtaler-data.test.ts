import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

type Port = typeof import("@/lib/deling/ak-profil-lesing").medAkProfiler;
let actor = { id: "synthetic-coach", role: "COACH" };
const id = "synthetic-player";
const now = new Date("2026-10-24T12:00:00Z");
let allowed = true, denied = false, inside = false;
let failure = "";
let reads: string[] = [];
const scope = () => ({ id: { in: allowed ? [id] : [] } });
function check(source: string) {
  assert.ok(inside, "alle oppslag må skje før profildelingslåsen slippes"); reads.push(source);
  if (source === failure) throw Error("synthetic-read-failure");
}
const tx = {
  user: { findFirst: async (args: Prisma.UserFindFirstArgs) => {
    check("player"); const and = args.where?.AND as Prisma.UserWhereInput[];
    assert.deepEqual(and[0], scope()); assert.deepEqual(args.select, { id: true });
    return allowed && and[1].id === id ? { id } : null;
  } },
  $queryRaw: async (query: TemplateStringsArray, ...values: unknown[]) => {
    check("threads"); const sql = query.join("?");
    assert.deepEqual(values, [id, actor.id]);
    assert.match(sql, /"userId" = \? AND "coachId" = \? AND kind = 'DIRECT'/);
    assert.match(sql, /CASE WHEN jsonb_typeof\(messages\) = 'array'/);
    assert.match(sql, /jsonb_array_length\(messages\)/);
    assert.match(sql, /LIMIT 12/);
    return [{ id: "direct", antall: 2, updatedAt: now }];
  },
  coachNote: { findFirst: async (args: Prisma.CoachNoteFindFirstArgs) => {
    check("note"); assert.deepEqual(args.where, { playerId: id, coachId: actor.id });
    assert.deepEqual(args.select, { content: true, updatedAt: true, coach: { select: { name: true } } });
    return { content: "Syntetisk eget notat", updatedAt: now, coach: { name: "Syntetisk trener" } };
  } },
  sessionVideo: { findMany: async (args: Prisma.SessionVideoFindManyArgs) => {
    check("video"); assert.deepEqual(args.where, { playerId: id, coachId: actor.id, status: "READY" });
    assert.deepEqual(args.select, { id: true, title: true, createdAt: true }); assert.equal(args.take, 3);
    return [{ id: "own-video", title: "Syntetisk egen video", createdAt: now }];
  } },
};
mock.module("next/navigation", { namedExports: { redirect() { throw Error("navigation"); }, notFound() { throw Error("not found"); } } });
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, { get() { throw Error("global database forbidden"); } }) } });
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (viewer: Parameters<Port>[0], read: Parameters<Port>[1]) => {
  assert.deepEqual(viewer, actor);
  if (failure === "sharing") throw Error("synthetic-sharing-failure");
  if (denied) return null;
  inside = true;
  try { return await read(tx as unknown as Prisma.TransactionClient, scope(), []); }
  finally { inside = false; }
} } });

for (const role of ["COACH", "ADMIN"]) test(`Samtaler krever fersk deling og egen mottaker/forfatter for ${role}`, async () => {
  const { lastSpiller360Fane } = await import("./spiller360-data");
  actor = { ...actor, role }; allowed = true; denied = false; failure = ""; reads = [];
  const read = (player = id) => lastSpiller360Fane(actor, player, "samtaler");
  const result = await read();
  assert.equal(result?.fane, "samtaler");
  if (result?.fane !== "samtaler") throw Error("missing conversations");
  assert.deepEqual(result.data.traader, [{ id: "direct", type: "Meldinger", antall: 2, sist: "24.10.2026" }]);
  assert.equal(result.data.notat?.tekst, "Syntetisk eget notat");
  assert.equal(result.data.videoer[0].id, "own-video");
  assert.deepEqual(Object.keys(result.data).sort(), ["notat", "traader", "videoer"]);
  assert.deepEqual(reads, ["player", "threads", "note", "video"], "ingen Caddie, spilleropptak eller bred dashboardleser");
  reads = []; assert.equal(await read("foreign-player"), null); assert.deepEqual(reads, ["player"]);
  allowed = false; reads = []; assert.equal(await read(), null); assert.deepEqual(reads, ["player"]);
  allowed = true; assert.ok(await read());
  denied = true; reads = []; assert.equal(await read(), null); assert.deepEqual(reads, []); denied = false;
  for (const source of ["threads", "note", "video", "sharing"]) {
    failure = source; await assert.rejects(read(), /synthetic-(read|sharing)-failure/);
  }
  failure = "";
});
