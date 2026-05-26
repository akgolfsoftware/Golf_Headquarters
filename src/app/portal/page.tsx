/**
 * PlayerHQ Workbench v2 — sprint 1-leveranse.
 *
 * Bruker 9 nye komponenter fra src/components/portal/workbench/.
 * Lever side-om-side med eksisterende /portal som forhåndsvisning.
 *
 * Athletic editorial: hero med AK Golf Academy-bilde, dark moment-cards,
 * editorial section headers med lime accent, og store display-tall.
 *
 * Når godkjent: erstatter /portal/page.tsx (eller flagges som default).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHeroImage } from "@/components/portal/workbench/player-hero-image";
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
import { FabButton } from "@/components/portal/workbench/fab-button";
import { SectionHeader } from "@/components/portal/workbench/section-header";
import { LiveBar } from "@/components/portal/workbench/live-bar";
import { CoachMessagePreview } from "@/components/portal/workbench/coach-message-preview";
import { EditorialDivider } from "@/components/portal/workbench/editorial-divider";
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

  // --- Neste økt fra calendarSessions (for LiveBar) ---
  const nextSession =
    calendarSessions.find((s) => s.startAt > now) ??
    (calendarSessions.length > 0 ? calendarSessions[0] : null);

  // --- Editorial divider sesong-stempel ---
  const dagINr = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86_400_000,
  );
  const ukeINr = Math.ceil(dagINr / 7);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
      {/* LIVE-BAR — tikkende klokke + neste økt + vær (mock) */}
      <LiveBar
        nextSession={
          nextSession
            ? { title: nextSession.title, startAt: nextSession.startAt }
            : null
        }
        weather={{ club: "GFGK", tempC: 14, summary: "Sol" }}
      />

      {/* HERO — AK Golf Academy-bilde med dark gradient */}
      <PlayerHeroImage
        user={userData}
        neste_turnering={
          nesteTurnering
            ? { navn: nesteTurnering.navn, dato: nesteTurnering.startDato }
            : undefined
        }
        imageId={1}
      />

      {/* SEKSJON: I DAG */}
      <section aria-labelledby="i-dag-heading">
        <SectionHeader
          eyebrow="Programmet i dag"
          title="I dag"
          description={
            calendarSessions.length > 0
              ? `${calendarSessions.length} økt${calendarSessions.length === 1 ? "" : "er"} planlagt — tidslinje fra 05:00 til 24:00.`
              : "Ingen økter planlagt. Bruk snarveiene under til å starte en økt eller booke en time."
          }
          cta={{ label: "Full kalender", href: "/portal/kalender" }}
        />
        <CalendarWidget sessions={calendarSessions} currentTime={now} />
      </section>

      {/* COACH MESSAGE PREVIEW — vises bare når brukeren har en coach */}
      <CoachMessagePreview
        coach={{ name: "Anders Kristiansen", initials: "AK" }}
        message="Bra jobba med putting i går. Hold rytmen på wedge-økten i dag — spin-kontroll viktigere enn distanse."
        time="06:38"
        href="/portal/coach/melding"
      />

      {/* SEKSJON: AI-INNSIKT */}
      {insights.length > 0 && (
        <section aria-labelledby="innsikt-heading">
          <SectionHeader
            eyebrow="Fra Caddie"
            title="AI-innsikt"
            description="Tre observasjoner basert på siste 30 dager. Klikk en handling for å sette i gang."
          />
          <AiInsightsRow insights={insights} />
        </section>
      )}

      {/* EDITORIAL DIVIDER — sesong-stempel */}
      <EditorialDivider
        image="/images/akademy/walking-bag.jpg"
        stamp={`Dag ${dagINr} · Uke ${ukeINr} av 52`}
        line={
          <>
            Sørlandsk vind. <span className="text-accent">14°C</span>. Sol fra
            vest fram til 17:00.
          </>
        }
      />


      {/* SEKSJON: UKAS PROGRESJON */}
      {ukens && (
        <section aria-labelledby="ukens-heading">
          <SectionHeader
            eyebrow="Status siste 7 dager"
            title="Ukas progresjon"
            description="Hvordan tida er fordelt mellom pyramide-aksene + summering av aktivitet."
            cta={{ label: "Se analyse", href: "/portal/analysere" }}
          />
          <WeekProgressCard
            fordeling={ukens.fordeling}
            anbefaling={ukens.anbefaling}
            ukens_stats={ukens.ukens_stats}
          />
        </section>
      )}

      {/* SEKSJON: SNARVEIER */}
      <section aria-labelledby="snarveier-heading">
        <SectionHeader
          eyebrow="Kom raskt i gang"
          title="Snarveier"
          description="Hyppigste handlinger ett klikk unna. Hovedhandling i mørk farge."
        />
        <QuickActions actions={DEFAULT_QUICK_ACTIONS} />
      </section>

      {/* SEKSJON: TRENINGSKOMPISER */}
      {partners.length > 0 && (
        <section aria-labelledby="kompiser-heading">
          <SectionHeader
            eyebrow="Sosial trening"
            title="Tren sammen"
            description="Spillere du har felles økter med denne uka."
          />
          <TrainingPartnersRow partners={partners} />
        </section>
      )}

      {/* SEKSJON: TURNERING + VELVÆRE — 2-kolonne */}
      <section aria-labelledby="moment-heading">
        <SectionHeader
          eyebrow="Hva som teller mest"
          title="Turnering + velvære"
          description="Nedtelling til neste konkurranse og daglig kropp-status fra wearable."
        />
        <div className="grid gap-6 md:grid-cols-2">
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
        </div>
      </section>

      {/* FAB — mobile-only floating action button */}
      <FabButton />
    </div>
  );
}
