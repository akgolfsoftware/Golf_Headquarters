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
import { ENVIRONMENT_LABELS } from "@/lib/sg-hub/environment-labels";
import { SgHub, type SgHubData, type SgGapToDrill } from "@/components/portal/sg-hub/sg-hub";
import { SgTrainingScatter } from "@/components/sg-hub/SgTrainingScatter";
import { computeScatterData } from "@/lib/sg-scatter/compute";
import { getDrillLibrary, type DrillCard } from "@/lib/portal-drills/drills-data";
import type { TrackManEnvironment } from "@/generated/prisma/client";

// ──────────────────────────────────────────────────────────────────────────────
// Hjelpere for siste TrackMan-økt
// ──────────────────────────────────────────────────────────────────────────────

/** Norsk visningsnavn for TrackMan-miljø via kanonisk tabell. */
function miljoeLabel(env: TrackManEnvironment | null | undefined): string {
  return env ? (ENVIRONMENT_LABELS[env] ?? env) : "Ukjent miljø";
}

/** Datoformat: "12. jun. 2026" */
function kortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

type SisteSession = {
  recordedAt: Date;
  shotCount: number;
  environment: TrackManEnvironment | null;
  source: string;
};

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

const SG_TIL_DRILL_AKSE: Record<"APP" | "OTT" | "ARG" | "PUTT", DrillCard["axis"]> = {
  APP: "slag",
  OTT: "slag",
  ARG: "spill",
  PUTT: "tek",
};

/** Oversetter ekte loader-output → v10 SgHubData. Tom-tilstander bevares. */
function mapSgHubData(args: {
  sg: ReturnType<typeof aggregateSg>;
  rundeAntall90d: number;
  sessionsCount: number;
  insightCount: number;
  clubsCount: number;
  sisteSession: SisteSession | null;
  alleDrills: DrillCard[];
}): SgHubData {
  const { sg, rundeAntall90d, sessionsCount, insightCount, clubsCount, sisteSession, alleDrills } = args;
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

  // Bygg body-innhold for "Sist TrackMan-økt"-kortet basert på ekte data.
  const trackmanBody = sisteSession ? (
    <>
      <strong className="font-semibold text-foreground">
        {kortDato(sisteSession.recordedAt)}
      </strong>{" "}
      · {sisteSession.shotCount} slag · {miljoeLabel(sisteSession.environment)}
      {sisteSession.source === "csv-import" ? " · CSV-import" : null}
    </>
  ) : (
    <>
      Ingen TrackMan-økter ennå.{" "}
      <Link href="/portal/mal/trackman" className="font-medium text-primary hover:opacity-80">
        Importer din første økt
      </Link>{" "}
      for å låse opp insights og per-kølle analyse.
    </>
  );

  // disiplinNote: tom når vi har ekte data, veiledende tekst kun ved 0 runder.
  const disiplinNote =
    sg.rundeAntall === 0
      ? "Ingen data ennå — logg runder for å aktivere"
      : sg.rundeAntall < 3
        ? `Bygd på ${sg.rundeAntall} runde${sg.rundeAntall === 1 ? "" : "r"} — mer data gir bedre presisjon`
        : "";

  // prioriteringer: veiledende tekst skalerer med antall runder.
  const prioriteringerBody =
    sg.rundeAntall === 0
      ? "Vi trenger runder for å rangere prioriteringer. Logg din første runde."
      : sg.rundeAntall < 3
        ? `Vi har ${sg.rundeAntall} runde${sg.rundeAntall === 1 ? "" : "r"} så langt — logg minst 3 for å låse opp topp-3-analysen.`
        : insightCount > 0
          ? `${insightCount} aktiv${insightCount === 1 ? "t" : "e"} innsikt${insightCount === 1 ? "" : "er"} er klar til gjennomgang.`
          : "Ingen aktive prioriteringer akkurat nå — fortsett å logge for løpende analyse.";

  // Beregn svakeste SG-kategori og finn matchende drills
  type SgKat = { slug: "APP" | "OTT" | "ARG" | "PUTT"; verdi: number | null; label: string };
  const sgKategorier: SgKat[] = [
    { slug: "APP", verdi: sg.app, label: "Innspill" },
    { slug: "OTT", verdi: sg.ott, label: "Fra tee" },
    { slug: "ARG", verdi: sg.arg, label: "Nærspill" },
    { slug: "PUTT", verdi: sg.putt, label: "Putting" },
  ];
  const negativeMedData = sgKategorier.filter((k) => k.verdi != null && k.verdi < 0);
  let gapToDrill: SgGapToDrill | null = null;
  if (negativeMedData.length > 0) {
    const svakest = negativeMedData.reduce((prev, curr) =>
      curr.verdi! < prev.verdi! ? curr : prev,
    );
    const akse = SG_TIL_DRILL_AKSE[svakest.slug];
    const matchende = alleDrills.filter((d) => d.axis === akse).slice(0, 4);
    if (matchende.length > 0) {
      gapToDrill = {
        kategori: svakest.slug,
        kategoriLabel: svakest.label,
        sgFormatert: formatSg(svakest.verdi),
        drills: matchende.map((d) => ({
          id: d.id,
          title: d.title,
          axisLabel: d.axisLabel,
          meta: d.meta,
        })),
      };
    }
  }

  return {
    eyebrow: "PLAYERHQ · /PORTAL/MAL/SG-HUB",
    subtittel:
      sg.rundeAntall === 0
        ? "Logg din første runde for å låse opp SG-pipelinen."
        : `Snitt siste ${sg.rundeAntall} runder · ${rundeAntall90d} totalt`,

    totalEyebrow: "SG TOTAL · 90 D",
    totalPill: `${sessionsCount} TrackMan-${sessionsCount === 1 ? "økt" : "økter"}`,
    totalBody: `SG-pipelinen viser hvor du tjener eller taper strokes mot benchmark. Bygd på ${rundeAntall90d} ${rundeOrd} siste 90 dager.`,
    totalValue: formatSg(sg.total),
    totalNegativ: sg.total != null && sg.total < 0,

    kpi: [
      { eyebrow: "TrackMan-økter", value: String(sessionsCount), footnote: "totalt" },
      { eyebrow: "Aktive innsikter", value: String(insightCount), footnote: "ikke kvittert" },
      {
        eyebrow: "Snitt-score",
        value: sg.snittScore == null ? "—" : sg.snittScore.toFixed(1).replace(".", ","),
        footnote: sg.rundeAntall === 0 ? "ingen runder ennå" : `${sg.rundeAntall} runder 90 d`,
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

    disiplinNote,
    disipliner,

    prioriteringer: {
      eyebrow: "TOPP 3 PRIORITERINGER FOR NESTE TURNERING",
      body: prioriteringerBody,
    },

    trackman: {
      eyebrow: "SIST TRACKMAN-ØKT",
      body: trackmanBody,
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
    gapToDrill,
  };
}

export default async function SgHubPage() {
  const user = await requirePortalUser();

  const naa = new Date();
  const ninetiDagSiden = new Date(naa.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [sessions, sisteSessionRad, runder, insightCount, alleDrills, trainingLogs, alleRunder] =
    await Promise.all([
      prisma.trackManSession.findMany({
        where: { userId: user.id },
        select: { rawJson: true },
      }),
      prisma.trackManSession.findFirst({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        select: {
          recordedAt: true,
          shotCount: true,
          environment: true,
          source: true,
        },
      }),
      prisma.round.findMany({
        where: { userId: user.id, playedAt: { gte: ninetiDagSiden } },
        orderBy: { playedAt: "desc" },
      }),
      prisma.sgInsight.count({
        where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
      }),
      getDrillLibrary(user.id),
      // For scatter: alle treningslogger
      prisma.trainingLog.findMany({
        where: { userId: user.id },
        select: { date: true, sgArea: true, minutes: true },
        orderBy: { date: "asc" },
      }),
      // For scatter: alle runder med SG-data
      prisma.round.findMany({
        where: { userId: user.id },
        select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
        orderBy: { playedAt: "asc" },
      }),
    ]);

  const sg = aggregateSg(runder);

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const club of extractClubs(s.rawJson)) {
      clubSet.add(club);
    }
  }

  const sisteSession: SisteSession | null = sisteSessionRad
    ? {
        recordedAt: sisteSessionRad.recordedAt,
        shotCount: sisteSessionRad.shotCount,
        environment: sisteSessionRad.environment ?? null,
        source: sisteSessionRad.source,
      }
    : null;

  const data = mapSgHubData({
    sg,
    rundeAntall90d: runder.length,
    sessionsCount: sessions.length,
    insightCount,
    clubsCount: clubSet.size,
    sisteSession,
    alleDrills,
  });

  const scatterData = computeScatterData(
    trainingLogs.map((l) => ({
      date: l.date,
      sgArea: l.sgArea as "OTT" | "APP" | "ARG" | "PUTT",
      minutes: l.minutes,
    })),
    alleRunder,
  );

  return (
    <div className="space-y-12">
      <SgHub data={data} />
      <SgTrainingScatter data={scatterData} />
    </div>
  );
}
