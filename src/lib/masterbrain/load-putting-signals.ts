import "server-only";
import { prisma } from "@/lib/prisma";
import { hentSgSnittPerOmrade } from "@/lib/portal/sg-omrade-snitt";
import type { PuttingSignals } from "@/lib/masterbrain/putting-signals";

/**
 * Load honest putting signals for a player. Nulls when data missing — never invent.
 */
export async function loadPuttingSignalsForUser(userId: string): Promise<PuttingSignals> {
  const [sg, recentRounds, user] = await Promise.all([
    hentSgSnittPerOmrade(userId),
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      take: 10,
      select: {
        id: true,
        holeScores: { select: { putts: true } },
      },
    }).catch(() => [] as { id: string; holeScores: { putts: number | null }[] }[]),
    prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    }).catch(() => null),
  ]);

  // 3-putt rate across loaded holes
  let holes = 0;
  let three = 0;
  for (const r of recentRounds) {
    for (const h of r.holeScores) {
      if (h.putts == null) continue;
      holes += 1;
      if (h.putts >= 3) three += 1;
    }
  }
  const threePuttRate = holes > 0 ? three / holes : null;

  // make % inside 8 ft not always available — leave null unless we have putt band data later
  const makePctInside8: number | null = null;

  let level: string | null = null;
  const prefs = user?.preferences;
  if (prefs && typeof prefs === "object" && !Array.isArray(prefs)) {
    const onboarding = (prefs as Record<string, unknown>).onboarding;
    if (onboarding && typeof onboarding === "object" && !Array.isArray(onboarding)) {
      const n = (onboarding as Record<string, unknown>).nivaa;
      if (typeof n === "string") level = n;
    }
  }

  return {
    sgPutt: sg.PUTT,
    makePctInside8,
    threePuttRate,
    tags: [],
    level,
  };
}
