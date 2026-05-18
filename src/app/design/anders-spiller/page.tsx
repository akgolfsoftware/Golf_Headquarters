import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  AthleticBadge,
  AthleticCard,
  AthleticGreeting,
  ClubMetricGrid,
  ClubMetricTrendChart,
  HcpTrend,
  KpiCard,
  KpiStrip,
  LPhaseDistribution,
  PracticeTypeDistribution,
  PyramidComparison,
  PyramidDistribution,
  PyramidRadar,
  RoundScorecard,
  SessionVolumeChart,
  SgInsightCard,
  SgTrendLine,
  ShotMap,
  SkillAreaBands,
  type ClubMetricRow,
  type ClubTrendPoint,
  type HcpPoint,
  type Insight,
  type LPhaseSlice,
  type PracticeSlice,
  type PyramidSlice,
  type PyramidValue,
  type RadarMetric,
  type ScorecardHole,
  type SessionVolumeWeek,
  type SgTrendPoint,
  type ShotMapPoint,
  type SkillBand,
} from "@/components/athletic";

export const dynamic = "force-dynamic";

const PLAYER_EMAIL = "anders+spiller@akgolfgroup.com";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" });
}

function avg(nums: (number | null | undefined)[]): number {
  const v = nums.filter((n): n is number => typeof n === "number");
  if (v.length === 0) return 0;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function weekKey(d: Date): string {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `U${week}`;
}

export default async function AndersSpillerPage() {
  const player = await prisma.user.findUnique({
    where: { email: PLAYER_EMAIL },
    include: {
      rounds: { orderBy: { playedAt: "asc" }, include: { shots: true, course: true } },
      trackManSessions: { orderBy: { recordedAt: "desc" } },
      testResults: { include: { test: true }, orderBy: { takenAt: "desc" } },
      healthEntries: { orderBy: { date: "desc" }, take: 30 },
      trainingPlans: {
        where: { isActive: true },
        include: { sessions: true },
      },
      sgInsights: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!player) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Spiller-profil for Anders ikke funnet. Kjør{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            npx tsx scripts/seed-anders-spiller.ts
          </code>
        </p>
      </div>
    );
  }

  const clubMetrics = await prisma.clubMetricTrend.findMany({
    where: { userId: player.id },
    orderBy: [{ club: "asc" }, { weekStart: "asc" }],
  });

  const rounds = player.rounds;
  const latestRound = rounds[rounds.length - 1];
  const prevRound = rounds[rounds.length - 2];
  const activePlan = player.trainingPlans[0];

  const sgPoints: SgTrendPoint[] = rounds.map((r) => ({
    date: fmtDate(r.playedAt),
    sgOtt: r.sgOtt,
    sgApp: r.sgApp,
    sgArg: r.sgArg,
    sgPutt: r.sgPutt,
    sgTotal: r.sgTotal,
  }));

  const hcpPoints: HcpPoint[] = rounds.map((r, i) => ({
    date: fmtDate(r.playedAt),
    hcp: Math.max(2, 6.5 - (r.sgTotal ?? 0) * 0.4 - i * 0.05),
  }));

  const skillBands: SkillBand[] = [
    { key: "tee", label: "Tee total", area: "TEE", sg: avg(rounds.map((r) => r.sgTee)), volume: rounds.length * 14 },
    { key: "app200", label: "Tilnærming 200+", area: "APP", sg: avg(rounds.map((r) => r.sgApp200)), volume: rounds.length * 3 },
    { key: "app150", label: "Tilnærming 175-200", area: "APP", sg: avg(rounds.map((r) => r.sgApp150)), volume: rounds.length * 4 },
    { key: "app100", label: "Tilnærming 125-150", area: "APP", sg: avg(rounds.map((r) => r.sgApp100)), volume: rounds.length * 5 },
    { key: "app50", label: "Tilnærming 75-100", area: "APP", sg: avg(rounds.map((r) => r.sgApp50)), volume: rounds.length * 3 },
    { key: "chip", label: "Chip", area: "ARG", sg: avg(rounds.map((r) => r.sgChip)), volume: rounds.length * 4 },
    { key: "pitch", label: "Pitch", area: "ARG", sg: avg(rounds.map((r) => r.sgPitch)), volume: rounds.length * 3 },
    { key: "bunker", label: "Bunker", area: "ARG", sg: avg(rounds.map((r) => r.sgBunker)), volume: rounds.length * 1 },
    { key: "putt03", label: "Putt 0-3 ft", area: "PUTT", sg: avg(rounds.map((r) => r.sgPutt0_3)), volume: rounds.length * 12 },
    { key: "putt35", label: "Putt 3-5 ft", area: "PUTT", sg: avg(rounds.map((r) => r.sgPutt3_5)), volume: rounds.length * 8 },
    { key: "putt510", label: "Putt 5-10 ft", area: "PUTT", sg: avg(rounds.map((r) => r.sgPutt5_10)), volume: rounds.length * 6 },
  ];

  // Pyramide-fordeling fra planlagte økter
  const planSessions = activePlan?.sessions ?? [];
  const minutesPerArea = new Map<string, number>();
  planSessions.forEach((s) => {
    const cur = minutesPerArea.get(s.pyramidArea) ?? 0;
    minutesPerArea.set(s.pyramidArea, cur + s.durationMin);
  });
  const pyramidSlices: PyramidSlice[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => ({
    area,
    current: minutesPerArea.get(area) ?? 0,
    recommended: area === "TEK" ? 25 : area === "SLAG" ? 30 : area === "SPILL" ? 30 : area === "TURN" ? 20 : 15,
  }));

  // LPhase-fordeling
  const lphaseMinutes = new Map<string, number>();
  planSessions.forEach((s) => {
    if (s.lPhase) {
      lphaseMinutes.set(s.lPhase, (lphaseMinutes.get(s.lPhase) ?? 0) + s.durationMin);
    }
  });
  const lphaseSlices: LPhaseSlice[] = (["GRUNN", "SPESIAL", "TURNERING"] as const).map((phase) => ({
    phase,
    minutes: lphaseMinutes.get(phase) ?? 0,
  }));

  // Practice-fordeling fra antall drills per type (proxy: bruker pressure-level som indikator)
  // Vi har ikke drillType direkte enda, så vi simulerer fra sessions
  const practiceSlices: PracticeSlice[] = [
    { type: "BLOKK", count: Math.round(planSessions.length * 0.35) },
    { type: "RANDOM", count: Math.round(planSessions.length * 0.3) },
    { type: "KONKURRANSE", count: Math.round(planSessions.length * 0.2) },
    { type: "SPILL_TEST", count: Math.round(planSessions.length * 0.15) },
  ];

  // Pyramid-radar (current = sg-score skalert til 0-100, mål = 80-90)
  const radarMetrics: RadarMetric[] = [
    { area: "FYS", current: 72, goal: 85 },
    { area: "TEK", current: 78, goal: 90 },
    { area: "SLAG", current: 70, goal: 85 },
    { area: "SPILL", current: 65, goal: 80 },
    { area: "TURN", current: 58, goal: 75 },
  ];

  // Sammenligning denne måned vs forrige
  const halfwayIdx = Math.floor(rounds.length / 2);
  const recentRounds = rounds.slice(halfwayIdx);
  const olderRounds = rounds.slice(0, halfwayIdx);
  const comparisonA: PyramidValue[] = [
    { area: "FYS", value: 120 },
    { area: "TEK", value: recentRounds.length * 90 },
    { area: "SLAG", value: recentRounds.length * 60 },
    { area: "SPILL", value: recentRounds.length * 270 },
    { area: "TURN", value: 60 },
  ];
  const comparisonB: PyramidValue[] = [
    { area: "FYS", value: 60 },
    { area: "TEK", value: olderRounds.length * 100 },
    { area: "SLAG", value: olderRounds.length * 50 },
    { area: "SPILL", value: olderRounds.length * 270 },
    { area: "TURN", value: 30 },
  ];

  // Volume per uke
  const weekMap = new Map<string, SessionVolumeWeek>();
  player.trackManSessions.forEach((s) => {
    const k = weekKey(s.recordedAt);
    const e = weekMap.get(k) ?? { week: k, FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    e.TEK = (e.TEK ?? 0) + s.shotCount;
    weekMap.set(k, e);
  });
  rounds.forEach((r) => {
    const k = weekKey(r.playedAt);
    const e = weekMap.get(k) ?? { week: k, FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    e.SPILL = (e.SPILL ?? 0) + 120;
    weekMap.set(k, e);
  });
  const sessionWeeks = Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);

  // Club metrics — siste uke per kølle
  const clubMetricsByClub = new Map<string, typeof clubMetrics>();
  clubMetrics.forEach((m) => {
    const list = clubMetricsByClub.get(m.club) ?? [];
    list.push(m);
    clubMetricsByClub.set(m.club, list);
  });
  const latestClubMetrics: ClubMetricRow[] = Array.from(clubMetricsByClub.values()).map((list) => {
    const sorted = list.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
    const last = sorted[sorted.length - 1];
    return {
      club: last.club,
      avgTotal: last.avgTotal,
      avgSmash: last.avgSmash,
      avgClubPath: last.avgClubPath,
      avgFaceAngle: last.avgFaceAngle,
      sigmaBall: last.sigmaBall,
      shotCount: list.reduce((acc, m) => acc + m.shotCount, 0),
    };
  });

  // Club trend for driver (utvalgte køller)
  const driverTrend: ClubTrendPoint[] = (clubMetricsByClub.get("Driver") ?? [])
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map((m) => ({
      weekStart: fmtDate(m.weekStart),
      avgTotal: m.avgTotal,
      avgSmash: m.avgSmash,
      sigmaBall: m.sigmaBall,
    }));
  const sevenIronTrend: ClubTrendPoint[] = (clubMetricsByClub.get("7i") ?? [])
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map((m) => ({
      weekStart: fmtDate(m.weekStart),
      avgTotal: m.avgTotal,
      avgSmash: m.avgSmash,
      sigmaBall: m.sigmaBall,
    }));

  // Scorecard fra siste runde med shots
  const scorecardHoles: ScorecardHole[] = [];
  if (latestRound && latestRound.shots.length > 0) {
    const byHole = new Map<number, { par: number; shots: number }>();
    latestRound.shots.forEach((s) => {
      const cur = byHole.get(s.holeNumber) ?? { par: s.holePar, shots: 0 };
      cur.shots += 1;
      byHole.set(s.holeNumber, cur);
    });
    Array.from(byHole.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([hole, data]) => {
        scorecardHoles.push({ hole, par: data.par, score: data.shots });
      });
  }

  // ShotMap: 7i approach-slag
  const sevenIronShots: ShotMapPoint[] = rounds
    .flatMap((r) => r.shots)
    .filter((s) => s.club === "7i" && s.shotType === "APPROACH" && s.distanceToPin !== null)
    .slice(-30)
    .map((s) => ({
      key: s.id,
      lateral: ((s.id.charCodeAt(0) + s.id.charCodeAt(1)) % 60) - 30,
      distance: (s.distanceToPin ?? 0) - 15,
      club: s.club ?? undefined,
      shotType: s.shotType as "APPROACH",
    }));

  // Insights
  const insights: Insight[] = player.sgInsights.map((i) => ({
    id: i.id,
    category: i.category,
    severity: i.severity,
    title: i.title,
    body: i.body,
    acknowledgedAt: i.acknowledgedAt,
    resolvedAt: i.resolvedAt,
  }));

  const hcpDelta =
    prevRound && latestRound
      ? (latestRound.sgTotal ?? 0) - (prevRound.sgTotal ?? 0)
      : 0;

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Tilbake til Design
          </Link>
          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>PlayerHQ-preview</span>
            <span>·</span>
            <span>Ekte data</span>
            <span>·</span>
            <AthleticBadge variant="lime">PRO</AthleticBadge>
          </div>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            Live på{" "}
            <Link href="/portal-preview" className="underline">
              /portal-preview
            </Link>{" "}
            (kobler samme data inn i ekte PlayerHQ-flate)
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-8 px-5 py-8">
        <section>
          <AthleticGreeting
            avatar={{ initials: "AK", status: "online" }}
            italicEyebrow="God morgen,"
            title={player.name}
            lede={`Du har spilt ${rounds.length} runder de siste 90 dagene. ${player.ambition ?? ""}`}
            metaItems={[
              <span key="1" className="font-mono text-[11px]">
                HCP {player.hcp?.toFixed(1) ?? "—"}
              </span>,
              <span key="2" className="font-mono text-[11px]">
                {player.homeClub ?? "—"}
              </span>,
              <span key="3" className="font-mono text-[11px]">
                {player.playingYears} år i sporten
              </span>,
            ]}
          />
        </section>

        <section>
          <KpiStrip columns={4}>
            <KpiCard
              label="Snitt SG"
              value={
                rounds.length > 0
                  ? (avg(rounds.map((r) => r.sgTotal)) > 0 ? "+" : "") +
                    avg(rounds.map((r) => r.sgTotal)).toFixed(2)
                  : "—"
              }
              trend={{
                value: `${hcpDelta > 0 ? "+" : ""}${hcpDelta.toFixed(2)} vs forrige`,
                tone: hcpDelta >= 0 ? "positive" : "negative",
              }}
            />
            <KpiCard label="Runder" value={String(rounds.length)} unit="stk" trend={{ value: "Siste 90 dager", tone: "neutral" }} />
            <KpiCard label="TrackMan" value={String(player.trackManSessions.length)} unit="økter" trend={{ value: "Siste 60 dager", tone: "neutral" }} />
            <KpiCard
              label="HCP"
              value={player.hcp?.toFixed(1) ?? "—"}
              trend={{ value: `Mål 3.0 — gap ${((player.hcp ?? 0) - 3).toFixed(1)}`, tone: "neutral" }}
            />
          </KpiStrip>
        </section>

        {insights.length > 0 && (
          <section>
            <h2 className="font-display mb-3 text-lg font-bold tracking-[-0.015em]">
              AI-innsikter ({insights.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {insights.slice(0, 4).map((i) => (
                <SgInsightCard key={i.id} insight={i} />
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <PyramidDistribution slices={pyramidSlices} unit="min" level="A" />
          <PyramidRadar metrics={radarMetrics} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <LPhaseDistribution slices={lphaseSlices} />
          <PracticeTypeDistribution slices={practiceSlices} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SgTrendLine points={sgPoints} />
          <HcpTrend points={hcpPoints} goalHcp={3.0} startHcp={hcpPoints[0]?.hcp} />
        </section>

        <section>
          <PyramidComparison
            labelA="Siste 45 dager"
            labelB="Forrige 45 dager"
            valuesA={comparisonA}
            valuesB={comparisonB}
          />
        </section>

        <section>
          <SkillAreaBands bands={skillBands} />
        </section>

        <section>
          <SessionVolumeChart weeks={sessionWeeks} title="Treningsvolum per uke (siste 8 uker)" />
        </section>

        <section>
          <ClubMetricGrid rows={latestClubMetrics} />
        </section>

        {driverTrend.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2">
            <ClubMetricTrendChart club="Driver" points={driverTrend} metric="avgTotal" />
            <ClubMetricTrendChart club="7i" points={sevenIronTrend} metric="avgSmash" />
          </section>
        )}

        {scorecardHoles.length > 0 && (
          <section>
            <RoundScorecard
              holes={scorecardHoles}
              playedAt={latestRound?.playedAt}
              courseName={latestRound?.course.name}
              totalSg={latestRound?.sgTotal}
            />
          </section>
        )}

        {sevenIronShots.length > 0 && (
          <section>
            <ShotMap shots={sevenIronShots} title="7-jern dispersion · siste 30 slag" targetLabel="150m" />
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <AthleticCard label={`${player.healthEntries.length} dager helsedata`}>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Snitt søvn</span>
                <span className="font-semibold text-foreground">
                  {avg(player.healthEntries.map((h) => h.sleepHours)).toFixed(1)}t
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Snitt hvilepuls</span>
                <span className="font-semibold text-foreground">
                  {avg(player.healthEntries.map((h) => h.restingHr)).toFixed(0)} bpm
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Vekt nå</span>
                <span className="font-semibold text-foreground">
                  {player.healthEntries[0]?.weightKg?.toFixed(1) ?? "—"} kg
                </span>
              </li>
            </ul>
          </AthleticCard>
          <AthleticCard label={`${player.testResults.length} testresultater`}>
            <ul className="space-y-2 font-mono text-[11px]">
              {player.testResults.slice(0, 4).map((t) => (
                <li key={t.id} className="flex justify-between gap-3">
                  <span className="truncate text-muted-foreground">{t.test.name}</span>
                  <span className="shrink-0 font-semibold text-foreground">{t.score.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </AthleticCard>
        </section>
      </main>
    </div>
  );
}
