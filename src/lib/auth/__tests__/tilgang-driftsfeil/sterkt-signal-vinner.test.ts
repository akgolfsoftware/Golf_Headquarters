import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { BASIS_BRUKER, mockFellesModuler, lastGetCurrentUserRaw } from "./_hjelper";

mockFellesModuler();
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => ({ ...BASIS_BRUKER }),
        update: async () => ({ ...BASIS_BRUKER }),
      },
      subscription: {
        findUnique: async ({ where }: { where: { userId_kind: { kind: string } } }) => {
          if (where.userId_kind.kind === "PLAYERHQ") {
            return {
              status: "ACTIVE",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              plan: "MANUELL",
              stripeSubscriptionId: "sub_test",
            };
          }
          throw new Error("coaching-oppslag feilet, men skal ikke rive ned bekreftet FULL-tilgang");
        },
      },
      groupMember: { count: async () => 0 },
    },
  },
});

test("sterkt positivt signal (bekreftet PLAYERHQ-abonnement) vinner selv om en annen spørring feiler", async () => {
  const getCurrentUserRaw = await lastGetCurrentUserRaw();
  const user = await getCurrentUserRaw();
  assert.ok(user, "en bekreftet FULL-tilgang skal ikke kastes bort pga. en annen feilet spørring");
  assert.equal(user?.tilgang.nivaa, "FULL");
});
