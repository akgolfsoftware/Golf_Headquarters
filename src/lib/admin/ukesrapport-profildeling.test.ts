import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import { etterlevelse } from "@/lib/domain/etterlevelse";

type Port = typeof import("@/lib/deling/ak-profil-lesing").medAkProfiler;
const NOW = new Date("2026-10-24T12:00:00Z");
let viewer = { id: "synthetic-coach", role: "COACH" };
let allowed = true;
let denied = false;
let failure: "sharing" | "sessions" | "tests" | null = null;
let inside = false;
let reads: string[] = [];
const ids = ["synthetic-a", "synthetic-b"];
const scope = () => ({ id: { in: allowed ? ids : [] }, role: "PLAYER", deletedAt: null });
const check = (kind: string) => { assert.ok(inside); reads.push(kind); };
const tx = {
  user: { findMany: async (args: Prisma.UserFindManyArgs) => {
    check("players"); assert.deepEqual(args.where, scope()); assert.deepEqual(args.select, { id: true });
    return allowed ? ids.map(id => ({ id })) : [];
  } },
  testAssignment: { findMany: async (args: Prisma.TestAssignmentFindManyArgs) => {
    check("tests");
    if (failure === "tests") throw Error("synthetic-test-read-failure");
    assert.deepEqual(args.where, { playerId: { in: ids }, status: "OPEN",
      dueDate: { not: null, lte: new Date("2026-11-07T12:00:00Z") } });
    assert.deepEqual(args.select, { dueDate: true }, "bare frist, ikke resultater eller personfelt");
    assert.deepEqual(args.orderBy, { dueDate: "asc" });
    return [{ dueDate: new Date("2026-10-25T12:00:00Z") }];
  } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, {
  get() { throw Error("global database must not be used"); },
}) } });
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (actor: Parameters<Port>[0], read: Parameters<Port>[1]) => {
  assert.deepEqual(actor, viewer);
  if (failure === "sharing") throw Error("synthetic-sharing-failure");
  if (denied) return null;
  inside = true;
  try { return await read(tx as unknown as Prisma.TransactionClient, scope() as Prisma.UserWhereInput, []); }
  finally { inside = false; }
} } });
mock.module("@/lib/portal/etterlevelse-data", { namedExports: {
  hentStallEtterlevelse: () => { throw Error("cached non-transactional reader must not be used"); },
  hentStallEtterlevelseITransaksjon: async (db: unknown, playerIds: string[], now: Date) => {
    check("sessions"); assert.equal(db, tx); assert.deepEqual(playerIds, ids); assert.equal(now, NOW);
    if (failure === "sessions") throw Error("synthetic-session-read-failure");
    return new Map(ids.map((id, i) => [id, etterlevelse([{
      scheduledAt: new Date("2026-10-20T12:00:00Z"), durationMin: i === 0 ? 60 : 180,
      status: i === 0 ? "COMPLETED" : "PLANNED",
    }], now)]));
  },
} });

for (const role of ["ADMIN", "COACH"]) {
  test(`ukesrapport leser og summerer bare innenfor fersk profildeling for ${role}`, async () => {
    const { hentUkesrapport } = await import("./ukesrapport");
    viewer = { ...viewer, role }; allowed = true; denied = false; failure = null; reads = [];
    const read = () => hentUkesrapport(viewer, NOW);
    const result = await read();
    assert.equal(result?.tall.find(t => t.key === "etterlevelse")?.verdi, "25 %", "vektet med minutter, ikke snitt av prosenter");
    assert.equal(result?.tall.find(t => t.key === "testforfall")?.verdi, "1");
    assert.match(result!.hvorfor[1], /2 spillere/);
    assert.deepEqual(reads.sort(), ["players", "sessions", "tests"]);
    assert.equal(inside, false);

    allowed = false; reads = [];
    assert.equal(await read(), null, "trekk fjerner også eksisterende tall og frister");
    assert.deepEqual(reads, ["players"]);
    allowed = true; reads = [];
    assert.ok(await read(), "nytt ja krever ny lesing");
    assert.equal(reads.length, 3);
    denied = true; reads = [];
    assert.equal(await read(), null);
    assert.deepEqual(reads, []);
    denied = false;
    for (const error of ["sharing", "sessions", "tests"] as const) {
      failure = error;
      await assert.rejects(read(), /synthetic-.*failure/);
    }
    failure = null;
  });
}
