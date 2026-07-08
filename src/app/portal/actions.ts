/**
 * PlayerHQ Dashboard — server actions for /portal (Oversikt).
 *
 * Alle funksjoner er server-only og tar userId eksplisitt. Brukes av
 * page.tsx og kan gjenbrukes av andre RSC i portalen.
 */

"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import type { PyramidArea, PracticeType, SessionStatusV2 } from "@/generated/prisma/client";
import { translateMiljo } from "@/lib/portal/translate-taxonomy";
import { v2DbSessionHref } from "@/lib/portal/session-hrefs";

// ── Types ─────────────────────────────────────────────────────────

export type TodaySession = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: SessionStatusV2;
  practiceType: PracticeType;
  pyramidArea: PyramidArea;
  durationMin: number;
  /** Treningsmiljø (Sted) — null hvis ikke satt på økten. */
  sted: string | null;
  drills: { id: string; name: string; durationMinutes: number }[];
  href: string;
};

export type WeekDay = {
  date: Date;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  sessions: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    status: SessionStatusV2;
    pyramidArea: PyramidArea;
    href: string;
  }[];
};

export type RecentActivityItem = {
  id: string;
  drillName: string;
  sessionTitle: string;
  loggedAt: Date;
  repsTotal: number;
  successRate: number | null;
  href: string;
};

export type GoalItem = {
  id: string;
  title: string;
  category: "OUTCOME" | "PROCESS";
  status: "ACTIVE" | "ACHIEVED" | "ABANDONED";
  targetValue: number | null;
  progress: number;
  deadline: Date | null;
  daysLeft: number | null;
  href: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: Date;
  href: string;
  unread: boolean;
};

export type CoachMessageItem = {
  id: string;
  subject: string;
  preview: string;
  from: "coach" | "player";
  coachName: string;
  coachInitials: string;
  createdAt: Date;
  href: string;
};

export type NextTournament = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  daysLeft: number;
  href: string;
};

export type WeekPlanProgress = {
  plannedMin: number;
  completedMin: number;
  plannedByAxis: Record<PyramidArea, number>;
  completedByAxis: Record<PyramidArea, number>;
};

export type StatsSnapshot = {
  sessionsToday: number;
  repsToday: number;
  timeThisWeekMin: number;
  roundsThisWeek: number;
};

// ── Helpers ───────────────────────────────────────────────────────

const PRACTICE_TO_PYRAMID: Record<PracticeType, PyramidArea> = {
  BLOKK: "TEK",
  RANDOM: "SLAG",
  KONKURRANSE: "TURN",
  SPILL_TEST: "SPILL",
};

const UKEDAG_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

function startOfWeek(d: Date): Date {
  const s = startOfDay(d);
  const day = (s.getDay() + 6) % 7; // mandag = 0
  s.setDate(s.getDate() - day);
  return s;
}

function endOfWeek(d: Date): Date {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

function ukenummer(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604_800_000);
}

function fornavn(name: string): string {
  return name.trim().split(/\s+/)[0] || "spiller";
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "God natt";
  if (hour < 11) return "God morgen";
  if (hour < 17) return "Hei";
  return "God kveld";
}

function initialer(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

// ── Today's session ───────────────────────────────────────────────

export async function getTodaysSession(userId: string): Promise<TodaySession | null> {
  const now = new Date();
  const sessions = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId, startTime: { gte: startOfDay(now), lte: endOfDay(now) } },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      practiceType: true,
      miljo: true,
      drills: { select: { id: true, name: true, durationMinutes: true }, orderBy: { sortOrder: "asc" } },
    },
    take: 1,
  });

  const s = sessions[0];
  if (!s) return null;

  return {
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    practiceType: s.practiceType,
    pyramidArea: PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK",
    durationMin: Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000)),
    sted: s.miljo ? translateMiljo(s.miljo) : null,
    drills: s.drills,
    href: v2DbSessionHref(s.id, s.status),
  };
}

// ── Week overview ─────────────────────────────────────────────────

export async function getWeekOverview(userId: string): Promise<WeekDay[]> {
  const now = new Date();
  const start = startOfWeek(now);
  const end = endOfWeek(now);

  const sessions = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId, startTime: { gte: start, lte: end } },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      practiceType: true,
    },
  });

  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      dayLabel: UKEDAG_KORT[(d.getDay() + 6) % 7],
      dayNumber: d.getDate(),
      isToday: d.toDateString() === now.toDateString(),
      sessions: [],
    };
  });

  for (const s of sessions) {
    const day = days.find((d) => d.date.toDateString() === s.startTime.toDateString());
    if (!day) continue;
    day.sessions.push({
      id: s.id,
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      pyramidArea: PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK",
      href: v2DbSessionHref(s.id, s.status),
    });
  }

  return days;
}

// ── Recent activity ───────────────────────────────────────────────

export async function getRecentActivity(userId: string, limit = 5): Promise<RecentActivityItem[]> {
  const logs = await prisma.drillLogV2.findMany({
    where: { loggedBy: userId },
    orderBy: { loggedAt: "desc" },
    take: limit,
    select: {
      id: true,
      loggedAt: true,
      repsTotal: true,
      successRate: true,
      drill: {
        select: {
          name: true,
          session: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (logs.length > 0) {
    return logs.map((log) => ({
      id: log.id,
      drillName: log.drill.name,
      sessionTitle: log.drill.session.title,
      loggedAt: log.loggedAt,
      repsTotal: log.repsTotal,
      successRate: log.successRate,
      href: v2DbSessionHref(log.drill.session.id, "COMPLETED"),
    }));
  }

  // Fallback (fasit «Hva er nytt»): ingen drill-logger ennå → vis siste varsler
  // (coach-meldinger, ny plan, innsikt, booking osv.) som aktivitetsfeed. Ekte data.
  const notifs = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, body: true, type: true, link: true, createdAt: true },
  });
  return notifs.map((n) => ({
    id: n.id,
    drillName: n.title,
    sessionTitle: n.body ?? n.type,
    loggedAt: n.createdAt,
    repsTotal: 0,
    successRate: null,
    href: n.link ?? "/portal",
  }));
}

// ── Goals ─────────────────────────────────────────────────────────

export async function getGoals(userId: string, limit = 3): Promise<GoalItem[]> {
  const goals = await prisma.goal.findMany({
    where: { userId, status: { in: ["ACTIVE", "ACHIEVED"] } },
    orderBy: [{ status: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: { id: true, title: true, category: true, status: true, targetValue: true, targetDate: true, createdAt: true },
  });

  const now = new Date();
  return goals.map((g) => {
    const daysLeft = g.targetDate ? Math.ceil((g.targetDate.getTime() - now.getTime()) / 86_400_000) : null;
    // Progress: forenklet ut fra måltype. Hvis targetDate finnes, regner vi tidsbasert fremdrift.
    let progress = 0;
    if (g.targetDate) {
      const created = g.createdAt.getTime();
      const total = g.targetDate.getTime() - created;
      const elapsed = now.getTime() - created;
      progress = total > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))) : 0;
    }
    if (g.status === "ACHIEVED") progress = 100;

    const status = g.status as GoalItem["status"];

    return {
      id: g.id,
      title: g.title,
      category: g.category,
      status,
      targetValue: g.targetValue,
      progress,
      deadline: g.targetDate,
      daysLeft,
      href: `/portal/mal/goal/${g.id}`,
    };
  });
}

// ── Unread notifications ──────────────────────────────────────────

export async function getUnreadNotifications(
  userId: string,
  limit = 5,
): Promise<{ count: number; notifications: NotificationItem[] }> {
  const [count, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, type: true, title: true, body: true, createdAt: true, readAt: true, link: true },
    }),
  ]);

  return {
    count,
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body ?? "",
      createdAt: n.createdAt,
      href: n.link ?? "/portal/varsler",
      unread: n.readAt === null,
    })),
  };
}

// ── Latest coach message ──────────────────────────────────────────

export async function getLatestCoachMessage(userId: string): Promise<CoachMessageItem | null> {
  // Henter siste coaching-session (DIRECT/AI) med meldinger.
  const session = await prisma.coachingSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, messages: true, updatedAt: true, coachId: true },
  });

  if (!session) return null;

  const messages = session.messages as Array<{ role: string; content: string; ts?: string }> | null;
  const lastMessage = messages?.slice(-1)[0];
  if (!lastMessage?.content) return null;

  const coach = await prisma.user.findUnique({
    where: { id: session.coachId },
    select: { name: true },
  });

  const preview = lastMessage.content.slice(0, 120) + (lastMessage.content.length > 120 ? "…" : "");
  const from = lastMessage.role === "user" || lastMessage.role === "player" ? "player" : "coach";

  return {
    id: session.id,
    subject: "Siste melding fra coach",
    preview,
    from,
    coachName: coach?.name ?? "Coach",
    coachInitials: initialer(coach?.name ?? "Coach"),
    createdAt: session.updatedAt,
    href: `/portal/coach/melding/${session.id}`,
  };
}

// ── Stats snapshot ────────────────────────────────────────────────

export async function getStatsSnapshot(userId: string): Promise<StatsSnapshot> {
  const now = new Date();
  const weekStart = startOfWeek(now);

  const [todaySessions, weekSessions, weekRounds, todayLogs] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { studentId: userId, startTime: { gte: startOfDay(now), lte: endOfDay(now) } },
      select: { id: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: userId, startTime: { gte: weekStart, lte: now } },
      select: { startTime: true, endTime: true, drills: { select: { durationMinutes: true } } },
    }),
    prisma.round.count({ where: { userId, playedAt: { gte: weekStart, lte: now } } }),
    prisma.drillLogV2.findMany({
      where: { loggedBy: userId, loggedAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      select: { repsTotal: true },
    }),
  ]);

  const timeThisWeekMin = weekSessions.reduce(
    (sum, s) => sum + Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000)),
    0,
  );
  const repsToday = todayLogs.reduce((sum, l) => sum + l.repsTotal, 0);

  return {
    sessionsToday: todaySessions.length,
    repsToday,
    timeThisWeekMin,
    roundsThisWeek: weekRounds,
  };
}

// ── Next tournament ───────────────────────────────────────────────

export async function getNextTournament(userId: string): Promise<NextTournament | null> {
  const now = startOfDay(new Date());

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId,
      entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      OR: [
        { tournamentId: { not: null }, tournament: { startDate: { gte: now } } },
        { tournamentId: null, manualDate: { gte: now } },
      ],
    },
    select: {
      id: true,
      tournamentId: true,
      manualName: true,
      manualDate: true,
      manualEndDate: true,
      tournament: { select: { name: true, startDate: true, endDate: true, location: true } },
    },
  });

  const sorted = entries
    .map((e) => ({
      entry: e,
      startDate: e.tournament?.startDate ?? e.manualDate ?? now,
    }))
    .filter((x) => x.startDate >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const first = sorted[0];
  if (!first) return null;

  const entry = first.entry;
  const name = entry.tournament?.name ?? entry.manualName ?? "Turnering";
  const startDate = first.startDate;
  const endDate = entry.tournament?.endDate ?? entry.manualEndDate ?? null;
  const location = entry.tournament?.location ?? null;
  const daysLeft = Math.max(0, Math.ceil((startDate.getTime() - now.getTime()) / 86_400_000));

  return {
    id: entry.tournamentId ?? entry.id,
    name,
    startDate,
    endDate,
    location,
    daysLeft,
    href: entry.tournamentId ? `/portal/tren/turneringer/${entry.tournamentId}` : "/portal/tren/turneringer",
  };
}

// ── Week plan progress (planned vs completed by pyramid axis) ───────

export async function getWeekPlanProgress(userId: string): Promise<WeekPlanProgress> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const sessions = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId, startTime: { gte: weekStart, lte: weekEnd } },
    select: {
      startTime: true,
      endTime: true,
      status: true,
      practiceType: true,
    },
  });

  const initial: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };

  return sessions.reduce(
    (acc, s) => {
      const min = Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000));
      const axis = PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK";
      acc.plannedMin += min;
      acc.plannedByAxis[axis] += min;
      if (s.status === "COMPLETED") {
        acc.completedMin += min;
        acc.completedByAxis[axis] += min;
      }
      return acc;
    },
    {
      plannedMin: 0,
      completedMin: 0,
      plannedByAxis: { ...initial },
      completedByAxis: { ...initial },
    } as WeekPlanProgress,
  );
}

// ── KPI stats (avg score + SG total from recent rounds) ──────────

export type KpiStats = {
  avgScore: number | null;   // snitt bruttoscore siste 10 runder
  sgTotal: number | null;    // snitt SG total siste 10 runder
  sessionsThisWeek: number;  // treningsøkter denne uken
  roundsCount: number;       // antall runder siste 90 dager
  sgBreakdown: {             // snitt SG per kategori siste 10 runder
    ott: number | null;
    app: number | null;
    arg: number | null;
    putt: number | null;
  };
  /** SG total per runde, eldst→nyest (siste 10 runder) — for hero-sparkline. Ekte tall, ikke interpolert. */
  sgTrend: number[];
};

export async function getKpiStats(userId: string): Promise<KpiStats> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const since90 = new Date(now.getTime() - 90 * 86_400_000);

  const [rounds, weekSessions, roundsCount] = await Promise.all([
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      take: 10,
      select: { score: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    prisma.trainingSessionV2.count({
      where: { studentId: userId, startTime: { gte: weekStart, lte: now } },
    }),
    prisma.round.count({ where: { userId, playedAt: { gte: since90 } } }),
  ]);

  const scoresWithValue = rounds.filter((r) => r.score > 0);
  const avgScore =
    scoresWithValue.length > 0
      ? Math.round((scoresWithValue.reduce((s, r) => s + r.score, 0) / scoresWithValue.length) * 10) / 10
      : null;

  const avg = (key: "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt"): number | null => {
    const vals = rounds.filter((r) => r[key] != null).map((r) => r[key] as number);
    return vals.length > 0
      ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
      : null;
  };

  const sgTrend = rounds
    .filter((r) => r.sgTotal != null)
    .map((r) => r.sgTotal as number)
    .reverse(); // rounds er nyest→eldst; sparkline leses venstre (eldst) → høyre (nyest)

  return {
    avgScore,
    sgTotal: avg("sgTotal"),
    sessionsThisWeek: weekSessions,
    roundsCount,
    sgBreakdown: { ott: avg("sgOtt"), app: avg("sgApp"), arg: avg("sgArg"), putt: avg("sgPutt") },
    sgTrend,
  };
}

// ── Treningshistorikk-heatmap (12 uker × ukedag, for Hjem-hero) ────

export type TrainingHeatmap = {
  rows: string[]; // ukedag-forkortelser, mandag først
  cols: string[]; // dato (dag i måned) for hver ukes mandag, eldst→nyest
  values: number[][]; // [ukedag][uke] — 0..1, normalisert på maks 2 økter/dag
  totalSessions: number;
};

export async function getTrainingHeatmap(userId: string): Promise<TrainingHeatmap> {
  const now = new Date();
  const weeksBack = 12;
  const rangeStart = startOfWeek(new Date(now.getTime() - (weeksBack - 1) * 7 * 86_400_000));

  const sessions = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId, startTime: { gte: rangeStart, lte: endOfDay(now) } },
    select: { startTime: true },
  });

  const rows = ["M", "T", "O", "T", "F", "L", "S"];
  const weekStarts = Array.from({ length: weeksBack }, (_, w) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + w * 7);
    return d;
  });
  const cols = weekStarts.map((d) => String(d.getDate()));
  const counts: number[][] = Array.from({ length: 7 }, () => Array.from({ length: weeksBack }, () => 0));

  for (const s of sessions) {
    const dayIdx = (s.startTime.getDay() + 6) % 7; // mandag = 0
    const weekIdx = Math.floor((startOfDay(s.startTime).getTime() - rangeStart.getTime()) / (7 * 86_400_000));
    if (weekIdx >= 0 && weekIdx < weeksBack) counts[dayIdx][weekIdx] += 1;
  }

  const values = counts.map((row) => row.map((n) => Math.max(0, Math.min(1, n / 2))));

  return { rows, cols, values, totalSessions: sessions.length };
}

// ── All today's sessions (for second-session compact row) ─────────

export async function getAllTodaysSessions(userId: string): Promise<TodaySession[]> {
  const now = new Date();
  const sessions = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId, startTime: { gte: startOfDay(now), lte: endOfDay(now) } },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      practiceType: true,
      miljo: true,
      drills: { select: { id: true, name: true, durationMinutes: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    practiceType: s.practiceType,
    pyramidArea: PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK",
    durationMin: Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000)),
    sted: s.miljo ? translateMiljo(s.miljo) : null,
    drills: s.drills,
    href: v2DbSessionHref(s.id, s.status),
  }));
}

// ── Composed dashboard data ───────────────────────────────────────

export type DashboardData = {
  user: { id: string; name: string; fornavn: string; initialer: string; avatarUrl: string | null; hcp: number | null; tier: "GRATIS" | "PRO" };
  greeting: string;
  weekNumber: number;
  today: TodaySession | null;
  todayAll: TodaySession[];
  week: WeekDay[];
  recentActivity: RecentActivityItem[];
  goals: GoalItem[];
  unreadCount: number;
  notifications: NotificationItem[];
  coachMessage: CoachMessageItem | null;
  stats: StatsSnapshot;
  kpiStats: KpiStats;
  nextTournament: NextTournament | null;
  weekProgress: WeekPlanProgress;
  trainingHeatmap: TrainingHeatmap;
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, avatarUrl: true, hcp: true, tier: true },
  });

  const [todayAll, week, recentActivity, goals, { count: unreadCount, notifications }, coachMessage, stats, kpiStats, nextTournament, weekProgress, trainingHeatmap] =
    await Promise.all([
      getAllTodaysSessions(userId),
      getWeekOverview(userId),
      getRecentActivity(userId, 5),
      getGoals(userId, 3),
      getUnreadNotifications(userId, 5),
      getLatestCoachMessage(userId),
      getStatsSnapshot(userId),
      getKpiStats(userId),
      getNextTournament(userId),
      getWeekPlanProgress(userId),
      getTrainingHeatmap(userId),
    ]);

  return {
    user: { id: user.id, name: user.name, fornavn: fornavn(user.name), initialer: initialer(user.name), avatarUrl: user.avatarUrl, hcp: user.hcp, tier: user.tier === "GRATIS" ? "GRATIS" : "PRO" },
    greeting: greeting(),
    weekNumber: ukenummer(new Date()),
    today: todayAll[0] ?? null,
    todayAll,
    week,
    recentActivity,
    goals,
    unreadCount,
    notifications,
    coachMessage,
    stats,
    kpiStats,
    nextTournament,
    weekProgress,
    trainingHeatmap,
  };
}
