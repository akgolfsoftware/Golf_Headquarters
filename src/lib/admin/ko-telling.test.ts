import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let lastCaddieWhere: unknown;
mock.module("@/lib/auth/coached", {
  namedExports: { coachScopedPlayerWhere: () => ({ role: "PLAYER" }) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      planAction: { count: async () => 2 },
      caddieDraft: {
        count: async ({ where }: { where: unknown }) => {
          lastCaddieWhere = where;
          return 1;
        },
      },
      sessionRequest: { count: async () => 3 },
    },
  },
});

let koTelling: typeof import("./ko-telling").koTelling;
before(async () => {
  ({ koTelling } = await import("./ko-telling"));
});

test("Caddie-telling bruker eier, også for ADMIN", async () => {
  const admin = await koTelling("admin", "ADMIN");
  assert.deepEqual(lastCaddieWhere, { status: "PENDING", userId: "admin" });
  assert.equal(admin.caddieDrafts, 1);
  assert.equal(admin.totalt, 6);
  const coach = await koTelling("coach-1", "COACH");
  assert.deepEqual(lastCaddieWhere, { status: "PENDING", userId: "coach-1" });
  assert.equal(coach.caddieDrafts, 1);
});
