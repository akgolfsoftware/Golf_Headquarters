import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let playerExists = true;
let writes = 0;
let notices = 0;
let visibility = "PRIVATE";
let creator = "other";
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "coach", name: "Testcoach", role: "COACH" }) } });
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => ({ id: "player" }) } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/notifications", { namedExports: { notify: async () => { notices++; } } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async () => playerExists ? { id: "player" } : null },
  testDefinition: { findUnique: async () => ({ id: "custom", name: "Test", isCustom: true, visibility, createdById: creator }) },
  testAssignment: { create: async () => { writes++; return {}; } },
} } });
let assign: typeof import("@/app/admin/(legacy)/tester/tildel/[spillerId]/actions").tildelTest;
before(async () => { assign = (await import("@/app/admin/(legacy)/tester/tildel/[spillerId]/actions")).tildelTest; });
beforeEach(() => { playerExists = true; writes = 0; notices = 0; visibility = "PRIVATE"; creator = "other"; });
test("privat test fra annen eier avvises uten tildeling eller varsel", async () => {
  assert.equal((await assign({ spillerId: "player", testId: "custom" })).ok, false);
  assert.equal(writes, 0); assert.equal(notices, 0);
});
test("coach kan tildele egen test til egen spiller", async () => {
  creator = "coach";
  assert.equal((await assign({ spillerId: "player", testId: "custom" })).ok, true);
  assert.equal(writes, 1); assert.equal(notices, 1);
});
test("spiller utenfor coachens omfang og ugyldig frist avvises", async () => {
  creator = "coach"; playerExists = false;
  assert.equal((await assign({ spillerId: "other", testId: "custom" })).ok, false);
  playerExists = true;
  assert.equal((await assign({ spillerId: "player", testId: "custom", dueDate: "ugyldig" })).ok, false);
  assert.equal(writes, 0); assert.equal(notices, 0);
});
