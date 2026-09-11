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
        findUnique: async () => {
          throw new Error("connect ETIMEDOUT");
        },
      },
      groupMember: { count: async () => 0 },
    },
  },
});

test("timeout på abonnements-oppslag: kaster TilgangDriftsfeil, sier IKKE 'INGEN'", async () => {
  const getCurrentUserRaw = await lastGetCurrentUserRaw();
  await assert.rejects(
    () => getCurrentUserRaw(),
    (err: unknown) => err instanceof Error && err.name === "TilgangDriftsfeil",
    "en timeout skal kaste TilgangDriftsfeil, ikke stille returnere INGEN-tilgang",
  );
});
