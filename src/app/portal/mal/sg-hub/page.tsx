/**
 * PlayerHQ · Mål · SG-Hub (/portal/mal/sg-hub) — v10-design.
 *
 * Rendrer <SgHub> (v10-fasit fra pl-sghub) med EKTE data via Prisma
 * (TrackMan-økter, runder siste 90 d, SG-aggregat, aktive innsikter, kølle-sett).
 * mapSgHubData oversetter loader-output → SgHubData. Tom-tilstander bevares
 * (null → "—", tomme lister → tom-tilstandskort) — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. Skall (sidebar/bunn-nav)
 * leveres av layout — denne siden rendrer kun innholdet.
 */
import Link from "next/link";
import {
  Activity,
  BarChart2,
  Box,
  Crosshair,
  MapPin,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { extractClubs } from "@/lib/sg-hub/extract-shots";
import { SgHub, type SgHubData } from "@/components/portal/sg-hub/sg-hub";

type DisiplinDef = {
  eyebrow: string;
  slug: "ott" | "app" | "arg" | "putt";
  href: string;
};

const DISIPLINER: DisiplinDef[] = [
  { eyebrow: "SG · OFF-THE-TEE", slug: "ott", href: "/portal/statistikk/sg-tee" },
  { eyebrow: "SG · APPROACH", slug: "app", href: "/portal/statistikk/sg-approach" },
  { eyebrow: "SG · AROUND-GREEN", slug: "arg", href: "/portal/statistikk/sg-around-green" },
  { eyebrow: "SG · PUTTING", slug: "putt", href: "/portal/statistikk/sg-putting" },
];

type VerktoyDef = {
  ikon: LucideIcon;
  tittel: string;
  badge: string;
  live?: boolean;
  href: string;
};

const VERKTOY: VerktoyDef[] = [
  { ikon: Activity, tittel: "Benchmark vs Tour", badge: "LIVE", live: true, href: "/portal/mal/sg-hub/benchmark" },
  { ikon: BarChart2, tittel: "Stock Yardage Chart", badge: "FASE 3", href: "/portal/mal/sg-hub/yardage" },
  { ikon: Wind, tittel: "Værjustert distanse", badge: "FASE 3", href: "/portal/mal/sg-hub/conditions" },
  { ikon: MapPin, tittel: "Same-Distance strategi", badge: "FASE 3", href: "/portal/mal/sg-hub/strategy" },
  { ikon: Crosshair, tittel: "Best vs Today", badge: "FASE 4", href: "/portal/mal/sg-hub/best-vs-now" },
  { ikon: Box, tittel: "Equipment Fit", badge: "FASE 5", href: "/portal/mal/sg-hub/equipment" },
];

/** Oversetter ekte loader-output → v10 SgHubData. Tom-tilstander bevares. */
function mapSgHubData(args: {
  sg: ReturnType<typeof aggregateSg>;
  rundeAntall90d: number;
  sessionsCount: number;
  insightCount: number;
  clubsCount: number;
}): SgHubData {
  const { sg, rundeAntall90d, sessionsCount, insightCount, clubsCount } = args;
  const rundeOrd = rundeAntall90d === 1 ? "runde" : "runder";

  const disipliner = DISIPLINER.map((d) => {
    const verdi = sg[d.slug];
    return {
      eyebrow: d.eyebrow,
      value: formatSg(verdi),
      negativ: verdi != null && verdi < 0,
      status: verdi == null ? "Ingen data" : "vs PGA Tour",
      href: d.href,
    };
  });

  const importTom = (
    <>
      Ingen TrackMan-økter ennå.{" "}
      <Link href="/portal/mal/trackman" className="font-medium text-primary hover:opacity-80">
        Importer din første økt
      </Link>{" "}
      for å låse opp insights og per-kølle analyse.
    </>
  );

  return {
    eyebrow: "PLAYERHQ · /PORTAL/MAL/SG-HUB",
    subtittel:
      sg.rundeAntall === 0
        ? "Logg din første runde for å låse opp SG-pipelinen."
        : `Snitt siste ${sg.rundeAntall} runder · ${rundeAntall90d} totalt`,

    totalEyebrow: "SG TOTAL · 90 D",
    totalPill: `${sessionsCount} TrackMan-økter`,
    totalBody: `SG-pipelinen viser hvor du tjener eller taper strokes mot benchmark. Bygd på ${rundeAntall90d} ${rundeOrd} siste 90 dager.`,
    totalValue: formatSg(sg.total),
    totalNegativ: sg.total != null && sg.total < 0,

    kpi: [
      { eyebrow: "TrackMan-økter", value: String(sessionsCount), footnote: "totalt" },
      { eyebrow: "Aktive innsikter", value: String(insightCount), footnote: "ikke kvittert" },
      {
        eyebrow: "Snitt-score",
        value: sg.snittScore == null ? "—" : sg.snittScore.toFixed(1).replace(".", ","),
        footnote: `${sg.rundeAntall} runder 90 d`,
      },
      { eyebrow: "Benchmark", value: "PGA Tour", footnote: "kategori A1" },
    ],

    cta: {
      tittel: "Hvordan bygges SG-pipelinen?",
      body: (
        <>
          Vi beregner strokes gained per disiplin og per kølle så snart du logger
          runder med{" "}
          <strong className="font-semibold text-foreground">slag-for-slag-data</strong>.
        </>
      ),
      knapp: { label: "Logg runde", href: "/portal/mal/runder" },
    },

    disiplinNote: sg.rundeAntall === 0 ? "dummy-tall vises til du har 3+ runder" : "",
    disipliner,

    prioriteringer: {
      eyebrow: "TOPP 3 PRIORITERINGER FOR NESTE TURNERING",
      body: "Vi trenger flere runder for å rangere prioriteringer. Logg minst 3 runder.",
    },

    trackman: {
      eyebrow: "SIST TRACKMAN-ØKT",
      body: importTom,
    },

    perKolleTom:
      clubsCount === 0 ? (
        <>
          Ingen TrackMan-data ennå.{" "}
          <Link href="/portal/mal/trackman" className="font-medium text-primary hover:opacity-80">
            Importer din første økt
          </Link>{" "}
          for å aktivere per-kølle analyse.
        </>
      ) : (
        <>
          {clubsCount} køller logget.{" "}
          <Link href="/portal/mal/trackman" className="font-medium text-primary hover:opacity-80">
            Åpne TrackMan-hub
          </Link>{" "}
          for per-kølle analyse.
        </>
      ),

    verktoy: VERKTOY,
  };
}

export default async function SgHubPage() {
  const user = await requirePortalUser();

  const naa = new Date();
  const ninetiDagSiden = new Date(naa.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [sessions, runder, insightCount] = await Promise.all([
    prisma.trackManSession.findMany({
      where: { userId: user.id },
      select: { rawJson: true },
    }),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: ninetiDagSiden } },
      orderBy: { playedAt: "desc" },
    }),
    prisma.sgInsight.count({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
    }),
  ]);

  const sg = aggregateSg(runder);

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const club of extractClubs(s.rawJson)) {
      clubSet.add(club);
    }
  }

  const data = mapSgHubData({
    sg,
    rundeAntall90d: runder.length,
    sessionsCount: sessions.length,
    insightCount,
    clubsCount: clubSet.size,
  });

  return <SgHub data={data} />;
}
