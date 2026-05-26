"use client";

import { useRef, useState } from "react";
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
  PartnerCard,
  CoachMessage,
  StubModal,
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
  TRAINING_PARTNERS,
  COACH_THREADS,
  COACH_DATA,
} from "@/lib/v2-fixtures";
import {
  Award,
  Flame,
  Target,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// ─── Streak / achievement strip data ────────────────────────────

const ACHIEVEMENTS = [
  {
    id: "a1",
    icon: Flame,
    label: "12 dager på rad",
    sub: "Treningsstreak",
    tone: "accent" as const,
  },
  {
    id: "a2",
    icon: Award,
    label: "Beste putting uka",
    sub: "Snittscore 1.72",
    tone: "default" as const,
  },
  {
    id: "a3",
    icon: Target,
    label: "Ny drill mestret",
    sub: "Gate-drill 50cm",
    tone: "default" as const,
  },
  {
    id: "a4",
    icon: TrendingUp,
    label: "HCP forbedret",
    sub: "−0.3 denne måneden",
    tone: "default" as const,
  },
];

export default function PortalSamplePage() {
  const nowTime = useNowTime();
  const pyramidRef = useRef<HTMLDivElement>(null);
  const pyramidInView = useInView(pyramidRef);

  const [coachModalOpen, setCoachModalOpen] = useState(false);

  return (
    <ShellWrapper
      player={ØYVIND_USER}
      sessions={TODAY_SESSIONS}
      weather={WEATHER_DATA}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-10 lg:space-y-12">

        {/* ── PhotoHero ────────────────────────────────────────── */}
        <PhotoHero
          player={ØYVIND_USER}
          tournament={TOURNAMENT_NEXT}
          heroImg={1}
        />

        {/* ── Achievement / Streak strip ───────────────────────── */}
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-3 pb-2 w-max min-w-full">
            {ACHIEVEMENTS.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px] border border-border flex-shrink-0"
                  style={{
                    background:
                      a.tone === "accent"
                        ? "color-mix(in oklab, var(--accent) 18%, var(--card))"
                        : "var(--card)",
                    minWidth: 180,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full grid place-items-center flex-shrink-0"
                    style={{
                      background:
                        a.tone === "accent"
                          ? "var(--accent)"
                          : "color-mix(in oklab, var(--primary) 12%, transparent)",
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      style={{
                        color:
                          a.tone === "accent"
                            ? "var(--accent-foreground)"
                            : "var(--primary)",
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-[13px] text-foreground leading-tight">
                      {a.label}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground tracking-[0.05em] mt-[2px]">
                      {a.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 01 · Programmet i dag ────────────────────────────── */}
        <section className="relative">
          <SectionHeader
            eyebrow="PROGRAMMET I DAG"
            title="Dagens program"
            description="Alle planlagte og gjennomførte økter for mandag 26. mai."
            ghostNum="01"
          />
          <ItineraryList
            sessions={TODAY_SESSIONS}
            nowDecimal={nowTime.decimal}
          />
        </section>

        {/* ── 02 · Fra Caddie ──────────────────────────────────── */}
        <section className="relative">
          <SectionHeader
            eyebrow="FRA CADDIE"
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

        {/* ── Coach melding (mellomsnitt) ────────────────────────── */}
        <section>
          <div
            className="rounded-[18px] border border-border overflow-hidden"
            style={{ background: "var(--card)" }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-border"
              style={{
                background: "color-mix(in oklab, var(--primary) 8%, var(--card))",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Coach avatar */}
                <div
                  className="w-9 h-9 rounded-full grid place-items-center font-display font-bold text-[12px] flex-shrink-0"
                  style={{
                    background: "var(--primary)",
                    color: "var(--accent)",
                  }}
                >
                  AK
                </div>
                <div>
                  <div className="font-display font-semibold text-[14px] text-foreground">
                    {COACH_DATA.name}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground tracking-[0.06em]">
                    {COACH_DATA.role}
                  </div>
                </div>
              </div>

              {COACH_THREADS[0].unread && (
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-[4px] rounded-full"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                  }}
                >
                  Ulest
                </span>
              )}
            </div>

            {/* Message thread row — uses CoachMessage */}
            <div className="px-2 py-2">
              <CoachMessage
                thread={COACH_THREADS[0]}
                onClick={() => setCoachModalOpen(true)}
              />
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">
                Sendt {COACH_THREADS[0].date}
              </span>
              <button
                type="button"
                onClick={() => setCoachModalOpen(true)}
                className="inline-flex items-center gap-[6px] font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground"
              >
                Åpne meldingen <ChevronRight size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>

        {/* ── 03 · Ukas progresjon ─────────────────────────────── */}
        <section className="relative">
          <SectionHeader
            eyebrow="UKAS PROGRESJON"
            title="Tidsfordeling"
            description="Faktisk vs. planlagt tid per treningsakse denne uka."
            ghostNum="03"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pyramid bars */}
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

            {/* Stat tiles + context */}
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 grid-cols-2">
                {WEEK_SUMMARY.map((tile, i) => (
                  <StatTile key={tile.label} tile={tile} idx={i} />
                ))}
              </div>
              {/* Context paragraph */}
              <div
                className="rounded-[14px] border border-border px-5 py-4"
                style={{ background: "var(--card)" }}
              >
                <p className="m-0 text-[13px] text-muted-foreground leading-[1.65]">
                  <span className="font-semibold text-foreground">Denne uka:</span>{" "}
                  FYS og TEK er over mål (+15 og +10 pp), mens SLAG, SPILL og TURN
                  ligger under. Sørlandsåpent om 3 dager — prioriter mental
                  forberedelse og wedge-økt i dag.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Photo divider 03→04 ───────────────────────────────── */}
        <PhotoDivider
          img={22}
          kicker="DAG 147 · UKE 21 AV 52"
          line="Sørlandsåpent fredag — fokus mental forberedelse."
          dateLabel="AK GOLF ACADEMY · 26/05/26"
        />

        {/* ── 04 · Snarveier ───────────────────────────────────── */}
        <section className="relative">
          <SectionHeader
            eyebrow="SNARVEIER"
            title="Hurtighandlinger"
            ghostNum="04"
          />
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
            {QUICK_ACTIONS_LIST.map((action) => (
              <QuickAction key={action.id} action={action} />
            ))}
          </div>
        </section>

        {/* ── Photo divider 04→05 ───────────────────────────────── */}
        <PhotoDivider
          img={7}
          kicker="SØRLANDSÅPENT 2026"
          line="3 dager til turnering. Fokus er satt — planen er klar."
          dateLabel="KRISTIANSAND GK · 28-30/05/26"
        />

        {/* ── 05 · Turnering + Velvære ─────────────────────────── */}
        <section className="relative">
          <SectionHeader
            eyebrow="TURNERING + VELVÆRE"
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

        {/* ── 06 · Tren sammen ─────────────────────────────────── */}
        <section className="relative">
          <SectionHeader
            eyebrow="TREN SAMMEN"
            title="Treningskompiser"
            cta="Inviter en kompis"
            ctaHref="/portal/gjennomfore"
            ghostNum="06"
          />
          <div className="-mx-4 px-4 overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
              {TRAINING_PARTNERS.map((p) => (
                <div key={p.id} style={{ width: 280, flexShrink: 0 }}>
                  <PartnerCard partner={p} />
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ── Coach message stub modal ─────────────────────────────── */}
      <StubModal
        open={coachModalOpen}
        onClose={() => setCoachModalOpen(false)}
        title={COACH_THREADS[0].subject}
        description={`Fra ${COACH_DATA.name} · ${COACH_THREADS[0].date}`}
      >
        <p className="m-0 text-[14px] text-foreground whitespace-pre-line leading-[1.6]">
          {COACH_THREADS[0].body}
        </p>
      </StubModal>
    </ShellWrapper>
  );
}
