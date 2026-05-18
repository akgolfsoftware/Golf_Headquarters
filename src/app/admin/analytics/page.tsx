import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Clock,
  Crown,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import {
  AnalyticsViewToggle,
  type AnalyticsView,
} from "@/components/coachhq/analytics-view-toggle";
import {
  AnalyticsHeatmap,
  type HeatmapPlayer,
  type PyramidKey,
} from "@/components/coachhq/analytics-heatmap";
import {
  AnalyticsTrend,
  type TrendWeek,
} from "@/components/coachhq/analytics-trend";

export const dynamic = "force-dynamic";

type SearchParams = { view?: string };

function parseView(raw?: string): AnalyticsView {
  if (raw === "heatmap" || raw === "trend") return raw;
  return "bento";
}

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const params = await searchParams;
  const view = parseView(params.view);

  const now = new Date();
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  // 12 uker tilbake (mandag som ukestart)
  const tolvUkerStart = new Date(now);
  tolvUkerStart.setDate(tolvUkerStart.getDate() - 12 * 7);
  // Sett til mandag
  const dow = tolvUkerStart.getDay();
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  tolvUkerStart.setDate(tolvUkerStart.getDate() + diffToMon);
  tolvUkerStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers30d,
    proUsers,
    totalRounds30d,
    totalSessions30d,
    totalTests30d,
    aiChatSessions,
    pendingApprovals,
    hcpFordelingRader,
    bookinger30d,
    inntektAgg,
    spillereListe,
    bokningerMedDato,
    // Heatmap: økter siste 30d
    heatmapSessions,
    // Trend: 12 uker økter
    trendSessions,
    // Trend: 12 uker runder
    trendRounds,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.user.count({
      where: { role: "PLAYER", lastLoginAt: { gte: tretti } },
    }),
    prisma.user.count({ where: { role: "PLAYER", tier: "PRO" } }),
    prisma.round.count({ where: { playedAt: { gte: tretti } } }),
    prisma.trainingPlanSessionLog.count({
      where: { startedAt: { gte: tretti } },
    }),
    prisma.testResult.count({ where: { takenAt: { gte: tretti } } }),
    prisma.coachingSession.count({ where: { kind: "AI" } }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      where: { role: "PLAYER", hcp: { not: null } },
      select: { hcp: true },
    }),
    prisma.booking.count({ where: { createdAt: { gte: tretti } } }),
    prisma.payment.aggregate({
      where: {
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] },
        paidAt: { gte: tretti },
      },
      _sum: { amountOre: true, amountRefundedOre: true },
    }),
    // Aktivitetstabell: 10 spillere med siste logg
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        trainingPlans: {
          select: {
            sessions: {
              where: { status: "COMPLETED" },
              select: {
                durationMin: true,
                log: { select: { startedAt: true } },
              },
              orderBy: { scheduledAt: "desc" },
            },
          },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    // Bookinger siste 30d for ukedag-fordeling
    prisma.booking.findMany({
      where: { createdAt: { gte: tretti } },
      select: { createdAt: true },
    }),
    // Heatmap: alle økter siste 30d, joinet til spiller via plan
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: tretti } },
      select: {
        status: true,
        pyramidArea: true,
        plan: {
          select: {
            user: {
              select: { id: true, name: true, hcp: true, role: true },
            },
          },
        },
      },
    }),
    // Trend: 12 uker økter (kun fullførte teller for volum)
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: tolvUkerStart }, status: "COMPLETED" },
      select: {
        scheduledAt: true,
        pyramidArea: true,
      },
    }),
    // Trend: SG-snitt per uke
    prisma.round.findMany({
      where: { playedAt: { gte: tolvUkerStart }, sgTotal: { not: null } },
      select: { playedAt: true, sgTotal: true },
    }),
  ]);

  // HCP-bins: <0, 0-10, 10-20, 20-30, 30+
  const bins = [0, 0, 0, 0, 0];
  const binLabels = ["< 0", "0–10", "10–20", "20–30", "30+"];
  for (const u of hcpFordelingRader) {
    const h = u.hcp ?? 0;
    if (h < 0) bins[0]++;
    else if (h < 10) bins[1]++;
    else if (h < 20) bins[2]++;
    else if (h < 30) bins[3]++;
    else bins[4]++;
  }
  const maxBin = Math.max(...bins, 1);
  const harData = totalUsers > 0;

  const proPercent =
    totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;
  const aktivPercent =
    totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0;

  const testRate =
    totalUsers > 0
      ? Math.min(100, Math.round((totalTests30d / totalUsers) * 100))
      : 0;
  const testDashArray = `${(testRate / 100) * 87.96} 87.96`;

  const bruttoOre = inntektAgg._sum.amountOre ?? 0;
  const refundOre = inntektAgg._sum.amountRefundedOre ?? 0;
  const inntektKr = Math.round((bruttoOre - refundOre) / 100);

  const snittTid = "47 min";

  const eyebrowDate = now.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Aktivitetstabell
  const aktivitetsRader = spillereListe.map((spiller) => {
    type SesjonMedLog = { startedAt: Date; durationMin: number };
    const alleSesjoner: SesjonMedLog[] = spiller.trainingPlans.flatMap((p) =>
      p.sessions.flatMap((s) =>
        s.log ? [{ startedAt: s.log.startedAt, durationMin: s.durationMin }] : [],
      ),
    );

    const sisteLog = [...alleSesjoner].sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
    )[0];

    const tretti2 = new Date(now);
    tretti2.setDate(tretti2.getDate() - 30);
    const seksti2 = new Date(now);
    seksti2.setDate(seksti2.getDate() - 60);

    const antallSiste30 = alleSesjoner.filter(
      (s) => s.startedAt >= tretti2,
    ).length;
    const antallForrige30 = alleSesjoner.filter(
      (s) => s.startedAt >= seksti2 && s.startedAt < tretti2,
    ).length;

    let trend: "up" | "flat" | "down" = "flat";
    if (antallSiste30 > antallForrige30) trend = "up";
    else if (antallSiste30 < antallForrige30) trend = "down";

    const snittMin =
      alleSesjoner.length > 0
        ? Math.round(
            alleSesjoner.reduce((sum, s) => sum + s.durationMin, 0) /
              alleSesjoner.length,
          )
        : null;

    return {
      navn: spiller.name,
      sisteOkt: sisteLog
        ? sisteLog.startedAt.toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
          })
        : "—",
      antall30d: antallSiste30,
      snittMin: snittMin != null ? `${snittMin} min` : "—",
      trend,
    };
  });

  // Bookinger per ukedag
  const ukedager = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const ukedagTellere = [0, 0, 0, 0, 0, 0, 0];
  for (const b of bokningerMedDato) {
    const jsDay = new Date(b.createdAt).getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    ukedagTellere[idx]++;
  }
  const maxUkedag = Math.max(...ukedagTellere, 1);

  // -------- Heatmap-bygging --------
  type CellAgg = { completed: number; total: number };
  const playersMap = new Map<
    string,
    { id: string; name: string; hcp: number | null; cells: Record<PyramidKey, CellAgg> }
  >();

  for (const s of heatmapSessions) {
    const u = s.plan.user;
    if (u.role !== "PLAYER") continue;
    let entry = playersMap.get(u.id);
    if (!entry) {
      const empty: Record<PyramidKey, CellAgg> = {
        FYS: { completed: 0, total: 0 },
        TEK: { completed: 0, total: 0 },
        SLAG: { completed: 0, total: 0 },
        SPILL: { completed: 0, total: 0 },
        TURN: { completed: 0, total: 0 },
      };
      entry = { id: u.id, name: u.name, hcp: u.hcp, cells: empty };
      playersMap.set(u.id, entry);
    }
    const cell = entry.cells[s.pyramidArea as PyramidKey];
    cell.total += 1;
    if (s.status === "COMPLETED") cell.completed += 1;
  }

  // Sortér heatmap-spillere etter HCP (null sist)
  const heatmapPlayers: HeatmapPlayer[] = Array.from(playersMap.values()).sort(
    (a, b) => {
      if (a.hcp == null && b.hcp == null) return a.name.localeCompare(b.name);
      if (a.hcp == null) return 1;
      if (b.hcp == null) return -1;
      return a.hcp - b.hcp;
    },
  );

  // -------- Trend-bygging — 12 ukers buckets --------
  const weeks: TrendWeek[] = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(tolvUkerStart);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    // Ukenummer (ISO)
    const tmp = new Date(
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
    );
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
    );

    const fordeling: Record<PyramidKey, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    let okter = 0;
    for (const s of trendSessions) {
      if (s.scheduledAt >= start && s.scheduledAt < end) {
        okter += 1;
        fordeling[s.pyramidArea as PyramidKey] += 1;
      }
    }

    let sgSum = 0;
    let sgN = 0;
    for (const r of trendRounds) {
      if (r.playedAt >= start && r.playedAt < end && r.sgTotal != null) {
        sgSum += r.sgTotal;
        sgN += 1;
      }
    }
    const sgAvg = sgN > 0 ? sgSum / sgN : null;

    weeks.push({
      weekLabel: `U${weekNo}`,
      startDate: start.toISOString().slice(0, 10),
      okter,
      sgAvg,
      fordeling,
    });
  }

  // Antall aktive spillere for agent-strip (har minst én økt siste 30d)
  const aktiveTrenende = heatmapPlayers.length;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Analytics · {eyebrowDate}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight tracking-tight sm:text-4xl">
            Analytics —{" "}
            <em className="font-normal italic text-primary">
              hvordan stallen
            </em>{" "}
            utvikler seg.
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {totalUsers} spillere · {totalSessions30d} økter · siste 30 dager
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <AnalyticsViewToggle active={view} />
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Periode
            </span>
            <span className="font-medium">
              {view === "trend" ? "Siste 12 uker" : "Siste 30 dager"}
            </span>
          </div>
        </div>
      </header>

      <AgentStrip label="Analyse-agent">
        Viser data fra de siste {view === "trend" ? "12 ukene" : "30 dagene"}{" "}
        basert på {aktiveTrenende || totalUsers} aktive spillere.
      </AgentStrip>

      {!harData ? (
        <EmptyState
          icon={BarChart3}
          titleItalic="Ingen data"
          titleTrail="ennå"
          sub="Statistikk vises når spillere er registrert og har aktivitet."
        />
      ) : (
        <>
          {/* KPI STRIP — synes på alle views */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={Users}
              label="Aktive spillere"
              value={String(totalUsers)}
              sub="Alle PLAYER-konti"
            />
            <Kpi
              icon={TrendingUp}
              label="Bookinger (30d)"
              value={String(bookinger30d)}
              sub={`${aktivPercent}% av stallen aktiv`}
            />
            <Kpi
              icon={Clock}
              label="Snitt sesjonstid"
              value={snittTid}
              sub="Estimert · faktisk data kommer"
            />
            <Kpi
              icon={Crown}
              label="Inntekt (30d)"
              value={
                inntektKr > 0
                  ? `${inntektKr.toLocaleString("nb-NO")} kr`
                  : "0 kr"
              }
              sub="Netto etter refusjoner"
            />
          </section>

          {view === "heatmap" && (
            <AnalyticsHeatmap players={heatmapPlayers} />
          )}

          {view === "trend" && <AnalyticsTrend weeks={weeks} />}

          {view === "bento" && (
            <>
              {/* AKTIVITETSTABELL */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    Spiller{" "}
                    <em className="font-normal italic text-primary">
                      aktivitet
                    </em>
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Siste 30 dager
                  </span>
                </div>

                {aktivitetsRader.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    titleItalic="Ingen spillere"
                    titleTrail="ennå"
                    sub="Spillere vises her når de er lagt til i systemet."
                  />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-secondary/40 text-left">
                        <tr>
                          <Th>Spiller</Th>
                          <Th>Siste økt</Th>
                          <Th>Sesjoner (30d)</Th>
                          <Th>Snitt-tid</Th>
                          <Th>Trend</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {aktivitetsRader.map((rad) => (
                          <tr
                            key={rad.navn}
                            className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                          >
                            <Td className="font-medium text-foreground">
                              {rad.navn}
                            </Td>
                            <Td className="font-mono text-xs text-muted-foreground">
                              {rad.sisteOkt}
                            </Td>
                            <Td className="font-mono tabular-nums">
                              {rad.antall30d}
                            </Td>
                            <Td className="font-mono text-xs text-muted-foreground">
                              {rad.snittMin}
                            </Td>
                            <Td>
                              <TrendPil trend={rad.trend} />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* UKEDAG-HISTOGRAM */}
              <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      Bookinger per{" "}
                      <em className="font-normal italic text-primary">
                        ukedag
                      </em>
                    </h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {bokningerMedDato.length} bookinger siste 30 dager
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Distribusjon
                  </span>
                </div>

                <div className="mt-6 flex h-40 items-end gap-2">
                  {ukedager.map((dag, i) => {
                    const pct = Math.round(
                      (ukedagTellere[i] / maxUkedag) * 100,
                    );
                    return (
                      <div
                        key={dag}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                          {ukedagTellere[i]}
                        </span>
                        <div className="relative flex h-28 w-full flex-col justify-end overflow-hidden rounded-sm bg-secondary">
                          <div
                            className="w-full rounded-sm bg-primary transition-all"
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                          {dag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* HCP CHART */}
              <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      HCP-fordeling
                      <span className="ml-2 text-xs font-normal italic text-muted-foreground">
                        {hcpFordelingRader.length} spillere med registrert HCP
                      </span>
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Stall-snitt
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {bins.map((count, i) => (
                    <div
                      key={binLabels[i]}
                      className="flex items-center gap-4"
                    >
                      <span className="w-16 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {binLabels[i]}
                      </span>
                      <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-secondary">
                        <div
                          className="h-full rounded-sm bg-primary transition-all"
                          style={{ width: `${(count / maxBin) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-sm tabular-nums text-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* BENTO */}
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    Test-completion
                  </span>
                  <div className="relative mx-auto mt-2 h-32 w-32">
                    <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        className="stroke-secondary"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        className="stroke-primary"
                        strokeWidth="3.5"
                        strokeDasharray={testDashArray}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                        {testRate}%
                      </span>
                      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                        Fullført
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                    <span>
                      {totalTests30d} av {totalUsers} spillere
                    </span>
                  </div>
                </div>

                <BentoStat
                  label="Runder loggført"
                  value={String(totalRounds30d)}
                  sub="Siste 30 dager"
                  icon={BarChart3}
                />

                <BentoStat
                  label="AI-chat-sesjoner"
                  value={String(aiChatSessions)}
                  sub="Totalt på plattformen"
                  icon={MessageCircle}
                />

                <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    <Sparkles
                      size={12}
                      strokeWidth={1.75}
                      className="mr-1 inline-block text-muted-foreground"
                    />
                    Pro-konvertering
                  </span>
                  <div className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                    {proPercent}
                    <span className="ml-1 text-lg font-medium text-muted-foreground">
                      %
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${proPercent}%` }}
                    />
                  </div>
                  <div className="mt-auto flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                    <span>
                      {proUsers} av {totalUsers}
                    </span>
                    <span className="font-semibold text-primary">PRO</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {pendingApprovals > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <AlertCircle
                size={16}
                strokeWidth={1.75}
                className="shrink-0 text-destructive"
              />
              <span className="text-sm text-destructive">
                {pendingApprovals} agent-forslag venter på godkjenning
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------- helpers ----------

function TrendPil({ trend }: { trend: "up" | "flat" | "down" }) {
  if (trend === "up")
    return (
      <ArrowUp
        size={14}
        strokeWidth={1.75}
        className="text-primary"
        aria-label="Stigende trend"
      />
    );
  if (trend === "down")
    return (
      <ArrowDown
        size={14}
        strokeWidth={1.75}
        className="text-destructive"
        aria-label="Fallende trend"
      />
    );
  return (
    <ArrowRight
      size={14}
      strokeWidth={1.75}
      className="text-muted-foreground"
      aria-label="Stabil trend"
    />
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon
          size={14}
          strokeWidth={1.75}
          className={
            tone === "warn" ? "text-destructive" : "text-muted-foreground"
          }
        />
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${
          tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {typeof progress === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      {sub && (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function BentoStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
      <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon size={12} strokeWidth={1.75} />
        {label}
      </span>
      <div className="font-mono text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      <p className="mt-auto font-mono text-[11px] text-muted-foreground">
        {sub}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-4 ${className}`}>{children}</td>;
}
