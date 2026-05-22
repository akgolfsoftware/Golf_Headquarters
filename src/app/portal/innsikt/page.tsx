/**
 * Innsikt — /portal/innsikt
 *
 * Alle tabs utbygget: Mål, Statistikk, TrackMan, Resultater.
 *
 * Server-komponent med:
 * - requirePortalUser() for auth
 * - ?tab= fra searchParams (Next 16: searchParams er Promise)
 * - Prisma-data per aktiv tab
 * - Fallback til demo-data hvis tom DB
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { InnsiktShell } from "@/components/innsikt/innsikt-shell";
import { MalTab } from "@/components/innsikt/mal-tab";
import type { MalTabGoal } from "@/components/innsikt/mal-tab";
import { StatistikkTab } from "@/components/innsikt/statistikk-tab";
import type { StatistikkTabRunde } from "@/components/innsikt/statistikk-tab";
import { TrackManTab } from "@/components/innsikt/trackman-tab";
import type { TrackManTabSession } from "@/components/innsikt/trackman-tab";
import { ResultaterTab } from "@/components/innsikt/resultater-tab";
import type { ResultaterRunde, ResultaterTurnering } from "@/components/innsikt/resultater-tab";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function dagerTilFrist(dato: Date | null): number | null {
  if (!dato) return null;
  const naa = new Date();
  return Math.max(
    0,
    Math.round((dato.getTime() - naa.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

// ---------------------------------------------------------------------------
// Side (server-komponent)
// ---------------------------------------------------------------------------

export default async function InnsiktPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;
  const tab = (typeof params.tab === "string" ? params.tab : "mal") as string;

  // Hent mål fra DB bare om Mål-tab er aktiv
  let malTabInnhold: React.ReactNode;

  if (tab === "mal") {
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);

    const [aktiveGoals, arkiverteGoals] = await Promise.all([
      prisma.goal.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goal.findMany({
        where: {
          userId: user.id,
          status: { in: ["ACHIEVED", "ABANDONED"] },
          updatedAt: { gte: tretti },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    const oppnaaddSiste30d = await prisma.goal.count({
      where: {
        userId: user.id,
        status: "ACHIEVED",
        updatedAt: { gte: tretti },
      },
    });

    // Map Prisma Goal → MalTabGoal
    const goals: MalTabGoal[] = aktiveGoals.map((g, i) => {
      // Deterministisk pseudo-progress basert på id (inntil ekte fremdrift kobles på)
      const idHash = g.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const pct =
        g.targetValue != null && g.targetValue > 0
          ? 30 + (idHash % 40)
          : 50;
      return {
        id: g.id,
        title: g.title,
        category: g.category,
        progressPct: pct,
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        displayType: i % 3 === 0 ? "ring" : "bar",
      };
    });

    const arkivert =
      arkiverteGoals.length > 0
        ? arkiverteGoals.map((g) => ({
            id: g.id,
            title: g.title,
            oppnaaddDato: g.updatedAt.toLocaleDateString("nb-NO", {
              month: "short",
              year: "numeric",
            }),
            type: g.category === "OUTCOME" ? "Resultatmål" : "Prosessmål",
          }))
        : undefined;

    // Finn nest nærmeste frist blant aktive mål
    const frister = aktiveGoals
      .map((g) => dagerTilFrist(g.targetDate))
      .filter((d): d is number => d !== null)
      .sort((a, b) => a - b);

    malTabInnhold = (
      <MalTab
        goals={goals.length > 0 ? goals : undefined}
        kpi={{
          aktive: aktiveGoals.length,
          oppnaaddSiste30d,
          nesteMilepael: frister[0] ?? null,
        }}
        arkivert={arkivert}
      />
    );
  } else if (tab === "statistikk") {
    // Hent siste 20 runder for SG-trend
    const sgRunder = await prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 20,
      select: {
        id: true,
        playedAt: true,
        sgOtt: true,
        sgApp: true,
        sgArg: true,
        sgPutt: true,
        sgTotal: true,
      },
    });

    const statistikkRunder: StatistikkTabRunde[] = sgRunder.map((r) => ({
      id: r.id,
      playedAt: r.playedAt.toISOString(),
      sgOtt: r.sgOtt,
      sgApp: r.sgApp,
      sgArg: r.sgArg,
      sgPutt: r.sgPutt,
      sgTotal: r.sgTotal,
    }));

    malTabInnhold = <StatistikkTab runder={statistikkRunder.length > 0 ? statistikkRunder : undefined} />;

  } else if (tab === "trackman") {
    const tmSessions = await prisma.trackManSession.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      take: 5,
    });

    const sessions: TrackManTabSession[] = tmSessions.map((s) => ({
      id: s.id,
      recordedAt: s.recordedAt.toISOString(),
      shotCount: s.shotCount,
      environment: s.environment?.toString() ?? null,
    }));

    malTabInnhold = <TrackManTab sessions={sessions.length > 0 ? sessions : undefined} />;

  } else if (tab === "resultater") {
    const [dbRunder, dbTurneringer] = await Promise.all([
      prisma.round.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        take: 5,
        include: { course: { select: { name: true, par: true } } },
      }),
      prisma.tournamentResult.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { tournament: { select: { name: true, startDate: true } } },
      }),
    ]);

    const resultaterRunder: ResultaterRunde[] = dbRunder.map((r) => ({
      id: r.id,
      playedAt: r.playedAt.toISOString(),
      courseName: r.course.name,
      score: r.score,
      par: r.course.par,
      sgTotal: r.sgTotal,
    }));

    const resultaterTurneringer: ResultaterTurnering[] = dbTurneringer.map((t) => ({
      id: t.id,
      tournamentName: t.tournament.name,
      startDate: t.tournament.startDate.toISOString(),
      position: t.position,
      score: t.score,
    }));

    malTabInnhold = (
      <ResultaterTab
        runder={resultaterRunder.length > 0 ? resultaterRunder : undefined}
        turneringer={resultaterTurneringer.length > 0 ? resultaterTurneringer : undefined}
      />
    );

  } else {
    malTabInnhold = null;
  }

  return (
    <InnsiktShell>
      {malTabInnhold}
    </InnsiktShell>
  );
}
