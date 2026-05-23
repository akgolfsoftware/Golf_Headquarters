/**
 * PlayerHQ Workbench (/portal) — pixel-perfekt v2 (sesjon-1)
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 1, Variant A · stack-layout.
 *
 * Server Component med live Prisma-queries + demo-fallback.
 * Auth: requirePortalUser() med rolle-redirect.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { prisma } from "@/lib/prisma";
import { WorkbenchShell, type WorkbenchProps } from "@/components/portal-workbench/workbench-shell";

export const dynamic = "force-dynamic";

function formatHcp(hcp: number | null | undefined): string {
  if (hcp == null) return "—";
  if (hcp < 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}

function timeStr(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min siden`;
  if (s < 86400) return `${Math.floor(s / 3600)} t siden`;
  if (s < 604800) return `${Math.floor(s / 86400)} d siden`;
  return d.toLocaleDateString("nb-NO");
}

export default async function PortalWorkbench() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  // --- KPI: Snittscore siste 10 runder ---
  let snittScore: number | null = null;
  try {
    const recent = await prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 10,
      select: { score: true },
    });
    const scores = recent
      .map((r) => r.score)
      .filter((s): s is number => s != null);
    if (scores.length > 0) {
      snittScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  } catch {
    /* demo */
  }

  // --- Neste turnering ---
  let nextTournament: { name: string; daysAway: number } | null = null;
  try {
    const upcoming = await prisma.tournamentEntry.findFirst({
      where: {
        userId: user.id,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
    });
    if (upcoming) {
      const startDate = upcoming.tournament?.startDate ?? upcoming.manualDate;
      const name =
        upcoming.tournament?.name ?? upcoming.manualName ?? "Turnering";
      if (startDate) {
        const daysAway = Math.ceil(
          (startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (daysAway >= 0) nextTournament = { name, daysAway };
      }
    }
  } catch {
    /* */
  }

  // --- Tester progresjon ---
  let testerDone = 0;
  let testerTotal = 36;
  try {
    const [doneCount, totalCount] = await Promise.all([
      prisma.testResult.count({ where: { userId: user.id } }),
      prisma.testDefinition.count(),
    ]);
    testerDone = doneCount;
    if (totalCount > 0) testerTotal = totalCount;
  } catch {
    testerDone = 12;
  }

  // --- Dagens fokus: TrainingSessionV2 i dag ---
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  let todaysFocus: WorkbenchProps["todaysFocus"] = [];
  try {
    const sessions = await prisma.trainingSessionV2.findMany({
      where: {
        studentId: user.id,
        startTime: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { startTime: "asc" },
    });
    todaysFocus = sessions.map((s) => ({
      time: timeStr(s.startTime),
      title: s.title,
      durMin: Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60000),
      location: s.miljo ?? s.practiceType,
    }));
  } catch {
    /* */
  }
  if (todaysFocus.length === 0) {
    // Demo-fallback når ingen reelle økter ligger inne
    todaysFocus = [
      {
        time: "14:00",
        title: "Drill-økt putt-fokus",
        durMin: 20,
        location: "Mulligan Studio",
      },
      {
        time: "17:00",
        title: "Faktura-frist · sjekk Stripe",
        durMin: 10,
        location: "Admin",
      },
    ];
  }

  // --- Pyramide-uke (Man-Søn med drill-fordeling) ---
  // Bygger fra TrainingPlanSession denne uka — sample for nå.
  const weekStart = new Date(now);
  const dayIdx = (weekStart.getDay() + 6) % 7; // 0=mandag
  weekStart.setDate(weekStart.getDate() - dayIdx);
  weekStart.setHours(0, 0, 0, 0);

  const DAGER = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
  let pyramideWeek: WorkbenchProps["pyramideWeek"] = DAGER.map((d, i) => ({
    day: d,
    isToday: i === dayIdx,
    drills: [],
  }));

  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const sessions = await prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: user.id, isActive: true },
        scheduledAt: { gte: weekStart, lt: weekEnd },
      },
      select: { scheduledAt: true, pyramidArea: true },
    });
    const map: Record<number, Record<string, number>> = {};
    for (const s of sessions) {
      const di = (s.scheduledAt.getDay() + 6) % 7;
      if (!map[di]) map[di] = {};
      map[di][s.pyramidArea] = (map[di][s.pyramidArea] ?? 0) + 1;
    }
    pyramideWeek = DAGER.map((d, i) => ({
      day: d,
      isToday: i === dayIdx,
      drills: Object.entries(map[i] ?? {}).map(([area, count]) => ({
        area,
        count,
      })),
    }));
  } catch {
    /* fall back to empty — vises som tomme dager */
  }

  // Hvis uka er helt tom, gi sample-data (mer interessant for design-review)
  const totalDrills = pyramideWeek.reduce(
    (acc, d) => acc + d.drills.reduce((a, b) => a + b.count, 0),
    0,
  );
  if (totalDrills === 0) {
    pyramideWeek = pyramideWeek.map((d, i) => ({
      ...d,
      drills:
        i === 0
          ? [{ area: "TEK", count: 2 }, { area: "SLAG", count: 1 }]
          : i === 1
            ? [{ area: "FYS", count: 1 }]
            : i === 2
              ? [{ area: "TEK", count: 1 }, { area: "SPILL", count: 2 }]
              : i === 3
                ? [{ area: "SLAG", count: 3 }]
                : i === 4
                  ? [{ area: "TURN", count: 1 }]
                  : i === 5
                    ? []
                    : [{ area: "SPILL", count: 1 }],
    }));
  }

  // --- Coach-ping (siste ulest melding fra coach) ---
  let coachPing: WorkbenchProps["coachPing"] = null;
  try {
    const notif = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        readAt: null,
        type: { in: ["MESSAGE", "COACH_FEEDBACK"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (notif?.body) {
      coachPing = {
        coachName: "Anders",
        text: notif.body.slice(0, 80),
        href: notif.link ?? "/portal/varsler",
      };
    }
  } catch {
    /* */
  }

  // --- Aktiv plan ---
  let activePlan: WorkbenchProps["activePlan"] = null;
  try {
    const plan = await prisma.trainingPlan.findFirst({
      where: { userId: user.id, isActive: true },
      include: { sessions: { select: { id: true, status: true } } },
    });
    if (plan) {
      activePlan = {
        name: plan.name,
        total: plan.sessions.length,
        done: plan.sessions.filter((s) => s.status === "COMPLETED").length,
        href: `/portal/planlegge/${plan.id}`,
      };
    }
  } catch {
    /* */
  }

  // --- Neste milepæl (target HCP) ---
  let nextMilestone: WorkbenchProps["nextMilestone"] = null;
  try {
    const goal = await prisma.goal.findFirst({
      where: { userId: user.id, status: "ACTIVE", targetDate: { not: null } },
      orderBy: { targetDate: "asc" },
    });
    if (goal?.targetDate) {
      const daysLeft = Math.max(
        0,
        Math.ceil(
          (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      );
      nextMilestone = {
        title: goal.title,
        daysLeft,
        sparkline: [5.4, 5.2, 5.0, 4.9, 5.1, 4.8, 4.7, 4.8],
      };
    }
  } catch {
    /* */
  }
  if (!nextMilestone && user.hcp != null) {
    nextMilestone = {
      title: `HCP ${formatHcp(user.hcp - 1)} innen 14. juli`,
      daysLeft: 52,
      sparkline: [5.4, 5.2, 5.0, 4.9, 5.1, 4.8, 4.7, 4.8],
    };
  }

  // --- Aktivitet-feed ---
  let activityFeed: WorkbenchProps["activityFeed"] = [];
  try {
    const [recentRounds, recentTests, recentNotifs] = await Promise.all([
      prisma.round.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        take: 3,
        include: { course: { select: { name: true } } },
      }),
      prisma.testResult.findMany({
        where: { userId: user.id },
        orderBy: { takenAt: "desc" },
        take: 3,
        include: { test: { select: { name: true } } },
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);
    type Merged = WorkbenchProps["activityFeed"][number] & { ts: number };
    const merged: Merged[] = [
      ...recentRounds.map((r) => ({
        id: `r-${r.id}`,
        type: "runde" as const,
        title: `Runde · ${r.course.name} · ${r.score}`,
        timeAgo: timeAgo(r.playedAt),
        ts: r.playedAt.getTime(),
      })),
      ...recentTests.map((t) => ({
        id: `t-${t.id}`,
        type: "test" as const,
        title: `Test · ${t.test.name}`,
        timeAgo: timeAgo(t.takenAt),
        ts: t.takenAt.getTime(),
      })),
      ...recentNotifs.map((n) => ({
        id: `n-${n.id}`,
        type: "melding" as const,
        title: n.title,
        timeAgo: timeAgo(n.createdAt),
        ts: n.createdAt.getTime(),
      })),
    ];
    activityFeed = merged
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 5)
      .map(({ ts: _ts, ...rest }) => rest);
  } catch {
    /* */
  }
  if (activityFeed.length === 0) {
    activityFeed = [
      { id: "demo-1", type: "okt", title: "Putt-økt fullført", timeAgo: "2 t siden" },
      { id: "demo-2", type: "test", title: "PuttSync — 38/50", timeAgo: "i går" },
      { id: "demo-3", type: "runde", title: "Runde · GFGK · 74", timeAgo: "2 d siden" },
      { id: "demo-4", type: "melding", title: "Anders kommenterte plan", timeAgo: "3 d siden" },
    ];
  }

  return (
    <WorkbenchShell
      playerName={user.name}
      playerAvatarUrl={user.avatarUrl}
      hcpString={formatHcp(user.hcp)}
      tier={user.tier}
      weekFocus="Putt < 2,5m"
      snittScore={snittScore}
      snittScoreDelta={snittScore != null ? "+3,2 mnd" : null}
      nextTournament={nextTournament}
      testerDone={testerDone}
      testerTotal={testerTotal}
      hcpTrendDelta="↓ 0,4 i mai"
      todaysFocus={todaysFocus}
      pyramideWeek={pyramideWeek}
      coachPing={coachPing}
      activePlan={activePlan}
      nextMilestone={nextMilestone}
      activityFeed={activityFeed}
      weather={{ tempC: 14, cond: "Sol", outdoorToday: false }}
    />
  );
}
