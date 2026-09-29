import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Where = Record<string, unknown>;
const medlemWheres: Where[] = [];
let medlemmer: Array<{ joinedAt: Date; user: Record<string, unknown> }> = [];
let runder: Array<{ userId: string; score: number; _count: { holeScores: number } }> = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupMember: {
        findMany: async ({ where }: { where: Where }) => {
          medlemWheres.push(where);
          return medlemmer;
        },
        findFirst: async ({ where }: { where: Where }) => {
          medlemWheres.push(where);
          return medlemmer.find((m) => m.user.id === where.userId) ?? null;
        },
      },
      round: { findMany: async () => runder },
    },
  },
});

const NA = new Date(Date.UTC(2026, 8, 28, 10, 0));
const elev = (id: string, navn: string) => ({
  joinedAt: new Date(Date.UTC(2026, 7, 1)),
  user: { id, name: navn, email: `${id}@example.no`, dateOfBirth: new Date(Date.UTC(2009, 0, 1)), schoolYear: "vg2", homeClub: " GFGK ", hcp: 4.3, deletedAt: null },
});

async function data() {
  return import("./wang-elever-data");
}

test.beforeEach(() => {
  medlemWheres.length = 0;
  medlemmer = [];
  runder = [];
});

test("hentGruppeElever spør på portens gruppe-id, aktive spillere, sortert på navn", async () => {
  const { hentGruppeElever } = await data();
  medlemmer = [elev("b", "Øystein Berg"), elev("a", "Anna Ås")];
  const ut = await hentGruppeElever("wang-demo-id", NA);
  assert.equal(medlemWheres[0].groupId, "wang-demo-id");
  assert.equal(medlemWheres[0].role, "PLAYER");
  assert.equal(medlemWheres[0].endedAt, null);
  assert.deepEqual(ut.map((e) => e.navn), ["Anna Ås", "Øystein Berg"]);
  assert.equal(ut[0].klasse, "VG2");
  assert.equal(ut[0].klubb, "GFGK");
  assert.equal(ut[0].alder, 17);
});

test("hentGruppeElev gir null for en elev som ikke er i gruppa", async () => {
  const { hentGruppeElev } = await data();
  medlemmer = [elev("a", "Anna Ås")];
  assert.equal(await hentGruppeElev("wang-ekte", "fremmed", NA), null);
  assert.equal((await hentGruppeElev("wang-ekte", "a", NA))?.fornavn, "Anna");
  assert.equal(medlemWheres[0].groupId, "wang-ekte");
});

test("hentSnittForElever teller bare atten-hullsrunder og gir null uten runder", async () => {
  const { hentSnittForElever } = await data();
  runder = [
    { userId: "a", score: 74, _count: { holeScores: 18 } },
    { userId: "a", score: 37, _count: { holeScores: 9 } },
    { userId: "a", score: 76, _count: { holeScores: 18 } },
  ];
  const ut = await hentSnittForElever(["a", "b"], NA);
  assert.equal(ut.get("a")?.snitt, 75);
  assert.equal(ut.get("a")?.kategori, "D"); // 74–76 er D i AK_BANDS
  assert.equal(ut.get("b")?.snitt, null);
  assert.equal(ut.get("b")?.kategori, null);
});
