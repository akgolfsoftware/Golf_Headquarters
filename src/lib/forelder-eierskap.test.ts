/**
 * O05: godkjent eierskap og barnbytte. Ugodkjent relasjon gir ikke innsyn,
 * og feil barn-id faller aldri tilbake til et annet barn.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rel = {
  id: string;
  parentId: string;
  childId: string;
  approved: boolean;
  relationship: string;
  createdAt: Date;
  child: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string | null;
    hcp: number | null;
    dateOfBirth: Date | null;
    guardianConsentGivenAt: Date | null;
    homeClub: string | null;
    tier: string;
  };
};

let relasjoner: Rel[] = [];

function barn(id: string, name: string): Rel["child"] {
  return {
    id,
    name,
    email: `${id}@test.no`,
    avatarUrl: null,
    hcp: null,
    dateOfBirth: null,
    guardianConsentGivenAt: null,
    homeClub: null,
    tier: "GRATIS",
  };
}

function matcher(where: {
  parentId?: string;
  childId?: string;
  approved?: boolean;
  parentId_childId?: { parentId: string; childId: string };
}) {
  const parentId = where.parentId_childId?.parentId ?? where.parentId;
  const childId = where.parentId_childId?.childId ?? where.childId;
  return relasjoner.filter((r) => {
    if (parentId && r.parentId !== parentId) return false;
    if (childId && r.childId !== childId) return false;
    if (where.approved !== undefined && r.approved !== where.approved) return false;
    return true;
  });
}

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      parentRelation: {
        findMany: async ({ where }: { where: Parameters<typeof matcher>[0] }) =>
          matcher(where),
        findFirst: async ({ where }: { where: Parameters<typeof matcher>[0] }) =>
          matcher(where)[0] ?? null,
        findUnique: async ({ where }: { where: Parameters<typeof matcher>[0] }) =>
          matcher(where)[0] ?? null,
      },
      user: { findUnique: async () => ({ homeClub: "Testklubb" }) },
      trainingPlanSessionLog: { count: async () => 0 },
      booking: {
        findFirst: async () => null,
        findMany: async () => [],
      },
      trainingPlanSession: { findMany: async () => [] },
      payment: { findMany: async () => [] },
      notification: { findMany: async () => [] },
    },
  },
});

async function helpers() {
  return import("./forelder");
}

test.beforeEach(() => {
  const eldre = new Date("2026-01-01T00:00:00Z");
  const nyere = new Date("2026-02-01T00:00:00Z");
  relasjoner = [
    {
      id: "rel-a",
      parentId: "forelder-a",
      childId: "barn-a",
      approved: true,
      relationship: "Mor",
      createdAt: eldre,
      child: barn("barn-a", "Barn A"),
    },
    {
      id: "rel-b",
      parentId: "forelder-a",
      childId: "barn-b",
      approved: true,
      relationship: "Mor",
      createdAt: nyere,
      child: barn("barn-b", "Barn B"),
    },
    {
      id: "rel-ugodkjent",
      parentId: "forelder-a",
      childId: "barn-ugodkjent",
      approved: false,
      relationship: "Far",
      createdAt: nyere,
      child: barn("barn-ugodkjent", "Barn Ugodkjent"),
    },
    {
      id: "rel-fremmed",
      parentId: "forelder-b",
      childId: "barn-c",
      approved: true,
      relationship: "Far",
      createdAt: eldre,
      child: barn("barn-c", "Barn C"),
    },
  ];
});

test("hentBarnForForelder viser bare godkjente egne barn", async () => {
  const { hentBarnForForelder } = await helpers();
  const liste = await hentBarnForForelder("forelder-a");
  assert.deepEqual(
    liste.map((b) => b.child.id),
    ["barn-a", "barn-b"],
  );
});

test("hentBarnHvisTilhoerer avviser ugodkjent og andres barn", async () => {
  const { hentBarnHvisTilhoerer } = await helpers();
  assert.equal((await hentBarnHvisTilhoerer("forelder-a", "barn-a"))?.id, "barn-a");
  assert.equal(await hentBarnHvisTilhoerer("forelder-a", "barn-ugodkjent"), null);
  assert.equal(await hentBarnHvisTilhoerer("forelder-a", "barn-c"), null);
});

test("assertBarnTilhorerForelder krever approved", async () => {
  const { assertBarnTilhorerForelder } = await helpers();
  assert.equal(await assertBarnTilhorerForelder("forelder-a", "barn-a"), true);
  assert.equal(await assertBarnTilhorerForelder("forelder-a", "barn-ugodkjent"), false);
  assert.equal(await assertBarnTilhorerForelder("forelder-a", "barn-c"), false);
});

test("velgGodkjentBarn bytter mellom egne barn uten å blande identitet", async () => {
  const { velgGodkjentBarn } = await helpers();
  const forste = await velgGodkjentBarn("forelder-a");
  assert.equal(forste.fokus?.child.id, "barn-a");
  assert.equal(forste.alle.length, 2);

  const andre = await velgGodkjentBarn("forelder-a", "barn-b");
  assert.equal(andre.fokus?.child.id, "barn-b");
});

test("velgGodkjentBarn faller ikke tilbake til annet barn ved feil id", async () => {
  const { velgGodkjentBarn } = await helpers();
  const ugodkjent = await velgGodkjentBarn("forelder-a", "barn-ugodkjent");
  assert.equal(ugodkjent.fokus, null);
  assert.equal(ugodkjent.alle.length, 2);

  const fremmed = await velgGodkjentBarn("forelder-a", "barn-c");
  assert.equal(fremmed.fokus, null);
});

test("hentForelderOversikt viser valgt barn, ikke alltid det første", async () => {
  const { hentForelderOversikt } = await helpers();
  const a = await hentForelderOversikt("forelder-a");
  assert.equal(a.fokusBarn?.id, "barn-a");
  assert.equal(a.antallBarn, 2);

  const b = await hentForelderOversikt("forelder-a", "barn-b");
  assert.equal(b.fokusBarn?.id, "barn-b");
  assert.equal(b.antallBarn, 2);
});

test("hentForelderOversikt lekker ikke annet barns identitet ved feil id", async () => {
  const { hentForelderOversikt } = await helpers();
  const tom = await hentForelderOversikt("forelder-a", "barn-c");
  assert.equal(tom.fokusBarn, null);
  assert.equal(tom.kpi.okter30d, 0);
  assert.equal(tom.kommendeBookinger.length, 0);
});
