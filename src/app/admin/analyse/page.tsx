/**
 * v2-preview: AgencyOS Stall-analyse (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data er identisk med den ekte /admin/analyse-siden: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-loader (stall-SG-
 * analyse på tvers). All beregning skjer server-side; klientkomponenten
 * (AdminAnalyseV2) rendrer bare den ferdige, ærlige datakontrakten.
 *
 * Server component.
 */

import { coachedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminAnalyseV2,
  type AnalyseV2Data,
  type AnalyseV2Kpi,
} from "@/components/admin/v2/AdminAnalyseV2";
import type { AkseKey } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

const DAG_MS = 86_400_000;

/** Pyramide-aksene i fasit-rekkefølge (topp → bunn). */
const AKSER: { key: AkseKey; label: string }[] = [
  { key: "TURN", label: "Turnering" },
  { key: "SPILL", label: "Spill" },
  { key: "SLAG", label: "Golfslag" },
  { key: "TEK", label: "Teknisk" },
  { key: "FYS", label: "Fysisk" },
];

/** «+0,21» / «−0,38» med typografisk minus (fasit-format). */
function fmtSigned(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals).replace(".", ",");
  return `${n < 0 ? "−" : "+"}${s}`;
}

async function loadStallAnalyse(): Promise<AnalyseV2Data> {
  const naa = new Date();
  const d7 = new Date(naa.getTime() - 7 * DAG_MS);
  const d14 = new Date(naa.getTime() - 14 * DAG_MS);
  const d30 = new Date(naa.getTime() - 30 * DAG_MS);
  const d60 = new Date(naa.getTime() - 60 * DAG_MS);
  const d90 = new Date(naa.getTime() - 90 * DAG_MS);

  const spillerOkter = { plan: { user: { role: "PLAYER" as const } } };

  const [
    nSpillere,
    timerNaa,
    timerFor,
    sgNaa,
    sgFor,
    oktFullfortNaa,
    oktPlanlagtNaa,
    oktFullfortFor,
    oktPlanlagtFor,
    inaktiveNaa,
    inaktiveFor,
    pyramideRaw,
    grupper,
  ] = await Promise.all([
    prisma.user.count({ where: { AND: [coachedPlayerWhere(), { deletedAt: null }] } }),
    prisma.trainingPlanSession.aggregate({
      _sum: { durationMin: true },
      where: { status: "COMPLETED", scheduledAt: { gte: d30, lte: naa }, ...spillerOkter },
    }),
    prisma.trainingPlanSession.aggregate({
      _sum: { durationMin: true },
      where: { status: "COMPLETED", scheduledAt: { gte: d60, lt: d30 }, ...spillerOkter },
    }),
    prisma.round.aggregate({
      _avg: { sgTotal: true },
      _count: { sgTotal: true },
      where: { playedAt: { gte: d30, lte: naa }, sgTotal: { not: null } },
    }),
    prisma.round.aggregate({
      _avg: { sgTotal: true },
      _count: { sgTotal: true },
      where: { playedAt: { gte: d60, lt: d30 }, sgTotal: { not: null } },
    }),
    prisma.trainingPlanSession.count({
      where: { status: "COMPLETED", scheduledAt: { gte: d30, lte: naa }, ...spillerOkter },
    }),
    prisma.trainingPlanSession.count({
      where: { status: { not: "CANCELLED" }, scheduledAt: { gte: d30, lte: naa }, ...spillerOkter },
    }),
    prisma.trainingPlanSession.count({
      where: { status: "COMPLETED", scheduledAt: { gte: d60, lt: d30 }, ...spillerOkter },
    }),
    prisma.trainingPlanSession.count({
      where: { status: { not: "CANCELLED" }, scheduledAt: { gte: d60, lt: d30 }, ...spillerOkter },
    }),
    prisma.user.count({
      where: {
        role: "PLAYER",
        deletedAt: null,
        OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: d7 } }],
      },
    }),
    prisma.user.count({
      where: {
        role: "PLAYER",
        deletedAt: null,
        OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: d14 } }],
      },
    }),
    prisma.trainingPlanSession.groupBy({
      by: ["pyramidArea"],
      _count: { _all: true },
      where: { status: "COMPLETED", ...spillerOkter },
    }),
    prisma.group.findMany({
      select: { id: true, name: true, members: { select: { userId: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  // ── KPI 1: Treningstimer 30 d ─────────────────────────────────
  const timerCur = Math.round((timerNaa._sum.durationMin ?? 0) / 60);
  const timerPrev = Math.round((timerFor._sum.durationMin ?? 0) / 60);
  const timerDiff = timerCur - timerPrev;
  const harTimer = timerCur > 0 || timerPrev > 0;

  // ── KPI 2: Snitt SG-utvikling (30 d vs forrige 30 d) ──────────
  const harSgUtvikling = sgNaa._count.sgTotal > 0 && sgFor._count.sgTotal > 0;
  const sgUtvikling = harSgUtvikling ? (sgNaa._avg.sgTotal ?? 0) - (sgFor._avg.sgTotal ?? 0) : null;

  // ── KPI 3: Økt-oppmøte ────────────────────────────────────────
  const oppmoteCur = oktPlanlagtNaa > 0 ? Math.round((oktFullfortNaa / oktPlanlagtNaa) * 100) : null;
  const oppmotePrev = oktPlanlagtFor > 0 ? Math.round((oktFullfortFor / oktPlanlagtFor) * 100) : null;
  const oppmoteDiff = oppmoteCur != null && oppmotePrev != null ? oppmoteCur - oppmotePrev : null;

  // ── KPI 4: Inaktive 7+ dg ─────────────────────────────────────
  const inaktivDiff = inaktiveNaa - inaktiveFor;

  const kpis: AnalyseV2Kpi[] = [
    {
      label: "Treningstimer · 30 d",
      value: String(timerCur),
      unit: "t",
      delta: harTimer ? `${fmtSigned(timerDiff, 0)} t` : undefined,
      dir: harTimer ? (timerDiff < 0 ? "down" : "up") : undefined,
    },
    {
      label: "Snitt SG-utvikling",
      value: sgUtvikling != null ? fmtSigned(sgUtvikling) : "—",
      sub: sgUtvikling != null ? "vs forrige mnd." : undefined,
      accent: sgUtvikling != null && sgUtvikling >= 0,
    },
    {
      label: "Økt-oppmøte",
      value: oppmoteCur != null ? String(oppmoteCur) : "—",
      unit: oppmoteCur != null ? "%" : undefined,
      delta: oppmoteDiff != null ? `${fmtSigned(oppmoteDiff, 0)} %` : undefined,
      dir: oppmoteDiff != null ? (oppmoteDiff < 0 ? "down" : "up") : undefined,
    },
    {
      label: "Inaktive 7+ dg",
      value: String(inaktiveNaa),
      sub: `${fmtSigned(inaktivDiff, 0)} vs forrige`,
    },
  ];

  // ── Pyramide-fordeling (andel av fullførte økter per akse) ────
  const pyrCounts: Record<AkseKey, number> = { TURN: 0, SPILL: 0, SLAG: 0, TEK: 0, FYS: 0 };
  for (const row of pyramideRaw) pyrCounts[row.pyramidArea as AkseKey] = row._count._all;
  const pyrTotal = AKSER.reduce((s, a) => s + pyrCounts[a.key], 0);
  const dist = AKSER.map((a) => ({
    akse: a.key,
    label: a.label,
    pct: pyrTotal > 0 ? Math.round((pyrCounts[a.key] / pyrTotal) * 100) : 0,
    okter: pyrCounts[a.key],
  }));

  // Innsikt: sterkeste to + svakeste akse (kun når data finnes).
  const sortert = [...dist].sort((a, b) => b.pct - a.pct);
  const svakest = sortert[sortert.length - 1];
  const innsikt =
    pyrTotal > 0
      ? `${sortert[0].label} og ${sortert[1].label.toLowerCase()} er solid. ${svakest.label} (${svakest.pct} %) er flaskehalsen${
          svakest.label === "Turnering"
            ? " — vurder flere konkurranse-simuleringer."
            : " — prioriter dette i gruppeprogrammene."
        }`
      : "Ingen fullførte økter logget ennå — fordelingen vises når stallen begynner å logge trening.";

  // ── Per gruppe ────────────────────────────────────────────────
  const gruppeRader = await Promise.all(
    grupper.map(async (g) => {
      const memberIds = g.members.map((m) => m.userId);
      if (memberIds.length === 0) {
        return { id: g.id, navn: g.name, n: 0, timer: null as number | null, sg: null as number | null };
      }
      const [okter, sg] = await Promise.all([
        prisma.trainingPlanSession.aggregate({
          _sum: { durationMin: true },
          where: {
            status: "COMPLETED",
            scheduledAt: { gte: d30, lte: naa },
            plan: { userId: { in: memberIds } },
          },
        }),
        prisma.round.aggregate({
          _avg: { sgTotal: true },
          _count: { sgTotal: true },
          where: { userId: { in: memberIds }, playedAt: { gte: d90 }, sgTotal: { not: null } },
        }),
      ]);
      const sumMin = okter._sum.durationMin ?? 0;
      // Timer per spiller per uke, siste 30 dager.
      const timer = sumMin > 0 ? sumMin / 60 / (30 / 7) / memberIds.length : null;
      return {
        id: g.id,
        navn: g.name,
        n: memberIds.length,
        timer,
        sg: sg._count.sgTotal > 0 ? sg._avg.sgTotal : null,
      };
    }),
  );

  return {
    nSpillere,
    kpis,
    harPyr: pyrTotal > 0,
    dist,
    innsikt,
    grupper: gruppeRader,
  };
}

export default async function V2AdminAnalysePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await loadStallAnalyse();
  return (
    <V2Shell aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminAnalyseV2 data={data} />
    </V2Shell>
  );
}
