/**
 * PlayerHQ Workbench v2 — sprint 1-leveranse.
 *
 * Bruker 8 nye komponenter fra src/components/portal/workbench/.
 * Lever side-om-side med eksisterende /portal som forhåndsvisning.
 *
 * Når godkjent: erstatter /portal/page.tsx (eller flagges som default).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHeroV2 } from "@/components/portal/workbench/player-hero-v2";
import { CalendarWidget } from "@/components/portal/workbench/calendar-widget";
import { AiInsightsRow } from "@/components/portal/workbench/ai-insights-row";
import { WeekProgressCard } from "@/components/portal/workbench/week-progress-card";
import {
  TrainingPartnersRow,
  type TrainingPartner,
} from "@/components/portal/workbench/training-partners-row";
import { NextTournamentCountdown } from "@/components/portal/workbench/next-tournament-countdown";
import { WellnessIndicators } from "@/components/portal/workbench/wellness-indicators";
import {
  QuickActions,
  DEFAULT_QUICK_ACTIONS,
} from "@/components/portal/workbench/quick-actions";
import { getWeekProgress } from "@/components/portal/workbench/get-week-progress";
import { getCaddieInsights } from "@/lib/ai/get-workbench-insights";

export const dynamic = "force-dynamic";

export default async function WorkbenchV2() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // --- Dagens økter (TrainingSessionV2) ---
  const dagensOkter = await prisma.trainingSessionV2
    .findMany({
      where: {
        studentId: user.id,
        startTime: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { startTime: "asc" },
      take: 10,
    })
    .catch(() => []);

  // PracticeType → pyramide-mapping (approksimasjon — bedre når plan-sesjoner brukes)
  const practiceToPyramid: Record<string, "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"> = {
    BLOKK: "TEK",
    RANDOM: "SLAG",
    KONKURRANSE: "TURN",
    SPILL_TEST: "SPILL",
  };

  const calendarSessions = dagensOkter.map((s) => ({
    id: s.id,
    title: s.title,
    startAt: s.startTime,
    endAt: s.endTime,
    pyramid: practiceToPyramid[s.practiceType] ?? "TEK",
    location: s.miljo ?? undefined,
    drills: [],
    tags: [],
  }));

  // --- HCP-trend (approks via score-trend siste 20 runder) ---
  const recentRounds = await prisma.round
    .findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 20,
      select: { score: true, playedAt: true },
    })
    .catch(() => []);

  let hcpTrend: number | undefined;
  if (recentRounds.length >= 5) {
    const half = Math.floor(recentRounds.length / 2);
    const eldreSnitt =
      recentRounds.slice(half).reduce((a, r) => a + r.score, 0) /
      (recentRounds.length - half);
    const nyereSnitt =
      recentRounds.slice(0, half).reduce((a, r) => a + r.score, 0) / half;
    // Lavere score = bedre. Positiv hcpTrend = forbedring.
    hcpTrend = (eldreSnitt - nyereSnitt) / 10;  // skaler ned til hcp-størrelse
  }

  // --- Neste turnering ---
  const upcoming = await prisma.tournamentEntry
    .findFirst({
      where: {
        userId: user.id,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => null);

  const nesteTurnering = upcoming?.tournament?.startDate
    ? {
        id: upcoming.tournamentId ?? "manual",
        navn:
          upcoming.tournament?.name ?? upcoming.manualName ?? "Turnering",
        startDato: upcoming.tournament.startDate,
        sluttDato: upcoming.tournament.endDate ?? upcoming.tournament.startDate,
        sted: upcoming.tournament.location ?? "Ukjent sted",
        format: upcoming.tournament.format ?? undefined,
      }
    : null;

  // --- Hero-data ---
  const userData = {
    name: user.name ?? "Spiller",
    tier: (user.tier ?? "GRATIS") as "GRATIS" | "PRO" | "ELITE",
    nivaa: undefined,  // TODO: bruk NGF-kategori når feltet finnes
    hcp: user.hcp ?? null,
    hcpTrend,
    avatarUrl: user.avatarUrl ?? undefined,
  };

  // --- Ukens progresjon ---
  const ukens = await getWeekProgress(user.id).catch(() => null);

  // --- AI-Innsikt (3 kort) ---
  const insights = await getCaddieInsights(user.id).catch(() => []);

  // --- Treningskompiser (mock inntil SessionParticipant-modellen finnes) ---
  const partners: TrainingPartner[] = [];

  // --- Wellness (skjelett — wearable ikke koblet ennå) ---
  const wellnessData = null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
      {/* Hero */}
      <PlayerHeroV2
        user={userData}
        neste_turnering={
          nesteTurnering
            ? { navn: nesteTurnering.navn, dato: nesteTurnering.startDato }
            : undefined
        }
      />

      {/* I dag — horisontal kalender */}
      <section>
        <header className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            I dag
          </span>
        </header>
        <CalendarWidget sessions={calendarSessions} currentTime={now} />
      </section>

      {/* AI-Innsikt */}
      {insights.length > 0 && (
        <section>
          <header className="mb-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              AI-innsikt
            </span>
          </header>
          <AiInsightsRow insights={insights} />
        </section>
      )}

      {/* Ukens progresjon */}
      {ukens && (
        <section>
          <WeekProgressCard
            fordeling={ukens.fordeling}
            anbefaling={ukens.anbefaling}
            ukens_stats={ukens.ukens_stats}
          />
        </section>
      )}

      {/* Snarveier */}
      <section>
        <header className="mb-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Snarveier
          </span>
        </header>
        <QuickActions actions={DEFAULT_QUICK_ACTIONS} />
      </section>

      {/* Treningskompiser */}
      {partners.length > 0 && (
        <section>
          <TrainingPartnersRow partners={partners} />
        </section>
      )}

      {/* 2-kol: Turnering + Wellness */}
      <section className="grid gap-4 md:grid-cols-2">
        {nesteTurnering && (
          <NextTournamentCountdown
            turnering={nesteTurnering}
            forberedelse={{
              planOppdatert: true,
              reiseBooket: false,
              baneRecon: false,
              mentalForberedelse: false,
            }}
          />
        )}
        <WellnessIndicators data={wellnessData} />
      </section>
    </div>
  );
}
