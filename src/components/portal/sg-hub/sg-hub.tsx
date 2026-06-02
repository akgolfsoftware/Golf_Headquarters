/**
 * PlayerHQ Strokes Gained Hub (SG-Hub) — portet FRA v10-fasit:
 *   - Visuell fasit (mobil, autoritativ): public/design-handover/_screens/pl-sghub.png
 *   - HTML/CSS-referanse (chart-stil/tokens): public/design-handover/playerhq/components-stats-sg.html
 *   - Manifest §4 (navigasjon): tool-ruter under /portal/mal/sg-hub/*
 *
 * Presentasjonell komponent. Tar all data via `SgHubData`-props — INGEN
 * Prisma/DB/auth her. Mobil er primær-fasit (pixel-nært PNG); desktop utvider
 * responsivt (sentrert lesbar kolonne, sidebar leveres av skall-laget).
 *
 * Fasiten viser TOM-TILSTAND (ny GRATIS-spiller, 0 runder / 0 TrackMan-økter).
 * Vertikal stack (topp → bunn), eksakt rekkefølge fra pl-sghub.png:
 *   1. Side-header: eyebrow + "Min SG-pipeline" (italic) + subtekst
 *   2. SG-total hero (forest) — eyebrow + TrackMan-pill + lime underline + body + "—"
 *   3. KPI-grid 2×2 — TrackMan-økter / Aktive innsikter / Snitt-score / Benchmark
 *   4. Tom-tilstand CTA (dashed) — forklaring + "Logg runde"
 *   5. "Per disiplin"-header + 4 disiplin-kort (OTT/APP/ARG/PUTT, tom: "Ingen data")
 *   6. Innsikt-banner "Topp 3 prioriteringer" (tom-tilstand)
 *   7. "Sist TrackMan-økt"-kort (tom-tilstand, import-lenke)
 *   8. "Per-kølle analyse"-header + tom-tilstand-kort (dashed)
 *   9. "Verktøy"-header + 6 verktøy-kort (badge + Åpne → + lime zap)
 *
 * Athletic/UI-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen
 * emoji (kun lucide-ikoner). All tekst norsk bokmål.
 */

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell — alt skjermen trenger, levert som props.
// ────────────────────────────────────────────────────────────────────────────

/** Én av de fire SG-disiplinene (drill-down per disiplin). */
export type SgDisiplin = {
  /** Eyebrow-tekst, f.eks. "SG · OFF-THE-TEE". */
  eyebrow: string;
  /** Stor verdi — "—" i tom-tilstand, ellers signert SG (f.eks. "+0,12"). */
  value: string;
  /** true = negativ (rød). Ignoreres i tom-tilstand (value "—"). */
  negativ?: boolean;
  /** Statuslinje under verdien, f.eks. "Ingen data" eller "vs PGA Tour". */
  status: string;
  /** Drill-down-rute, f.eks. "/portal/mal/sg-hub/ott". */
  href: string;
};

/** Ett KPI-kort i 2×2-rutenettet. */
export type SgKpi = {
  eyebrow: string;
  value: string;
  footnote: string;
};

/** Ett verktøy-kort i "Verktøy"-seksjonen. */
export type SgVerktoy = {
  ikon: LucideIcon;
  tittel: string;
  /** Badge øverst til høyre, f.eks. "LIVE" eller "FASE 3". */
  badge: string;
  /** true = LIVE (grønn zap aktiv). Badge-fargen er lik FASE-badgene per fasit. */
  live?: boolean;
  href: string;
};

export type SgHubData = {
  /** Eyebrow over headline, f.eks. "PLAYERHQ · /PORTAL/MAL/SG-HUB". */
  eyebrow: string;
  /** Vindu for SG-total, f.eks. "SG TOTAL · 90 D". */
  totalEyebrow: string;
  /** Pill øverst til høyre i hero, f.eks. "0 TrackMan-økter". */
  totalPill: string;
  /** Body-tekst i hero (lime på forest). */
  totalBody: string;
  /** Stor SG-total-verdi — "—" i tom-tilstand. */
  totalValue: string;
  /** true = negativ total (rød). Ignoreres når value er "—". */
  totalNegativ?: boolean;
  /** Subtekst under headline. */
  subtittel: string;
  /** KPI-rutenett (4 kort). */
  kpi: SgKpi[];
  /** Tom-tilstand CTA-kort. */
  cta: {
    tittel: string;
    body: React.ReactNode;
    knapp: { label: string; href: string };
  };
  /** Note til høyre for "Per disiplin"-headeren. */
  disiplinNote: string;
  /** De fire disiplin-kortene. */
  disipliner: SgDisiplin[];
  /** "Topp 3 prioriteringer"-banner. */
  prioriteringer: { eyebrow: string; body: string };
  /** "Sist TrackMan-økt"-kort. */
  trackman: { eyebrow: string; body: React.ReactNode };
  /** Tom-tilstand-tekst for per-kølle-seksjonen. */
  perKolleTom: React.ReactNode;
  /** Verktøy-kortene. */
  verktoy: SgVerktoy[];
};

// ────────────────────────────────────────────────────────────────────────────
// Atomer — små seksjons-headere som matcher fasitens stil.
// ────────────────────────────────────────────────────────────────────────────

/** Editorial seksjons-tittel: display, med valgfri italic-grønn ledetekst. */
function SeksjonTittel({
  italic,
  rest,
  note,
  id,
}: {
  italic?: string;
  rest?: string;
  note?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2
        id={id}
        className="font-display text-[26px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground"
      >
        {italic && <span className="font-normal italic text-primary">{italic}</span>}
        {italic && rest ? " " : null}
        {rest}
      </h2>
      {note && (
        <span className="font-mono text-[11px] leading-snug tracking-[0.02em] text-muted-foreground">
          {note}
        </span>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. SG-total hero — flat forest-kort (bg-primary) med eyebrow + fylt pill,
//    lime underline, lime body-tekst og stor (tom) verdi.
// ────────────────────────────────────────────────────────────────────────────

function SgTotalHero({ data }: { data: SgHubData }) {
  const tom = data.totalValue.trim() === "—";
  return (
    <section
      aria-label="SG total"
      className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[20px] bg-primary p-6 text-accent shadow-[0_20px_48px_-16px_rgba(10,31,23,0.35)] sm:p-7"
    >
      {/* Topp-rad: vindu-eyebrow + TrackMan-pill (fylt lysere grønn) */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          {data.totalEyebrow}
        </span>
        <span className="inline-flex items-center rounded-full bg-success px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          {data.totalPill}
        </span>
      </div>

      {/* Lime underline (accent-markør) */}
      <span aria-hidden className="mt-7 block h-[3px] w-14 rounded-full bg-accent" />

      {/* Body-tekst */}
      <p className="mt-6 max-w-[44ch] text-[17px] font-medium leading-[1.4] tracking-[-0.005em] text-accent">
        {data.totalBody}
      </p>

      {/* Stor total-verdi (tom = "—", sentrert nederst) */}
      <div className="mt-auto flex justify-center pt-6">
        <span
          className={cn(
            "font-mono text-4xl font-bold leading-none tabular-nums",
            tom ? "text-accent/55" : data.totalNegativ ? "text-[#FF9C8A]" : "text-accent",
          )}
        >
          {data.totalValue}
        </span>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. KPI-kort — eyebrow (mono uppercase) + stor mono-verdi + footnote (mono,
//    småbokstaver). Egen sub-komponent for å treffe fasitens footnote-stil.
// ────────────────────────────────────────────────────────────────────────────

function SgKpiCard({ kpi }: { kpi: SgKpi }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {kpi.eyebrow}
      </span>
      <div className="mt-2 font-mono text-3xl font-bold leading-none tracking-[-0.02em] text-foreground tabular-nums">
        {kpi.value}
      </div>
      <p className="mt-2 font-mono text-[12px] tracking-[0.01em] text-muted-foreground">
        {kpi.footnote}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Tom-tilstand CTA — dashed-border kort med tittel, body og primær-knapp.
// ────────────────────────────────────────────────────────────────────────────

function TomTilstandCta({ data }: { data: SgHubData }) {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-card/40 px-6 py-8 text-center sm:px-8">
      <h3 className="font-display text-[24px] font-bold leading-[1.12] tracking-[-0.02em] text-foreground">
        {data.cta.tittel}
      </h3>
      <p className="mx-auto mt-3 max-w-[44ch] text-[15px] leading-[1.55] text-muted-foreground">
        {data.cta.body}
      </p>
      <Link
        href={data.cta.knapp.href}
        className="mt-6 inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-7 font-display text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        {data.cta.knapp.label}
      </Link>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Disiplin-kort — eyebrow + ekstern-pil, dempet underline, stor (tom) verdi,
//    statuslinje. Hele kortet er en lenke til drill-down.
// ────────────────────────────────────────────────────────────────────────────

function DisiplinKort({ d }: { d: SgDisiplin }) {
  const tom = d.value.trim() === "—";
  return (
    <Link
      href={d.href}
      className="group relative block min-h-[180px] rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {d.eyebrow}
        </span>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-primary"
          strokeWidth={2}
          aria-hidden
        />
      </div>

      {/* Dempet underline (foreground-markør) */}
      <span aria-hidden className="mt-5 block h-[3px] w-12 rounded-full bg-foreground" />

      {/* Stor verdi (tom = "—", sentrert) */}
      <div className="mt-7 flex justify-center">
        <span
          className={cn(
            "font-mono text-3xl font-bold leading-none tabular-nums",
            tom ? "text-muted-foreground/60" : d.negativ ? "text-destructive" : "text-success",
          )}
        >
          {d.value}
        </span>
      </div>

      <p className="mt-7 font-mono text-[12px] tracking-[0.01em] text-muted-foreground">
        {d.status}
      </p>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Innsikt-banner — secondary-bg med ikon-eyebrow + body (tom-tilstand).
// ────────────────────────────────────────────────────────────────────────────

function PrioriteringerBanner({ data }: { data: SgHubData }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          {data.prioriteringer.eyebrow}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-[1.55] text-muted-foreground">
        {data.prioriteringer.body}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Sist TrackMan-økt — kort med ikon-eyebrow + body (import-lenke).
// ────────────────────────────────────────────────────────────────────────────

function TrackmanKort({ data }: { data: SgHubData }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {data.trackman.eyebrow}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-[1.55] text-foreground">{data.trackman.body}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 9. Verktøy-kort — ikon (venstre) + badge (høyre), tittel, "Åpne →"-lenke,
//    lime zap (nederst høyre). Badge-fargen er lik for LIVE og FASE (blek lime
//    accent-tint) — kun teksten skiller dem (fasit).
// ────────────────────────────────────────────────────────────────────────────

function VerktoyKort({ v }: { v: SgVerktoy }) {
  const Icon = v.ikon;
  return (
    <Link
      href={v.href}
      className="group relative block rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
        <span className="inline-flex items-center rounded-full bg-accent/25 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
          {v.badge}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl font-bold leading-tight tracking-[-0.015em] text-foreground">
        {v.tittel}
      </h3>

      <div className="mt-3 flex items-end justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-medium text-primary transition-opacity group-hover:opacity-80">
          Åpne
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <Zap className="h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne. Skall (sidebar/bunn-nav) leveres av
// preview/portal-laget; her er det rene innholdet.
// ────────────────────────────────────────────────────────────────────────────

export function SgHub({ data }: { data: SgHubData }) {
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-0 md:max-w-[720px]">
      {/* 1. Side-header */}
      <header className="space-y-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {data.eyebrow}
        </span>
        <h1 className="font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
          Min <span className="font-normal italic text-primary">SG-pipeline</span>
        </h1>
        <p className="text-[16px] leading-[1.5] text-muted-foreground">{data.subtittel}</p>
      </header>

      {/* 2. SG-total hero */}
      <SgTotalHero data={data} />

      {/* 3. KPI-grid 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {data.kpi.map((k) => (
          <SgKpiCard key={k.eyebrow} kpi={k} />
        ))}
      </div>

      {/* 4. Tom-tilstand CTA */}
      <TomTilstandCta data={data} />

      {/* 5. Per disiplin */}
      <section aria-labelledby="disiplin-heading" className="space-y-4">
        <SeksjonTittel
          id="disiplin-heading"
          italic="Per disiplin"
          rest="· klikk for drill-down"
          note={data.disiplinNote}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.disipliner.map((d) => (
            <DisiplinKort key={d.eyebrow} d={d} />
          ))}
        </div>
      </section>

      {/* 6. Topp 3 prioriteringer */}
      <PrioriteringerBanner data={data} />

      {/* 7. Sist TrackMan-økt */}
      <TrackmanKort data={data} />

      {/* 8. Per-kølle analyse */}
      <section aria-labelledby="kolle-heading" className="space-y-4">
        <SeksjonTittel id="kolle-heading" rest="Per-kølle analyse" />
        <div className="rounded-[20px] border border-dashed border-border bg-card/40 px-6 py-8 text-center">
          <p className="mx-auto max-w-[48ch] text-[15px] leading-[1.55] text-muted-foreground">
            {data.perKolleTom}
          </p>
        </div>
      </section>

      {/* 9. Verktøy */}
      <section aria-labelledby="verktoy-heading" className="space-y-4">
        <SeksjonTittel id="verktoy-heading" rest="Verktøy" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.verktoy.map((v) => (
            <VerktoyKort key={v.tittel} v={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
