/**
 * R-I: kaller sendLiveMelding. Coach uten eierskap til økten avvises.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker: { id: string; role: string } | null = { id: "coach-a", role: "COACH" };
let sesjonCoachId = "coach-a";
let skrevet = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingSessionV2: {
        findFirst: async ({
          where,
        }: {
          where: { id: string; coachId?: string };
        }) => {
          if (where.coachId && where.coachId !== sesjonCoachId) return null;
          return { id: where.id, completedSummary: {} };
        },
        update: async () => {
          skrevet += 1;
          return {};
        },
      },
    },
  },
});

async function send() {
  return (await import("./live-okt-actions")).sendLiveMelding;
}

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  sesjonCoachId = "coach-a";
  skrevet = 0;
});

test("sendLiveMelding avviser spiller", async () => {
  const fn = await send();
  bruker = { id: "spiller-a", role: "PLAYER" };
  const svar = await fn("okt-1", "Hei");
  assert.deepEqual(svar, { ok: false, error: "Ikke tilgang" });
  assert.equal(skrevet, 0);
});

test("sendLiveMelding avviser coach uten økten og skriver ingenting", async () => {
  const fn = await send();
  bruker = { id: "coach-b", role: "COACH" };
  const svar = await fn("okt-1", "Hei");
  assert.deepEqual(svar, { ok: false, error: "Økt ikke funnet" });
  assert.equal(skrevet, 0);
});

test("sendLiveMelding skriver når coachen eier økten", async () => {
  const fn = await send();
  const svar = await fn("okt-1", "Fokus: startlinjen");
  assert.deepEqual(svar, { ok: true });
  assert.equal(skrevet, 1);
});
