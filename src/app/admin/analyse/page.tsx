/**
 * AgencyOS — Stall-analyse (ANALYSERE · STALL-ANALYSE), /admin/analyse.
 *
 * Port av fasit `agencyos-app/screens-analyze.jsx` → StableAnalysisScreen
 * (mørkt tema, desktop 1280): PageHead («Stallen i tall.») + 4 KPI-kort +
 * 2-kolonners grid med Pyramide-fordeling (stall) til venstre og
 * Per gruppe-tabell til høyre. Radklikk → /admin/lag-snitt (fasit-flyt).
 *
 * Datakilder (alle ekte, «—» ellers):
 *   - Treningstimer 30 d: sum durationMin av COMPLETED TrainingPlanSession
 *     siste 30 d (delta vs forrige 30-dagers vindu).
 *   - Snitt SG-utvikling: snitt Round.sgTotal siste 30 d minus forrige 30 d.
 *   - Økt-oppmøte: COMPLETED / planlagte (ikke-kansellerte) økter siste 30 d.
 *   - Inaktive 7+ dg: spillere uten innlogging siste 7 dg (delta = vs
 *     tilstanden for 7 dg siden, dvs. uten innlogging siste 14 dg).
 *   - Pyramide-fordeling: andel COMPLETED-økter per pyramidArea (hele stallen).
 *   - Per gruppe: medlemstall + timer/uke per spiller (siste 30 d) + snitt
 *     SG-total over medlemmenes runder siste 90 d.
 */

import Link from "next/link";
import {
  Activity,
  Minus,
  TrendingDown,
  TrendingUp,
  UserCheck,
  ZapOff,
  type LucideIcon,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgPage,
  AgPageHead,
  AgSectionHead,
  AgTable,
  AgTd,
  AgTh,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAG_MS = 86_400_000;

/** Pyramide-aksene i fasit-rekkefølge (topp → bunn). */
const AKSER = [
  { key: "TURN", label: "Turnering", cls: "bg-pyr-turn" },
  { key: "SPILL", label: "Spill", cls: "bg-pyr-spill" },
  { key: "SLAG", label: "Golfslag", cls: "bg-pyr-slag" },
  { key: "TEK", label: "Teknisk", cls: "bg-pyr-tek" },
  { key: "FYS", label: "Fysisk", cls: "bg-pyr-fys" },
] as const;

type AkseKey = (typeof AKSER)[number]["key"];

/** «+0,21» / «−0,38» med typografisk minus (fasit-format). */
function fmtSigned(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals).replace(".", ",");
  return `${n < 0 ? "−" : "+"}${s}`;
}

// ── KPI-kort (fasit .kpi) ───────────────────────────────────────
function KpiCard({
  label,
  icon: Icon,
  value,
  unit,
  delta,
  dir,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  unit?: string;
  delta?: string;
  dir?: "up" | "down";
}) {
  const DeltaIcon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card px-[18px] py-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-[3px] text-[15px] font-bold text-muted-foreground">{unit}</span>}
      </div>
      {delta && (
        <div
          className={cn(
            "inline-flex items-center gap-[5px] font-mono text-[11px] font-bold tracking-[0.04em]",
            dir === "up" ? "text-success" : dir === "down" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <DeltaIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          {delta}
        </div>
      )}
    </div>
  );
}

// ── Pyramide-barer (fasit PyramidBars / .pyr-row) ───────────────
function PyramidBars({
  rows,
}: {
  rows: { label: string; pct: number; value: string; cls: string }[];
}) {
  return (
    <div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[72px_1fr_48px] items-center gap-3 py-[6px] leading-none"
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {r.label}
          </span>
          <span className="h-[7px] overflow-hidden rounded-full bg-muted">
            <span
              className={cn("block h-full rounded-full", r.cls)}
              style={{ width: `${r.pct}%` }}
            />
          </span>
          <span className="text-right font-mono text-[11px] font-bold text-foreground">
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function StallAnalysePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

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
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
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
  const oppmoteCur =
    oktPlanlagtNaa > 0 ? Math.round((oktFullfortNaa / oktPlanlagtNaa) * 100) : null;
  const oppmotePrev =
    oktPlanlagtFor > 0 ? Math.round((oktFullfortFor / oktPlanlagtFor) * 100) : null;
  const oppmoteDiff = oppmoteCur != null && oppmotePrev != null ? oppmoteCur - oppmotePrev : null;

  // ── KPI 4: Inaktive 7+ dg ─────────────────────────────────────
  const inaktivDiff = inaktiveNaa - inaktiveFor;

  // ── Pyramide-fordeling (andel av fullførte økter per akse) ────
  const pyrCounts: Record<AkseKey, number> = { TURN: 0, SPILL: 0, SLAG: 0, TEK: 0, FYS: 0 };
  for (const row of pyramideRaw) pyrCounts[row.pyramidArea as AkseKey] = row._count._all;
  const pyrTotal = AKSER.reduce((s, a) => s + pyrCounts[a.key], 0);
  const dist = AKSER.map((a) => {
    const pct = pyrTotal > 0 ? Math.round((pyrCounts[a.key] / pyrTotal) * 100) : 0;
    return { label: a.label, pct, value: pyrTotal > 0 ? `${pct} %` : "—", cls: a.cls };
  });

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

  const lead =
    `Aggregert over ${nSpillere} spillere.` +
    (pyrTotal > 0 ? ` ${svakest.label}-aksen er stallens svakeste — typisk for en ung stall.` : "");

  // ── Per gruppe-tabell ─────────────────────────────────────────
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

  return (
    <AgPage>
      <AgPageHead eyebrow="Analysere · Stall-analyse" title="Stallen" italic="i tall." lead={lead} />

      {/* KPI-strip (fasit .kpis) */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          label="Treningstimer · 30 d"
          icon={Activity}
          value={String(timerCur)}
          unit="t"
          delta={harTimer ? `${fmtSigned(timerDiff, 0)} t` : undefined}
          dir={harTimer ? (timerDiff < 0 ? "down" : "up") : undefined}
        />
        <KpiCard
          label="Snitt SG-utvikling"
          icon={TrendingUp}
          value={sgUtvikling != null ? fmtSigned(sgUtvikling) : "—"}
          delta={sgUtvikling != null ? "vs forrige mnd." : undefined}
          dir={sgUtvikling != null ? (sgUtvikling < 0 ? "down" : "up") : undefined}
        />
        <KpiCard
          label="Økt-oppmøte"
          icon={UserCheck}
          value={oppmoteCur != null ? String(oppmoteCur) : "—"}
          unit={oppmoteCur != null ? "%" : undefined}
          delta={oppmoteDiff != null ? `${fmtSigned(oppmoteDiff, 0)} %` : undefined}
          dir={oppmoteDiff != null ? (oppmoteDiff < 0 ? "down" : "up") : undefined}
        />
        <KpiCard
          label="Inaktive 7+ dg"
          icon={ZapOff}
          value={String(inaktiveNaa)}
          delta={`${fmtSigned(inaktivDiff, 0)} vs forrige`}
          dir={inaktivDiff <= 0 ? "down" : "up"}
        />
      </div>

      {/* 2 kolonner: pyramide + per gruppe */}
      <div className="mt-4 grid grid-cols-2 items-start gap-3">
        <div>
          <AgSectionHead className="mb-[12px] mt-0 leading-none">Pyramide-fordeling · stall</AgSectionHead>
          <div className="rounded-xl border border-border bg-card p-[18px]">
            <PyramidBars rows={dist} />
            <div className="mt-[14px] rounded-[10px] border border-border border-l-[3px] border-l-accent bg-card px-4 py-[14px] font-mono text-[11px] leading-[1.55] text-muted-foreground">
              {innsikt}
            </div>
          </div>
        </div>
        <div>
          <AgSectionHead className="mb-[12px] mt-0 leading-none">Per gruppe</AgSectionHead>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <AgTable>
              <thead>
                <tr>
                  <AgTh className="leading-[1.2]">Gruppe</AgTh>
                  <AgTh num className="leading-[1.2]">Spillere</AgTh>
                  <AgTh num className="leading-[1.2]">Timer/uke</AgTh>
                  <AgTh num className="leading-[1.2]">Snitt SG</AgTh>
                </tr>
              </thead>
              <tbody>
                {gruppeRader.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-[14px] py-8 text-center text-[13px] text-muted-foreground">
                      Ingen grupper opprettet ennå.
                    </td>
                  </tr>
                )}
                {gruppeRader.map((g) => (
                  <tr key={g.id} className={`${agTrClass} leading-[1.2]`}>
                    <AgTd>
                      <Link href="/admin/lag-snitt" className="font-semibold text-foreground hover:underline">
                        {g.navn}
                      </Link>
                    </AgTd>
                    <AgTd num>{g.n}</AgTd>
                    <AgTd num>{g.timer != null ? g.timer.toFixed(1).replace(".", ",") : "—"}</AgTd>
                    <AgTd num>
                      {g.sg != null ? (
                        <span className={cn("font-semibold", g.sg < 0 ? "text-destructive" : "text-success")}>
                          {fmtSigned(g.sg)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </AgTd>
                  </tr>
                ))}
              </tbody>
            </AgTable>
          </div>
        </div>
      </div>
    </AgPage>
  );
}
