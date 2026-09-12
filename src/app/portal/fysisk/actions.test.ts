/**
 * R-I: kaller loggFysOkt. Fremmed spiller og coach uten tilgang avvises.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as const };
let harTilgang = true;
let transaksjoner = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => bruker },
});
mock.module("@/lib/auth/own-or-coached", {
  namedExports: { canAccessPlayer: async () => harTilgang },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      fysOkt: {
        findUnique: async () => ({
          id: "okt-1",
          estimertMinutter: 45,
          uke: { plan: { userId: "spiller-a" } },
          rader: [{ id: "rad-1" }],
        }),
        update: async () => ({}),
      },
      fysOvelseRad: { update: async () => ({}) },
      $transaction: async (ops: Promise<unknown>[]) => {
        transaksjoner += 1;
        return Promise.all(ops);
      },
    },
  },
});

async function logg() {
  return (await import("./actions")).loggFysOkt;
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  harTilgang = true;
  transaksjoner = 0;
});

test("loggFysOkt avviser uten tilgang og skriver ingenting", async () => {
  const fn = await logg();
  harTilgang = false;
  const svar = await fn({ oktId: "okt-1" });
  assert.deepEqual(svar, { ok: false, error: "Du kan ikke logge denne økten." });
  assert.equal(transaksjoner, 0);
});

test("loggFysOkt lagrer når tilgang finnes", async () => {
  const fn = await logg();
  const svar = await fn({ oktId: "okt-1" });
  assert.equal(svar.ok, true);
  assert.equal(transaksjoner, 1);
});
