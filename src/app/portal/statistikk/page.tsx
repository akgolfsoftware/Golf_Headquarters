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
  type StatistikkHybridData,
} from "@/components/portal/statistikk/statistikk-hybrid";
import { aggregateSg } from "@/lib/sg";

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
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  holeScores: { putts: number | null; gir: boolean | null }[];
};

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
  const trendScores = runder.slice(-10).map((r) => r.score);

  const hcp = user.hcp;
  const identitetsLinje =
    `${user.name} · HCP ${fmtHcp(hcp)}`;

  const data: StatistikkHybridData = {
    identitetsLinje,
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
