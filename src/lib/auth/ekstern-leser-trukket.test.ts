/**
 * O05: trukket ekstern leser (revokedAt satt i spørringen) har tomt scope.
 * Egen fil fordi Prisma-mocken ikke kan sameksistere med
 * ekstern-leser-scope.test.ts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

test("trukket ekstern leser har ingen spillere i scopet", async (t) => {
  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        eksternLeserGruppe: {
          findMany: async () => [],
        },
        group: { findMany: async () => [] },
        user: { findMany: async () => [] },
        delingsSamtykke: { findMany: async () => [] },
      },
    },
  });

  const { eksternLeserSpillerIder, harEksternLeserTilgang } = await import(
    "./ekstern-leser-scope"
  );

  const ider = await eksternLeserSpillerIder("leser-tn-1", "TEST_RESULTATER");
  assert.deepEqual(ider, []);
  assert.equal(
    await harEksternLeserTilgang("leser-tn-1", "spiller-med-samtykke", "TEST_RESULTATER"),
    false,
  );
});
