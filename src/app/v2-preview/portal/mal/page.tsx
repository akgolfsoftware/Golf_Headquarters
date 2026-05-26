"use client";

import {
  ShellWrapper,
  PageHero,
  SectionHeader,
  GoalsHubPattern,
  TimelinePattern,
} from "@/components/v2";
import {
  ØYVIND_USER,
  TODAY_SESSIONS,
  WEATHER_DATA,
  DEMO_GOALS,
  DEMO_MILESTONES,
} from "@/lib/v2-fixtures";
import type { Goal } from "@/components/v2";

// Konverter fixture Goal til GoalsHubPattern sin Goal-type
// (identisk shape — direkte bruk)
const GOALS: Goal[] = DEMO_GOALS.map((g) => ({
  id: g.id,
  title: g.title,
  axis: g.axis,
  progress: g.progress,
  deadline: g.deadline,
  daysLeft: g.daysLeft,
  milestonesDone: g.milestonesDone,
  milestonesTotal: g.milestonesTotal,
  status: g.status,
}));

export default function MalSamplePage() {
  return (
    <ShellWrapper
      player={ØYVIND_USER}
      sessions={TODAY_SESSIONS}
      weather={WEATHER_DATA}
    >
      {/* Page hero */}
      <PageHero
        eyebrow="DINE MÅL"
        title="Mål"
        italic="Hvor du skal"
        lead="Oversikt over alle aktive, oppnådde og forfalte mål — sesong 2026."
        crumb="Hjem"
        crumbHref="/v2-preview/portal"
      />

      {/* GoalsHubPattern — 5 mål fra fixture */}
      <GoalsHubPattern goals={GOALS} />

      {/* Separator */}
      <div
        className="my-10 h-px"
        style={{ background: "var(--border)" }}
        role="separator"
      />

      {/* Timeline — siste 5 milepæler */}
      <section>
        <SectionHeader
          eyebrow="MILEPÆLER"
          title="Siste prestasjoner"
          description="De 5 nyeste milepælene fra trenings- og turneringshistorikken din."
          cta="Se alle"
          ctaHref="/portal/milestones"
          ghostNum="06"
        />
        <TimelinePattern
          milestones={DEMO_MILESTONES.slice(0, 5)}
          groupByYear={false}
        />
      </section>
    </ShellWrapper>
  );
}
