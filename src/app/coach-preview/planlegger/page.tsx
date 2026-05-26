import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  AthleticBadge,
  AthleticButton,
  AthleticCard,
  AthleticEyebrow,
  AthleticGreeting,
  AthleticHero,
  KpiCard,
  KpiStrip,
  LPhaseDistribution,
  MonthGrid,
  PeriodTimeline,
  PracticeTypeDistribution,
  PulseDot,
  PyramidComparison,
  PyramidDistribution,
  QueueList,
  SessionVolumeChart,
  WeekGrid,
  YearPlanGantt,
  type LPhaseSlice,
  type MonthDayCell,
  type Period,
  type PeriodMarker,
  type PracticeSlice,
  type PyramidSlice,
  type PyramidValue,
  type QueueItemData,
  type SessionVolumeWeek,
  type WeekEvent,
  type YearMilestone,
  type YearPhase,
} from "@/components/athletic";

export const dynamic = "force-dynamic";

const COACH_EMAIL = "anders@akgolf.no";
const PLAYER_EMAIL = "anders+spiller@akgolfgroup.com";

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function weekKey(d: Date): string {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `U${week}`;
}

export default async function CoachPlanleggerPage() {
  const coach = await prisma.user.findUnique({
    where: { email: COACH_EMAIL },
    select: { id: true, name: true, role: true },
  });

  // Henter alle aktive planer (coach ser alle spillere)
  const activePlans = await prisma.trainingPlan.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, name: true, hcp: true, avatarUrl: true } },
      sessions: { orderBy: { scheduledAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  // Fokus-spiller: Anders som spiller
  const focusUser = await prisma.user.findUnique({
    where: { email: PLAYER_EMAIL },
    select: { id: true },
  });
  const focusPlan = activePlans.find((p) => p.user.id === focusUser?.id) ?? activePlans[0];
  const focusSessions = focusPlan?.sessions ?? [];

  const today = new Date(2026, 4, 18);

  // KPI: planer å godkjenne (DRAFT/PENDING)
  const pendingApprovals = await prisma.trainingPlan.count({
    where: { status: { in: ["DRAFT", "PENDING_PLAYER"] } },
  });

  const totalPlayers = await prisma.user.count({ where: { role: "PLAYER" } });

  // Pyramide og fordeling for fokus-spillerens plan
  const minPerArea = new Map<string, number>();
  focusSessions.forEach((s) => {
    minPerArea.set(s.pyramidArea, (minPerArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  });
  const pyramidSlices: PyramidSlice[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => ({
    area,
    current: minPerArea.get(area) ?? 0,
    recommended: area === "TEK" ? 25 : area === "SLAG" ? 30 : area === "SPILL" ? 30 : area === "TURN" ? 20 : 15,
  }));

  const lphaseMin = new Map<string, number>();
  focusSessions.forEach((s) => {
    if (s.lPhase) lphaseMin.set(s.lPhase, (lphaseMin.get(s.lPhase) ?? 0) + s.durationMin);
  });
  const lphaseSlices: LPhaseSlice[] = (["GRUNN", "SPESIAL", "TURNERING"] as const).map((phase) => ({
    phase,
    minutes: lphaseMin.get(phase) ?? 0,
  }));

  const practiceSlices: PracticeSlice[] = [
    { type: "BLOKK", count: Math.round(focusSessions.length * 0.35) },
    { type: "RANDOM", count: Math.round(focusSessions.length * 0.3) },
    { type: "KONKURRANSE", count: Math.round(focusSessions.length * 0.2) },
    { type: "SPILL_TEST", count: Math.round(focusSessions.length * 0.15) },
  ];

  // Gruppefordeling — aggregat på tvers av alle aktive planer
  const groupMinPerArea = new Map<string, number>();
  activePlans.forEach((p) => {
    p.sessions.forEach((s) => {
      groupMinPerArea.set(s.pyramidArea, (groupMinPerArea.get(s.pyramidArea) ?? 0) + s.durationMin);
    });
  });
  const groupPyramid: PyramidValue[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => ({
    area,
    value: groupMinPerArea.get(area) ?? 0,
  }));
  const focusPyramid: PyramidValue[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => ({
    area,
    value: minPerArea.get(area) ?? 0,
  }));

  // Årsplan og periodisering — felles ramme
  const yearPhases: YearPhase[] = [
    { key: "p1", label: "Off-season", startMonth: 1, endMonth: 2, intensity: "base", tone: "muted" },
    { key: "p2", label: "Base build", startMonth: 3, endMonth: 4, intensity: "build", tone: "primary" },
    { key: "p3", label: "Sesong-prep", startMonth: 5, endMonth: 6, intensity: "build", tone: "moss" },
    { key: "p4", label: "Konkurranse", startMonth: 7, endMonth: 9, intensity: "peak", tone: "accent" },
    { key: "p5", label: "Avslutning", startMonth: 10, endMonth: 11, intensity: "recovery", tone: "gold" },
    { key: "p6", label: "Hvile", startMonth: 12, endMonth: 12, intensity: "recovery", tone: "muted" },
  ];
  const yearMilestones: YearMilestone[] = [
    { key: "m1", month: 6, day: 8, label: "Sørlandsåpent", type: "tournament" },
    { key: "m2", month: 8, day: 15, label: "NM-Senior", type: "tournament" },
    { key: "m3", month: 3, day: 20, label: "Klubb-test", type: "test" },
  ];

  const periods: Period[] = [
    { key: "f1", label: "Akkumulering", startDay: 0, endDay: 21, focus: "Volum 80%", tone: "primary" },
    { key: "f2", label: "Intensivering", startDay: 21, endDay: 49, focus: "Kvalitet", tone: "moss" },
    { key: "f3", label: "Realisering", startDay: 49, endDay: 70, focus: "Peak", tone: "accent" },
    { key: "f4", label: "Restitusjon", startDay: 70, endDay: 84, focus: "Hvile", tone: "muted" },
  ];
  const periodMarkers: PeriodMarker[] = [
    { key: "k1", day: 14, label: "Test 1", type: "test" },
    { key: "k2", day: 42, label: "Test 2", type: "test" },
    { key: "k3", day: 56, label: "Turnering", type: "tournament" },
    { key: "k4", day: 70, label: "Review", type: "review" },
  ];

  // Måneds-grid med alle planlagte økter (på tvers av spillere)
  const monthCells: MonthDayCell[] = [];
  activePlans.forEach((p) => {
    p.sessions
      .filter((s) => s.scheduledAt.getMonth() === today.getMonth())
      .forEach((s) => {
        monthCells.push({
          date: s.scheduledAt,
          sessions: 1,
          events: [{ key: s.id, label: `${p.user.name}: ${s.title}`, tone: "primary" as const }],
          highlight: s.scheduledAt.toDateString() === today.toDateString() ? "today" : undefined,
        });
      });
  });

  // Ukes-grid: alle coach-økter denne uka
  const weekStart = addDays(today, -((today.getDay() + 6) % 7));
  const weekEvents: WeekEvent[] = [];
  activePlans.forEach((p, planIdx) => {
    p.sessions
      .filter((s) => {
        const diff = (s.scheduledAt.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 7;
      })
      .forEach((s, i) => {
        const dayIndex = Math.floor((s.scheduledAt.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        const startHour = 9 + ((i + planIdx) % 5) * 2;
        weekEvents.push({
          key: s.id,
          dayIndex: Math.max(0, Math.min(6, dayIndex)),
          startHour,
          endHour: startHour + s.durationMin / 60,
          title: `${p.user.name.split(" ")[0]}: ${s.title}`,
          category: s.skillArea ?? s.pyramidArea,
          tone: s.pyramidArea === "FYS" ? "moss" : s.pyramidArea === "TURN" ? "accent" : "primary",
        });
      });
  });

  // Plan-kø (status pr. plan)
  const queueItems: QueueItemData[] = activePlans.slice(0, 6).map((p) => {
    const completed = p.sessions.filter((s) => s.status === "COMPLETED").length;
    const total = p.sessions.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const variant: "ok" | "warn" | "urgent" = pct >= 80 ? "ok" : pct >= 30 ? "warn" : "urgent";
    return {
      key: p.id,
      name: p.user.name,
      detail: `${p.name} · ${completed}/${total} økter · HCP ${p.user.hcp?.toFixed(1) ?? "—"}`,
      status: { label: `${pct}%`, variant },
      avatar: {
        initials: p.user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join(""),
      },
    };
  });

  // Volum per uke (aggregat alle spillere)
  const weekMap = new Map<string, SessionVolumeWeek>();
  activePlans.forEach((p) => {
    p.sessions.forEach((s) => {
      const k = weekKey(s.scheduledAt);
      const e = weekMap.get(k) ?? { week: k, FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
      const area = s.pyramidArea as keyof Omit<SessionVolumeWeek, "week">;
      e[area] = (e[area] ?? 0) + s.durationMin;
      weekMap.set(k, e);
    });
  });
  const sessionWeeks = Array.from(weekMap.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-8);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AthleticHero
        eyebrow={`COACHHQ TRENINGSPLANLEGGER · ${(coach?.name ?? "Anders Kristiansen").toUpperCase()}`}
        weather={{ label: `${activePlans.length} AKTIVE PLANER · ${pendingApprovals} VENTER`, pulse: true }}
        height="md"
      >
        <div className="px-6 pb-6">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Design
          </Link>
        </div>
      </AthleticHero>

      <main className="mx-auto -mt-12 max-w-6xl space-y-6 px-6 pb-12 relative z-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <AthleticGreeting
              avatar={{ initials: "AK", status: "online" }}
              italicEyebrow="God morgen, Coach"
              title={coach?.name ?? "Anders Kristiansen"}
              lede={`Du følger opp ${activePlans.length} aktive planer på tvers av ${totalPlayers} spillere.`}
              metaItems={[
                <span key="1" className="font-mono text-[11px] flex items-center gap-1.5">
                  <PulseDot size="sm" />
                  {pendingApprovals} godkjenninger venter
                </span>,
                <AthleticBadge key="2" variant="primary">
                  COACH
                </AthleticBadge>,
              ]}
            />
            <AthleticButton variant="lime">
              <Plus className="h-4 w-4" strokeWidth={2} /> Ny plan
            </AthleticButton>
          </div>
        </div>

        <KpiStrip columns={4}>
          <KpiCard
            label="Aktive planer"
            value={String(activePlans.length)}
            trend={{ value: `${totalPlayers} spillere totalt`, tone: "neutral" }}
          />
          <KpiCard
            label="Godkjenninger"
            value={String(pendingApprovals)}
            trend={{
              value: pendingApprovals === 0 ? "Alt klart" : "Krever handling",
              tone: pendingApprovals === 0 ? "positive" : "negative",
            }}
          />
          <KpiCard
            label="Planlagte uker"
            value={String(sessionWeeks.length)}
            unit="uker"
            trend={{ value: "Snittvolum nå", tone: "neutral" }}
          />
          <KpiCard
            label="Snitt-løft"
            value="+0.4"
            unit="SG"
            trend={{ value: "Spillere på plan", tone: "positive" }}
          />
        </KpiStrip>

        <YearPlanGantt year={2026} currentMonth={5} phases={yearPhases} milestones={yearMilestones} />

        <PeriodTimeline totalDays={84} currentDay={32} periods={periods} markers={periodMarkers} />

        <section className="grid gap-4 md:grid-cols-3">
          <AthleticCard
            label="Spillere på plan"
            action={
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" strokeWidth={1.75} /> {queueItems.length}
              </span>
            }
            className="md:col-span-2"
          >
            <QueueList items={queueItems} />
          </AthleticCard>

          <div className="space-y-4">
            <KpiCard label="Mest brukt fase" value="GRUNN" trend={{ value: "60% av økter", tone: "neutral" }} />
            <KpiCard label="Mest brukt skill" value="TILNAERMING" trend={{ value: "35% av økter", tone: "neutral" }} />
            <KpiCard label="Press-snitt" value="PR3" trend={{ value: "Moderat", tone: "neutral" }} />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <AthleticEyebrow>Fokus: {focusPlan?.user.name ?? "—"}</AthleticEyebrow>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <PyramidDistribution slices={pyramidSlices} unit="min" level="A" title="Pyramide-fordeling" />
            <LPhaseDistribution slices={lphaseSlices} />
            <PracticeTypeDistribution slices={practiceSlices} />
          </div>
        </section>

        <PyramidComparison
          title="Fokusplan vs gruppe-snitt"
          labelA={focusPlan?.user.name ?? "Fokus"}
          labelB="Alle spillere"
          valuesA={focusPyramid}
          valuesB={groupPyramid}
        />

        <MonthGrid
          year={today.getFullYear()}
          month={today.getMonth() + 1}
          cells={monthCells}
          monthName={`${today.toLocaleDateString("nb-NO", { month: "long" })} ${today.getFullYear()} · Alle planer`}
        />

        <WeekGrid weekStart={weekStart} todayIndex={(today.getDay() + 6) % 7} events={weekEvents} />

        <SessionVolumeChart weeks={sessionWeeks} title="Treningsvolum per uke — alle aktive planer" />
      </main>
    </div>
  );
}
