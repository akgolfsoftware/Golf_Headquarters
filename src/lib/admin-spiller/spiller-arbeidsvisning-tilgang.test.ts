import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { stallenPlayerWhere } from "@/lib/admin/stallen-scope";

let scoped: { id: string; name: string; role: string; avatarUrl: null; hcp: number } | null = {
  id: "spiller",
  name: "Øyvind Rohjan",
  role: "PLAYER",
  avatarUrl: null,
  hcp: 4.2,
};
let railWhere: unknown;
const extraQueries: string[] = [];
function extra(name: string) {
  extraQueries.push(name);
  return [];
}

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findFirst: async () => scoped,
        findMany: async ({ where }: { where: unknown }) => {
          extraQueries.push("rail");
          railWhere = where;
          return [];
        },
      },
      groupMember: { findFirst: async () => { extraQueries.push("group"); return null; } },
      trainingSessionV2: { findMany: async () => extra("sessions") },
      round: { findMany: async () => extra("rounds") },
      testResult: { findMany: async () => extra("tests") },
      playerSwingVideo: { findMany: async () => extra("videos") },
      coachNote: { findFirst: async () => { extraQueries.push("note"); return null; } },
    },
  },
});

let lastSpillerArbeidsvisning: typeof import("./spiller-arbeidsvisning-data").lastSpillerArbeidsvisning;
before(async () => {
  ({ lastSpillerArbeidsvisning } = await import("./spiller-arbeidsvisning-data"));
});

test("uvedkommende coach får ingen arbeidsvisning og ingen tilleggsoppslag", async () => {
  scoped = null;
  extraQueries.length = 0;
  railWhere = undefined;
  const data = await lastSpillerArbeidsvisning({ id: "fremmed", role: "COACH" }, "spiller");
  assert.equal(data, null);
  assert.deepEqual(extraQueries, []);
});

test("tillatt coach bruker samme stall-porte i 360-listen", async () => {
  scoped = { id: "spiller", name: "Øyvind Rohjan", role: "PLAYER", avatarUrl: null, hcp: 4.2 };
  extraQueries.length = 0;
  const coach = { id: "coach-1", role: "COACH" };
  const data = await lastSpillerArbeidsvisning(coach, "spiller");
  assert.equal(data?.aktivId, "spiller");
  assert.deepEqual(railWhere, stallenPlayerWhere(coach));
  assert.deepEqual(stallenPlayerWhere(coach), coachScopedPlayerWhere(coach));
  assert.ok(extraQueries.includes("rail"));
});
