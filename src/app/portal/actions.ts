/**
 * PlayerHQ Dashboard — server actions for /portal (Oversikt).
 *
 * Alle funksjoner tar userId eksplisitt, men verifiserer selv (forsvar-i-
 * dybden, sikkerhetsgjennomgang 2026-07-14) at kalleren enten ER den
 * brukeren eller er en coach/admin med bekreftet tilgang — se
 * assertCanViewPlayerData. Brukes av page.tsx og kan gjenbrukes av andre
 * RSC i portalen.
 */

"use server";

import "server-only";
import { ukenummer } from "@/lib/uke-helpers";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { weekPlanProgress } from "@/lib/portal/week-progress";
import { osloUkeGrenser } from "@/lib/jarvis/ukesreview";
import { OSLO_YMD_FMT, osloInstant } from "@/lib/jarvis/dagen";
import { tilDatoKolonne } from "@/lib/workbench/wb-map";
import { prisma } from "@/lib/prisma";
import { harVisbarSg } from "@/lib/ak-sg/visibility";
import type { PyramidArea, PracticeType, SessionStatusV2, OktAvbruddAarsak } from "@/generated/prisma/client";
import { assertCanViewPlayerData } from "@/lib/auth/assert-own-or-coached";
import { v2DbSessionHref } from "@/lib/portal/session-hrefs";
import {
  hentOptimalOktHint,
  type OptimalSessionHint,
} from "@/lib/portal/optimal-session";
import { nesteBesteHandling, finnDagensAktiveOkt } from "@/lib/portal/neste-beste-handling";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";

// ── Types ─────────────────────────────────────────────────────────

export type TodaySession = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: SessionStatusV2;
  avbruddAarsak?: OktAvbruddAarsak | null;
  planSessionId?: string | null;
  model?: "v2" | "wb" | "plan";
  practiceType: PracticeType;
  pyramidArea: PyramidArea;
  durationMin: number;
  /** Treningsmiljø (Sted) — null hvis ikke satt på økten. */
  sted: string | null;
  /** Hva økten skal oppnå — null hvis ikke satt av coach/spiller. */
  maalsetning: string | null;
  drills: { id: string; name: string; durationMinutes: number }[];
  href: string;
};

export type WeekDay = {
  date: Date;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  sessions: TodaySession[];
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

export type NesteHandlingData = {
  tekst: string;
  href: string;
  ikon: string;
};

export type StatsSnapshot = {
  sessionsToday: number;
  repsToday: number;
  timeThisWeekMin: number;
  roundsThisWeek: number;
};

// ── Helpers ───────────────────────────────────────────────────────

const UKEDAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function startOfDay(d: Date): Date {
  const [year, month, day] = OSLO_YMD_FMT.format(d).split("-").map(Number);
  return osloInstant(year, month, day, 0, 0);
}

function endOfDay(d: Date): Date {
  const date = tilDatoKolonne(OSLO_YMD_FMT.format(d));
  date.setUTCDate(date.getUTCDate() + 1);
  return osloInstant(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), 0, 0);
}

function startOfWeek(d: Date): Date {
  return osloUkeGrenser(d).start;
}

function fornavn(name: string): string {
  return name.trim().split(/\s+/)[0] || "spiller";
}

function greeting(naa: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", hourCycle: "h23" }).format(naa));
  if (hour < 5) return "God natt";
  if (hour < 11) return "God morgen";
  if (hour < 17) return "Hei";
  return "God kveld";
}

function initialer(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

// ── Today's session ───────────────────────────────────────────────

export async function getTodaysSession(userId: string, naa: Date = new Date()): Promise<TodaySession | null> {
  return (await getAllTodaysSessions(userId, naa))[0] ?? null;
}

// ── Week overview ─────────────────────────────────────────────────

export async function getWeekOverview(userId: string, naa: Date = new Date()): Promise<WeekDay[]> {
  await assertCanViewPlayerData(userId);
  const now = naa;
  const { start, slutt: end } = osloUkeGrenser(now);

  const sessions = await loadVisibleSessionRange(userId, start.toISOString(), end.toISOString());

  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const key = tilDatoKolonne(OSLO_YMD_FMT.format(start));
    key.setUTCDate(key.getUTCDate() + i);
    const d = osloInstant(key.getUTCFullYear(), key.getUTCMonth() + 1, key.getUTCDate(), 12, 0);
    return {
      date: d,
      dayLabel: UKEDAG_KORT[i],
      dayNumber: key.getUTCDate(),
      isToday: OSLO_YMD_FMT.format(d) === OSLO_YMD_FMT.format(now),
      sessions: [],
    };
  });

  for (const session of sessions) {
    const day = days.find(d => OSLO_YMD_FMT.format(d.date) === OSLO_YMD_FMT.format(session.startTime));
    if (day) day.sessions.push(session);
  }
  return days;
}

// ── Recent activity ───────────────────────────────────────────────

export async function getRecentActivity(userId: string, limit = 5): Promise<RecentActivityItem[]> {
  await assertCanViewPlayerData(userId);
  const [logs, workbench] = await Promise.all([
    prisma.drillLogV2.findMany({
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
    }),
    prisma.workbenchSession.findMany({
      where: {
        playerId: userId, status: "COMPLETED", hiddenByPlayer: false,
        needsPlayerApproval: false,
        OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }],
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);
  const counts = workbench.length === 0 ? [] : await prisma.sessionBallLog.groupBy({
    by: ["planSessionId"],
    where: { planSessionId: { in: workbench.map(session => session.id) } },
    _sum: { count: true },
  });
  const countBySession = new Map(counts.map(row => [row.planSessionId, row._sum.count ?? 0]));
  const activities: RecentActivityItem[] = [
    ...logs.map((log) => ({
      id: log.id,
      drillName: log.drill.name,
      sessionTitle: log.drill.session.title,
      loggedAt: log.loggedAt,
      repsTotal: log.repsTotal,
      successRate: log.successRate,
      href: v2DbSessionHref(log.drill.session.id, "COMPLETED"),
    })),
    ...workbench.map((session) => ({
      id: `wb-${session.id}`,
      drillName: "Gjennomført økt",
      sessionTitle: session.title,
      loggedAt: session.updatedAt,
      repsTotal: countBySession.get(session.id) ?? 0,
      successRate: null,
      href: `/portal/live/${session.id}/summary`,
    })),
  ].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()).slice(0, limit);

  if (activities.length > 0) return activities;

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

export async function getGoals(userId: string, limit = 3, naa: Date = new Date()): Promise<GoalItem[]> {
  await assertCanViewPlayerData(userId);
  const [goals, bruker] = await Promise.all([
    prisma.goal.findMany({
      where: { userId, status: { in: ["ACTIVE", "ACHIEVED"] } },
      orderBy: [{ status: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true, userId: true, type: true, title: true, category: true, status: true,
        targetValue: true, targetDate: true, createdAt: true, payload: true,
        linkedPyramidArea: true, linkedTestId: true,
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
  ]);
  const hcp = bruker?.hcp ?? null;

  const now = naa;
  return Promise.all(
    goals.map(async (g) => {
      const daysLeft = g.targetDate ? Math.ceil((g.targetDate.getTime() - now.getTime()) / 86_400_000) : null;
      // Oppnådd mål vises alltid som fullført, uansett hva nåværende tall skulle si.
      const progress = g.status === "ACHIEVED" ? 100 : (await beregnGoalProgress(g, { hcp })).pct;

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
    }),
  );
}

// ── Unread notifications ──────────────────────────────────────────

export async function getUnreadNotifications(
  userId: string,
  limit = 5,
): Promise<{ count: number; notifications: NotificationItem[] }> {
  await assertCanViewPlayerData(userId);
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
  await assertCanViewPlayerData(userId);
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

export async function getStatsSnapshot(userId: string, naa: Date = new Date()): Promise<StatsSnapshot> {
  await assertCanViewPlayerData(userId);
  const now = naa;
  const weekStart = startOfWeek(now);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [todaySessions, weekSessions, weekRounds, todayLogs] = await Promise.all([
    loadVisibleSessionRange(userId, todayStart.toISOString(), todayEnd.toISOString()),
    loadVisibleSessionRange(userId, weekStart.toISOString(), now.toISOString()),
    prisma.round.count({ where: { userId, playedAt: { gte: weekStart, lte: now } } }),
    prisma.drillLogV2.findMany({
      where: { loggedBy: userId, loggedAt: { gte: todayStart, lt: todayEnd } },
      select: { repsTotal: true },
    }),
  ]);
  const todayIds = todaySessions.map(session => session.id);
  const ballCounts = todayIds.length === 0 ? null : await prisma.sessionBallLog.aggregate({
    where: { planSessionId: { in: todayIds } },
    _sum: { count: true },
  });

  const timeThisWeekMin = weekSessions.reduce(
    (sum, session) => sum + session.durationMin,
    0,
  );
  const repsToday = todayLogs.reduce((sum, log) => sum + log.repsTotal, 0) + (ballCounts?._sum.count ?? 0);

  return {
    sessionsToday: todaySessions.length,
    repsToday,
    timeThisWeekMin,
    roundsThisWeek: weekRounds,
  };
}

// ── Next tournament ───────────────────────────────────────────────

export async function getNextTournament(userId: string, naa: Date = new Date()): Promise<NextTournament | null> {
  await assertCanViewPlayerData(userId);
  const now = startOfDay(naa);

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

export async function getWeekPlanProgress(userId: string, naa: Date = new Date()): Promise<WeekPlanProgress> {
  await assertCanViewPlayerData(userId);
  return weekPlanProgress(await getWeekOverview(userId, naa));
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

export async function getKpiStats(userId: string, naa: Date = new Date()): Promise<KpiStats> {
  await assertCanViewPlayerData(userId);
  const now = naa;
  const weekStart = startOfWeek(now);
  const since90 = new Date(now.getTime() - 90 * 86_400_000);

  const [rounds, weekSessions, roundsCount] = await Promise.all([
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      take: 10,
      select: { score: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true,
        sgSource: true, sgModelVersionId: true },
    }),
    loadVisibleSessionRange(userId, weekStart.toISOString(), now.toISOString()),
    prisma.round.count({ where: { userId, playedAt: { gte: since90 } } }),
  ]);

  const scoresWithValue = rounds.filter((r) => r.score > 0);
  const avgScore =
    scoresWithValue.length > 0
      ? Math.round((scoresWithValue.reduce((s, r) => s + r.score, 0) / scoresWithValue.length) * 10) / 10
      : null;

  const avg = (key: "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt"): number | null => {
    const vals = rounds.filter((r) => harVisbarSg(r) && r[key] != null)
      .map((r) => r[key] as number);
    return vals.length > 0
      ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
      : null;
  };

  const sgTrend = rounds
    .filter((r) => harVisbarSg(r) && r.sgTotal != null)
    .map((r) => r.sgTotal as number)
    .reverse(); // rounds er nyest→eldst; sparkline leses venstre (eldst) → høyre (nyest)

  return {
    avgScore,
    sgTotal: avg("sgTotal"),
    sessionsThisWeek: weekSessions.length,
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

export async function getTrainingHeatmap(userId: string, naa: Date = new Date()): Promise<TrainingHeatmap> {
  await assertCanViewPlayerData(userId);
  const now = naa;
  const weeksBack = 12;
  const currentWeekDate = tilDatoKolonne(OSLO_YMD_FMT.format(startOfWeek(now)));
  const rangeDate = new Date(currentWeekDate);
  rangeDate.setUTCDate(rangeDate.getUTCDate() - (weeksBack - 1) * 7);
  const rangeStart = osloInstant(rangeDate.getUTCFullYear(), rangeDate.getUTCMonth() + 1, rangeDate.getUTCDate(), 0, 0);
  const sessions = await loadVisibleSessionRange(userId, rangeStart.toISOString(), endOfDay(now).toISOString());

  const rows = ["M", "T", "O", "T", "F", "L", "S"];
  const weekStarts = Array.from({ length: weeksBack }, (_, week) => {
    const date = new Date(rangeDate);
    date.setUTCDate(date.getUTCDate() + week * 7);
    return date;
  });
  const cols = weekStarts.map(date => String(date.getUTCDate()));
  const counts: number[][] = Array.from({ length: 7 }, () => Array.from({ length: weeksBack }, () => 0));

  for (const session of sessions) {
    const date = tilDatoKolonne(OSLO_YMD_FMT.format(session.startTime));
    const dayIdx = (date.getUTCDay() + 6) % 7; // mandag = 0
    const weekIdx = Math.floor((date.getTime() - rangeDate.getTime()) / (7 * 86_400_000));
    if (weekIdx >= 0 && weekIdx < weeksBack) counts[dayIdx][weekIdx] += 1;
  }

  const values = counts.map((row) => row.map((n) => Math.max(0, Math.min(1, n / 2))));

  return { rows, cols, values, totalSessions: sessions.length };
}

// ── All today's sessions (for second-session compact row) ─────────

export async function getAllTodaysSessions(userId: string, naa: Date = new Date()): Promise<TodaySession[]> {
  // I dag and Plan share identities, publication filters and all three models.
  const dayKey = OSLO_YMD_FMT.format(naa);
  const week = await getWeekOverview(userId, naa);
  return week.find(day => OSLO_YMD_FMT.format(day.date) === dayKey)?.sessions ?? [];
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
  optimalSession: OptimalSessionHint | null;
  nesteHandling: NesteHandlingData;
};

export async function getDashboardData(userId: string, naa: Date = new Date()): Promise<DashboardData> {
  await assertCanViewPlayerData(userId);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, avatarUrl: true, hcp: true, tier: true },
  });

  const [todayAll, week, recentActivity, goals, { count: unreadCount, notifications }, coachMessage, stats, kpiStats, nextTournament, trainingHeatmap, optimalSession, harPlanTilGodkjenning] =
    await Promise.all([
      getAllTodaysSessions(userId, naa),
      getWeekOverview(userId, naa),
      getRecentActivity(userId, 5),
      getGoals(userId, 3, naa),
      getUnreadNotifications(userId, 5),
      getLatestCoachMessage(userId),
      getStatsSnapshot(userId, naa),
      getKpiStats(userId, naa),
      getNextTournament(userId, naa),
      getTrainingHeatmap(userId, naa),
      hentOptimalOktHint(userId),
      prisma.trainingPlan
        .findFirst({ where: { userId, status: "PENDING_PLAYER" }, select: { id: true } })
        .then((p) => p != null),
    ]);

  const dagensAktiveOkt = finnDagensAktiveOkt(todayAll);

  const nesteHandling = nesteBesteHandling({
    harPlanTilGodkjenning,
    dagensOkt: dagensAktiveOkt
      ? { href: dagensAktiveOkt.href, title: dagensAktiveOkt.title, status: dagensAktiveOkt.status }
      : null,
    ukenHarOkter: week.some((d) => d.sessions.length > 0),
  });

  return {
    user: { id: user.id, name: user.name, fornavn: fornavn(user.name), initialer: initialer(user.name), avatarUrl: user.avatarUrl, hcp: user.hcp, tier: user.tier === "GRATIS" ? "GRATIS" : "PRO" },
    greeting: greeting(naa),
    weekNumber: ukenummer(naa),
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
    weekProgress: weekPlanProgress(week),
    trainingHeatmap,
    optimalSession: todayAll.length === 0 ? optimalSession : null,
    nesteHandling,
  };
}
