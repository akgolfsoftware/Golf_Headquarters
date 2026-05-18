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
  DayPlanner,
  FeaturedCard,
  KpiCard,
  KpiStrip,
  LPhaseDistribution,
  MonthGrid,
  PeriodTimeline,
  PracticeTypeDistribution,
  PulseDot,
  PyramidDistribution,
  SessionVolumeChart,
  SgInsightCard,
  WeekGrid,
  YearPlanGantt,
  type Insight,
  type LPhaseSlice,
  type MonthDayCell,
  type Period,
  type PeriodMarker,
  type PlannerSlot,
  type PracticeSlice,
  type PyramidSlice,
  type SessionVolumeWeek,
  type WeekEvent,
  type YearMilestone,
  type YearPhase,
} from "@/components/athletic";

export const dynamic = "force-dynamic";

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

export default async function PortalPlanleggerPage() {
  const player = await prisma.user.findUnique({
    where: { email: PLAYER_EMAIL },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: { sessions: { orderBy: { scheduledAt: "asc" } } },
      },
      sgInsights: {
        where: { resolvedAt: null, category: { in: ["TRAINING_GAP", "PROGRESSION_TREND"] } },
        take: 2,
      },
    },
  });

  if (!player) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">Spiller-profil mangler.</p>
      </div>
    );
  }

  const today = new Date(2026, 4, 18);
  const plan = player.trainingPlans[0];
  const sessions = plan?.sessions ?? [];

  // Plan-stats
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const upcomingSessions = sessions.filter((s) => s.scheduledAt >= today);
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const completedMinutes = completedSessions.reduce((acc, s) => acc + s.durationMin, 0);
  const progressPct = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
  const nextSession = upcomingSessions[0];

  // Pyramide-fordeling
  const minPerArea = new Map<string, number>();
  sessions.forEach((s) => {
    minPerArea.set(s.pyramidArea, (minPerArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  });
  const pyramidSlices: PyramidSlice[] = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => ({
    area,
    current: minPerArea.get(area) ?? 0,
    recommended: area === "TEK" ? 25 : area === "SLAG" ? 30 : area === "SPILL" ? 30 : area === "TURN" ? 20 : 15,
  }));

  // L-phase
  const lphaseMin = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.lPhase) lphaseMin.set(s.lPhase, (lphaseMin.get(s.lPhase) ?? 0) + s.durationMin);
  });
  const lphaseSlices: LPhaseSlice[] = (["GRUNN", "SPESIAL", "TURNERING"] as const).map((phase) => ({
    phase,
    minutes: lphaseMin.get(phase) ?? 0,
  }));

  // Practice
  const practiceSlices: PracticeSlice[] = [
    { type: "BLOKK", count: Math.round(sessions.length * 0.35) },
    { type: "RANDOM", count: Math.round(sessions.length * 0.3) },
    { type: "KONKURRANSE", count: Math.round(sessions.length * 0.2) },
    { type: "SPILL_TEST", count: Math.round(sessions.length * 0.15) },
  ];

  // Årsplan-faser
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
    { key: "m3", month: 3, day: 20, label: "TrackMan-test", type: "test" },
  ];

  // Period timeline (84-dagers blokk)
  const periods: Period[] = [
    { key: "f1", label: "Akkumulering", startDay: 0, endDay: 21, focus: "Volum · 80% terskel", tone: "primary" },
    { key: "f2", label: "Intensivering", startDay: 21, endDay: 49, focus: "Kvalitet · spesifikk", tone: "moss" },
    { key: "f3", label: "Realisering", startDay: 49, endDay: 70, focus: "Peak · NM-prep", tone: "accent" },
    { key: "f4", label: "Restitusjon", startDay: 70, endDay: 84, focus: "Aktiv hvile", tone: "muted" },
  ];
  const periodMarkers: PeriodMarker[] = [
    { key: "k1", day: 14, label: "Test 1", type: "test" },
    { key: "k2", day: 42, label: "Test 2", type: "test" },
    { key: "k3", day: 56, label: "NM-kval", type: "tournament" },
    { key: "k4", day: 70, label: "Review", type: "review" },
  ];

  // Month grid med planlagte økter
  const monthCells: MonthDayCell[] = sessions
    .filter((s) => s.scheduledAt.getMonth() === today.getMonth())
    .map((s) => ({
      date: s.scheduledAt,
      sessions: 1,
      events: [{ key: s.id, label: s.title, tone: "primary" as const }],
      highlight: s.scheduledAt.toDateString() === today.toDateString() ? "today" : undefined,
    }));

  // Week grid med kommende uke
  const weekStart = addDays(today, -((today.getDay() + 6) % 7));
  const weekEvents: WeekEvent[] = sessions
    .filter((s) => {
      const diff = (s.scheduledAt.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 7;
    })
    .map((s, i) => {
      const dayIndex = Math.floor((s.scheduledAt.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      const startHour = 9 + (i % 3) * 2;
      return {
        key: s.id,
        dayIndex: Math.max(0, Math.min(6, dayIndex)),
        startHour,
        endHour: startHour + s.durationMin / 60,
        title: s.title,
        category: s.skillArea ?? s.pyramidArea,
        tone: s.pyramidArea === "FYS" ? "moss" : s.pyramidArea === "TURN" ? "accent" : "primary",
      } as WeekEvent;
    });

  // Day planner — slot for neste økt
  const dayPlannerSlots: PlannerSlot[] = nextSession
    ? [
        {
          key: nextSession.id,
          startHour: nextSession.scheduledAt.getHours() || 10,
          duration: nextSession.durationMin,
          title: nextSession.title,
          category: nextSession.skillArea ?? nextSession.pyramidArea,
          intensity:
            nextSession.pressureLevel === "PR5" ? "high" : nextSession.pressureLevel === "PR3" ? "medium" : "low",
          participants: 1,
          notes: nextSession.rationale ?? undefined,
          status: "planned",
        },
      ]
    : [];

  // Volume per week
  const weekMap = new Map<string, SessionVolumeWeek>();
  sessions.forEach((s) => {
    const k = weekKey(s.scheduledAt);
    const e = weekMap.get(k) ?? { week: k, FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    const area = s.pyramidArea as keyof Omit<SessionVolumeWeek, "week">;
    e[area] = (e[area] ?? 0) + s.durationMin;
    weekMap.set(k, e);
  });
  const sessionWeeks = Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week));

  const insights: Insight[] = player.sgInsights.map((i) => ({
    id: i.id,
    category: i.category,
    severity: i.severity,
    title: i.title,
    body: i.body,
    acknowledgedAt: i.acknowledgedAt,
    resolvedAt: i.resolvedAt,
  }));

  const nextActions = [
    {
      key: "1",
      numeric: "1",
      title: nextSession ? `Forbered: ${nextSession.title}` : "Sjekk neste økt",
      meta: nextSession ? nextSession.scheduledAt.toLocaleDateString("nb-NO", { weekday: "long" }) : "—",
    },
    { key: "2", numeric: "2", title: "Logg gjennomført økt i går", meta: "5 min", tone: "neutral" as const },
    { key: "3", numeric: "3", title: "Sjekk dagens kapasitet (CTL/ATL)", meta: "2 min", tone: "neutral" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AthleticHero
        eyebrow={`TRENINGSPLANLEGGER · ${plan?.name?.toUpperCase() ?? "INGEN AKTIV PLAN"}`}
        weather={{ label: `${progressPct}% FULLFØRT`, pulse: true }}
        height="md"
      >
        <div className="px-5 pb-5">
          <Link
            href="/portal-preview"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Til PlayerHQ
          </Link>
        </div>
      </AthleticHero>

      <main className="mx-auto -mt-12 max-w-5xl space-y-6 px-5 pb-12 relative z-10">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
          <AthleticGreeting
            avatar={{ initials: "AK", status: "online" }}
            italicEyebrow="Min treningsplan"
            title={plan?.name ?? "Vår-progresjon 2026"}
            lede={`${sessions.length} planlagte økter · ${plan?.startDate.toLocaleDateString("nb-NO") ?? ""} → ${plan?.endDate?.toLocaleDateString("nb-NO") ?? "åpen"}`}
            metaItems={[
              <span key="1" className="font-mono text-[11px] flex items-center gap-1.5">
                <PulseDot size="sm" />
                Aktiv
              </span>,
              <AthleticBadge key="2" variant="lime">
                {progressPct}%
              </AthleticBadge>,
            ]}
          />
        </div>

        {nextSession && (
          <FeaturedCard
            eyebrow="NESTE ØKT"
            showPulse
            title={nextSession.title}
            description={`${nextSession.scheduledAt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })} · ${nextSession.durationMin} min · ${nextSession.skillArea ?? nextSession.pyramidArea} · Press ${nextSession.pressureLevel ?? "PR3"}`}
            action={
              <AthleticButton variant="lime">
                Start <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </AthleticButton>
            }
          />
        )}

        <KpiStrip columns={4}>
          <KpiCard label="Plan-fremdrift" value={`${progressPct}%`} trend={{ value: `${completedSessions.length}/${sessions.length} økter`, tone: "positive" }} />
          <KpiCard label="Trenings-min" value={String(totalMinutes)} unit="min" trend={{ value: `${completedMinutes} gjennomført`, tone: "neutral" }} />
          <KpiCard label="Neste fase" value={periods[1].label} trend={{ value: "om 21 dager", tone: "neutral" }} />
          <KpiCard label="Neste turnering" value="21" unit="dager" trend={{ value: "Sørlandsåpent", tone: "neutral" }} />
        </KpiStrip>

        {insights.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <AthleticEyebrow>AI-coach signaler om treningsplanen</AthleticEyebrow>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {insights.map((i) => (
                <SgInsightCard key={i.id} insight={i} />
              ))}
            </div>
          </section>
        )}

        <YearPlanGantt year={2026} currentMonth={5} phases={yearPhases} milestones={yearMilestones} />

        <PeriodTimeline totalDays={84} currentDay={32} periods={periods} markers={periodMarkers} />

        <section className="grid gap-4 md:grid-cols-3">
          <PyramidDistribution slices={pyramidSlices} unit="min" level="A" />
          <LPhaseDistribution slices={lphaseSlices} />
          <PracticeTypeDistribution slices={practiceSlices} />
        </section>

        <MonthGrid year={today.getFullYear()} month={today.getMonth() + 1} cells={monthCells} />

        <WeekGrid weekStart={weekStart} todayIndex={(today.getDay() + 6) % 7} events={weekEvents} />

        {dayPlannerSlots.length > 0 && (
          <DayPlanner
            date={nextSession?.scheduledAt ?? today}
            slots={dayPlannerSlots}
            startHour={7}
            endHour={18}
          />
        )}

        <SessionVolumeChart weeks={sessionWeeks} title="Planlagt volum per uke" />

        <AthleticCard label="Dagens prioriteringer" showPulse>
          <ActionList variant="on-light" items={nextActions} />
        </AthleticCard>
      </main>
    </div>
  );
}
