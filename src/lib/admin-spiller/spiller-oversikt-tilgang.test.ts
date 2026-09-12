import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let scoped: { id: string } | null = { id: "spiller" };
const extraQueries: string[] = [];
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => ({ id: "fremmed", role: "COACH" }) },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    coachScopedPlayerWhere: () => ({ id: "scope" }),
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findFirst: async () => scoped,
      },
      groupMember: { findFirst: async () => { extraQueries.push("group"); return null; } },
      trainingSessionV2: {
        count: async () => { extraQueries.push("count"); return 0; },
        findMany: async () => { extraQueries.push("sessions"); return []; },
        findFirst: async () => { extraQueries.push("naa"); return null; },
      },
      tournamentEntry: {
        count: async () => { extraQueries.push("entries"); return 0; },
        findMany: async () => { extraQueries.push("upcoming"); return []; },
      },
      technicalPlan: { findFirst: async () => { extraQueries.push("plan"); return null; } },
      round: { findMany: async () => { extraQueries.push("rounds"); return []; } },
    },
  },
});

let lastSpillerOversiktForViewer: typeof import("./spiller-oversikt-data").lastSpillerOversiktForViewer;
before(async () => {
  ({ lastSpillerOversiktForViewer } = await import("./spiller-oversikt-data"));
});

test("uvedkommende coach får ingen spillerdata og ingen tilleggsoppslag", async () => {
  scoped = null;
  extraQueries.length = 0;
  const data = await lastSpillerOversiktForViewer({ id: "fremmed", role: "COACH" }, "spiller");
  assert.equal(data, null);
  assert.deepEqual(extraQueries, []);
});
