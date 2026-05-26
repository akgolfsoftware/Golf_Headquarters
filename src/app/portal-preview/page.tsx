import Link from "next/link";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ActionList,
  AthleticBadge,
  AthleticButton,
  AthleticCard,
  AthleticEyebrow,
  AthleticGreeting,
  AthleticHero,
  FeaturedCard,
  HcpTrend,
  KpiCard,
  KpiStrip,
  PulseDot,
  PyramidDistribution,
  PyramidRadar,
  SgInsightCard,
  SgTrendLine,
  SkillAreaBands,
  type HcpPoint,
  type Insight,
  type PyramidSlice,
  type RadarMetric,
  type SgTrendPoint,
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

export default async function PortalPreviewPage() {
  const player = await prisma.user.findUnique({
    where: { email: PLAYER_EMAIL },
    include: {
      rounds: { orderBy: { playedAt: "asc" } },
      trackManSessions: { orderBy: { recordedAt: "desc" }, take: 6 },
      healthEntries: { orderBy: { date: "desc" }, take: 7 },
      trainingPlans: {
        where: { isActive: true },
        include: { sessions: { orderBy: { scheduledAt: "asc" } } },
      },
      sgInsights: {
        where: { resolvedAt: null },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 3,
      },
    },
  });

  if (!player) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">Spiller-profil mangler. Seed Anders først.</p>
      </div>
    );
  }

  const rounds = player.rounds;
  const latestRound = rounds[rounds.length - 1];
  const today = new Date(2026, 4, 18);

  // Neste planlagte økt
  const upcomingSessions = (player.trainingPlans[0]?.sessions ?? []).filter(
    (s) => s.scheduledAt >= today,
  );
  const nextSession = upcomingSessions[0];

  // Pyramide fra plan
  const minutesPerArea = new Map<string, number>();
  (player.trainingPlans[0]?.sessions ?? []).forEach((s) => {
    minutesPerArea.set(s.pyramidArea, (minutesPerArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  });
  const pyramidSlices: PyramidSlice[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => ({
    area,
    current: minutesPerArea.get(area) ?? 0,
    recommended: area === "TEK" ? 25 : area === "SLAG" ? 30 : area === "SPILL" ? 30 : area === "TURN" ? 20 : 15,
  }));

  const radarMetrics: RadarMetric[] = [
    { area: "FYS", current: 72, goal: 85 },
    { area: "TEK", current: 78, goal: 90 },
    { area: "SLAG", current: 70, goal: 85 },
    { area: "SPILL", current: 65, goal: 80 },
    { area: "TURN", current: 58, goal: 75 },
  ];

  const sgPoints: SgTrendPoint[] = rounds.slice(-10).map((r) => ({
    date: fmtDate(r.playedAt),
    sgOtt: r.sgOtt,
    sgApp: r.sgApp,
    sgArg: r.sgArg,
    sgPutt: r.sgPutt,
    sgTotal: r.sgTotal,
  }));

  const hcpPoints: HcpPoint[] = rounds.slice(-12).map((r, i) => ({
    date: fmtDate(r.playedAt),
    hcp: Math.max(2, 6.5 - (r.sgTotal ?? 0) * 0.4 - i * 0.05),
  }));

  const skillBands: SkillBand[] = [
    { key: "tee", label: "Tee total", area: "TEE", sg: avg(rounds.map((r) => r.sgTee)), volume: rounds.length * 14 },
    { key: "app200", label: "200+", area: "APP", sg: avg(rounds.map((r) => r.sgApp200)), volume: rounds.length * 3 },
    { key: "app150", label: "175-200", area: "APP", sg: avg(rounds.map((r) => r.sgApp150)), volume: rounds.length * 4 },
    { key: "app100", label: "125-150", area: "APP", sg: avg(rounds.map((r) => r.sgApp100)), volume: rounds.length * 5 },
    { key: "chip", label: "Chip", area: "ARG", sg: avg(rounds.map((r) => r.sgChip)), volume: rounds.length * 4 },
    { key: "putt03", label: "Putt 0-3 ft", area: "PUTT", sg: avg(rounds.map((r) => r.sgPutt0_3)), volume: rounds.length * 12 },
    { key: "putt35", label: "Putt 3-5 ft", area: "PUTT", sg: avg(rounds.map((r) => r.sgPutt3_5)), volume: rounds.length * 8 },
  ];

  const insights: Insight[] = player.sgInsights.map((i) => ({
    id: i.id,
    category: i.category,
    severity: i.severity,
    title: i.title,
    body: i.body,
    acknowledgedAt: i.acknowledgedAt,
    resolvedAt: i.resolvedAt,
  }));

  const sleep = avg(player.healthEntries.map((h) => h.sleepHours));
  const hr = avg(player.healthEntries.map((h) => h.restingHr));
  const weight = player.healthEntries[0]?.weightKg;

  // Action list — dagens fokus
  const todayActions = [
    { key: "1", numeric: "1", title: `${nextSession?.title ?? "Putt 3-6 ft"}`, meta: nextSession ? `${nextSession.durationMin} min` : "60 min" },
    { key: "2", numeric: "2", title: "Logg gårsdagens runde", meta: "5 min", tone: "neutral" as const },
    { key: "3", numeric: "3", title: "Send rapport til coach", meta: "2 min", tone: "neutral" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Hero med portrettbilde og dagens nøkkeltall */}
      <AthleticHero
        eyebrow={`${player.homeClub?.toUpperCase()} · ${today.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}`}
        weather={{ label: "16°C · LETT BRIS · DELVIS SKYET", pulse: true }}
        height="md"
      >
        <div className="px-6 pb-6">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Tilbake
          </Link>
        </div>
      </AthleticHero>

      <main className="mx-auto -mt-12 max-w-3xl space-y-6 px-6 pb-12 relative z-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <AthleticGreeting
            avatar={{ initials: "AK", status: "online" }}
            italicEyebrow="God morgen,"
            title={player.name}
            lede={`HCP ${player.hcp?.toFixed(1)} · ${rounds.length} runder · ${player.ambition}`}
            metaItems={[
              <span key="1" className="font-mono text-[11px] flex items-center gap-1.5">
                <PulseDot size="sm" />
                Plan aktiv
              </span>,
              <AthleticBadge key="2" variant="lime">
                PRO
              </AthleticBadge>,
            ]}
          />
        </div>

        <FeaturedCard
          eyebrow="DAGENS FOKUS"
          showPulse
          title={nextSession?.title ?? "Putting 3-6m kontroll"}
          description={
            nextSession
              ? `${nextSession.durationMin} min · ${nextSession.skillArea ?? ""} · ${nextSession.environment ?? "RANGE"}`
              : "Performance Studio · Strokes Gained: Putting"
          }
          action={
            <AthleticButton variant="lime">
              Start økt <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </AthleticButton>
          }
        />

        <KpiStrip columns={4}>
          <KpiCard
            label="Snitt SG"
            value={(avg(rounds.map((r) => r.sgTotal)) > 0 ? "+" : "") + avg(rounds.map((r) => r.sgTotal)).toFixed(2)}
            trend={{ value: "Siste 10 runder", tone: "positive" }}
          />
          <KpiCard label="HCP" value={player.hcp?.toFixed(1) ?? "—"} trend={{ value: "Mål 3.0", tone: "neutral" }} />
          <KpiCard label="Søvn" value={sleep.toFixed(1)} unit="t" trend={{ value: "Siste 7 dager", tone: "neutral" }} />
          <KpiCard label="Hvilepuls" value={hr.toFixed(0)} unit="bpm" trend={{ value: weight ? `${weight.toFixed(1)}kg` : "", tone: "neutral" }} />
        </KpiStrip>

        {insights.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <AthleticEyebrow>AI-coach signaler</AthleticEyebrow>
            </div>
            <div className="space-y-2">
              {insights.map((i) => (
                <SgInsightCard key={i.id} insight={i} />
              ))}
            </div>
          </section>
        )}

        <AthleticCard label="Dagens prioriteringer" showPulse>
          <ActionList variant="on-light" items={todayActions} />
        </AthleticCard>

        <section className="grid gap-4 md:grid-cols-2">
          <PyramidDistribution slices={pyramidSlices} unit="min" level="A" />
          <PyramidRadar metrics={radarMetrics} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SgTrendLine points={sgPoints} title="SG siste 10 runder" />
          <HcpTrend points={hcpPoints} goalHcp={3.0} startHcp={hcpPoints[0]?.hcp} />
        </section>

        <section>
          <SkillAreaBands bands={skillBands} title="Treningsområder" />
        </section>

        {latestRound && (
          <section>
            <AthleticCard label="Siste runde">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-display text-3xl font-bold leading-none">{latestRound.score}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {fmtDate(latestRound.playedAt)} · {player.homeClub}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono text-base font-semibold ${
                      (latestRound.sgTotal ?? 0) >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    SG {(latestRound.sgTotal ?? 0) > 0 ? "+" : ""}
                    {(latestRound.sgTotal ?? 0).toFixed(2)}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    OTT {latestRound.sgOtt?.toFixed(2)} · APP {latestRound.sgApp?.toFixed(2)} · ARG {latestRound.sgArg?.toFixed(2)} · PUTT{" "}
                    {latestRound.sgPutt?.toFixed(2)}
                  </p>
                </div>
              </div>
            </AthleticCard>
          </section>
        )}
      </main>
    </div>
  );
}
