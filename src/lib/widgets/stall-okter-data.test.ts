import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { stallenGruppeWhere, stallenPlayerWhere } from "@/lib/admin/stallen-scope";

let playerWhere: unknown;
let groupWhere: unknown;
let sessionQueries = 0;

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findMany: async ({ where }: { where: unknown }) => {
          playerWhere = where;
          return [];
        },
      },
      group: {
        findMany: async ({ where }: { where: unknown }) => {
          groupWhere = where;
          return [];
        },
      },
      trainingSessionV2: {
        findMany: async () => {
          sessionQueries += 1;
          return [];
        },
      },
      trainingPlanSession: {
        findMany: async () => {
          sessionQueries += 1;
          return [];
        },
      },
    },
  },
});

let getStallOkterData: typeof import("./stall-okter-data").getStallOkterData;
before(async () => {
  ({ getStallOkterData } = await import("./stall-okter-data"));
});

test("dagens stalløkter bruker samme spiller- og gruppeporte som stallen", async () => {
  const coach = { id: "coach-1", role: "COACH" };
  sessionQueries = 0;
  const data = await getStallOkterData(coach);
  assert.deepEqual(playerWhere, stallenPlayerWhere(coach));
  assert.deepEqual(groupWhere, stallenGruppeWhere(coach));
  assert.equal(sessionQueries, 0);
  assert.equal(data.antall, 0);
});
