/** kanSeLiveOkt: head coach ser alt, assistant coach bare egne økter og egne spillere. */
import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let okt: { coachId: string; studentId: string | null } | null;
let wbOkt: { coachId: string; playerId: string } | null;
let spillerIStall: boolean;

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingSessionV2: { findUnique: async () => okt },
      workbenchSession: { findUnique: async () => wbOkt },
      user: { findFirst: async () => (spillerIStall ? { id: "spiller" } : null) },
    },
  },
});

let kanSeLiveOkt: typeof import("./live-okt-data").kanSeLiveOkt;
before(async () => {
  ({ kanSeLiveOkt } = await import("./live-okt-data"));
});
test.beforeEach(() => {
  okt = { coachId: "coach-a", studentId: "spiller" };
  wbOkt = null;
  spillerIStall = false;
});

test("head coach (ADMIN) ser alle live-økter", async () => {
  assert.equal(await kanSeLiveOkt({ id: "admin", role: "ADMIN" }, "okt-1"), true);
});

test("assistant coach ser økter han selv leder", async () => {
  assert.equal(await kanSeLiveOkt({ id: "coach-a", role: "COACH" }, "okt-1"), true);
});

test("assistant coach ser en annen coachs økt bare når spilleren er i hans stall", async () => {
  const annen = { id: "coach-b", role: "COACH" };
  assert.equal(await kanSeLiveOkt(annen, "okt-1"), false);
  spillerIStall = true;
  assert.equal(await kanSeLiveOkt(annen, "okt-1"), true);
});

test("ukjent økt, spiller og forelder avvises", async () => {
  okt = null;
  assert.equal(await kanSeLiveOkt({ id: "admin", role: "ADMIN" }, "mangler"), false);
  okt = { coachId: "coach-a", studentId: "spiller" };
  for (const role of ["PLAYER", "PARENT"]) {
    assert.equal(await kanSeLiveOkt({ id: "x", role }, "okt-1"), false);
  }
});

test("Workbench-økt: samme regel med eier-coach, stall og rolle", async () => {
  okt = null;
  wbOkt = { coachId: "coach-a", playerId: "spiller" };
  assert.equal(await kanSeLiveOkt({ id: "admin", role: "ADMIN" }, "wb-1"), true);
  assert.equal(await kanSeLiveOkt({ id: "coach-a", role: "COACH" }, "wb-1"), true);
  assert.equal(await kanSeLiveOkt({ id: "coach-b", role: "COACH" }, "wb-1"), false);
  spillerIStall = true;
  assert.equal(await kanSeLiveOkt({ id: "coach-b", role: "COACH" }, "wb-1"), true);
  for (const role of ["PLAYER", "PARENT"]) {
    assert.equal(await kanSeLiveOkt({ id: "spiller", role }, "wb-1"), false);
  }
});
