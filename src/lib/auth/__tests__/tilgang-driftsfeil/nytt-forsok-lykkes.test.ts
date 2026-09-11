import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { BASIS_BRUKER, mockFellesModuler, lastGetCurrentUserRaw } from "./_hjelper";

mockFellesModuler();
let forsokNr = 0;
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => ({ ...BASIS_BRUKER }),
        update: async () => ({ ...BASIS_BRUKER }),
      },
      subscription: {
        findUnique: async () => {
          forsokNr++;
          if (forsokNr === 1) throw new Error("nettverksfeil");
          return null;
        },
      },
      groupMember: { count: async () => 0 },
    },
  },
});

test("nytt forsøk etter driftsfeil lykkes når DB svarer normalt igjen", async () => {
  const getCurrentUserRaw = await lastGetCurrentUserRaw();
  await assert.rejects(() => getCurrentUserRaw(), /TilgangDriftsfeil|driftsfeil/i);
  const user = await getCurrentUserRaw();
  assert.ok(user, "det andre forsøket skal lykkes når DB svarer normalt igjen");
  assert.equal(user?.tilgang.nivaa, "INGEN");
});
