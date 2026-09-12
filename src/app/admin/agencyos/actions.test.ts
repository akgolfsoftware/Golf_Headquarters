/**
 * R-I: kaller pinnSpiller. Coach uten stalltilgang kan ikke feste fremmed spiller.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "coach-a", role: "COACH" as const };
let harTilgang = false;
let skrevet = 0;

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
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => harTilgang },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      coachPinnedPlayer: {
        findUnique: async () => null,
        count: async () => 0,
        create: async () => {
          skrevet += 1;
          return {};
        },
        deleteMany: async () => ({ count: 0 }),
      },
    },
  },
});

async function pinn() {
  return (await import("./actions")).pinnSpiller;
}

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  harTilgang = false;
  skrevet = 0;
});

test("pinnSpiller avviser spiller utenfor stallen og skriver ingenting", async () => {
  const fn = await pinn();
  const svar = await fn("spiller-b");
  assert.deepEqual(svar, { ok: false, error: "Du har ikke tilgang til denne spilleren." });
  assert.equal(skrevet, 0);
});

test("pinnSpiller fester når tilgang finnes", async () => {
  const fn = await pinn();
  harTilgang = true;
  const svar = await fn("spiller-a");
  assert.deepEqual(svar, { ok: true });
  assert.equal(skrevet, 1);
});
