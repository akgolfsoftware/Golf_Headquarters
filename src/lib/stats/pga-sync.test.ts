import assert from "node:assert/strict";
import { test } from "node:test";

test("HQ-statistikkriters stopper før DataGolf-lesing eller baselineskriving", async (t) => {
  let apiReads = 0;
  let dbWrites = 0;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        pgaPlayerSeason: {
          upsert: async () => { dbWrites++; },
          findMany: async () => [],
          aggregate: async () => ({ _avg: {}, _count: { _all: 0 } }),
        },
        pgaPuttDistance: { upsert: async () => { dbWrites++; } },
      },
    },
  });
  t.mock.module("@/lib/datagolf/client", {
    namedExports: {
      getSkillRatings: async () => { apiReads++; return []; },
    },
  });
  t.mock.module("@/lib/error-tracking", {
    namedExports: { logError: async () => undefined },
  });

  const { syncPgaSkillRatings, syncPgaPuttDistance, syncPgaApproach } =
    await import("./pga-sync");

  for (const sync of [syncPgaSkillRatings, syncPgaPuttDistance, syncPgaApproach]) {
    await assert.rejects(() => sync(), /DataGolf\/Broadie-baselineskriving er deaktivert i HQ/);
  }
  assert.equal(apiReads, 0);
  assert.equal(dbWrites, 0);
});
