/**
 * PlayerHQ Statistikk (/portal/statistikk) — hybrid design (2026-06-17)
 *
 * Portert fra: public/design-handover/prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Statistikk-hub (hybrid).dc.html
 *
 * Rendrer <StatistikkHub> med ekte data fra Prisma:
 *   - KPI-strip: Snittscore, SG Total, Putts/runde, GIR %
 *     (putts og GIR aggregeres fra HoleScore-tabellen)
 *   - TrendBand: siste 10 runder-scores (proxy for HCP-utvikling)
 *   - Hub-shortcuts: 6 linker til undersider
 *
 * Tom-tilstand: null-verdier vises som "–" i KPI-strip.
 * Ingen dummy-tall, aldri.
 *
 * Server component. Auth-guard via requirePortalUser.
 * Skall (sidebar/bunn-nav) eies av portal-layoutet.
 */

import {
  BarChart2,
  CalendarDays,
  FlaskConical,
  MapPin,
  Shield,
  Target,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  StatistikkHub,
  type KpiTile,
  type NivaaDiagnose,
  type StatistikkHybridData,
} from "@/components/portal/statistikk/statistikk-hybrid";
import { aggregateSg } from "@/lib/sg";
import {
  kategoriFraSnittscore,
  nesteKategori,
  prosentTilNesteNiva,
} from "@/lib/domain/ak-kategori";

export const dynamic = "force-dynamic";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtNb(n: number, decimals = 1): string {
  return n.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtHcp(hcp: number | null): string {
  if (hcp === null) return "–";
  return fmtNb(hcp, 1);
}

// ── Data → KpiTile[] ──────────────────────────────────────────────────────────

type RundeRaw = {
  score: number;
  playedAt: Date;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  holeScores: { putts: number | null; gir: boolean | null }[];
};

// ── A–K nivå-diagnose (inneværende sesong) ──────────────────────────────────────
// Snittscore-kilde = snitt brutto score for runder spilt inneværende kalenderår
// (Anders 2026-06-22 — sesong-basert). null hvis ingen runder i år.

const SG_OMRADER = [
  { key: "sgOtt", navn: "Utslag" },
  { key: "sgApp", navn: "Innspill" },
  { key: "sgArg", navn: "Nærspill" },
  { key: "sgPutt", navn: "Putting" },
] as const;

function snitt(tall: number[]): number | null {
  return tall.length > 0 ? tall.reduce((s, v) => s + v, 0) / tall.length : null;
}

function buildNivaaDiagnose(runder: RundeRaw[], aar: number): NivaaDiagnose | null {
  const sesong = runder.filter((r) => r.playedAt.getFullYear() === aar);
  const snittscore = snitt(sesong.map((r) => r.score));
  if (snittscore == null) return null; // ingen runder i år → ærlig tom-tilstand

  const band = kategoriFraSnittscore(snittscore);
  const neste = nesteKategori(band.kategori);

  // SG-gap: snitt per område over ALLE runder med SG (mer robust), svakest først.
  const gaps: { omrade: string; sgVerdi: number }[] = SG_OMRADER.map(({ key, navn }) => ({
    omrade: navn as string,
    sgVerdi: snitt(runder.map((r) => r[key]).filter((v): v is number => v != null)),
  }))
    .filter((g) => g.sgVerdi !== null)
    .map((g) => ({ omrade: g.omrade, sgVerdi: g.sgVerdi as number }))
    .sort((a, b) => a.sgVerdi - b.sgVerdi) // mest negativ (svakest) først
    .slice(0, 3);

  return {
    kategori: band.kategori,
    niva: band.niva,
    snittscore: Math.round(snittscore * 10) / 10,
    prosentTilNeste: prosentTilNesteNiva(snittscore),
    nesteKategori: neste?.kategori ?? null,
    nesteNiva: neste?.niva ?? null,
    sgGaps: gaps,
  };
}

function buildKpis(runder: RundeRaw[]): KpiTile[] {
  const n = runder.length;

  // Snittscore
  const snittScore = n > 0 ? runder.reduce((s, r) => s + r.score, 0) / n : null;
  const prevScoreHalf = runder.slice(0, Math.max(1, Math.floor(n / 2)));
  const prevSnitt =
    prevScoreHalf.length > 0
      ? prevScoreHalf.reduce((s, r) => s + r.score, 0) / prevScoreHalf.length
      : null;
  const scoreDelta = snittScore !== null && prevSnitt !== null ? snittScore - prevSnitt : null;

  // SG Total
  const agg = aggregateSg(runder);
  const sgTotal = agg.total;
  // Crude half/half delta for SG
  const aggPrev = aggregateSg(runder.slice(0, Math.max(1, Math.floor(n / 2))));
  const sgDelta =
    sgTotal !== null && aggPrev.total !== null ? sgTotal - aggPrev.total : null;

  // Putts/runde (fra HoleScore)
  const rundsWithPutts = runder.filter((r) =>
    r.holeScores.some((h) => h.putts !== null),
  );
  const avgPutts =
    rundsWithPutts.length > 0
      ? rundsWithPutts.reduce(
          (s, r) =>
            s +
            r.holeScores.reduce((hs, h) => hs + (h.putts ?? 0), 0),
          0,
        ) / rundsWithPutts.length
      : null;

  // GIR % (fra HoleScore)
  const rundsWithGir = runder.filter((r) =>
    r.holeScores.some((h) => h.gir !== null),
  );
  const avgGir =
    rundsWithGir.length > 0
      ? (rundsWithGir.reduce(
          (s, r) => s + r.holeScores.filter((h) => h.gir === true).length,
          0,
        ) /
          rundsWithGir.reduce((s, r) => s + r.holeScores.length, 0)) *
        100
      : null;

  const kpis: KpiTile[] = [
    {
      label: "Snittscore",
      val: snittScore !== null ? fmtNb(snittScore, 1) : "–",
      delta:
        scoreDelta !== null
          ? (scoreDelta > 0 ? "+" : "") + fmtNb(scoreDelta, 1)
          : "ingen sammenligning",
      // Lower score = better in golf — negative delta is positive
      positive: scoreDelta !== null ? scoreDelta < 0 : true,
    },
    {
      label: "SG Total",
      val: sgTotal !== null ? (sgTotal >= 0 ? "+" : "") + fmtNb(sgTotal) : "–",
      delta:
        sgDelta !== null
          ? (sgDelta >= 0 ? "+" : "") + fmtNb(sgDelta)
          : "ingen sammenligning",
      positive: sgDelta !== null ? sgDelta >= 0 : true,
    },
    {
      label: "Putts/runde",
      val: avgPutts !== null ? fmtNb(avgPutts, 1) : "–",
      delta: "fra loggede hull",
      // Always show as neutral-positive when we have data
      positive: true,
    },
    {
      label: "GIR %",
      val: avgGir !== null ? fmtNb(avgGir, 0) + " %" : "–",
      delta: "fra loggede hull",
      positive: true,
    },
  ];

  return kpis;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StatistikkDashboard() {
  const user = await requirePortalUser();

  const runder = await prisma.round.findMany({
    where: { userId: user.id },
    orderBy: { playedAt: "asc" },
    select: {
      score: true,
      playedAt: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      holeScores: {
        select: { putts: true, gir: true },
      },
    },
  });

  const kpis = buildKpis(runder);
  const nivaaDiagnose = buildNivaaDiagnose(runder, new Date().getFullYear());
  const trendScores = runder.slice(-10).map((r) => r.score);

  const hcp = user.hcp;
  const identitetsLinje =
    `${user.name} · HCP ${fmtHcp(hcp)}`;

  const data: StatistikkHybridData = {
    identitetsLinje,
    nivaaDiagnose,
    kpis,
    trendScores,
    hubs: [
      {
        label: "SG-hub",
        sub: "9 undersider",
        href: "/portal/analysere",
        icon: BarChart2,
      },
      {
        label: "TrackMan",
        sub: "Balldata fra økt",
        href: "/portal/analysere",
        icon: Target,
      },
      {
        label: "Runder",
        sub: `${runder.length} runder`,
        href: "/portal/analysere",
        icon: CalendarDays,
      },
      {
        label: "Tester",
        sub: "Kartlegging",
        href: "/portal/tren/tester",
        icon: FlaskConical,
      },
      {
        label: "Baner",
        sub: "Banehistorikk",
        href: "/portal/analysere",
        icon: MapPin,
      },
      {
        label: "Turneringer",
        sub: "Resultater",
        href: "/portal/tren/turneringer",
        icon: Shield,
      },
    ],
  };

  return <StatistikkHub data={data} />;
}
