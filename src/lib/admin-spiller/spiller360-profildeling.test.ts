import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

type Port = typeof import("@/lib/deling/ak-profil-lesing").medAkProfiler;
const id = "synthetic-player";
const otherId = "synthetic-other-shared-player";
let viewer = { id: "synthetic-coach", role: "COACH" };
let allowed = true;
let denied = false;
let failure: "sharing" | "sessions" | "details" | null = null;
let inside = false;
let reads: string[] = [];
const scope = () => ({ id: { in: allowed ? [id, otherId] : [] }, role: "PLAYER", deletedAt: null });
const check = (model: string) => { assert.ok(inside, `${model} må leses før delingslåsene slippes`); reads.push(model); };
const tx = {
  user: {
    findFirst: async (args: Prisma.UserFindFirstArgs) => {
      check("player"); assert.ok(Array.isArray(args.where?.AND));
      assert.deepEqual(args.where.AND[0], scope());
      if (!allowed || args.where.AND[1].id !== id) return null;
      if (!args.select?.name) return { id };
      const membership = args.select.groupMemberships as Prisma.User$groupMembershipsArgs;
      assert.deepEqual(membership.where, { role: "PLAYER", endedAt: null, groupId: { in: ["synthetic-ak-group"] } },
        "andre gruppers medlemskap er ikke delingsgrunnlag for AK-profilen");
      return { id, name: "Syntetisk Spiller", avatarUrl: null, hcp: 5, dateOfBirth: null,
        groupMemberships: [{ group: { name: "Syntetisk AK-gruppe", program: "AK_ACADEMY" } }] };
    },
    findUnique: async (args: Prisma.UserFindUniqueArgs) => {
      check("preferences"); assert.equal(args.where.id, id); assert.deepEqual(args.select, { preferences: true });
      return { preferences: null };
    },
    findMany: async (args: Prisma.UserFindManyArgs) => {
      check("rail"); assert.deepEqual(args.where, scope());
      assert.deepEqual(args.select, { id: true, name: true, hcp: true, homeClub: true });
      assert.deepEqual(args.orderBy, { name: "asc" }); assert.equal(args.take, 60);
      return [{ id, name: "Syntetisk Spiller", hcp: -1, homeClub: "Syntetisk klubb" },
        { id: otherId, name: "Syntetisk Annen", hcp: null, homeClub: null }];
    },
  },
  technicalPlan: {
    findMany: async (args: Prisma.TechnicalPlanFindManyArgs) => {
      check("technical-list"); assert.equal(args.where?.userId, id);
      return [{ id: "synthetic-plan", navn: "Syntetisk teknisk plan", status: "ACTIVE", startDato: new Date(), sluttDato: null, updatedAt: new Date() }];
    },
    findFirst: async (args: Prisma.TechnicalPlanFindFirstArgs) => {
      check("technical-detail"); assert.deepEqual(args.where, { id: "synthetic-plan", userId: id });
      assert.ok(args.include?.positions, "den eksisterende planleseren må bruke samme transaksjon");
      if (failure === "details") throw Error("synthetic-detail-failure");
      return { id: "synthetic-plan", userId: id, navn: "Syntetisk teknisk plan", status: "ACTIVE", positions: [], opprettetAv: null };
    },
  },
  talentTracking: { findUnique: async (args: Prisma.TalentTrackingFindUniqueArgs) => {
    check("talent"); assert.equal(args.where.userId, id);
    if (failure === "details") throw Error("synthetic-detail-failure");
    return null;
  } },
  round: { findMany: async (args: Prisma.RoundFindManyArgs) => {
    check("round"); assert.equal(args.where?.userId, id); assert.equal(args.where?.sharedWithCoach, true);
    return args.select?.score ? [{ score: 72, playedAt: new Date(), _count: { holeScores: 18 } }] : [{ sgTotal: 2 }];
  } },
  subscription: { findFirst: async (args: Prisma.SubscriptionFindFirstArgs) => {
    check("subscription"); assert.equal(args.where?.userId, id); assert.equal(args.where?.kind, "COACHING"); return null;
  } },
  tournamentEntry: { findFirst: async (args: Prisma.TournamentEntryFindFirstArgs) => {
    check("tournament"); assert.equal(args.where?.userId, id); return null;
  } },
  booking: { findFirst: async (args: Prisma.BookingFindFirstArgs) => {
    check("booking"); assert.equal(args.where?.userId, id); return null;
  } },
  planAction: { findMany: async (args: Prisma.PlanActionFindManyArgs) => {
    check("proposals"); assert.equal(args.where?.userId, id);
    assert.deepEqual(args.where?.OR, [{ coachId: viewer.id }, { coachId: null }]);
    return [];
  } },
  workbenchSession: { findMany: async (args: Prisma.WorkbenchSessionFindManyArgs) => {
    check("workbench"); assert.equal(args.where?.playerId, id); return [];
  } },
  trainingPlan: { findFirst: async (args: Prisma.TrainingPlanFindFirstArgs) => {
    check("plan"); assert.equal(args.where?.userId, id); return null;
  } },
};
mock.module("next/navigation", { namedExports: {
  redirect: () => { throw Error("unexpected navigation"); }, notFound: () => { throw Error("unexpected not found"); },
} });
mock.module("@/lib/prisma", { namedExports: { prisma: new Proxy({}, { get() { throw Error("global database forbidden"); } }) } });
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: { medAkProfiler: async (actor: Parameters<Port>[0], read: Parameters<Port>[1], _mode: Parameters<Port>[2], options: Parameters<Port>[3]) => {
  assert.deepEqual(actor, viewer);
  if (failure === "sharing") throw Error("synthetic-sharing-failure");
  if (denied) return null;
  inside = true;
  try { return await read(tx as unknown as Prisma.TransactionClient, scope() as Prisma.UserWhereInput,
    allowed && options?.medGrunnlag ? [{ spillerId: id, gruppeId: "synthetic-ak-group", fingeravtrykk: "synthetic" }] : []); }
  finally { inside = false; }
} } });
mock.module("@/lib/portal/etterlevelse-data", { namedExports: {
  hentStallEtterlevelseITransaksjon: async (db: unknown, ids: string[]) => {
    check("sessions"); assert.equal(db, tx); assert.deepEqual(ids, [id]);
    if (failure === "sessions") throw Error("synthetic-session-failure");
    return new Map([[id, { pct: 50 }]]);
  },
} });

for (const role of ["ADMIN", "COACH"]) {
  test(`Spiller 360 hovedfelt og rail krever fersk deling og samme transaksjon for ${role}`, async () => {
    const { lastSpiller360Hode: head, lastSpiller360Rail: rail } = await import("./spiller360-hode-data");
    viewer = { ...viewer, role }; allowed = true; denied = false; failure = null; reads = [];
    const result = await head(viewer, id);
    assert.equal(result?.navn, "Syntetisk Spiller"); assert.equal(result?.etterlevelse.pct, 50);
    assert.equal(result?.sg30.verdi, 2);
    assert.deepEqual(result?.grupper, ["Syntetisk AK-gruppe"]); assert.equal(result?.iup, false);
    assert.equal(reads.length, 10); assert.equal(inside, false);
    reads = [];
    assert.deepEqual(await rail(viewer, id), [
      { id, navn: "Syntetisk Spiller", sub: "HCP +1,0 · Syntetisk klubb" },
      { id: otherId, navn: "Syntetisk Annen", sub: "—" },
    ]);
    assert.deepEqual(reads, ["player", "rail"], "ingen tester, videoer, notater eller full profil for en rail");
    reads = [];
    assert.equal(await head(viewer, "foreign-player"), null);
    assert.deepEqual(await rail(viewer, "foreign-player"), []);
    assert.deepEqual(reads, ["player", "player"]);
    allowed = false; reads = [];
    assert.equal(await head(viewer, id), null); assert.deepEqual(await rail(viewer, id), []);
    assert.deepEqual(reads, ["player", "player"], "trekk gir ingen videre oppslag");
    allowed = true; assert.ok(await head(viewer, id), "nytt ja krever fersk lesing");
    denied = true; reads = [];
    assert.equal(await head(viewer, id), null); assert.deepEqual(await rail(viewer, id), []); assert.deepEqual(reads, []);
    denied = false; failure = "sharing";
    await assert.rejects(head(viewer, id), /synthetic-sharing-failure/);
    await assert.rejects(rail(viewer, id), /synthetic-sharing-failure/);
    failure = "sessions";
    await assert.rejects(head(viewer, id), /synthetic-session-failure/);
    failure = null;
  });
}


for (const role of ["ADMIN", "COACH"]) {
  test(`teknisk plan og talent har selvstendig delingskontroll for ${role}`, async () => {
    const { lastSpiller360Fane } = await import("./spiller360-data");
    viewer = { ...viewer, role }; allowed = true; denied = false; failure = null;
    for (const fane of ["tp", "talent"] as const) {
      const read = (playerId = id) => lastSpiller360Fane(viewer, playerId, fane);
      reads = [];
      const result = await read();
      assert.equal(result?.fane, fane);
      if (result?.fane === "tp") assert.equal(result.data.aktivId, "synthetic-plan");
      assert.deepEqual(reads, fane === "tp" ? ["player", "technical-list", "technical-detail"] : ["player", "talent", "preferences"]);
      reads = [];
      assert.equal(await read("foreign-player"), null); assert.deepEqual(reads, ["player"]);
      allowed = false; reads = [];
      assert.equal(await read(), null, "trekk etter hodelesing må stoppe direkte fanekall");
      assert.deepEqual(reads, ["player"]);
      allowed = true; assert.ok(await read());
      denied = true; reads = [];
      assert.equal(await read(), null); assert.deepEqual(reads, []);
      denied = false; failure = "details";
      await assert.rejects(read(), /synthetic-detail-failure/);
      failure = "sharing";
      await assert.rejects(read(), /synthetic-sharing-failure/);
      failure = null;
    }
  });
}
