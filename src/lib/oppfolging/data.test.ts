import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Kall = { navn: string; arg: unknown };
const kall: Kall[] = [];
let medlemmer: Array<{ groupId: string; userId: string }> = [];
let forslagRad: { elevId: string; status: string } | null = null;
let sjekkFinnes = true;
let updateCount = 1;

const audit = mock.fn(async (_e: unknown) => {});
mock.module("@/lib/audit", { namedExports: { audit } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupMember: {
        findFirst: async ({ where }: { where: { groupId: string; userId: string; role: string; endedAt: null } }) => {
          assert.equal(where.role, "PLAYER", "bare aktive spillere, aldri trenere eller foresatte");
          assert.equal(where.endedAt, null);
          return medlemmer.some((m) => m.groupId === where.groupId && m.userId === where.userId) ? { id: "m" } : null;
        },
        findMany: async () => [],
      },
      user: { findMany: async () => [] },
      trenerForslag: {
        create: async ({ data }: { data: unknown }) => {
          kall.push({ navn: "forslag.create", arg: data });
          return { id: "f1" };
        },
        findUnique: async () => forslagRad,
        updateMany: async ({ where, data }: { where: unknown; data: unknown }) => {
          kall.push({ navn: "forslag.updateMany", arg: { where, data } });
          return { count: updateCount };
        },
      },
      elevSamtale: {
        create: async ({ data }: { data: unknown }) => {
          kall.push({ navn: "samtale.create", arg: data });
          return { id: "s1" };
        },
      },
      fireukerssjekk: { findFirst: async () => (sjekkFinnes ? { id: "x" } : null) },
    },
  },
});

const k = { flate: "WANG", groupId: "g1", trenerId: "t1" } as const;

test.beforeEach(() => {
  kall.length = 0;
  audit.mock.resetCalls();
  medlemmer = [{ groupId: "g1", userId: "e1" }];
  forslagRad = { elevId: "e1", status: "VENTER" };
  sjekkFinnes = true;
  updateCount = 1;
});

test("opprettForslag: lagrer som VENTER med gruppe og trener fra konteksten", async () => {
  const { opprettForslag } = await import("./data");
  const r = await opprettForslag(k, { elevId: "e1", type: "PLAN", tekst: "Flytt en økt" });
  assert.deepEqual(r, { ok: true, data: { id: "f1" } });
  const data = kall[0].arg as Record<string, unknown>;
  assert.equal(data.status, "VENTER");
  assert.equal(data.groupId, "g1");
  assert.equal(data.trenerId, "t1");
  assert.equal(data.flate, "WANG");
  assert.equal(audit.mock.callCount(), 1);
});

test("opprettForslag: elev utenfor gruppa avvises og ingenting lagres", async () => {
  const { opprettForslag } = await import("./data");
  const r = await opprettForslag(k, { elevId: "annen-elev", type: "PLAN", tekst: "x" });
  assert.equal(r.ok, false);
  assert.equal(kall.length, 0);
  assert.equal(audit.mock.callCount(), 0);
});

test("opprettForslag: ugyldig input avvises før basen røres", async () => {
  const { opprettForslag } = await import("./data");
  const r = await opprettForslag(k, { elevId: "e1", type: "UKJENT", tekst: "x" });
  assert.equal(r.ok, false);
  assert.equal(kall.length, 0);
});

test("opprettSamtale: dato lagres som UTC-midnatt og elev utenfor gruppa avvises", async () => {
  const { opprettSamtale } = await import("./data");
  const ok = await opprettSamtale(k, { elevId: "e1", dag: "2026-09-29", type: "OPPFOLGING", avtalt: "Følg opp prosessmålet" });
  assert.equal(ok.ok, true);
  assert.equal((kall[0].arg as { dato: Date }).dato.toISOString(), "2026-09-29T00:00:00.000Z");
  kall.length = 0;
  const nei = await opprettSamtale(k, { elevId: "fremmed", dag: "2026-09-29", type: "OPPFOLGING", avtalt: "x" });
  assert.equal(nei.ok, false);
  assert.equal(kall.length, 0);
});

test("opprettSamtale: kobling til fireukerssjekk må høre til eleven", async () => {
  const { opprettSamtale } = await import("./data");
  sjekkFinnes = false;
  const r = await opprettSamtale(k, { elevId: "e1", dag: "2026-09-29", type: "FIREUKERSSJEKK", avtalt: "x", fireukerssjekkId: "andres" });
  assert.equal(r.ok, false);
  assert.equal(kall.length, 0);
});

test("svarPaaForslag: bare eleven forslaget er til kan svare", async () => {
  const { svarPaaForslag } = await import("./data");
  const r = await svarPaaForslag("e2", "f1", "GODTATT", null);
  assert.equal(r.ok, false);
  assert.equal(kall.length, 0);
});

test("svarPaaForslag: godtar fra VENTER, og et besvart forslag kan ikke besvares på nytt", async () => {
  const { svarPaaForslag } = await import("./data");
  const ok = await svarPaaForslag("e1", "f1", "GODTATT", "  Greit  ");
  assert.equal(ok.ok, true);
  const oppdatering = kall[0].arg as { where: { status: string }; data: { status: string; svar: string | null } };
  assert.equal(oppdatering.where.status, "VENTER");
  assert.equal(oppdatering.data.svar, "Greit");

  kall.length = 0;
  forslagRad = { elevId: "e1", status: "GODTATT" };
  const igjen = await svarPaaForslag("e1", "f1", "AVVIST", null);
  assert.equal(igjen.ok, false);
  assert.equal(kall.length, 0);
});

test("svarPaaForslag: samtidig svar (ingen rad oppdatert) gir feil", async () => {
  const { svarPaaForslag } = await import("./data");
  updateCount = 0;
  const r = await svarPaaForslag("e1", "f1", "AVVIST", null);
  assert.equal(r.ok, false);
});

test("svarPaaForslag: VENTER er ikke et gyldig svar", async () => {
  const { svarPaaForslag } = await import("./data");
  const r = await svarPaaForslag("e1", "f1", "VENTER", null);
  assert.equal(r.ok, false);
  assert.equal(kall.length, 0);
});
