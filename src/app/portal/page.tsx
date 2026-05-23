/**
 * PRODUKSJON — PlayerHQ Oversikt (/portal)
 * Slank versjon 2026-05-22 (validerings-runde).
 *
 * Plan-IA:
 *   Hero + 4 KPI + Dagens fokus + Fortsett der du sluttet
 *   + 3 quick-actions (Be om økt / Logg runde / AI-foreslå uke)
 *   + Varsler-strip + Pyramide-footer
 *
 * Server-component med Live Prisma + demo-fallback (Q7).
 * Auth: requirePortalUser() med rolle-redirect.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { getDashboardData } from "@/lib/dashboard-data";
import { prosentPerArea } from "@/lib/pyramide";
import { prisma } from "@/lib/prisma";
import { OversiktSlim } from "@/components/portal-oversikt/oversikt-slim";
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

export default async function PortalOversikt() {
  const user = await requirePortalUser();

  // Rolle-basert redirect
  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await getDashboardData(user);

  // Pyramide-prosenter (siste 14 d)
  const pyrPct = prosentPerArea(data.pyramide14d);
  const pyramide: { area: PyramidArea; pct: number }[] = (
    ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as PyramidArea[]
  ).map((a) => ({ area: a, pct: Math.round(pyrPct[a] ?? 0) }));

  // Streak
  const streakDays = data.streak14.filter(Boolean).length;

  // Snittscore — siste 10 runder
  let scoreAvg: number | null = null;
  let scoreRoundCount = 0;
  try {
    const recentRounds = await prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 10,
      select: { score: true },
    });
    const scoresWithValue = recentRounds
      .map((r) => r.score)
      .filter((s): s is number => s !== null && s !== undefined);
    if (scoresWithValue.length > 0) {
      scoreAvg = Math.round(
        scoresWithValue.reduce((a, b) => a + b, 0) / scoresWithValue.length,
      );
      scoreRoundCount = scoresWithValue.length;
    }
  } catch {
    // demo-fallback
  }

  // Neste turnering — første kommende TournamentEntry
  let nextTournament: { name: string; daysAway: number } | null = null;
  try {
    const upcoming = await prisma.tournamentEntry.findFirst({
      where: {
        userId: user.id,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    if (upcoming) {
      const startDate = upcoming.tournament?.startDate ?? upcoming.manualDate;
      const name = upcoming.tournament?.name ?? upcoming.manualName ?? "Turnering";
      if (startDate) {
        const daysAway = Math.ceil(
          (startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (daysAway >= 0) {
          nextTournament = { name, daysAway };
        }
      }
    }
  } catch {
    // ingen fallback
  }

  // Ukens fokus (demo for nå — kan kobles til AI-anbefaling senere)
  const weekFocus = "Putt < 2,5m";

  // Dagens fokus — siste planlagte TrainingSessionV2 i dag
  let todaysFocus: {
    title: string;
    description: string;
    ctaHref: string;
  } | null = null;
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const todaySession = await prisma.trainingSessionV2.findFirst({
      where: {
        studentId: user.id,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: "asc" },
    });
    if (todaySession) {
      const durMin = Math.round(
        (todaySession.endTime.getTime() - todaySession.startTime.getTime()) / 60000,
      );
      todaysFocus = {
        title: todaySession.title,
        description: `${durMin} min · ${todaySession.practiceType}`,
        ctaHref: `/portal/tren/${todaySession.id}`,
      };
    }
  } catch {
    // demo-fallback
  }
  if (!todaysFocus) {
    todaysFocus = {
      title: "Putt-progresjon CS70 → CS80",
      description: "45 min · slag-tab · auto-generert fra teknisk plan",
      ctaHref: "/portal/gjennomfore?tab=idag",
    };
  }

  // Fortsett der du sluttet — siste IN_PROGRESS session
  let resumeSession: { label: string; href: string } | null = null;
  try {
    const last = await prisma.trainingSessionV2.findFirst({
      where: { studentId: user.id, status: "IN_PROGRESS" },
      orderBy: { startTime: "desc" },
    });
    if (last) {
      resumeSession = {
        label: `${last.title} — ikke fullført`,
        href: `/portal/tren/${last.id}`,
      };
    }
  } catch {
    // ingen fallback
  }

  // Varsler
  let unreadNotifications = 0;
  let recentNotifications: Array<{ id: string; title: string; timeAgo: string }> = [];
  try {
    const notif = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    unreadNotifications = notif.filter((n) => !n.readAt).length;
    recentNotifications = notif.slice(0, 3).map((n) => ({
      id: n.id,
      title: n.title,
      timeAgo: timeAgoLabel(n.createdAt),
    }));
  } catch {
    // demo
    recentNotifications = [
      { id: "demo-1", title: "Anders kommenterte teknisk plan", timeAgo: "2T SIDEN" },
      { id: "demo-2", title: "Ny drill-anbefaling: 2-fot putt", timeAgo: "I GÅR" },
      { id: "demo-3", title: "Sørlandsåpent påmeldingsfrist 25. mai", timeAgo: "2D SIDEN" },
    ];
  }

  const today = new Date();
  const weekNumber = getIsoWeek(today);
  const weekRange = formatWeekRange(today);

  return (
    <OversiktSlim
      playerName={user.name ?? "Spiller"}
      playerInitials={initials(user.name)}
      playerAvatarUrl={user.avatarUrl ?? null}
      hcpString={formatHcp(user.hcp ?? null)}
      club="GFGK"
      weekNumber={weekNumber}
      weekRange={weekRange}
      streakDays={streakDays}
      longestStreak={23}
      scoreAvg={scoreAvg}
      scoreRoundCount={scoreRoundCount}
      nextTournament={nextTournament}
      weekFocus={weekFocus}
      todaysFocus={todaysFocus}
      pyramide={pyramide}
      unreadNotifications={unreadNotifications}
      recentNotifications={recentNotifications}
      resumeSession={resumeSession}
    />
  );
}

function timeAgoLabel(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}M SIDEN`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}T SIDEN`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}D SIDEN`;
  return date.toLocaleDateString("nb-NO");
}
