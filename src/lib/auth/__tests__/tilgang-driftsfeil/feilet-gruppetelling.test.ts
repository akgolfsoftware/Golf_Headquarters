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
      groupMember: {
        count: async () => {
          throw new Error("P1001: Can't reach database server");
        },
      },
    },
  },
});

test("kastet feil på gruppemedlemskap-tellingen gir driftsfeil, ikke fail-open FULL og ikke null-bruker uten feil", async () => {
  const getCurrentUserRaw = await lastGetCurrentUserRaw();
  let feilKastet: Error | null = null;
  let bruker: unknown = null;
  try {
    bruker = await getCurrentUserRaw();
  } catch (e) {
    feilKastet = e as Error;
  }
  assert.equal(bruker, null, "skal ikke returnere en bruker ved driftsfeil");
  assert.ok(feilKastet, "skal kaste, ikke stille returnere en tilstand");
  assert.equal(feilKastet?.name, "TilgangDriftsfeil");
});
