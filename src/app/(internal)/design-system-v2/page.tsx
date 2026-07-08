"use client";

/**
 * Design System V2 — Living Athletic Editorial
 *
 * Visual fasit: all 25 V2 components displayed with all variants.
 * Used by agents during migration Bølger 1-5 to compare implementations.
 *
 * Route: /design-system-v2 (protected by (internal) layout — ADMIN only)
 */

import { useState } from "react";
import Link from "next/link";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import {
  LiveBar,
  Topbar,
  PhotoHero,
  DetailHero,
  PageHero,
  StatTile,
  PyramidBar,
  SgBar,
  HcpDelta,
  ItineraryList,
  ItineraryRow,
  NowLine,
  InsightCard,
  PartnerCard,
  TournamentCard,
  WellnessCard,
  QuickAction,
  CoachMessage,
  CoachMessageDetail,
  SectionHeader,
  PhotoDivider,
  GhostNumber,
  StubModal,
} from "@/components/athletic";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { useNowTime } from "@/components/athletic/hooks";
import {
  ØYVIND_USER,
  TODAY_SESSIONS,
  AI_INSIGHTS,
  WEEK_PROGRESS,
  WEEK_SUMMARY,
  QUICK_ACTIONS_LIST,
  TRAINING_PARTNERS,
  TOURNAMENT_NEXT,
  TOURNAMENT_CHECKLIST,
  WELLNESS_DATA,
  WEATHER_DATA,
  COACH_THREADS,
  COACH_DATA,
} from "@/lib/v2-fixtures";

// ─── TOC sections ────────────────────────────────────────────────────────────

const TOC_ITEMS = [
  { id: "shell", label: "Shell" },
  { id: "hero", label: "Hero" },
  { id: "data", label: "Data" },
  { id: "itinerary", label: "Itinerary" },
  { id: "cards", label: "Cards" },
  { id: "editorial", label: "Editorial" },
  { id: "modals", label: "Modals" },
] as const;

// ─── Helper: ComponentShowcase ────────────────────────────────────────────────

function ComponentShowcase({
  name,
  path,
  description,
  variantLabel,
  children,
}: {
  name: string;
  path: string;
  description: string;
  variantLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          COMPONENT
        </p>
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <code className="block font-mono text-xs text-muted-foreground/70 mt-2">
          {path}
        </code>
      </div>
      {variantLabel && (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {variantLabel}
        </p>
      )}
      <div className="rounded-xl border border-dashed border-border bg-background/50 p-6">
        {children}
      </div>
    </div>
  );
}

// ─── Helper: VariantRow ────────────────────────────────────────────────────────

function VariantRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Helper: SectionWrapper ───────────────────────────────────────────────────

function SectionWrapper({
  id,
  categoryLabel,
  title,
  children,
}: {
  id: string;
  categoryLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-8 scroll-mt-20">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {categoryLabel}
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mt-1">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DesignSystemV2Page() {
  // Shell / LiveBar state
  const nowTime = useNowTime();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Active coach thread
  const [activeThread, setActiveThread] = useState(COACH_THREADS[0]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky ToC sidebar (desktop) ──────────────────────────── */}
      <div className="hidden xl:block fixed left-0 top-12 bottom-0 w-48 border-r border-border bg-card/50 overflow-y-auto z-10">
        <nav className="p-4 flex flex-col gap-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Innhold
          </p>
          {TOC_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground py-1 px-2 rounded-md transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href="/portal-v2"
              className="block font-mono text-[10px] uppercase tracking-[0.06em] text-accent hover:text-accent/80 py-1 px-2 rounded-md transition-colors duration-150"
            >
              Full shell demo →
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Mobile ToC (accordion) ────────────────────────────────── */}
      <details className="xl:hidden border-b border-border bg-card">
        <summary className="cursor-pointer px-4 py-2 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground list-none flex items-center justify-between">
          Innhold
          <span className="text-xs">▼</span>
        </summary>
        <nav className="px-4 pb-4 grid grid-cols-3 gap-2">
          {TOC_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground py-1 text-center rounded-md border border-border"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </details>

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="xl:pl-48 max-w-[1440px] mx-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 lg:space-y-20">

          {/* ── Page hero ────────────────────────────────────────── */}
          <header className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              INTERN · DESIGN SYSTEM
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground">
              Design System V2{" "}
              <span className="italic" style={{ color: "var(--accent)" }}>
                Living Athletic Editorial
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-[62ch]">
              Visual fasit for migrasjon · 25 komponenter · sist oppdatert 2026-05-25
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {TOC_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="inline-flex items-center px-4 py-1 rounded-full border border-border font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </header>

          {/* ════════════════════════════════════════════════════════
              SHELL
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="shell" categoryLabel="KATEGORI · SHELL" title="Shell">

            {/* LiveBar */}
            <ComponentShowcase
              name="LiveBar"
              path="src/components/v2/shell/live-bar.tsx"
              description="Sticky-bar øverst i alle shell-oppsett. Viser sanntidstid, neste økt og vær. Fire tilstander: normal, med-neste-økt, critical og ingen-vær."
            >
              <div className="space-y-4">
                <VariantRow label="Normal — ingen neste økt">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <LiveBar
                      nowTime={{ decimal: 21.5, hh: 21, mm: 30, ss: 0, label: "21:30:00", labelShort: "21:30" }}
                      sessions={TODAY_SESSIONS}
                      weather={WEATHER_DATA}
                      critical={false}
                    />
                  </div>
                </VariantRow>
                <VariantRow label="Med neste økt (11:00 SLAG)">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <LiveBar
                      nowTime={{ decimal: 10.0, hh: 10, mm: 0, ss: 0, label: "10:00:00", labelShort: "10:00" }}
                      sessions={TODAY_SESSIONS}
                      weather={WEATHER_DATA}
                      critical={false}
                    />
                  </div>
                </VariantRow>
                <VariantRow label="Critical — økt starter om 15 min">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <LiveBar
                      nowTime={{ decimal: 10.75, hh: 10, mm: 45, ss: 0, label: "10:45:00", labelShort: "10:45" }}
                      sessions={TODAY_SESSIONS}
                      weather={WEATHER_DATA}
                      critical={true}
                      onClick={() => alert("Critical click")}
                    />
                  </div>
                </VariantRow>
                <VariantRow label="Live (bruker useNowTime — oppdateres hvert minutt)">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <LiveBar
                      nowTime={nowTime}
                      sessions={TODAY_SESSIONS}
                      weather={WEATHER_DATA}
                      critical={false}
                    />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* Topbar */}
            <ComponentShowcase
              name="Topbar"
              path="src/components/v2/shell/topbar.tsx"
              description="Sticky topbar med søk (desktop) eller logo (mobil), varsel-bjelle og innstillinger. Props: mobile?: boolean."
            >
              <div className="space-y-4">
                <VariantRow label="Desktop (standard)">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <Topbar mobile={false} />
                  </div>
                </VariantRow>
                <VariantRow label="Mobil">
                  <div className="rounded-xl overflow-hidden border border-border max-w-sm">
                    <Topbar mobile={true} />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* Sidebar — link to full demo */}
            <ComponentShowcase
              name="Sidebar"
              path="src/components/v2/shell/sidebar.tsx"
              description="Desktop-sidebar med navigasjonsgrupper og player-kort nederst. Krever auth-shell for å fungere korrekt (usePathname). Props: player: Player."
            >
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground space-y-2">
                <p>Sidebar krever auth-shell og pathname-context for å vise aktiv rute.</p>
                <Link
                  href="/portal-v2"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-accent hover:text-accent/80 transition-colors"
                >
                  Se full shell-demo på /portal-v2 →
                </Link>
              </div>
            </ComponentShowcase>

            {/* BottomNav */}
            <ComponentShowcase
              name="BottomNav"
              path="src/components/v2/shell/bottom-nav.tsx"
              description="Mobil bottom-tab-bar med 5 ruter: Hjem, Plan, Analyse, Coach, Meg. Bruker usePathname — tar ingen props."
            >
              <div className="space-y-4">
                <VariantRow label="Mobil preview (max-w-sm)">
                  <div className="relative rounded-xl overflow-hidden border border-border bg-background max-w-sm mx-auto" style={{ height: 80 }}>
                    {/* Inline replica — BottomNav is fixed-positioned so we show a static mockup */}
                    <div
                      className="absolute inset-0 grid grid-cols-5 border-t border-border"
                      style={{
                        background: "color-mix(in oklab, var(--background) 86%, transparent)",
                        padding: "8px 4px 14px",
                      }}
                    >
                      {["Hjem", "Plan", "Analyse", "Coach", "Meg"].map((label, i) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-1 py-[6px] px-1"
                        >
                          <div
                            className="w-4 h-4 rounded-sm"
                            style={{
                              background: i === 0 ? "var(--foreground)" : "var(--muted)",
                              opacity: i === 0 ? 1 : 0.4,
                            }}
                          />
                          <span
                            className="font-mono text-[10px] font-bold tracking-[0.06em] uppercase"
                            style={{ color: i === 0 ? "var(--foreground)" : "var(--muted-foreground)" }}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </VariantRow>
                <p className="text-xs text-muted-foreground font-mono">
                  OBS: BottomNav er fixed-posisjonert — vises i bunnen av reelle app-sider. Se /portal-v2 for live demo.
                </p>
              </div>
            </ComponentShowcase>

            {/* ShellWrapper */}
            <ComponentShowcase
              name="ShellWrapper"
              path="src/components/v2/shell/shell-wrapper.tsx"
              description="Wrapper som kombinerer Sidebar/Topbar/LiveBar/BottomNav + FAB til et komplett app-shell. Props: children, player, sessions, weather, mobile?, critical?, nowOverride?, onCriticalClick?"
            >
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground space-y-2">
                <p>ShellWrapper monterer hele shell-strukturen — best demonstrert i kontekst.</p>
                <Link
                  href="/portal-v2"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-accent hover:text-accent/80 transition-colors"
                >
                  Full shell-demo på /portal-v2 →
                </Link>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ════════════════════════════════════════════════════════
              HERO
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="hero" categoryLabel="KATEGORI · HERO" title="Hero">

            {/* PhotoHero */}
            <ComponentShowcase
              name="PhotoHero"
              path="src/components/v2/hero/photo-hero.tsx"
              description="Fullbredde foto-hero med parallax, count-up HCP og turneringsteller. Props: player, tournament, heroImg?, mobile?."
            >
              <div className="space-y-6">
                <VariantRow label="Desktop (heroImg=22)">
                  <PhotoHero
                    player={ØYVIND_USER}
                    tournament={TOURNAMENT_NEXT}
                    heroImg={22}
                    mobile={false}
                  />
                </VariantRow>
                <VariantRow label="Mobil">
                  <div className="max-w-sm">
                    <PhotoHero
                      player={ØYVIND_USER}
                      tournament={TOURNAMENT_NEXT}
                      heroImg={22}
                      mobile={true}
                    />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* DetailHero */}
            <ComponentShowcase
              name="DetailHero"
              path="src/components/v2/hero/detail-hero.tsx"
              description="Drill-detalj-hero med axis-pill, progress-bar og statistikk. Props: axis, title, image, duration, timesRun, bestStreak, progressPct, backHref?, backLabel?, mobile?."
            >
              <div className="space-y-6">
                <VariantRow label="Desktop — Putt-konsistens (TEK-økt)">
                  <DetailHero
                    axis="SLAG"
                    title="Putt-konsistens 50cm"
                    image={33}
                    duration={35}
                    timesRun={14}
                    bestStreak={7}
                    progressPct={60}
                    backHref="/drills"
                    backLabel="Tilbake til drills"
                    mobile={false}
                  />
                </VariantRow>
                <VariantRow label="Mobil — Gate-drill">
                  <div className="max-w-sm">
                    <DetailHero
                      axis="TEK"
                      title="Gate-drill 50cm"
                      image={19}
                      duration={25}
                      timesRun={8}
                      bestStreak={16}
                      progressPct={0}
                      mobile={true}
                    />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* PageHero */}
            <ComponentShowcase
              name="PageHero"
              path="src/components/v2/hero/page-hero.tsx"
              description="Side-hero for stats og listesider. Props: eyebrow, title, italic?, lead?, crumb?, crumbHref?."
            >
              <div className="space-y-6">
                <VariantRow label="Minimal (eyebrow + title)">
                  <PageHero
                    eyebrow="STATISTIKK · 2026"
                    title="Din sesong"
                  />
                </VariantRow>
                <VariantRow label="Med italic og lead">
                  <PageHero
                    eyebrow="ANALYSE · SG-FORDELING"
                    title="Strokes gained"
                    italic="detaljer"
                    lead="Historisk SG-oversikt fordelt på alle fem akser. Oppdateres etter hver logget runde."
                  />
                </VariantRow>
                <VariantRow label="Med breadcrumb">
                  <PageHero
                    eyebrow="DRILL · DETALJ"
                    title="Avstandskontroll"
                    italic="50m"
                    lead="Wedge-stige fra 50–120m. Logg carry, ikke total."
                    crumb="Alle drills"
                    crumbHref="/drills"
                  />
                </VariantRow>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ════════════════════════════════════════════════════════
              DATA
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="data" categoryLabel="KATEGORI · DATA" title="Data">

            {/* StatTile */}
            <ComponentShowcase
              name="StatTile"
              path="src/components/v2/data/stat-tile.tsx"
              description="Kompakt datakort for statistikk-grid. Props: tile (label, value, unit, context, tone, decimals?), idx?, hero?. Fire toner: default / accent / warning / critical."
            >
              <div className="space-y-6">
                <VariantRow label="Kompakt variant — alle 4 toner (fra WEEK_SUMMARY)">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {WEEK_SUMMARY.map((tile, i) => (
                      <StatTile key={tile.label} tile={tile} idx={i} hero={false} />
                    ))}
                  </div>
                </VariantRow>
                <VariantRow label="Hero variant — Accent-tone">
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-w-xs">
                    <StatTile
                      tile={{ label: "HCP", value: 2.1, unit: "", context: "−0.3 siste mnd", tone: "accent", decimals: 1 }}
                      idx={0}
                      hero={true}
                    />
                    <StatTile
                      tile={{ label: "SG Total", value: 1.0, unit: "", context: "+1.0 over field", tone: "default", decimals: 1 }}
                      idx={1}
                      hero={true}
                    />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* PyramidBar */}
            <ComponentShowcase
              name="PyramidBar"
              path="src/components/v2/data/pyramid-bar.tsx"
              description="Horisontal bar for treningspyramide-fordeling. Props: row (axis, pct, mål, status, color), inView, delayIdx?. Animerer inn via inView."
            >
              <div className="space-y-4">
                <VariantRow label="5 akser — FYS/TEK/SLAG/SPILL/TURN (fra WEEK_PROGRESS)">
                  <div className="space-y-4">
                    {WEEK_PROGRESS.map((row, i) => (
                      <PyramidBar
                        key={row.axis}
                        row={row}
                        inView={true}
                        delayIdx={i}
                      />
                    ))}
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* SgBar */}
            <ComponentShowcase
              name="SgBar"
              path="src/components/v2/data/sg-bar.tsx"
              description="Symmetrisk SG-bar med positiv/negativ visuell representasjon. Props: label, value, max?, idx?."
            >
              <div className="space-y-4">
                <VariantRow label="Tre eksempler: OTT +0.8, APP +0.4, PUTT -1.4">
                  <div className="space-y-4 max-w-sm">
                    <SgBar label="OTT" value={ØYVIND_USER.sgOtt} max={2} idx={0} />
                    <SgBar label="APP" value={ØYVIND_USER.sgApp} max={2} idx={1} />
                    <SgBar label="PUTT" value={ØYVIND_USER.sgPutt} max={2} idx={2} />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* HcpDelta */}
            <ComponentShowcase
              name="HcpDelta"
              path="src/components/athletic/data/hcp-delta.tsx"
              description="Inline HCP-trendindikator med pil og verdi. Props: delta (positiv = bedre, negativ = dårligere, 0 = stabil)."
            >
              <div className="space-y-4">
                <VariantRow label="3 tilstander: forbedring +0.3 / stabil 0 / forverring -0.2">
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                      <HcpDelta delta={0.3} />
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">Forbedring</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <HcpDelta delta={0} />
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">Stabil</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <HcpDelta delta={-0.2} />
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">Forverring</span>
                    </div>
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ════════════════════════════════════════════════════════
              ITINERARY
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="itinerary" categoryLabel="KATEGORI · ITINERARY" title="Itinerary">

            {/* ItineraryList */}
            <ComponentShowcase
              name="ItineraryList"
              path="src/components/v2/itinerary/itinerary-list.tsx"
              description="Full dagsplan med 5 sesjoner og automatisk NowLine-plassering. Props: sessions: Session[], nowDecimal: number."
            >
              <div className="space-y-6">
                <VariantRow label="Full dagsplan — NÅ-linje mellom SLAG og SPILL (kl. 13:30)">
                  <ItineraryList
                    sessions={TODAY_SESSIONS}
                    nowDecimal={13.5}
                  />
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* ItineraryRow */}
            <ComponentShowcase
              name="ItineraryRow"
              path="src/components/v2/itinerary/itinerary-row.tsx"
              description="Enkelt rad i dagsplan-liste. Props: session, isActiveNow, isPast, isLast, detailHref. Fire tilstander: done, active, upcoming, turnering."
            >
              <div className="space-y-6">
                <VariantRow label="Tilstand: DONE (fullført)">
                  <ItineraryRow
                    session={TODAY_SESSIONS[0]}
                    isActiveNow={false}
                    isPast={true}
                    isLast={false}
                    detailHref="/drill/gate-50cm"
                  />
                </VariantRow>
                <VariantRow label="Tilstand: PÅGÅR NÅ (aktiv)">
                  <ItineraryRow
                    session={TODAY_SESSIONS[2]}
                    isActiveNow={true}
                    isPast={false}
                    isLast={false}
                    detailHref="/drill/avstandskontroll"
                  />
                </VariantRow>
                <VariantRow label="Tilstand: PLANLAGT (fremtidig)">
                  <ItineraryRow
                    session={TODAY_SESSIONS[3]}
                    isActiveNow={false}
                    isPast={false}
                    isLast={false}
                    detailHref="/drill/gate-50cm"
                  />
                </VariantRow>
                <VariantRow label="Tilstand: TURNERING">
                  <ItineraryRow
                    session={{
                      id: "turn1",
                      time: "09:30",
                      end: "18:00",
                      startH: 9.5,
                      endH: 18.0,
                      axis: "TURN",
                      title: "Sørlandsåpent · R1",
                      subtitle: "Kristiansand GK · 54 hull stroke play",
                      location: "Kristiansand GK",
                      drills: 0,
                      status: "TURNERING",
                    }}
                    isActiveNow={false}
                    isPast={false}
                    isLast={true}
                    detailHref="/turnering/sorlandsapent"
                  />
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* NowLine */}
            <ComponentShowcase
              name="NowLine"
              path="src/components/v2/itinerary/now-line.tsx"
              description="Rød stiplet nå-linje med tidsmerke. Brukes av ItineraryList automatisk. Props: label (HH:MM), sub? (valgfri tekst under linjen)."
            >
              <div className="space-y-6">
                <VariantRow label="Standard (label alene)">
                  <NowLine label="11:30" />
                </VariantRow>
                <VariantRow label="Med sub-tekst (brukes av aktiv sesjon)">
                  <NowLine label="11:30" sub="(pågår nå)" />
                </VariantRow>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ════════════════════════════════════════════════════════
              CARDS
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="cards" categoryLabel="KATEGORI · CARDS" title="Cards">

            {/* InsightCard */}
            <ComponentShowcase
              name="InsightCard"
              path="src/components/v2/cards/insight-card.tsx"
              description="AI-innsikt-kort. Tre typer: HANDLING (primær CTA, accent-border), OBSERVASJON (informasjon, info-tint), MAAL (mål, primary-tint). Props: insight: Insight."
            >
              <div className="grid sm:grid-cols-3 gap-4">
                {AI_INSIGHTS.map((insight) => (
                  <div key={insight.id} className="flex flex-col gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {insight.type}
                    </p>
                    <InsightCard insight={insight} />
                  </div>
                ))}
              </div>
            </ComponentShowcase>

            {/* PartnerCard */}
            <ComponentShowcase
              name="PartnerCard"
              path="src/components/v2/cards/partner-card.tsx"
              description="Treningspartner-kort med avatar, HCP og Inviter-knapp. Props: partner: Partner, onInvite?: (partner) => void."
            >
              <div className="space-y-2 max-w-md">
                {TRAINING_PARTNERS.slice(0, 2).map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    onInvite={(p) => alert(`Inviterer ${p.name}`)}
                  />
                ))}
              </div>
            </ComponentShowcase>

            {/* TournamentCard */}
            <ComponentShowcase
              name="TournamentCard"
              path="src/components/v2/cards/tournament-card.tsx"
              description="Mørk turnerings-tellekortet med countdown, sjekkliste og CTA. Props: tournament, checklist, mobile?, statsHref?."
            >
              <div className="space-y-6">
                <VariantRow label="Desktop">
                  <div className="max-w-md">
                    <TournamentCard
                      tournament={TOURNAMENT_NEXT}
                      checklist={TOURNAMENT_CHECKLIST}
                      mobile={false}
                      statsHref="/stats"
                    />
                  </div>
                </VariantRow>
                <VariantRow label="Mobil">
                  <div className="max-w-sm">
                    <TournamentCard
                      tournament={TOURNAMENT_NEXT}
                      checklist={TOURNAMENT_CHECKLIST}
                      mobile={true}
                      statsHref="/stats"
                    />
                  </div>
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* WellnessCard */}
            <ComponentShowcase
              name="WellnessCard"
              path="src/components/v2/cards/wellness-card.tsx"
              description="Velvære-oversikt med energi, søvn, HRV og stress fra Garmin-integrasjon. Props: wellness: Wellness."
            >
              <div className="max-w-sm">
                <WellnessCard wellness={WELLNESS_DATA} />
              </div>
            </ComponentShowcase>

            {/* QuickAction */}
            <ComponentShowcase
              name="QuickAction"
              path="src/components/v2/cards/quick-action.tsx"
              description="Kompakt handlingskort. To toner: default (lys, border) og dark (mørk bakgrunn, accent-tekst). Props: action: QuickAction."
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Standard</p>
                  <QuickAction action={QUICK_ACTIONS_LIST[0]} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Standard</p>
                  <QuickAction action={QUICK_ACTIONS_LIST[1]} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Dark tone</p>
                  <QuickAction action={QUICK_ACTIONS_LIST[2]} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Standard</p>
                  <QuickAction action={QUICK_ACTIONS_LIST[4]} />
                </div>
              </div>
            </ComponentShowcase>

            {/* CoachMessage + CoachMessageDetail */}
            <ComponentShowcase
              name="CoachMessage + CoachMessageDetail"
              path="src/components/v2/cards/coach-message.tsx"
              description="To relaterte eksporter: CoachMessage (list-item i thread-liste) og CoachMessageDetail (fullstendig meldingsvisning). Klikk en thread for å se detalj."
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-2">
                    List-items (CoachMessage)
                  </p>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {COACH_THREADS.map((thread) => (
                      <CoachMessage
                        key={thread.id}
                        thread={thread}
                        isActive={activeThread.id === thread.id}
                        onClick={() => setActiveThread(thread)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-2">
                    Detalj (CoachMessageDetail)
                  </p>
                  <div className="rounded-xl border border-border p-4">
                    <CoachMessageDetail
                      thread={activeThread}
                      coach={COACH_DATA}
                    />
                  </div>
                </div>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ════════════════════════════════════════════════════════
              EDITORIAL
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="editorial" categoryLabel="KATEGORI · EDITORIAL" title="Editorial">

            {/* SectionHeader */}
            <ComponentShowcase
              name="SectionHeader"
              path="src/components/v2/editorial/section-header.tsx"
              description="Seksjonsoverskrift med eyebrow, tittel og valgfri beskrivelse, CTA og ghost-nummer. Props: eyebrow, title, description?, cta?, ctaHref?, ghostNum?."
            >
              <div className="space-y-8">
                <VariantRow label="Minimal (eyebrow + title)">
                  <SectionHeader
                    eyebrow="DAGSPROGRAM · TIRSDAG"
                    title="I dag"
                  />
                </VariantRow>
                <VariantRow label="Med description">
                  <SectionHeader
                    eyebrow="ANALYSE · SG"
                    title="Strokes gained"
                    description="Fordeling på alle 5 akser. Oppdateres etter hver logget runde. Baseline: lag-snitt A1."
                  />
                </VariantRow>
                <VariantRow label="Med CTA-knapp">
                  <SectionHeader
                    eyebrow="INNSIKT · AI"
                    title="Anbefalinger"
                    description="Generert basert på siste 14 dager med treningsdata."
                    cta="Se alle"
                    ctaHref="/stats"
                  />
                </VariantRow>
                <VariantRow label="Med ghost-nummer">
                  <SectionHeader
                    eyebrow="TRENINGSPYRAMIDE"
                    title="Ukesfordeling"
                    description="Prosent av total treningstid per akse denne uka."
                    ghostNum="01"
                  />
                </VariantRow>
              </div>
            </ComponentShowcase>

            {/* PhotoDivider */}
            <ComponentShowcase
              name="PhotoDivider"
              path="src/components/v2/editorial/photo-divider.tsx"
              description="Fullbredde foto-divider med kicker-tekst og kursiv sitatlinje. Bruker aria-hidden. Props: img, kicker, line, dateLabel?."
            >
              <div className="overflow-hidden rounded-xl">
                <PhotoDivider
                  img={22}
                  kicker="AK GOLF ACADEMY"
                  line="Konsistens slår talent — til slutt."
                  dateLabel="AK GOLF ACADEMY · 26/05/26"
                />
              </div>
            </ComponentShowcase>

            {/* GhostNumber */}
            <ComponentShowcase
              name="GhostNumber"
              path="src/components/v2/editorial/ghost-number.tsx"
              description="Dekorativt bakgrunns-tall. Brukes inni SectionHeader (via ghostNum-prop) eller fritt som layout-element. Props: value: string | number, className?."
            >
              <div className="flex items-end gap-8 overflow-hidden">
                <div className="flex flex-col items-center gap-2">
                  <GhostNumber value="01" />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">01</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <GhostNumber value="02" />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">02</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <GhostNumber value="03" />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">03</span>
                </div>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ════════════════════════════════════════════════════════
              MODALS
          ════════════════════════════════════════════════════════ */}
          <SectionWrapper id="modals" categoryLabel="KATEGORI · MODALS" title="Modals">

            {/* StubModal */}
            <ComponentShowcase
              name="StubModal"
              path="src/components/v2/modals/stub-modal.tsx"
              description="Generisk modal-shell med backdrop, Escape-støtte og aria-dialog. Interaktiv: klikk knappen for å åpne. Props: open, onClose, title, description?, children?."
            >
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-[10px] rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] border border-border text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background"
                  style={{ background: "var(--card)" }}
                >
                  Apne StubModal
                </button>
                <p className="text-xs text-muted-foreground font-mono">
                  Lukk med Escape eller klikk backdrop.
                </p>
                <StubModal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="Bekreft handling"
                  description="Dette er et eksempel på StubModal — brukes som stub for alle modaler som ikke enda er ferdig implementert."
                >
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-[10px] rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] border border-border text-foreground"
                      style={{ background: "var(--card)" }}
                    >
                      Avbryt
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-[10px] rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground"
                      style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                    >
                      Bekreft
                    </button>
                  </div>
                </StubModal>
              </div>
            </ComponentShowcase>

          </SectionWrapper>

          {/* ── Footer ────────────────────────────────────────────── */}
          <footer className="border-t border-border pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                AK GOLF HQ · DESIGN SYSTEM V2
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                25 komponenter · Athletic Editorial · Tailwind v4 + shadcn/ui-tokens
              </p>
            </div>
            <Link
              href="/portal-v2"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Se full app-demo
            </Link>
          </footer>

        </div>
      </div>
    </div>
  );
}
