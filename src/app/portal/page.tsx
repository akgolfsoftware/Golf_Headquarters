/**
 * /portal — PlayerHQ Dashboard
 *
 * Pixel-perfect implementering av workbench-v2/planlegge.html
 * (Athletic Editorial Living v3). Bruker ekte Prisma-data der mulig,
 * mock-fallback for områder uten datakilde ennå.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { prisma } from "@/lib/prisma";
import {
  PlanleggeV3,
  type ActivePlan,
  type AxisData,
  type DrillCategory,
  type Goal,
  type Tournament,
} from "@/components/portal-planlegge/planlegge-v3/planlegge-v3";

export const dynamic = "force-dynamic";

// --- Fallback-data for pre-BETA (ingen koblet data ennå) ---

const MOCK_PLAN: ActivePlan = {
  id: "pre-beta-plan",
  name: "Velkommen-plan",
  coach: "Anders Kristiansen",
  startDate: "Pågående",
  endDate: "—",
  currentWeek: 1,
  totalWeeks: 6,
  progress: 0,
  milestones: [
    {
      id: "m1",
      label: "FYS-fundament",
      weeks: "Uke 1 – 2",
      status: "active",
      summary: "Mobilitet + power-base",
      drills: 0,
    },
    {
      id: "m2",
      label: "TEK-konsolidering",
      weeks: "Uke 3 – 4",
      status: "planned",
      summary: "Sving-tempo + gate-drill",
      drills: 0,
    },
    {
      id: "m3",
      label: "SLAG-presisjon",
      weeks: "Uke 5",
      status: "planned",
      summary: "Wedge + spin-kontroll",
      drills: 0,
    },
    {
      id: "m4",
      label: "TURN-ramping",
      weeks: "Uke 6",
      status: "planned",
      summary: "Visualisering + rutine",
      drills: 0,
    },
  ],
};

const MOCK_AXES: AxisData[] = [
  {
    axis: "FYS",
    actualHours: 0,
    targetHours: 6,
    drills: 0,
    sessionsThisWeek: 0,
    lastSession: "ingen",
    note: "Ikke startet",
  },
  {
    axis: "TEK",
    actualHours: 0,
    targetHours: 8,
    drills: 0,
    sessionsThisWeek: 0,
    lastSession: "ingen",
    note: "Ikke startet",
  },
  {
    axis: "SLAG",
    actualHours: 0,
    targetHours: 6,
    drills: 0,
    sessionsThisWeek: 0,
    lastSession: "ingen",
    note: "Ikke startet",
  },
  {
    axis: "SPILL",
    actualHours: 0,
    targetHours: 6.5,
    drills: 0,
    sessionsThisWeek: 0,
    lastSession: "ingen",
    note: "Ikke startet",
  },
  {
    axis: "TURN",
    actualHours: 0,
    targetHours: 1.5,
    drills: 0,
    sessionsThisWeek: 0,
    lastSession: "ingen",
    note: "Ikke startet",
  },
];

const MOCK_DRILL_LIB: DrillCategory[] = [
  {
    id: "putting",
    label: "Putting",
    count: 0,
    axis: "SPILL",
    lastUsed: "aldri",
    icon: "target",
    featured: true,
  },
  {
    id: "wedge",
    label: "Wedge",
    count: 0,
    axis: "TEK",
    lastUsed: "aldri",
    icon: "flag",
  },
  {
    id: "driver",
    label: "Driver",
    count: 0,
    axis: "TEK",
    lastUsed: "aldri",
    icon: "zap",
  },
  {
    id: "approach",
    label: "Approach",
    count: 0,
    axis: "SLAG",
    lastUsed: "aldri",
    icon: "compass",
    featured: true,
  },
  {
    id: "bunker",
    label: "Bunker",
    count: 0,
    axis: "SLAG",
    lastUsed: "aldri",
    icon: "mapPin",
  },
  {
    id: "mental",
    label: "Mental",
    count: 0,
    axis: "TURN",
    lastUsed: "aldri",
    icon: "brain",
  },
];

function initials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatDateRange(start: Date, end: Date | null | undefined): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = start.toLocaleDateString("nb-NO", opts);
  if (!end) return startStr;
  const endStr = end.toLocaleDateString("nb-NO", opts);
  return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
}

export default async function DashboardPage() {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  // --- Ekte data: mål ---
  const goalRows = await prisma.goal
    .findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
    })
    .catch(() => []);

  const goals: Goal[] = goalRows.map((g, i) => ({
    id: g.id,
    title: g.title,
    deadline: g.targetDate
      ? g.targetDate.toLocaleDateString("nb-NO", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Ingen frist",
    current: 0,
    target: typeof g.targetValue === "number" ? g.targetValue : 0,
    progress: 0,
    unit: "stroke" as const,
    trend: "flat" as const,
    metric: g.type ?? "Mål",
    priority: i === 0,
  }));

  // --- Ekte data: turneringer ---
  const tournamentRows = await prisma.tournamentEntry
    .findMany({
      where: {
        userId: user.id,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      include: { tournament: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    })
    .catch(
      () =>
        [] as Awaited<
          ReturnType<
            typeof prisma.tournamentEntry.findMany<{
              include: { tournament: true };
            }>
          >
        >,
    );

  const tournaments: Tournament[] = tournamentRows
    .filter((e) => e.tournament?.startDate || e.manualDate)
    .map((e, i) => {
      const startDate = e.tournament?.startDate ?? e.manualDate!;
      const endDate = e.tournament?.endDate ?? e.manualDate;
      return {
        id: e.id,
        name: e.tournament?.name ?? e.manualName ?? "Turnering",
        dateRange: formatDateRange(startDate, endDate),
        location: e.tournament?.location ?? "Ukjent sted",
        status:
          e.entryStatus === "CONFIRMED" ? "REGISTRERT" : ("PLANLAGT" as const),
        daysUntil: daysUntil(startDate),
        format: e.tournament?.format ?? "—",
        priority: i === 0,
      };
    });

  return (
    <PlanleggeV3
      user={{ initials: initials(user.name), name: user.name ?? "Spiller" }}
      activePlan={MOCK_PLAN}
      axes={MOCK_AXES}
      drillLib={MOCK_DRILL_LIB}
      goals={goals}
      tournaments={tournaments}
    />
  );
}
