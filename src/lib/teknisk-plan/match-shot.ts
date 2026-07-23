import { prisma } from "@/lib/prisma";

export type ShotMatchResult = {
  taskId: string | null;
  matchSource: string | null;
  matchConfidence: string | null;
};

export type MatchTaskCandidate = {
  id: string;
  tittel: string;
  koller: string[];
  slagType: string | null;
  sortOrder: number;
  hovedfokus: boolean;
  pSortOrder: number;
  pNummer: string;
};

export type MatchPlan = {
  tasks: MatchTaskCandidate[];
};

export type MatchOptions = {
  /** Eksplisitt oppgave valgt i import-modal. */
  preferredTaskId?: string | null;
  /** Prioriter fullsving-oppgaver (default true for range/simulator). */
  preferFullsving?: boolean;
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
    return nk === "alle køller" || nk === normShot || nk.includes(normShot) || normShot.includes(nk);
  });
}

function isFullsving(slagType: string | null): boolean {
  if (!slagType) return false;
  const s = slagType.trim().toLowerCase();
  return s === "fullsving" || s === "full sving" || s === "full-sving";
}

/** Laster aktiv teknisk plan én gang for batch-match under import. */
export async function loadMatchPlan(userId: string): Promise<MatchPlan | null> {
  const plan = await prisma.technicalPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    select: {
      positions: {
        orderBy: { sortOrder: "asc" },
        select: {
          sortOrder: true,
          hovedfokus: true,
          pNummer: true,
          tasks: {
            where: { status: { in: ["ACTIVE", "PENDING"] } },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              tittel: true,
              koller: true,
              slagType: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  if (!plan) return null;

  const tasks: MatchTaskCandidate[] = [];
  for (const pos of plan.positions) {
    for (const task of pos.tasks) {
      tasks.push({
        id: task.id,
        tittel: task.tittel,
        koller: task.koller,
        slagType: task.slagType,
        sortOrder: task.sortOrder,
        hovedfokus: pos.hovedfokus,
        pSortOrder: pos.sortOrder,
        pNummer: pos.pNummer,
      });
    }
  }

  return { tasks };
}

/**
 * Matcher ett slag mot allerede lastet plan (ingen ekstra DB-kall).
 */
export function matchShotAgainstPlan(
  plan: MatchPlan | null,
  club: string,
  options: MatchOptions = {},
): ShotMatchResult {
  if (!club.trim()) {
    return { taskId: null, matchSource: null, matchConfidence: null };
  }

  const preferFullsving = options.preferFullsving !== false;

  if (options.preferredTaskId) {
    const exists = plan?.tasks.some((t) => t.id === options.preferredTaskId);
    if (exists || !plan) {
      return {
        taskId: options.preferredTaskId,
        matchSource: "manual",
        matchConfidence: "high",
      };
    }
  }

  if (!plan || plan.tasks.length === 0) {
    return { taskId: null, matchSource: null, matchConfidence: null };
  }

  type Scored = MatchTaskCandidate & { score: number; confidence: string; source: string };
  const scored: Scored[] = [];

  for (const task of plan.tasks) {
    if (!clubsMatch(task.koller, club)) continue;

    let score = 10;
    let confidence = "medium";
    let source = "auto-club";

    if (preferFullsving && isFullsving(task.slagType)) {
      score += 40;
      confidence = "high";
      source = "auto-fullsving-club";
    }
    if (task.hovedfokus) {
      score += 25;
      if (confidence !== "high") confidence = "high";
      source = isFullsving(task.slagType) ? "auto-fullsving-fokus" : "auto-club-fokus";
    }

    // Lavere sortOrder = høyere prio
    score += Math.max(0, 10 - task.pSortOrder) + Math.max(0, 5 - task.sortOrder);

    scored.push({ ...task, score, confidence, source });
  }

  if (scored.length === 0) {
    return { taskId: null, matchSource: null, matchConfidence: null };
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!;
  return {
    taskId: best.id,
    matchSource: best.source,
    matchConfidence: best.confidence,
  };
}

/**
 * Matcher ett TrackMan-slag mot aktiv PositionTask.
 * For batch-import: bruk loadMatchPlan + matchShotAgainstPlan i stedet.
 */
export async function matchShotToTask(
  userId: string,
  club: string,
  options: MatchOptions = {},
): Promise<ShotMatchResult> {
  const plan = await loadMatchPlan(userId);
  return matchShotAgainstPlan(plan, club, options);
}

/** Mps → mph (TrackMan-schema lagrer clubSpeed i mph). */
export function mpsToMph(mps: number | null): number | null {
  if (mps === null) return null;
  return Math.round(mps * 2.23694 * 100) / 100;
}
