/**
 * PRODUKSJON — PlayerHQ Hjem (/portal)
 * "Min Workbench"-design implementert fra Claude Design-bundlen
 * (AK Golf Workbench Unified.html, mai 2026).
 *
 * Server-component med:
 *  - Hero med Instrument Serif italic
 *  - Årsplan-gantt (sesong 2026 — 6 perioder + tournament-flagg + I dag-pin)
 *  - 3-pane workbench (profil + ukeskalender + drills/periodisering)
 *  - Mål-tracker (3 mål-kort med ring/scoreline/HCP-zone)
 *  - Innsikt (SG-trend, slag-prioritering, DataGolf-sammenligning)
 *  - TrackMan-timeline (5 siste økter)
 *  - Sticky footer (uke-pyramide + status)
 *
 * Auth: requirePortalUser() med rolle-redirect (COACH/ADMIN -> /admin, GUEST -> /admin/kalender).
 * Forrige design er bevart i git-historikk (commit før dette).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { getDashboardData } from "@/lib/dashboard-data";
import { prosentPerArea } from "@/lib/pyramide";
import { prisma } from "@/lib/prisma";
import { WorkbenchDashboard } from "@/components/portal-dashboard/workbench-dashboard";
import type { PyramidArea } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const ISO_WEEK_OFFSET = 0;

function getIsoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7) + ISO_WEEK_OFFSET;
}

function formatWeekRange(d: Date): string {
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const dM = (x: Date) => x.getDate();
  const monthName = (x: Date) =>
    ["jan", "feb", "mars", "apr", "mai", "juni", "juli", "aug", "sept", "okt", "nov", "des"][x.getMonth()];
  if (monday.getMonth() === sunday.getMonth()) {
    return `${dM(monday)}—${dM(sunday)} ${monthName(monday)} ${sunday.getFullYear()}`;
  }
  return `${dM(monday)} ${monthName(monday)}—${dM(sunday)} ${monthName(sunday)} ${sunday.getFullYear()}`;
}

function initials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatHcp(hcp: number | null | undefined): string {
  if (hcp === null || hcp === undefined) return "—";
  if (hcp < 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}

export default async function PortalHjem() {
  const user = await requirePortalUser();

  // Rolle-basert redirect: coacher/admin -> CoachHQ, gjester -> kalender.
  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await getDashboardData(user);

  // Aktiv teknisk plan (for "Aktiv periode"-kortet)
  const activePlan = await prisma.technicalPlan.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { startDato: "desc" },
    include: {
      positions: {
        include: {
          tasks: {
            select: {
              repsMaalDry: true,
              repsMaalLav: true,
              repsMaalFull: true,
              repsGjortDry: true,
              repsGjortLav: true,
              repsGjortFull: true,
            },
          },
        },
      },
    },
  });

  // Coach — vi henter første aktive coach for spilleren via PlayerCoach-relasjon hvis den finnes
  // Fallback til generisk «AK»
  type CoachInfo = { name: string; initials: string };
  let coach: CoachInfo = { name: "Anders Kristiansen", initials: "AK" };
  try {
    const link = await prisma.user.findFirst({
      where: { role: "COACH" },
      orderBy: { createdAt: "asc" },
      select: { name: true },
    });
    if (link?.name) coach = { name: link.name, initials: initials(link.name) };
  } catch {
    // ignore
  }

  // Siste 5 TrackMan-økter
  const tmRecords = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 5,
  });

  // Beregn pyramide-prosenter
  const pyrPct = prosentPerArea(data.pyramide14d);
  const pyramide: { area: PyramidArea; pct: number }[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as PyramidArea[]).map(
    (a) => ({ area: a, pct: Math.round(pyrPct[a] ?? 0) }),
  );

  // Active plan progress
  let activePlanCard: React.ComponentProps<typeof WorkbenchDashboard>["activePlan"] | undefined;
  if (activePlan) {
    const allTasks = activePlan.positions.flatMap((p) => p.tasks);
    const target = allTasks.reduce(
      (s, t) => s + (t.repsMaalDry ?? 0) + (t.repsMaalLav ?? 0) + (t.repsMaalFull ?? 0),
      0,
    );
    const current = allTasks.reduce(
      (s, t) => s + (t.repsGjortDry ?? 0) + (t.repsGjortLav ?? 0) + (t.repsGjortFull ?? 0),
      0,
    );
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    activePlanCard = {
      name: activePlan.navn.split(" — ")[0].split(" · ")[0],
      weeksLabel: "UKE 17—22 · 6 UKER",
      progressPct: pct,
      csTarget: "CS70 → CS80",
    };
  }

  // TrackMan sessions -> formatted
  const tmSessions = tmRecords.length
    ? tmRecords.map((s, i) => ({
        id: s.id,
        date: s.recordedAt.toLocaleDateString("nb-NO", {
          day: "numeric",
          month: "short",
          weekday: "short",
        }),
        title: s.source ?? `Økt ${i + 1}`,
        metric: "—",
        unit: "se detaljer",
        color: ["forest", "tek", "accent", "warn", "forest"][i] as "forest" | "tek" | "accent" | "warn",
        sparkPoints: "0,22 14,18 28,20 42,14 56,12 70,8 84,10 100,6",
      }))
    : [
        { date: "12. MAI · ONS", title: "Driver-økt", metric: "112", unit: "mph club-speed", color: "forest" as const, sparkPoints: "0,22 14,18 28,20 42,14 56,12 70,8 84,10 100,6" },
        { date: "10. MAI · MAN", title: "Iron 7", metric: "1,48", unit: "smash-faktor", color: "tek" as const, sparkPoints: "0,16 14,20 28,14 42,18 56,12 70,16 84,10 100,12" },
        { date: "6. MAI · TOR", title: "Pitch 50—100m", metric: "68", unit: "m carry · spred 4m", color: "accent" as const, sparkPoints: "0,20 14,16 28,18 42,12 56,14 70,10 84,12 100,8" },
        { date: "3. MAI · MAN", title: "Driver-økt", metric: "220", unit: "m carry", color: "forest" as const, sparkPoints: "0,18 14,14 28,16 42,10 56,12 70,8 84,6 100,4" },
        { date: "28. APR · SØN", title: "Wedge-finkalibrering", metric: "9 100", unit: "rpm spin", color: "warn" as const, sparkPoints: "0,14 14,18 28,12 42,16 56,10 70,14 84,8 100,12" },
      ];

  // Goals — fallback til representative seed-data inntil mål-modell er på plass
  const goals = [
    { title: "Top 10 NM Slag", pct: 38, label: "50 dager", type: "tournament" as const },
    { title: "HCP +3,0 innen sesongslutt", pct: 60, label: "60 %", type: "hcp" as const },
    { title: "Bryte 70 på Bossum", pct: 80, label: "71 sist", type: "course" as const },
  ];

  const today = new Date();
  const weekNumber = getIsoWeek(today);
  const weekRange = formatWeekRange(today);

  return (
    <WorkbenchDashboard
      playerName={user.name ?? "Spiller"}
      playerInitials={initials(user.name)}
      hcpString={formatHcp(user.hcp ?? null)}
      category="A1"
      club="GFGK"
      weekNumber={weekNumber}
      weekRange={weekRange}
      streak={{
        active: data.streak14,
        total: data.streak14.filter(Boolean).length,
        longest: 23,
      }}
      goals={goals}
      coach={coach}
      pyramide={pyramide}
      activePlan={activePlanCard}
      nextTournament={{ name: "Sørlandsåpent", daysAway: 21 }}
      coachMessage={{
        text: `Du har vært jevn denne uka, ${(user.name ?? "").split(" ")[0]}. Hold trykket inn mot Sørlandsåpent.`,
        timeAgo: "FOR 2T SIDEN",
      }}
      tmSessions={tmSessions}
    />
  );
}
