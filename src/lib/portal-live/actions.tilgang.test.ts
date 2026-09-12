/**
 * R-I: kaller savePlanSessionVideoNote. Eier-ID fra databasen, ikke klienten.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as const, tilgang: { nivaa: "FULL" } };
let planEier = "spiller-a";
let skrevet = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => bruker },
});
mock.module("@/lib/auth/own-or-coached", {
  namedExports: {
    canAccessPlayer: async (viewer: { id: string }, playerId: string) => viewer.id === playerId,
  },
});
mock.module("@/lib/agents/triggers", {
  namedExports: {
    triggerLiveSessionAgent: () => undefined,
    triggerSwingVideoAnalyst: () => undefined,
  },
});
mock.module("@/lib/workbench/wb-actions", {
  namedExports: { startSession: async () => ({ ok: true }) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingPlanSession: {
        findUnique: async () => ({
          liveSnapshot: {},
          plan: { userId: planEier },
        }),
        update: async () => {
          skrevet += 1;
          return {};
        },
      },
      workbenchSession: { findUnique: async () => null },
      trainingSessionV2: { findUnique: async () => null, update: async () => ({}) },
    },
  },
});

async function saveNote() {
  return (await import("./actions")).savePlanSessionVideoNote;
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER", tilgang: { nivaa: "FULL" } };
  planEier = "spiller-a";
  skrevet = 0;
});

test("savePlanSessionVideoNote avviser fremmed økt og skriver ingenting", async () => {
  const lagre = await saveNote();
  planEier = "spiller-b";
  const svar = await lagre({
    sessionId: "okt-fremmed",
    videoUrl: "https://example.test/video.mp4",
  });
  assert.deepEqual(svar, { ok: false, error: "Du har ikke tilgang til denne økten." });
  assert.equal(skrevet, 0);
});

test("savePlanSessionVideoNote lagrer på egen økt", async () => {
  const lagre = await saveNote();
  const svar = await lagre({
    sessionId: "okt-egen",
    videoUrl: "https://example.test/video.mp4",
  });
  assert.deepEqual(svar, { ok: true });
  assert.equal(skrevet, 1);
});
