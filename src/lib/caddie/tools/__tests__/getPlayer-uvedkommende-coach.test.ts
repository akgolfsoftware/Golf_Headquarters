/**
 * R-A: en COACH som IKKE coacher spilleren skal IKKE få dataene, selv med
 * direkte ID-oppslag (IDOR). Feilteksten er identisk med "finnes ikke" —
 * viewer skal ikke kunne skille "finnes ikke" fra "finnes, men er ikke din".
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

const KARI = { id: "u-kari", name: "Kari Nordmann" };

mock.module("@/lib/auth/coached", {
  namedExports: {
    coachScopedPlayerWhere: () => ({}),
    harCoachTilgangTilSpiller: async (viewer: { id: string }, playerId: string) =>
      viewer.id === "coach-a" && playerId === KARI.id,
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => ({
          id: KARI.id,
          name: KARI.name,
          role: "PLAYER",
          tier: "GRATIS",
          hcp: 12,
          playingYears: 5,
          ambition: null,
          homeClub: null,
          lastLoginAt: null,
          createdAt: new Date(),
          trainingPlans: [],
        }),
      },
    },
  },
});

test("getPlayer: uvedkommende coach (coach-b) avvises som om spilleren ikke finnes", async () => {
  const { buildReadTools } = await import("../read");
  const tools = buildReadTools({ id: "coach-b", role: "COACH" });
  const svar = (await tools.getPlayer.execute!(
    { id: KARI.id },
    { toolCallId: "t1", messages: [] },
  )) as { ok: boolean; userMessage?: string; data?: unknown };
  assert.equal(svar.ok, false, "coach-b skal IKKE få Karis data");
  assert.equal(svar.userMessage, "Fant ingen spiller med denne IDen.");
  assert.equal(svar.data, undefined);
});
