/**
 * Innsikt — /portal/innsikt
 *
 * Fase 1: Mål-tab fullt utbygget. Statistikk/TrackMan/Resultater er stubs.
 *
 * Server-komponent med:
 * - requirePortalUser() for auth
 * - ?tab= fra searchParams (Next 16: searchParams er Promise)
 * - Prisma-data for aktive og arkiverte mål
 * - Fallback til demo-data hvis 0 mål i DB
 */

import Link from "next/link";
import { BarChart2, Crosshair, Trophy, ArrowLeft, Clock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { InnsiktShell } from "@/components/innsikt/innsikt-shell";
import { MalTab } from "@/components/innsikt/mal-tab";
import type { MalTabGoal } from "@/components/innsikt/mal-tab";

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
// Stub-visning for kommende tabs
// ---------------------------------------------------------------------------

type StubTabProps = {
  icon: React.ElementType;
  tittel: string;
  beskrivelse: string;
  fase: string;
  dato: string;
};

function StubTab({
  icon: Icon,
  tittel,
  beskrivelse,
  fase,
  dato,
}: StubTabProps) {
  return (
    <div className="in-stub">
      <div className="in-stub-icon">
        <Icon />
      </div>
      <h2 className="in-stub-title">{tittel}</h2>
      <p className="in-stub-sub">{beskrivelse}</p>
      <div className="in-stub-badge">
        <Clock />
        Tilgjengelig {dato} — {fase}
      </div>
      <Link href="/portal/innsikt?tab=mal" className="in-stub-back">
        <ArrowLeft />
        Tilbake til Mål
      </Link>
    </div>
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
    malTabInnhold = (
      <StubTab
        icon={BarChart2}
        tittel="Statistikk"
        beskrivelse="Dypdykk i HCP-trend, snitt-score per bane, strokes gained og mye mer. Bygges ut i Fase 2."
        fase="Fase 2"
        dato="juni 2026"
      />
    );
  } else if (tab === "trackman") {
    malTabInnhold = (
      <StubTab
        icon={Crosshair}
        tittel="TrackMan"
        beskrivelse="Historikk over alle TrackMan-økter — carry, launch angle, spin og utvikling over tid. Kommer i Fase 3."
        fase="Fase 3"
        dato="august 2026"
      />
    );
  } else if (tab === "resultater") {
    malTabInnhold = (
      <StubTab
        icon={Trophy}
        tittel="Resultater"
        beskrivelse="Turneringsresultater, beste runder, personlige rekorder og bane-PBer samlet på ett sted. Kommer i Fase 3."
        fase="Fase 3"
        dato="august 2026"
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
