/**
 * R-I: kaller opprettGruppepostAction. Trenerrolle uten gruppemedlemskap avvises.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker: { id: string; role: "COACH" | "ADMIN" | "PLAYER" } = {
  id: "coach-a",
  role: "COACH",
};
let medlem = false;
let opprettet = 0;

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
mock.module("@/lib/storage/supabase-storage", {
  namedExports: { uploadFile: async () => ({ path: "x" }) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupMember: {
        findFirst: async () => (medlem ? { id: "m1", role: "COACH" } : null),
      },
      tnPost: {
        create: async () => {
          opprettet += 1;
          return { id: "post-1" };
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
});

test("opprettGruppepostAction avviser spiller før skriving", async () => {
  const fn = await action();
  bruker = { id: "spiller-a", role: "PLAYER" };
  await assert.rejects(() => fn("gruppe-tn", { tekst: "Hei gruppen", kind: "TEKST" }), /forbidden/);
  assert.equal(opprettet, 0);
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
