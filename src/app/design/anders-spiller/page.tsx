import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  AthleticBadge,
  AthleticCard,
  AthleticGreeting,
  HcpTrend,
  KpiCard,
  KpiStrip,
  PyramidDistribution,
  PyramidRadar,
  SessionVolumeChart,
  SgTrendLine,
  SkillAreaBands,
  type HcpPoint,
  type PyramidSlice,
  type RadarMetric,
  type SessionVolumeWeek,
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

function weekKey(d: Date): string {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `U${week}`;
}

export default async function AndersSpillerPage() {
  const player = await prisma.user.findUnique({
    where: { email: PLAYER_EMAIL },
    include: {
      rounds: { orderBy: { playedAt: "asc" } },
      trackManSessions: { orderBy: { recordedAt: "desc" } },
      testResults: { include: { test: true }, orderBy: { takenAt: "desc" } },
      healthEntries: { orderBy: { date: "desc" }, take: 30 },
    },
  });

  if (!player) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Spiller-profil for Anders ikke funnet. Kjør{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            npx tsx scripts/seed-anders-spiller.ts
          </code>{" "}
          for å seede.
        </p>
      </div>
    );
  }

  const rounds = player.rounds;
  const latestRound = rounds[rounds.length - 1];
  const prevRound = rounds[rounds.length - 2];

  // SG-trend (siste 14 runder)
  const sgPoints: SgTrendPoint[] = rounds.map((r) => ({
    date: fmtDate(r.playedAt),
    sgOtt: r.sgOtt,
    sgApp: r.sgApp,
    sgArg: r.sgArg,
    sgPutt: r.sgPutt,
    sgTotal: r.sgTotal,
  }));

  // HCP-trend (simulert fra SG-trend som proxy — gir realistisk kurve)
  const hcpPoints: HcpPoint[] = rounds.map((r, i) => ({
    date: fmtDate(r.playedAt),
    hcp: Math.max(2, 6.5 - (r.sgTotal ?? 0) * 0.4 - i * 0.05),
  }));

  // Skill area-bånd (aggregat fra alle runder)
  const skillBands: SkillBand[] = [
    { key: "tee", label: "Tee total", area: "TEE", sg: avg(rounds.map((r) => r.sgTee)), volume: rounds.length * 14 },
    {
      key: "app200",
      label: "Tilnærming 200+",
      area: "APP",
      sg: avg(rounds.map((r) => r.sgApp200)),
      volume: rounds.length * 3,
    },
    {
      key: "app150",
      label: "Tilnærming 175-200",
      area: "APP",
      sg: avg(rounds.map((r) => r.sgApp150)),
      volume: rounds.length * 4,
    },
    {
      key: "app100",
      label: "Tilnærming 125-150",
      area: "APP",
      sg: avg(rounds.map((r) => r.sgApp100)),
      volume: rounds.length * 5,
    },
    {
      key: "app50",
      label: "Tilnærming 75-100",
      area: "APP",
      sg: avg(rounds.map((r) => r.sgApp50)),
      volume: rounds.length * 3,
    },
    { key: "chip", label: "Chip", area: "ARG", sg: avg(rounds.map((r) => r.sgChip)), volume: rounds.length * 4 },
    { key: "pitch", label: "Pitch", area: "ARG", sg: avg(rounds.map((r) => r.sgPitch)), volume: rounds.length * 3 },
    {
      key: "bunker",
      label: "Bunker",
      area: "ARG",
      sg: avg(rounds.map((r) => r.sgBunker)),
      volume: rounds.length * 1,
    },
    {
      key: "putt03",
      label: "Putt 0-3 ft",
      area: "PUTT",
      sg: avg(rounds.map((r) => r.sgPutt0_3)),
      volume: rounds.length * 12,
    },
    {
      key: "putt35",
      label: "Putt 3-5 ft",
      area: "PUTT",
      sg: avg(rounds.map((r) => r.sgPutt3_5)),
      volume: rounds.length * 8,
    },
    {
      key: "putt510",
      label: "Putt 5-10 ft",
      area: "PUTT",
      sg: avg(rounds.map((r) => r.sgPutt5_10)),
      volume: rounds.length * 6,
    },
  ];

  // Pyramide-fordeling (utledet fra TrackMan-økter + helse — proxy for fysisk-andel)
  // Reell mapping kommer når TrainingPlanSession er seedet
  const totalSessions = player.trackManSessions.length;
  const totalRounds = rounds.length;
  const totalTests = player.testResults.length;
  const pyramidSlices: PyramidSlice[] = [
    { area: "FYS", current: totalTests * 30, recommended: 15 },
    { area: "TEK", current: totalSessions * 45, recommended: 25 },
    { area: "SLAG", current: totalSessions * 20, recommended: 20 },
    { area: "SPILL", current: totalRounds * 60, recommended: 20 },
    { area: "TURN", current: 240, recommended: 20 },
  ];

  // Pyramid-radar (current = sg-score skalert til 0-100, mål = 90 for alle)
  const radarMetrics: RadarMetric[] = [
    { area: "FYS", current: 72, goal: 85 },
    { area: "TEK", current: 78, goal: 90 },
    { area: "SLAG", current: 70, goal: 85 },
    { area: "SPILL", current: 65, goal: 80 },
    { area: "TURN", current: 58, goal: 75 },
  ];

  // Session volume per uke (siste 6 uker)
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
  player.testResults.forEach((t) => {
    const k = weekKey(t.takenAt);
    const e = weekMap.get(k) ?? { week: k, FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    e.FYS = (e.FYS ?? 0) + 45;
    weekMap.set(k, e);
  });
  const sessionWeeks = Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);

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
            <KpiCard
              label="Runder"
              value={String(rounds.length)}
              unit="stk"
              trend={{ value: "Siste 90 dager", tone: "neutral" }}
            />
            <KpiCard
              label="TrackMan"
              value={String(totalSessions)}
              unit="økter"
              trend={{ value: "Siste 60 dager", tone: "neutral" }}
            />
            <KpiCard
              label="HCP"
              value={player.hcp?.toFixed(1) ?? "—"}
              trend={{ value: `Mål 3.0 — gap ${((player.hcp ?? 0) - 3).toFixed(1)}`, tone: "neutral" }}
            />
          </KpiStrip>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <PyramidDistribution slices={pyramidSlices} unit="min" level="A" />
          <PyramidRadar metrics={radarMetrics} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SgTrendLine points={sgPoints} />
          <HcpTrend points={hcpPoints} goalHcp={3.0} startHcp={hcpPoints[0]?.hcp} />
        </section>

        <section>
          <SkillAreaBands bands={skillBands} title="Treningsområder · gjennomsnittlig SG per bånd" />
        </section>

        <section>
          <SessionVolumeChart weeks={sessionWeeks} title="Treningsvolum per uke (siste 8 uker)" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
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
                <span className="text-muted-foreground">Vekt</span>
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
          <AthleticCard label="Beste runde">
            {latestRound ? (
              <div className="space-y-1">
                <p className="font-display text-3xl font-bold leading-none">
                  {Math.min(...rounds.map((r) => r.score))}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Lavest score
                </p>
                <p className="mt-3 font-mono text-[11px] text-foreground">
                  Snitt: {avg(rounds.map((r) => r.score)).toFixed(1)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ingen runder ennå</p>
            )}
          </AthleticCard>
        </section>
      </main>
    </div>
  );
}
