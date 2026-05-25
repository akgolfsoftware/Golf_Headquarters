"use client";

import { useRef } from "react";
import {
  ShellWrapper,
  PhotoHero,
  SectionHeader,
  ItineraryList,
  InsightCard,
  PyramidBar,
  StatTile,
  QuickAction,
  TournamentCard,
  WellnessCard,
  PhotoDivider,
  useNowTime,
  useInView,
} from "@/components/v2";
import {
  ØYVIND_USER,
  TODAY_SESSIONS,
  TOURNAMENT_NEXT,
  TOURNAMENT_CHECKLIST,
  AI_INSIGHTS,
  WEEK_PROGRESS,
  WEEK_SUMMARY,
  QUICK_ACTIONS_LIST,
  WEATHER_DATA,
} from "@/lib/v2-fixtures";

export default function PortalSamplePage() {
  const nowTime = useNowTime();
  const pyramidRef = useRef<HTMLDivElement>(null);
  const pyramidInView = useInView(pyramidRef);

  return (
    <ShellWrapper
      player={ØYVIND_USER}
      sessions={TODAY_SESSIONS}
      weather={WEATHER_DATA}
    >
      <div className="space-y-10 lg:space-y-12">

        {/* PhotoHero */}
        <PhotoHero
          player={ØYVIND_USER}
          tournament={TOURNAMENT_NEXT}
          heroImg={1}
        />

        {/* 01 · Programmet i dag */}
        <section>
          <SectionHeader
            eyebrow="01 · PROGRAMMET I DAG"
            title="Dagens program"
            description="Alle planlagte og gjennomførte økter for mandag 25. mai."
            ghostNum="01"
          />
          <ItineraryList
            sessions={TODAY_SESSIONS}
            nowDecimal={nowTime.decimal}
          />
        </section>

        {/* Photo divider */}
        <PhotoDivider
          img={3}
          kicker="AK GOLF ACADEMY · VINTER 2026"
          line="Spesialisering handler ikke om mengde — det handler om presisjon."
          dateLabel="AK GOLF ACADEMY · 25/05/26"
        />

        {/* 02 · Fra Caddie */}
        <section>
          <SectionHeader
            eyebrow="02 · FRA CADDIE"
            title="AI-innsikt"
            description="Tre observasjoner fra Caddie basert på din siste uke med data."
            cta="Se alt"
            ctaHref="/stats"
            ghostNum="02"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_INSIGHTS.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        {/* 03 · Ukas progresjon */}
        <section>
          <SectionHeader
            eyebrow="03 · UKAS PROGRESJON"
            title="Tidsfordeling"
            description="Faktisk vs. planlagt tid per treningsakse denne uka."
            ghostNum="03"
          />
          <div
            ref={pyramidRef}
            className="flex flex-col gap-4 p-6 rounded-[20px] border border-border"
            style={{ background: "var(--card)" }}
          >
            {WEEK_PROGRESS.map((row, i) => (
              <PyramidBar
                key={row.axis}
                row={row}
                inView={pyramidInView}
                delayIdx={i}
              />
            ))}
          </div>
          <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
            {WEEK_SUMMARY.map((tile, i) => (
              <StatTile key={tile.label} tile={tile} idx={i} />
            ))}
          </div>
        </section>

        {/* 04 · Snarveier */}
        <section>
          <SectionHeader
            eyebrow="04 · SNARVEIER"
            title="Hurtighandlinger"
            ghostNum="04"
          />
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
            {QUICK_ACTIONS_LIST.map((action) => (
              <QuickAction key={action.id} action={action} />
            ))}
          </div>
        </section>

        {/* Photo divider */}
        <PhotoDivider
          img={7}
          kicker="SØRLANDSÅPENT 2026"
          line="3 dager til turnering. Fokus er satt — planen er klar."
          dateLabel="KRISTIANSAND GK · 28-30/05/26"
        />

        {/* 05 · Turnering + Velvære */}
        <section>
          <SectionHeader
            eyebrow="05 · TURNERING + VELVÆRE"
            title="Neste konkurranse"
            ghostNum="05"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <TournamentCard
              tournament={TOURNAMENT_NEXT}
              checklist={TOURNAMENT_CHECKLIST}
              statsHref="/stats"
            />
            <WellnessCard
              wellness={{
                energi: 7,
                energiMax: 10,
                søvn: 7.4,
                søvnUnit: "t",
                hrv: 65,
                hrvDelta: 3,
                stress: "Lav",
              }}
            />
          </div>
        </section>

      </div>
    </ShellWrapper>
  );
}
