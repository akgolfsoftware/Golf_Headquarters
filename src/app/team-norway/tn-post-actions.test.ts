/**
 * R-I: kaller opprettGruppepostAction og sendPaaminnelseAction. Tilgang avgjøres
 * av rollen i gruppen, ikke plattformrollen.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker: { id: string; role: "COACH" | "ADMIN" | "PLAYER" } = {
  id: "coach-a",
  role: "COACH",
};
let medlem = false;
let opprettet = 0;
let lestAv: string[] = [];
let varsler: { userId: string; groupKey?: string; createdAt: Date }[] = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") {
        throw new Error("forbidden");
      }
      return bruker;
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async (input: { userId: string; groupKey?: string }) => {
      varsler.push({ userId: input.userId, groupKey: input.groupKey, createdAt: new Date("2026-09-27T12:00:00Z") });
    },
  },
});
mock.module("@/lib/storage/supabase-storage", {
  namedExports: { uploadFile: async () => ({ path: "x" }) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group: {
        findUnique: async ({ where }: { where: { id: string } }) =>
          where.id === "gruppe-tn" ? { slug: "team-norway", name: "Team Norway Golf" } : { slug: "annen-gruppe", name: "Annen" },
      },
      groupMember: {
        findFirst: async () => (medlem ? { id: "m1", role: "COACH" } : null),
        findMany: async () => [{ userId: "s1" }, { userId: "s2" }, { userId: "s3" }],
      },
      parentRelation: { findFirst: async () => null },
      tnPost: {
        create: async () => {
          opprettet += 1;
          return { id: "post-1" };
        },
        findUnique: async () => ({ groupId: "gruppe-tn", lesekvittert: lestAv.map((userId) => ({ userId })) }),
      },
      notification: {
        groupBy: async ({ where }: { where: { groupKey: { in: string[] } } }) => {
          const treff = varsler.filter((v) => v.groupKey && where.groupKey.in.includes(v.groupKey));
          if (treff.length === 0) return [];
          return [{ groupKey: treff[0]!.groupKey, _min: { createdAt: treff[0]!.createdAt }, _count: { _all: treff.length } }];
        },
      },
    },
  },
});

async function action() {
  return (await import("./tn-post-actions")).opprettGruppepostAction;
}

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  medlem = false;
  opprettet = 0;
  lestAv = [];
  varsler = [];
});

test("opprettGruppepostAction avviser spiller som ikke er trener i gruppen", async () => {
  const fn = await action();
  bruker = { id: "spiller-a", role: "PLAYER" };
  const svar = await fn("gruppe-tn", { tekst: "Hei gruppen", kind: "TEKST" });
  assert.equal(svar.ok, false);
  assert.equal(opprettet, 0);
});

test("opprettGruppepostAction lar gruppetrener uten plattformrollen COACH poste", async () => {
  const fn = await action();
  bruker = { id: "trener-uten-coachrolle", role: "PLAYER" };
  medlem = true;
  assert.deepEqual(await fn("gruppe-tn", { tekst: "Hei gruppen", kind: "TEKST" }), { ok: true });
  assert.equal(opprettet, 1);
});

test("opprettGruppepostAction avviser coach uten medlemskap i gruppen", async () => {
  const fn = await action();
  const svar = await fn("gruppe-tn", { tekst: "Hei gruppen", kind: "TEKST" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.feil, /ikke trener/i);
  assert.equal(opprettet, 0);
});

test("opprettGruppepostAction skriver når coachen er trener i gruppen", async () => {
  const fn = await action();
  medlem = true;
  const svar = await fn("gruppe-tn", { tekst: "Hei gruppen", kind: "TEKST" });
  assert.deepEqual(svar, { ok: true });
  assert.equal(opprettet, 1);
});

async function paaminn() {
  return (await import("./tn-post-actions")).sendPaaminnelseAction;
}

test("sendPaaminnelseAction avviser den som ikke er trener i gruppen", async () => {
  const fn = await paaminn();
  const svar = await fn("post-1");
  assert.equal(svar.ok, false);
  assert.equal(varsler.length, 0);
});

test("sendPaaminnelseAction varsler bare dem som ikke har lest", async () => {
  const fn = await paaminn();
  medlem = true;
  lestAv = ["s2"];
  const svar = await fn("post-1");
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.antall, 2);
  assert.deepEqual(varsler.map((v) => v.userId).sort(), ["s1", "s3"]);
});

test("sendPaaminnelseAction sender aldri to ganger for samme innlegg", async () => {
  const fn = await paaminn();
  medlem = true;
  await fn("post-1");
  await fn("post-1");
  assert.equal(varsler.length, 3);
});

test("sendPaaminnelseAction sender ingenting når alle har lest", async () => {
  const fn = await paaminn();
  medlem = true;
  lestAv = ["s1", "s2", "s3"];
  const svar = await fn("post-1");
  assert.equal(svar.ok, false);
  assert.equal(varsler.length, 0);
});
