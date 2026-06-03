/**
 * PlayerHQ · Statistikk — nøkkeltall + metrikk, portet FRA v10-fasit:
 *   - Visuell fasit (mobil, autoritativ): public/design-handover/_screens/pl-stats.png
 *   - HTML/CSS-referanse (eyebrow-pulse, mono-skala, kort-radius/border):
 *     public/design-handover/playerhq/components-stats-sg.html
 *   - Manifest §4 ("Statistikk"): nøkkeltall-oversikt · metrikk-drilldown ·
 *     sammenlign mot PGA-spiller.
 *
 * Presentasjonell komponent. Tar all data via `StatistikkData`-props — INGEN
 * Prisma/DB/auth her. Mobil er primær-fasit (pixel-nært PNG); desktop utvider
 * responsivt (sentrert lesbar kolonne, sidebar leveres av skall-laget).
 *
 * Fasiten viser TOM-TILSTAND (ny GRATIS-spiller, 0 runder). Vertikal stack
 * (topp → bunn), eksakt rekkefølge fra pl-stats.png:
 *   1. Side-header: eyebrow (lime pulse-dot + "STATS · 2026 · 0 RUNDER") +
 *      headline "Din statistikk." ("statistikk" italic primary)
 *   2. Seksjons-tabs (border-bottom): Oversikt · Strokes Gained · TrackMan ·
 *      Tester · Runder — fasit rendrer ALLE faner i samme dempede grå, uten
 *      aktiv-markering og uten lime-underline (verifisert mot pl-stats.png).
 *   3. Tom-tilstand-kort (stiplet border, sentrert): tekst "Statistikk vises når
 *      du har logget runder." + primær pill "LOGG FØRSTE RUNDE →".
 *
 * Når metrikker finnes (metrikker ≥ 1): tom-kortet erstattes av en KPI-grid med
 * klikkbare metrikk-celler (→ drilldown). Tab-raden beholdes.
 *
 * Athletic/UI-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen
 * emoji (kun lucide-ikoner). All tekst norsk bokmål.
 */

import Link from "next/link";
import { ArrowRight, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { PulseDot } from "@/components/athletic/pulse-dot";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell — alt skjermen trenger, levert som props.
// ────────────────────────────────────────────────────────────────────────────

/** Tab-identifikator (rute-segment under /portal/stats). */
export type StatistikkTab =
  | "oversikt"
  | "sg"
  | "trackman"
  | "tester"
  | "runder";

/** Én nøkkeltall-celle (vises når data finnes — ellers tom-tilstand). */
export type MetrikkCelle = {
  /** Stabil nøkkel + lenke-segment for drilldown. */
  id: string;
  /** Etikett, f.eks. "SG Total". */
  label: string;
  /** Tabular verdi, f.eks. "−0,18". */
  value: string;
  /** Enhet/suffiks, f.eks. "/ runde". */
  unit?: string;
  /** Trend mot referanse — styrer farge + ikon. */
  trend?: { value: string; tone: "positive" | "negative" | "neutral" };
};

/** Lenker skjermen navigerer til. */
export type StatistikkHrefs = {
  /** Logg første runde (tom-tilstand-CTA). */
  loggRunde: string;
  /** Bygger drilldown-rute for en gitt metrikk-id. */
  metrikk: (id: string) => string;
};

export type StatistikkData = {
  /** Eyebrow-tekst etter pulse-dot, f.eks. "STATS · 2026 · 0 RUNDER". */
  eyebrow: string;
  /** Hvilken tab som er aktiv. Default brukes hvis utelatt. */
  aktivTab?: StatistikkTab;
  /** Nøkkeltall-celler (tom liste ⇒ tom-tilstand vises). */
  metrikker: MetrikkCelle[];
  /** Navigasjons-lenker. */
  hrefs: StatistikkHrefs;
};

// ────────────────────────────────────────────────────────────────────────────
// Seksjons-tabs — rute-baserte (ikke query-state). Fasit (pl-stats.png) viser
// ALLE faner i samme dempede grå: ingen aktiv-farge, ingen lime-underline.
// Kompakt padding så alle 5 faner får plass på 430px uten avkutting; horisontal
// scroll beholdes som sikkerhet på smalere skjermer. Aktiv tab markeres kun
// semantisk via aria-selected (skjermlesere), ikke visuelt.
// ────────────────────────────────────────────────────────────────────────────

const TABS: { id: StatistikkTab; href: string; label: string }[] = [
  { id: "oversikt", href: "/portal/stats", label: "Oversikt" },
  { id: "sg", href: "/portal/stats/sg", label: "Strokes Gained" },
  { id: "trackman", href: "/portal/stats/trackman", label: "TrackMan" },
  { id: "tester", href: "/portal/stats/tester", label: "Tester" },
  { id: "runder", href: "/portal/stats/runder", label: "Runder" },
];

function SeksjonsTabs({ aktiv }: { aktiv: StatistikkTab }) {
  return (
    <nav
      role="tablist"
      aria-label="Statistikk-seksjoner"
      className="-mx-4 flex items-center gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === aktiv;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className="shrink-0 whitespace-nowrap px-2 py-3 font-display text-[14px] font-bold tracking-[-0.01em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Primær-knapp ("Logg første runde") — forest pill, lime mono-tekst + arrow.
// Eksakt fra pl-stats.png.
// ────────────────────────────────────────────────────────────────────────────

function LoggRundeKnapp({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-primary px-7 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Logg første runde
      <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tom-tilstand-kort — stiplet border, sentrert tekst + primær CTA. Eksakt
// proporsjon/farge fra pl-stats.png (stor hvit card, generøs vertikal padding).
// ────────────────────────────────────────────────────────────────────────────

function TomTilstand({ href }: { href: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-7 rounded-[20px] border border-dashed border-border bg-card px-6 py-14 text-center sm:px-8">
      <p className="max-w-[34ch] text-[20px] font-medium leading-[1.4] tracking-[-0.01em] text-foreground sm:text-[22px]">
        Statistikk vises når du har logget runder.
      </p>
      <LoggRundeKnapp href={href} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Metrikk-grid — vises når metrikker finnes (≠ fasit-tom-tilstand). Klikkbare
// celler → drilldown. Mono tabular-tall, jf. KPI-stilen i components-stats-sg.
// ────────────────────────────────────────────────────────────────────────────

function TrendMerke({ trend }: { trend: NonNullable<MetrikkCelle["trend"]> }) {
  const Icon =
    trend.tone === "positive"
      ? TrendingUp
      : trend.tone === "negative"
        ? TrendingDown
        : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums",
        trend.tone === "positive" && "text-success",
        trend.tone === "negative" && "text-destructive",
        trend.tone === "neutral" && "text-muted-foreground",
      )}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.5} aria-hidden />}
      {trend.value}
    </span>
  );
}

function MetrikkGrid({
  metrikker,
  hrefs,
}: {
  metrikker: MetrikkCelle[];
  hrefs: StatistikkHrefs;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {metrikker.map((m) => (
        <Link
          key={m.id}
          href={hrefs.metrikk(m.id)}
          className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <span className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {m.label}
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              {m.value}
            </span>
            {m.unit && (
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                {m.unit}
              </span>
            )}
          </span>
          {m.trend && <TrendMerke trend={m.trend} />}
        </Link>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne. Skall (sidebar/bunn-nav) leveres av
// preview/portal-laget; her er det rene innholdet.
// ────────────────────────────────────────────────────────────────────────────

export function Statistikk({ data }: { data: StatistikkData }) {
  const aktiv = data.aktivTab ?? "oversikt";
  const tom = data.metrikker.length === 0;

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-0 md:max-w-[720px]">
      {/* 1. Side-header */}
      <header className="space-y-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <PulseDot size="sm" />
          {data.eyebrow}
        </span>
        <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
          Din <span className="font-normal italic text-primary">statistikk</span>
          <span className="text-foreground">.</span>
        </h1>
      </header>

      {/* 2. Seksjons-tabs */}
      <SeksjonsTabs aktiv={aktiv} />

      {/* 3. Tom-tilstand ELLER metrikk-grid */}
      {tom ? (
        <TomTilstand href={data.hrefs.loggRunde} />
      ) : (
        <MetrikkGrid metrikker={data.metrikker} hrefs={data.hrefs} />
      )}
    </div>
  );
}
