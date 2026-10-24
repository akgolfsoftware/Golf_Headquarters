import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

type Port = typeof import("@/lib/deling/ak-profil-lesing").medAkProfiler;
const scope = { id: { in: ["synthetic-shared-player"] }, role: "PLAYER", deletedAt: null };
let mode: "read" | "denied" | "error" = "read";
let role = "ADMIN";
let reads = 0;
let inTransaction = false;
const check = () => { assert.ok(inTransaction); reads++; };
const tx = {
  user: {
    count: async (args: Prisma.UserCountArgs) => { check(); assert.ok(Array.isArray(args.where?.AND)); assert.deepEqual(args.where.AND[0], scope); return 0; },
    findMany: async (args: Prisma.UserFindManyArgs) => { check(); assert.ok(Array.isArray(args.where?.AND)); assert.deepEqual(args.where.AND[0], scope); return []; },
  },
  round: { aggregate: async (args: Prisma.RoundAggregateArgs) => { check(); assert.deepEqual(args.where?.user, scope); return { _avg: { sgTotal: null } }; } },
  trainingPlanSession: {
    groupBy: async (args: Prisma.TrainingPlanSessionGroupByArgs) => { check(); assert.deepEqual(args.where?.plan, { user: scope }); return []; },
    findMany: async (args: Prisma.TrainingPlanSessionFindManyArgs) => { check(); assert.deepEqual(args.where?.plan, { user: scope }); return []; },
  },
  tournamentEntry: { findMany: async (args: Prisma.TournamentEntryFindManyArgs) => { check(); assert.deepEqual(args.where?.user, scope); return []; } },
};
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (viewer: Parameters<Port>[0], read: Parameters<Port>[1]) => {
  assert.deepEqual(viewer, { id: "synthetic-viewer", role });
  if (mode === "error") throw Error("synthetic-sharing-unavailable");
  if (mode === "denied") return null;
  inTransaction = true;
  try { return await read(tx as unknown as Prisma.TransactionClient, scope as Prisma.UserWhereInput, []); }
  finally { inTransaction = false; }
} } });

for (const actorRole of ["ADMIN", "COACH"]) {
  test(`profiloppslag bruker bare delingskontrollert transaksjon for ${actorRole}`, async () => {
    const { hentCockpitProfilnokkel } = await import("./cockpit-profildata");
    const { lastCockpitTillegg } = await import("./cockpit-tillegg");
    role = actorRole; mode = "read"; reads = 0;
    const viewer = { id: "synthetic-viewer", role: actorRole as "ADMIN" | "COACH" };
    await hentCockpitProfilnokkel(viewer, new Date());
    await lastCockpitTillegg(viewer);
    assert.equal(reads, 7);
    mode = "denied";
    assert.equal((await hentCockpitProfilnokkel(viewer, new Date())).aktiveSpillereCount, 0);
    assert.deepEqual((await lastCockpitTillegg(viewer)).turneringer, []);
    assert.equal(reads, 7);
    mode = "error";
    await assert.rejects(hentCockpitProfilnokkel(viewer, new Date()), /synthetic-sharing-unavailable/);
    await assert.rejects(lastCockpitTillegg(viewer), /synthetic-sharing-unavailable/);
    assert.equal(reads, 7);
  });
}
