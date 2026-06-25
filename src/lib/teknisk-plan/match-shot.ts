import { prisma } from "@/lib/prisma";

export type ShotMatchResult = {
  taskId: string | null;
  matchSource: string | null;
  matchConfidence: string | null;
};

const CLUB_ALIASES: Record<string, string[]> = {
  driver: ["driver", "d"],
  "3-tre": ["3-tre", "3 wood", "3w", "3-wood"],
  hybrid: ["hybrid", "hibrid", "rescue"],
  "5-jern": ["5-jern", "5 iron", "5i", "5-iron"],
  "6-jern": ["6-jern", "6 iron", "6i", "6-iron"],
  "7-jern": ["7-jern", "7 iron", "7i", "7-iron"],
  "8-jern": ["8-jern", "8 iron", "8i", "8-iron"],
  "9-jern": ["9-jern", "9 iron", "9i", "9-iron"],
  pw: ["pw", "pitching wedge", "p-wedge"],
  "sw/lw": ["sw", "lw", "sand wedge", "lob wedge", "sw/lw"],
  putter: ["putter", "putt"],
};

function normalizeClub(raw: string): string {
  const lower = raw.trim().toLowerCase();
  for (const [canonical, aliases] of Object.entries(CLUB_ALIASES)) {
    if (aliases.some((a) => lower === a || lower.includes(a))) return canonical;
  }
  return lower;
}

function clubsMatch(taskKoller: string[], shotClub: string): boolean {
  const normShot = normalizeClub(shotClub);
  return taskKoller.some((k) => {
    const nk = normalizeClub(k);
    return nk === "alle køller" || nk === normShot;
  });
}

/**
 * Matcher ett TrackMan-slag mot aktiv PositionTask via kølle (hovedstrategi).
 * Drill-kontekst og manuell tagging kommer i senere fase.
 */
export async function matchShotToTask(
  userId: string,
  club: string,
): Promise<ShotMatchResult> {
  if (!club.trim()) {
    return { taskId: null, matchSource: null, matchConfidence: null };
  }

  const plan = await prisma.technicalPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    select: {
      positions: {
        orderBy: { sortOrder: "asc" },
        select: {
          tasks: {
            where: { status: { in: ["ACTIVE", "PENDING"] } },
            orderBy: { sortOrder: "asc" },
            select: { id: true, koller: true },
          },
        },
      },
    },
  });

  if (!plan) {
    return { taskId: null, matchSource: null, matchConfidence: null };
  }

  for (const pos of plan.positions) {
    for (const task of pos.tasks) {
      if (clubsMatch(task.koller, club)) {
        return {
          taskId: task.id,
          matchSource: "auto-club",
          matchConfidence: "medium",
        };
      }
    }
  }

  return { taskId: null, matchSource: null, matchConfidence: null };
}

/** Mps → mph (TrackMan-schema lagrer clubSpeed i mph). */
export function mpsToMph(mps: number | null): number | null {
  if (mps === null) return null;
  return Math.round(mps * 2.23694 * 100) / 100;
}