"use server";

/**
 * Server actions for /portal/analysere — Analytics Workbench.
 * Fetch + save analytics data for the logged-in player.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type {
  PyramidArea,
  ShotLie,
  WindDir,
  ShotType,
} from "@/generated/prisma/client";

function startOfPeriod(period: "7d" | "30d" | "90d" | "1y" | "all"): Date | null {
  const now = new Date();
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

// ── Types ───────────────────────────────────────────────────────────────────

export type TrainingStats = {
  sessions: number;
  reps: number;
  minutes: number;
  byAxis: { axis: PyramidArea; minutes: number; sessions: number }[];
  recentSessions: {
    id: string;
    title: string;
    date: Date;
    durationMin: number;
    pyramidArea: PyramidArea;
    reps: number;
  }[];
};

export type RoundListItem = {
  id: string;
  playedAt: Date;
  courseName: string;
  score: number;
  par: number;
  sgTotal: number | null;
  shots: number;
};

export type RoundDetail = Omit<RoundListItem, "shots"> & {
  shotCount: number;
  holeScores: {
    holeNumber: number;
    par: number;
    strokes: number;
    putts: number | null;
    fairway: boolean | null;
    gir: boolean | null;
  }[];
  shots: {
    id: string;
    holeNumber: number;
    shotNumber: number;
    club: string | null;
    lie: ShotLie;
    distanceToPin: number | null;
    distanceHit: number | null;
    windDir: WindDir | null;
    shotType: ShotType;
    mentalScore: number | null;
  }[];
};

export type RoundStats = {
  rounds: RoundListItem[];
  bestScore: number | null;
  avgScore: number | null;
  totalRounds: number;
};

export type TournamentListItem = {
  id: string;
  name: string;
  startDate: Date;
  position: number | null;
  score: number | null;
  status: string;
};

export type TestListItem = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  takenAt: Date;
  score: number;
};

export type TrackManClub = {
  club: string;
  shots: number;
  avgTotal: number | null;
  avgSmash: number | null;
  avgBallSpeed: number | null;
};

export type TrackManData = {
  clubs: TrackManClub[];
  sessions: {
    id: string;
    recordedAt: Date;
    shotCount: number;
    source: string;
    /** Kølle brukt i økten, kun satt hvis ALLE slag i økten har samme kølle (ekte data, ikke gjettet). */
    primaryClub: string | null;
  }[];
};

export type GoalListItem = {
  id: string;
  title: string;
  category: string;
  targetValue: number | null;
  targetDate: Date | null;
  status: string;
};

export type CourseOption = {
  id: string;
  name: string;
  par: number;
};

export type SgBreakdown = {
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  /** Number of rounds used for the average */
  roundCount: number;
};

export type AnalyticsWorkbenchData = {
  training: TrainingStats;
  rounds: RoundStats;
  tournaments: TournamentListItem[];
  tests: TestListItem[];
  trackman: TrackManData;
  goals: GoalListItem[];
  courses: CourseOption[];
  sgBreakdown: SgBreakdown;
};

// ── Training stats ──────────────────────────────────────────────────────────

export async function getTrainingStats(
  userId: string,
  period: "7d" | "30d" | "90d" | "1y" | "all" = "30d",
): Promise<TrainingStats> {
  const from = startOfPeriod(period);
  // Øvre grense = nå: planlagte fremtidige økter er ikke gjennomført trening
  // og skal aldri telle i volum eller «Siste økter».
  const naa = new Date();

  const [sessions, drills] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: {
        studentId: userId,
        startTime: { ...(from ? { gte: from } : {}), lte: naa },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        miljo: true,
        practiceType: true,
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.drillLogV2.findMany({
      where: {
        loggedBy: userId,
        ...(from && { loggedAt: { gte: from } }),
      },
      include: {
        drill: {
          select: {
            pyramide: true,
            sessionId: true,
          },
        },
      },
    }),
  ]);

  const minutes = sessions.reduce(
    (sum, s) => sum + Math.max(0, (s.endTime.getTime() - s.startTime.getTime()) / 60000),
    0,
  );

  const reps = drills.reduce((sum, d) => sum + (d.repsTotal ?? 0), 0);

  // Fordel økt-varighet per drill/akse i økten.
  const sessionMinutes = new Map<string, number>();
  for (const s of sessions) {
    sessionMinutes.set(s.id, Math.max(0, (s.endTime.getTime() - s.startTime.getTime()) / 60000));
  }

  const byAxisAgg = new Map<PyramidArea, { minutes: number; sessions: Set<string> }>();
  for (const d of drills) {
    const axis = d.drill?.pyramide ?? "SPILL";
    const entry = byAxisAgg.get(axis) ?? { minutes: 0, sessions: new Set<string>() };
    const min = d.drill?.sessionId ? (sessionMinutes.get(d.drill.sessionId) ?? 0) * 0.2 : 0;
    entry.minutes += min;
    if (d.drill?.sessionId) entry.sessions.add(d.drill.sessionId);
    byAxisAgg.set(axis, entry);
  }

  const byAxis = Array.from(byAxisAgg.entries()).map(([axis, v]) => ({
    axis,
    minutes: Math.round(v.minutes),
    sessions: v.sessions.size,
  }));

  const recentSessions = sessions.slice(0, 8).map((s) => ({
    id: s.id,
    title: s.title,
    date: s.startTime,
    durationMin: Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60000),
    pyramidArea: ("SPILL" as PyramidArea), // TrainingSessionV2 har ikke pyramidArea; bruk generisk
    reps: drills.filter((d) => d.drill?.sessionId === s.id).reduce((sum, d) => sum + (d.repsTotal ?? 0), 0),
  }));

  return {
    sessions: sessions.length,
    reps,
    minutes: Math.round(minutes),
    byAxis,
    recentSessions,
  };
}

// ── Round stats ─────────────────────────────────────────────────────────────

export async function getRoundStats(
  userId: string,
  period: "7d" | "30d" | "90d" | "1y" | "all" = "all",
): Promise<RoundStats> {
  const from = startOfPeriod(period);

  const roundsRaw = await prisma.round.findMany({
    where: {
      userId,
      ...(from && { playedAt: { gte: from } }),
    },
    include: {
      course: { select: { name: true, par: true } },
      shots: { select: { id: true } },
      _count: { select: { shots: true } },
    },
    orderBy: { playedAt: "desc" },
  });

  const scores = roundsRaw.map((r) => r.score);
  const bestScore = scores.length ? Math.min(...scores) : null;
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const rounds: RoundListItem[] = roundsRaw.map((r) => ({
    id: r.id,
    playedAt: r.playedAt,
    courseName: r.course?.name ?? "Ukjent bane",
    score: r.score,
    par: r.course?.par ?? 72,
    sgTotal: r.sgTotal,
    shots: r._count.shots,
  }));

  return {
    rounds,
    bestScore,
    avgScore: avgScore != null ? Math.round(avgScore * 10) / 10 : null,
    totalRounds: roundsRaw.length,
  };
}

export async function getRoundDetail(userId: string, roundId: string): Promise<RoundDetail | null> {
  const round = await prisma.round.findFirst({
    where: { id: roundId, userId },
    include: {
      course: { select: { name: true, par: true } },
      holeScores: { orderBy: { holeNumber: "asc" } },
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });

  if (!round) return null;

  return {
    id: round.id,
    playedAt: round.playedAt,
    courseName: round.course?.name ?? "Ukjent bane",
    score: round.score,
    par: round.course?.par ?? 72,
    sgTotal: round.sgTotal,
    shotCount: round.shots.length,
    holeScores: round.holeScores.map((h) => ({
      holeNumber: h.holeNumber,
      par: h.par,
      strokes: h.strokes,
      putts: h.putts,
      fairway: h.fairway,
      gir: h.gir,
    })),
    shots: round.shots.map((s) => ({
      id: s.id,
      holeNumber: s.holeNumber,
      shotNumber: s.shotNumber,
      club: s.club,
      lie: s.lie,
      distanceToPin: s.distanceToPin,
      distanceHit: s.distanceHit,
      windDir: s.windDir,
      shotType: s.shotType,
      mentalScore: s.mentalScore,
    })),
  };
}

// ── Tournament results ──────────────────────────────────────────────────────

export async function getTournamentResults(
  userId: string,
  period: "7d" | "30d" | "90d" | "1y" | "all" = "all",
): Promise<TournamentListItem[]> {
  const from = startOfPeriod(period);

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId,
      ...(from && { createdAt: { gte: from } }),
    },
    include: {
      tournament: {
        select: { id: true, name: true, startDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tournamentIds = entries.map((e) => e.tournamentId).filter(Boolean) as string[];

  const results = tournamentIds.length
    ? await prisma.tournamentResult.findMany({
        where: { userId, tournamentId: { in: tournamentIds } },
        select: { tournamentId: true, position: true, score: true },
      })
    : [];

  const resultMap = new Map(results.map((r) => [r.tournamentId, r]));

  return entries.map((e) => ({
    id: e.id,
    name: e.tournament?.name ?? e.manualName ?? "Ukjent turnering",
    startDate: e.tournament?.startDate ?? e.manualDate ?? e.createdAt,
    position: resultMap.get(e.tournamentId ?? "")?.position ?? null,
    score: resultMap.get(e.tournamentId ?? "")?.score ?? null,
    status: e.entryStatus,
  }));
}

// ── Test results ────────────────────────────────────────────────────────────

export async function getTestResults(
  userId: string,
  period: "7d" | "30d" | "90d" | "1y" | "all" = "all",
): Promise<TestListItem[]> {
  const from = startOfPeriod(period);

  const results = await prisma.testResult.findMany({
    where: {
      userId,
      ...(from && { takenAt: { gte: from } }),
    },
    include: {
      test: { select: { name: true, pyramidArea: true } },
    },
    orderBy: { takenAt: "desc" },
  });

  return results.map((r) => ({
    id: r.id,
    name: r.test?.name ?? "Test",
    pyramidArea: r.test?.pyramidArea ?? "SPILL",
    takenAt: r.takenAt,
    score: r.score,
  }));
}

// ── TrackMan data ───────────────────────────────────────────────────────────

export async function getTrackManData(
  userId: string,
  period: "7d" | "30d" | "90d" | "1y" | "all" = "30d",
): Promise<TrackManData> {
  const from = startOfPeriod(period);

  const sessions = await prisma.trackManSession.findMany({
    where: {
      userId,
      ...(from && { recordedAt: { gte: from } }),
    },
    include: {
      shots: {
        select: {
          club: true,
          totalDistance: true,
          smashFactor: true,
          ballSpeed: true,
        },
      },
    },
    orderBy: { recordedAt: "desc" },
  });

  const clubMap = new Map<
    string,
    {
      shots: number;
      totalSum: number;
      smashSum: number;
      ballSpeedSum: number;
      smashCount: number;
      ballSpeedCount: number;
    }
  >();

  for (const session of sessions) {
    for (const shot of session.shots) {
      const club = shot.club ?? "Ukjent";
      const entry = clubMap.get(club) ?? {
        shots: 0,
        totalSum: 0,
        smashSum: 0,
        ballSpeedSum: 0,
        smashCount: 0,
        ballSpeedCount: 0,
      };
      entry.shots += 1;
      if (shot.totalDistance != null) entry.totalSum += shot.totalDistance;
      if (shot.smashFactor != null) {
        entry.smashSum += shot.smashFactor;
        entry.smashCount += 1;
      }
      if (shot.ballSpeed != null) {
        entry.ballSpeedSum += shot.ballSpeed;
        entry.ballSpeedCount += 1;
      }
      clubMap.set(club, entry);
    }
  }

  const clubs: TrackManClub[] = Array.from(clubMap.entries()).map(([club, v]) => ({
    club,
    shots: v.shots,
    avgTotal: v.shots ? Math.round((v.totalSum / v.shots) * 10) / 10 : null,
    avgSmash: v.smashCount ? Math.round((v.smashSum / v.smashCount) * 100) / 100 : null,
    avgBallSpeed: v.ballSpeedCount ? Math.round((v.ballSpeedSum / v.ballSpeedCount) * 10) / 10 : null,
  }));

  return {
    clubs,
    sessions: sessions.map((s) => {
      const kolleSet = new Set(s.shots.map((sh) => sh.club).filter((c): c is string => !!c));
      return {
        id: s.id,
        recordedAt: s.recordedAt,
        shotCount: s.shotCount,
        source: s.source,
        primaryClub: kolleSet.size === 1 ? [...kolleSet][0] : null,
      };
    }),
  };
}

// ── Goals ───────────────────────────────────────────────────────────────────

export async function getGoals(userId: string): Promise<GoalListItem[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      targetValue: true,
      targetDate: true,
      status: true,
    },
  });

  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    targetValue: g.targetValue,
    targetDate: g.targetDate,
    status: g.status,
  }));
}

// ── SG breakdown ─────────────────────────────────────────────────────────────

async function getSgBreakdown(userId: string): Promise<SgBreakdown> {
  const recent = await prisma.round.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 10,
    select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
  });

  function avgOf(vals: (number | null)[]): number | null {
    const filtered = vals.filter((v): v is number => v != null);
    if (!filtered.length) return null;
    return Math.round((filtered.reduce((a, b) => a + b, 0) / filtered.length) * 10) / 10;
  }

  return {
    roundCount: recent.length,
    sgTotal: avgOf(recent.map((r) => r.sgTotal)),
    sgOtt: avgOf(recent.map((r) => r.sgOtt)),
    sgApp: avgOf(recent.map((r) => r.sgApp)),
    sgArg: avgOf(recent.map((r) => r.sgArg)),
    sgPutt: avgOf(recent.map((r) => r.sgPutt)),
  };
}

// ── Combined loader ─────────────────────────────────────────────────────────

export async function loadAnalyticsWorkbenchData(
  userId: string,
): Promise<AnalyticsWorkbenchData> {
  const [training, rounds, tournaments, tests, trackman, goals, courses, sgBreakdown] = await Promise.all([
    getTrainingStats(userId, "30d"),
    getRoundStats(userId, "all"),
    getTournamentResults(userId, "all"),
    getTestResults(userId, "all"),
    getTrackManData(userId, "30d"),
    getGoals(userId),
    prisma.courseDefinition.findMany({
      select: { id: true, name: true, par: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
    getSgBreakdown(userId),
  ]);

  return { training, rounds, tournaments, tests, trackman, goals, courses, sgBreakdown };
}

// ── Save round stats ────────────────────────────────────────────────────────

export type RoundShotInput = {
  holeNumber: number;
  shotNumber: number;
  club?: string;
  lie: ShotLie;
  distanceToPin?: number;
  distanceHit?: number;
  windDir?: WindDir;
  shotType: ShotType;
  mentalScore?: number;
  notes?: string;
};

export type RoundHoleInput = {
  holeNumber: number;
  par: number;
  strokes: number;
  putts?: number;
  fairway?: boolean;
  gir?: boolean;
};

export async function saveRoundStats(
  input: {
    courseId: string;
    playedAt: Date | string;
    score: number;
    holes: RoundHoleInput[];
    shots: RoundShotInput[];
    notes?: string;
  },
): Promise<{ success: boolean; roundId?: string; error?: string }> {
  try {
    const user = await requirePortalUser();
    const userId = user.id;
    const playedAt = typeof input.playedAt === "string" ? new Date(input.playedAt) : input.playedAt;

    const round = await prisma.round.create({
      data: {
        userId,
        courseId: input.courseId,
        playedAt,
        score: input.score,
        notes: input.notes,
      },
    });

    if (input.holes.length) {
      await prisma.holeScore.createMany({
        data: input.holes.map((h) => ({
          roundId: round.id,
          holeNumber: h.holeNumber,
          par: h.par,
          strokes: h.strokes,
          putts: h.putts,
          fairway: h.fairway,
          gir: h.gir,
        })),
      });
    }

    if (input.shots.length) {
      await prisma.shot.createMany({
        data: input.shots.map((s) => ({
          roundId: round.id,
          holeNumber: s.holeNumber,
          holePar: input.holes.find((h) => h.holeNumber === s.holeNumber)?.par ?? 4,
          shotNumber: s.shotNumber,
          club: s.club,
          lie: s.lie,
          distanceToPin: s.distanceToPin,
          distanceHit: s.distanceHit,
          windDir: s.windDir,
          shotType: s.shotType,
          mentalScore: s.mentalScore,
          notes: s.notes,
        })),
      });
    }

    revalidatePath("/portal/analysere");
    return { success: true, roundId: round.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil";
    return { success: false, error: message };
  }
}
