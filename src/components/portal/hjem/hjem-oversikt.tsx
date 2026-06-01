/**
 * PlayerHQ Hjem / Workbench — "Spotify Now Playing for trening".
 * Mobil-først (430px), port av public/design-handover/playerhq/
 * components-player-mobile.html (skjerm 01 — WORKBENCH HJEM) +
 * spec §1 i SKJERMER-RUNDE-2-PLAYERHQ-HOVEDSKJERMER.md.
 *
 * Vertikal stack:
 *   1. Foto-hero (eyebrow + greeting italic + meta) — dark gradient
 *   2. Featured "Dagens økt" (forest-gradient + lime + CTA)  ← det som "spiller nå"
 *   3. KPI-strip 2x2 (SG-akser — ekte data fra Round/BrukerSgInput)
 *   4. Pyramide-card (uke-vekting, 5 bars i akse-farger)
 *   5. Neste tee-card
 *   6. AI-innsikt-kort (fra Caddie)
 * Tomstate når data mangler — ALDRI falske tall.
 *
 * Server component. Athletic-primitiver (FeaturedCard, KpiStrip/KpiCard,
 * PyramidProgress) + DS-tokens. Ingen hardkodet hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  CalendarRange,
  ChevronRight,
  Flag,
  MessageSquare,
  Play,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  FeaturedCard,
  KpiCard,
  PyramidProgress,
} from "@/components/athletic";
import { PulseDot } from "@/components/athletic/pulse-dot";
import { cn } from "@/lib/utils";
import type {
  DagensOkt,
  HjemData,
  KpiCelle,
  NesteTee,
} from "@/lib/portal-hjem/hjem-data";
import type { AiInsight } from "@/components/portal/workbench/ai-insights-row";

// ── Foto-hero — design-handover §1 (320px, dark gradient, eyebrow + greeting) ──
function FotoHero({ data }: { data: HjemData }) {
  return (
    <header className="relative overflow-hidden rounded-[20px] shadow-[0_20px_48px_-12px_rgba(10,31,23,0.18)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/akgolf/AK-Golf-Academy-${data.heroImageId}.webp`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 55%" }}
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 48%, rgba(0,0,0,0.12) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 52%)",
        }}
      />

      <div className="relative flex min-h-[300px] flex-col justify-between p-5 sm:p-7 text-background">
        {/* Topp: tier-pill + avatar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent backdrop-blur-sm"
              style={{ background: "hsl(var(--accent) / 0.18)" }}
            >
              PlayerHQ · {data.user.tier}
            </span>
            {data.user.hcp != null && (
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background/75">
                HCP {data.user.hcp.toLocaleString("nb-NO")}
              </span>
            )}
          </div>
          <span
            className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 font-display text-base font-bold"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--accent))",
              borderColor: "hsl(var(--accent))",
            }}
          >
            {data.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              data.user.initialer
            )}
          </span>
        </div>

        {/* Eyebrow + greeting */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <PulseDot size="sm" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background/80">
              {data.datoEyebrow}
            </span>
          </div>
          <h1 className="mt-2.5 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-background">
            {data.headlineNormal}
            {data.headlineAksent && (
              <span className="italic font-normal text-accent">
                {data.headlineAksent}
              </span>
            )}
          </h1>
          {data.metaLinje && (
            <p className="mt-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-background/70">
              {data.metaLinje}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Dagens økt — featured-card (forest-gradient + lime) eller tomstate ──
function DagensOktSeksjon({
  okt,
  harPlan,
}: {
  okt: DagensOkt | null;
  harPlan: boolean;
}) {
  if (okt) {
    return (
      <FeaturedCard
        eyebrow={`Dagens økt · ${okt.tidsrom}`}
        showPulse
        title={okt.tittel}
        description={okt.meta}
        minHeight={172}
        action={
          <Link
            href={okt.href}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Start økt
          </Link>
        }
      />
    );
  }

  // Tomstate — ingen økt planlagt i dag.
  return (
    <FeaturedCard
      eyebrow="Ingen økt i dag"
      title={harPlan ? "Fri dag — eller legg til en økt selv." : "La oss bygge planen din."}
      description={
        harPlan
          ? "Du har ingen planlagt økt i dag. Start en egentrening eller se ukesplanen."
          : "Vi setter opp en startplan så du kommer raskt i gang."
      }
      minHeight={172}
      action={
        <Link
          href={harPlan ? "/portal/tren" : "/portal/planlegge"}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          {harPlan ? "Start egentrening" : "Se planen"}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </Link>
      }
    />
  );
}

// ── KPI-strip 2x2 ──
function KpiSeksjon({ kpi }: { kpi: KpiCelle[] }) {
  return (
    <section aria-labelledby="kpi-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="kpi-heading"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Strokes Gained · siste runder
        </h2>
        <Link
          href="/portal/statistikk"
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80"
        >
          Se alt
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>

      {kpi.length > 0 ? (
        <div
          className={cn(
            "grid gap-2.5",
            kpi.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {kpi.map((k) => (
            <KpiCard
              key={k.label}
              label={k.label}
              value={k.value}
              trend={k.trend}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Strokes Gained vises når du har loggført runder eller lagt inn
            SG-tall.
          </p>
          <Link
            href="/portal/statistikk"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80"
          >
            Legg inn tall
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

// ── Pyramide-card (uke-vekting) ──
function PyramideSeksjon({ data }: { data: HjemData }) {
  return (
    <section
      aria-labelledby="pyr-heading"
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="pyr-heading"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Uka i pyramiden
        </h2>
        <Link
          href="/portal/analysere"
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80"
        >
          Full
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>

      {data.pyramide.length > 0 ? (
        <>
          <PyramidProgress rows={data.pyramide} />
          {data.pyramideNote && (
            <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
              <TrendingUp
                className="h-3 w-3 text-primary"
                strokeWidth={2}
                aria-hidden
              />
              {data.pyramideNote}
            </p>
          )}
        </>
      ) : (
        <p className="py-2 text-sm text-muted-foreground">
          Pyramiden bygges når du har loggført økter denne uka.
        </p>
      )}
    </section>
  );
}

// ── Neste tee-card ──
function NesteTeeSeksjon({ tee }: { tee: NesteTee | null }) {
  if (tee) {
    return (
      <Link
        href={tee.href}
        className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <span className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-secondary py-1.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {tee.dagKort}
          </span>
          <span className="font-mono text-lg font-bold leading-none tracking-[-0.01em] text-foreground">
            {tee.datoTall}
          </span>
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <Flag className="h-3 w-3 shrink-0 text-primary" strokeWidth={2} aria-hidden />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Neste tee · {tee.naar}
            </span>
          </span>
          <span className="mt-1 block truncate font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-foreground">
            {tee.navn}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
            {tee.sted}
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground/60"
          strokeWidth={2}
          aria-hidden
        />
      </Link>
    );
  }

  return (
    <Link
      href="/portal/kalender"
      className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <CalendarPlus className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Neste tee
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-foreground">
          Ingen turnering planlagt ennå
        </span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted-foreground/60"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}

// ── AI-innsikt-kort (én topp-innsikt fra Caddie) ──
const INNSIKT_IKON: Record<AiInsight["type"], typeof Sparkles> = {
  HANDLING: Sparkles,
  OBSERVASJON: TrendingUp,
  MAAL: Target,
};

const INNSIKT_IKON_KLASSE: Record<AiInsight["type"], string> = {
  HANDLING: "bg-accent text-accent-foreground",
  OBSERVASJON: "bg-info/15 text-info",
  MAAL: "bg-primary/10 text-primary",
};

const INNSIKT_LABEL: Record<AiInsight["type"], string> = {
  HANDLING: "Handling",
  OBSERVASJON: "Observasjon",
  MAAL: "Mål",
};

function InnsiktSeksjon({ innsikt }: { innsikt: AiInsight | null }) {
  if (!innsikt) return null;
  const Icon = INNSIKT_IKON[innsikt.type];

  return (
    <section aria-labelledby="innsikt-heading" className="space-y-3">
      <h2
        id="innsikt-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
      >
        Fra Caddie
      </h2>
      <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl",
              INNSIKT_IKON_KLASSE[innsikt.type],
            )}
          >
            <Icon className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="rounded-full bg-foreground px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-background">
            {INNSIKT_LABEL[innsikt.type]}
          </span>
        </div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {innsikt.eyebrow}
        </p>
        <p className="font-display text-[16px] font-medium leading-[1.45] tracking-[-0.005em] text-card-foreground">
          {innsikt.body}
        </p>
        {innsikt.cta && (
          <Link
            href={innsikt.cta.href}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:text-primary"
          >
            {innsikt.cta.label}
            <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
          </Link>
        )}
      </article>
    </section>
  );
}

// ── Hovedkomponent ──
// ── Hurtighandlinger — v10 HomeScreen hub-grid (4 kort, 2×2) ──
const HURTIG = [
  { href: "/portal/planlegge", Icon: CalendarRange, eyebrow: "PLANLEGGE", title: "Plan", status: "Sesong, mål og drills" },
  { href: "/portal/gjennomfore", Icon: Play, eyebrow: "GJENNOMFØRE", title: "Gjør jobben", status: "Dagens program" },
  { href: "/portal/analysere", Icon: BarChart3, eyebrow: "ANALYSERE", title: "Tallene", status: "SG og runder" },
  { href: "/portal/coach/melding", Icon: MessageSquare, eyebrow: "COACH", title: "Coachen din", status: "Meldinger" },
] as const;

function HurtighandlingerSeksjon() {
  return (
    <section aria-labelledby="hurtig-heading" className="space-y-3">
      <h2
        id="hurtig-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
      >
        Hurtighandlinger
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {HURTIG.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <h.Icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <span className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {h.eyebrow}
            </span>
            <span className="mt-0.5 font-display text-lg font-semibold tracking-tight text-foreground">
              {h.title}
            </span>
            <span className="mt-1 text-[12px] text-muted-foreground">{h.status}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HjemOversikt({ data }: { data: HjemData }) {
  // "harPlan" = brukeren har minst én økt loggført denne uka eller en kommende tee.
  const harPlan = data.pyramide.length > 0 || data.nesteTee != null;

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-5 px-4 py-5 sm:px-0 md:max-w-[720px]">
      <FotoHero data={data} />
      <KpiSeksjon kpi={data.kpi} />
      <DagensOktSeksjon okt={data.dagensOkt} harPlan={harPlan} />
      <HurtighandlingerSeksjon />

      <div className="grid gap-5 md:grid-cols-2">
        <PyramideSeksjon data={data} />
        <NesteTeeSeksjon tee={data.nesteTee} />
      </div>

      <InnsiktSeksjon innsikt={data.innsikt} />
    </div>
  );
}
