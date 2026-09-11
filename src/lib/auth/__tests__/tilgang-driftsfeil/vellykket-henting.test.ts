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
      subscription: { findUnique: async () => null },
      groupMember: { count: async () => 0 },
    },
  },
});

test("vellykket henting: ekte manglende abonnement gir INGEN, ingen feil kastes", async () => {
  const getCurrentUserRaw = await lastGetCurrentUserRaw();
  const user = await getCurrentUserRaw();
  assert.ok(user);
  assert.equal(user?.tilgang.nivaa, "INGEN");
  assert.equal(user?.tilgang.kilde, "INGEN");
});
