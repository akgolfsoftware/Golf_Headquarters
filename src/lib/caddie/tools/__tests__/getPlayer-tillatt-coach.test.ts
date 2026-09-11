/**
 * R-A: getPlayer skal gi data når viewer FAKTISK coacher spilleren, og
 * (R-B) navnet skal være pseudonymisert i det som returneres fra tool.execute
 * — det er dette resultatet AI SDK sender videre til modellen.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

const KARI = { id: "u-kari", name: "Kari Nordmann", email: "kari@example.no" };

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

test("getPlayer: tillatt coach får data, navnet er pseudonymisert (ikke ekte navn)", async () => {
  const { buildReadTools } = await import("../read");
  const tools = buildReadTools({ id: "coach-a", role: "COACH" });
  const svar = (await tools.getPlayer.execute!(
    { id: KARI.id },
    { toolCallId: "t1", messages: [] },
  )) as { ok: boolean; data?: { name: string } };
  assert.equal(svar.ok, true);
  assert.notEqual(svar.data?.name, KARI.name, "ekte navn skal ikke returneres fra tool.execute");
  assert.match(svar.data?.name ?? "", /^Spiller-[0-9a-f]{6}$/);
});
