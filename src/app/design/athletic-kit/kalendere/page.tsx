"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  CompareCalendar,
  DayPlanner,
  HeatmapCalendar,
  LoadCalendar,
  MonthGrid,
  PeriodTimeline,
  SessionScheduler,
  StreakCalendar,
  WeekGrid,
  YearPlanGantt,
  type HeatmapDay,
  type LoadDay,
  type MonthDayCell,
  type PlannerSlot,
  type SchedulerSlot,
  type StreakDay,
  type WeekEvent,
} from "@/components/athletic";

const today = new Date(2026, 4, 18);

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function generateHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  for (let i = 0; i < 26 * 7; i++) {
    const d = addDays(today, -i);
    const day = d.getDay();
    const isRest = day === 0;
    const r = (Math.sin(i * 0.4) + Math.cos(i * 0.13)) * 0.5 + 0.5;
    days.push({ date: d, value: isRest ? 0 : Math.round(r * 120) });
  }
  return days;
}

function generateStreak(): StreakDay[] {
  const days: StreakDay[] = [];
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, -i);
    const day = d.getDay();
    let status: StreakDay["status"] = "done";
    if (day === 0) status = "rest";
    else if (i === 4 || i === 11) status = "missed";
    days.push({ date: d, status });
  }
  return days;
}

function generateLoad(): LoadDay[] {
  const days: LoadDay[] = [];
  for (let i = 41; i >= 0; i--) {
    const d = addDays(today, -i);
    const ctl = 40 + Math.sin(i * 0.15) * 10 + (41 - i) * 0.3;
    const atl = ctl + Math.sin(i * 0.4) * 12 + (i % 7 === 0 ? -10 : 5);
    days.push({ date: d, ctl, atl, tsb: ctl - atl });
  }
  return days;
}

function generateScheduler(): SchedulerSlot[] {
  const slots: SchedulerSlot[] = [];
  for (let day = 0; day < 7; day++) {
    const d = addDays(today, day);
    [9, 11, 14, 16].forEach((h) => {
      slots.push({
        key: `${day}-${h}`,
        date: d,
        hour: h,
        duration: 60,
        available: !(day === 0 && h === 9) && !(day === 3 && h === 14),
        coachName: "Anders K.",
        facility: "Performance Studio",
      });
    });
  }
  return slots;
}

function generateMonthCells(): MonthDayCell[] {
  const cells: MonthDayCell[] = [];
  const month = today.getMonth();
  const year = today.getFullYear();
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) {
    const date = new Date(year, month, i);
    const day = date.getDay();
    if (day === 0) continue;
    cells.push({
      date,
      sessions: 1,
      load: 40 + ((i * 7) % 30),
      highlight: i === today.getDate() ? "today" : i === 21 ? "tournament" : undefined,
      events: [
        { key: `${i}a`, label: "Teknikk", tone: "primary" },
        ...(i % 3 === 0 ? [{ key: `${i}b`, label: "Mental", tone: "accent" as const }] : []),
      ],
    });
  }
  return cells;
}

function generateWeekEvents(): WeekEvent[] {
  return [
    { key: "w1", dayIndex: 0, startHour: 9, endHour: 10, title: "Markus — putting", category: "Teknikk", tone: "primary" },
    { key: "w2", dayIndex: 0, startHour: 14, endHour: 15.5, title: "Aksel — iron", category: "Teknikk", tone: "primary" },
    { key: "w3", dayIndex: 1, startHour: 10, endHour: 12, title: "Gruppe A — strategi", category: "Mental", tone: "accent" },
    { key: "w4", dayIndex: 2, startHour: 8, endHour: 9, title: "Fysisk testbatteri", category: "Fysisk", tone: "moss" },
    { key: "w5", dayIndex: 2, startHour: 13, endHour: 14, title: "Fredrik — short game", category: "Teknikk", tone: "primary" },
    { key: "w6", dayIndex: 3, startHour: 11, endHour: 13, title: "Lag-snitt review", category: "Analyse", tone: "muted" },
    { key: "w7", dayIndex: 4, startHour: 9, endHour: 11, title: "Junior gruppe", category: "Bredde", tone: "primary" },
    { key: "w8", dayIndex: 5, startHour: 10, endHour: 14, title: "Lørdagsklinikk", category: "Klinikk", tone: "accent" },
  ];
}

function generateDaySlots(): PlannerSlot[] {
  return [
    {
      key: "d1",
      startHour: 8,
      duration: 60,
      title: "Oppvarming + fysisk",
      category: "Fysisk",
      intensity: "low",
      participants: 6,
      notes: "Mobilitet 15 min + lett kondisjon",
      status: "completed",
    },
    {
      key: "d2",
      startHour: 9.5,
      duration: 90,
      title: "Markus R. — short game block",
      category: "Teknikk",
      intensity: "high",
      participants: 1,
      notes: "30-60m distansekontroll · 4 stasjoner",
      status: "active",
    },
    {
      key: "d3",
      startHour: 11.5,
      duration: 60,
      title: "Aksel — iron strike test",
      category: "Teknikk",
      intensity: "medium",
      participants: 1,
      status: "planned",
    },
    {
      key: "d4",
      startHour: 13.5,
      duration: 120,
      title: "Lag A — strategi-økt",
      category: "Mental",
      intensity: "medium",
      participants: 8,
      notes: "Course management + visualisering",
      status: "planned",
    },
    {
      key: "d5",
      startHour: 16,
      duration: 45,
      title: "Coach-prep neste uke",
      category: "Admin",
      intensity: "low",
      status: "planned",
    },
  ];
}

export default function CalendarKitPage() {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <Link
            href="/design/athletic-kit"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Tilbake til Kit
          </Link>
          <h1 className="font-display mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] md:text-4xl">
            <span className="block text-base font-medium italic text-primary">
              10 dynamiske kalendere
            </span>
            For treningsplanlegging og analyse
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Alle prop-drevet, mobile-vennlig og bygd på Athletic Performance-tokens. Demo-data
            er statisk her — i produksjon kommer alt fra Prisma/server-actions.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-12 px-5 py-10">
        <Section
          num="01"
          title="YearPlanGantt"
          subtitle="Årsplan med faser og milepæler"
        >
          <YearPlanGantt
            year={2026}
            currentMonth={5}
            phases={[
              { key: "p1", label: "Off-season", startMonth: 1, endMonth: 2, intensity: "base", tone: "muted" },
              { key: "p2", label: "Base build", startMonth: 3, endMonth: 4, intensity: "build", tone: "primary" },
              { key: "p3", label: "Sesong-prep", startMonth: 5, endMonth: 6, intensity: "build", tone: "moss" },
              { key: "p4", label: "Konkurranse", startMonth: 7, endMonth: 9, intensity: "peak", tone: "accent" },
              { key: "p5", label: "Avslutning", startMonth: 10, endMonth: 11, intensity: "recovery", tone: "gold" },
              { key: "p6", label: "Restitusjon", startMonth: 12, endMonth: 12, intensity: "recovery", tone: "muted" },
            ]}
            milestones={[
              { key: "m1", month: 6, day: 8, label: "Sørlandsåpent", type: "tournament" },
              { key: "m2", month: 8, day: 15, label: "NM", type: "tournament" },
              { key: "m3", month: 3, day: 20, label: "TrackMan-test", type: "test" },
              { key: "m4", month: 10, day: 10, label: "Sesongreview", type: "review" },
            ]}
          />
        </Section>

        <Section num="02" title="MonthGrid" subtitle="Måneds-grid med økter, belastning og hendelser">
          <MonthGrid year={2026} month={5} cells={generateMonthCells()} />
        </Section>

        <Section num="03" title="WeekGrid" subtitle="Uke × tidslots — klikk for å booke">
          <WeekGrid
            weekStart={addDays(today, -((today.getDay() + 6) % 7))}
            todayIndex={(today.getDay() + 6) % 7}
            events={generateWeekEvents()}
          />
        </Section>

        <Section num="04" title="DayPlanner" subtitle="Dag-detail med status, intensitet og notater">
          <DayPlanner
            date={today}
            slots={generateDaySlots()}
            nowHour={11.25}
            startHour={7}
            endHour={18}
          />
        </Section>

        <Section num="05" title="PeriodTimeline" subtitle="Periodisering med faser og milepæler">
          <PeriodTimeline
            totalDays={84}
            currentDay={32}
            periods={[
              { key: "f1", label: "Akkumulering", startDay: 0, endDay: 21, focus: "Volum · 80% terskel", tone: "primary" },
              { key: "f2", label: "Intensivering", startDay: 21, endDay: 49, focus: "Kvalitet · spesifikk", tone: "moss" },
              { key: "f3", label: "Realisering", startDay: 49, endDay: 70, focus: "Peak · turnering", tone: "accent" },
              { key: "f4", label: "Restitusjon", startDay: 70, endDay: 84, focus: "Aktiv hvile", tone: "muted" },
            ]}
            markers={[
              { key: "k1", day: 14, label: "Test 1", type: "test" },
              { key: "k2", day: 42, label: "Test 2", type: "test" },
              { key: "k3", day: 56, label: "NM-kval", type: "tournament" },
              { key: "k4", day: 70, label: "Review", type: "review" },
            ]}
          />
        </Section>

        <Section num="06" title="SessionScheduler" subtitle="Slot-picker — booking-flyt">
          <SessionScheduler
            slots={generateScheduler()}
            startDate={today}
            selectedKey="2-11"
          />
        </Section>

        <Section num="07" title="HeatmapCalendar" subtitle="GitHub-stil 26 uker">
          <HeatmapCalendar days={generateHeatmap()} title="Treningstimer siste 6 mnd" unit="min" />
        </Section>

        <Section num="08" title="StreakCalendar" subtitle="Konsistens siste 30 dager">
          <StreakCalendar days={generateStreak()} totalDays={30} goalLabel="Treningsstreak" />
        </Section>

        <Section num="09" title="LoadCalendar" subtitle="CTL/ATL/TSB-belastning">
          <LoadCalendar days={generateLoad()} title="Treningsbelastning siste 42 dager" />
        </Section>

        <Section num="10" title="CompareCalendar" subtitle="To perioder side-om-side">
          <CompareCalendar
            metricLabel="Treningsvolum"
            unit="min"
            periodA={{
              label: "Denne måneden",
              startDate: new Date(2026, 4, 1),
              endDate: new Date(2026, 4, 18),
              values: Array.from({ length: 18 }, (_, i) => ({
                date: new Date(2026, 4, i + 1),
                value: 60 + Math.round(Math.sin(i * 0.5) * 40 + i * 2),
              })),
            }}
            periodB={{
              label: "Forrige måned",
              startDate: new Date(2026, 3, 1),
              endDate: new Date(2026, 3, 18),
              values: Array.from({ length: 18 }, (_, i) => ({
                date: new Date(2026, 3, i + 1),
                value: 55 + Math.round(Math.cos(i * 0.4) * 30 + i * 1.2),
              })),
            }}
          />
        </Section>
      </main>
    </div>
  );
}

function Section({
  num,
  title,
  subtitle,
  children,
}: {
  num: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {num}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-[-0.015em] md:text-2xl">{title}</h2>
          <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
