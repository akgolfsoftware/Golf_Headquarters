/**
 * PlayerHQ Hjem — portet FRA v10-fasit:
 *   - Visuell fasit: public/design-handover/_screens/pl-hjem.png (mobil 430px, tom-tilstand ny spiller)
 *   - HTML/CSS-referanse: public/design-handover/playerhq/components-player-mobile.html (skjerm 01)
 *   - Spec: SKJERMER-RUNDE-2-PLAYERHQ-HOVEDSKJERMER.md §1
 *
 * Presentasjonell komponent. Tar all data via `PlayerHomeData`-props — INGEN
 * Prisma/DB/auth her. Mobil er primær-fasit (pixel-perfekt mot PNG); desktop
 * utvider responsivt (sentrert lesbar kolonne, sidebar leveres av skall-laget).
 *
 * Vertikal stack (topp → bunn), eksakt rekkefølge fra pl-hjem.png:
 *   1. Foto-hero (eyebrow PLAYERHQ · TIER + avatar, status-rad m/ lime dot, hilsen-headline italic)
 *   2. "Dagens økt"-kort (forest-gradient) — tom-tilstand: "La oss bygge planen din." + SE PLANEN
 *   3. Strokes Gained-seksjon — header + SE ALT, tom-tilstand-tekst
 *   4. Neste turnering-rad — tom-tilstand: "Ingen turnering planlagt ennå"
 *   5. Fra Caddie-seksjon — handling-kort med lime ikon-boks + PLAN NY ØKT
 *
 * Athletic-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen emoji
 * (kun lucide-ikoner). All tekst norsk bokmål.
 */

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CalendarPlus,
  TrendingUp,
  Sparkles,
  Target,
} from "lucide-react";
import { FeaturedCard, KpiCard, PyramidProgress } from "@/components/athletic";
import type { PyramidRow } from "@/components/athletic";
import { PulseDot } from "@/components/athletic/pulse-dot";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell — alt skjermen trenger, levert som props.
// ────────────────────────────────────────────────────────────────────────────

export type CaddieInnsiktType = "HANDLING" | "OBSERVASJON" | "MAAL";

export type KpiCelle = {
  label: string;
  value: string;
  trend?: { value: string; tone?: "positive" | "negative" | "neutral" };
};

export type PlayerHomeData = {
  user: {
    fornavn: string;
    initialer: string;
    tier: string; // f.eks. "GRATIS", "PRO"
    avatarUrl?: string;
  };
  /** Bilde-id i public/images/akgolf/AK-Golf-Academy-<id>.webp */
  heroImageId: number;
  /** Status-rad over headline, f.eks. "MAN 2. JUN · UKE 23" */
  datoEyebrow: string;
  /** Hilsen, f.eks. "God morgen" */
  hilsen: string;
  /** Dagens økt — null = tom-tilstand ("La oss bygge planen din."). */
  dagensOkt: {
    eyebrow: string;
    tittel: string;
    meta: string;
    href: string;
  } | null;
  /** KPI-celler for Strokes Gained — tom array = tom-tilstand. */
  kpi: KpiCelle[];
  /** Pyramide-rader — tom array = ingen pyramide ennå (skjules i tom-tilstand). */
  pyramide: PyramidRow[];
  pyramideNote?: string;
  /** Neste tee/turnering — null = "Ingen turnering planlagt ennå". */
  nesteTurnering: {
    dagKort: string;
    datoTall: string;
    naar: string;
    navn: string;
    sted: string;
    href: string;
  } | null;
  /** Topp-innsikt fra Caddie — null = skjul seksjon. */
  caddie: {
    type: CaddieInnsiktType;
    eyebrow: string;
    body: string;
    cta: { label: string; href: string };
  } | null;
  /** Lenker til andre PlayerHQ-skjermer. */
  hrefs: {
    planlegge: string; // "SE PLANEN"
    sgHub: string; // "SE ALT" (Strokes Gained)
    turneringer: string; // hero-turnering / Neste tee tom-CTA
  };
};

// ────────────────────────────────────────────────────────────────────────────
// 1. Foto-hero — dark gradient + eyebrow/avatar topp, hilsen-headline bunn.
//    Unntak (Anders 2026-06-02): PlayerHQ-hjem beholder profilbilde + tier-pill
//    øverst i hero (v10 har dato-eyebrow + vær der).
// ────────────────────────────────────────────────────────────────────────────

function FotoHero({ data }: { data: PlayerHomeData }) {
  return (
    <header className="relative overflow-hidden rounded-[20px] shadow-[0_20px_48px_-12px_rgba(10,31,23,0.18)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/akgolf/AK-Golf-Academy-${data.heroImageId}.webp`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 50%" }}
        loading="eager"
      />
      {/* Mørk gradient — diagonal + bunn, så tekst er lesbar. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 46%, rgba(0,0,0,0.10) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 50%)",
        }}
      />

      <div className="relative flex min-h-[360px] flex-col justify-between p-5 text-background sm:min-h-[380px] sm:p-7">
        {/* Topp: eyebrow PLAYERHQ · TIER (venstre) + avatar (høyre) */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            PlayerHQ · {data.user.tier}
          </span>
          <Link
            href="/portal/meg"
            aria-label="Min profil"
            className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent bg-foreground/30 font-display text-base font-bold text-accent transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
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
          </Link>
        </div>

        {/* Bunn: status-rad + hilsen-headline */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <PulseDot size="sm" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-background/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
              {data.datoEyebrow}
            </span>
          </div>
          <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.04] tracking-[-0.025em] text-background [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
            {data.hilsen},{" "}
            <span className="font-normal italic text-accent">
              {data.user.fornavn}.
            </span>
          </h1>
        </div>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Dagens økt — forest-gradient featured-card. Tom-tilstand = startplan-CTA.
// ────────────────────────────────────────────────────────────────────────────

function DagensOktSeksjon({ data }: { data: PlayerHomeData }) {
  const okt = data.dagensOkt;

  if (okt) {
    return (
      <FeaturedCard
        eyebrow={okt.eyebrow}
        showPulse
        title={okt.tittel}
        description={okt.meta}
        minHeight={176}
        action={
          <Link
            href={okt.href}
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Start økt
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        }
      />
    );
  }

  // Tom-tilstand (ny spiller, ingen plan ennå).
  return (
    <FeaturedCard
      eyebrow="Ingen økt i dag"
      title="La oss bygge planen din."
      description="Vi setter opp en startplan så du kommer raskt i gang."
      minHeight={176}
      action={
        <Link
          href={data.hrefs.planlegge}
          className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Se planen
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </Link>
      }
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Strokes Gained — header + SE ALT, KPI-grid eller tom-tilstand-tekst.
// ────────────────────────────────────────────────────────────────────────────

function StrokesGainedSeksjon({ data }: { data: PlayerHomeData }) {
  return (
    <section aria-labelledby="sg-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="sg-heading"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Strokes Gained · siste runder
        </h2>
        <Link
          href={data.hrefs.sgHub}
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary hover:opacity-80"
        >
          Se alt
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>

      {data.kpi.length > 0 ? (
        <div
          className={cn(
            "grid gap-2.5",
            data.kpi.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {data.kpi.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} trend={k.trend} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Strokes Gained vises når du har loggført runder eller lagt inn
            SG-tall.
          </p>
        </div>
      )}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Pyramide — vises kun når det finnes data (skjult i tom-tilstand per fasit).
// ────────────────────────────────────────────────────────────────────────────

function PyramideSeksjon({ data }: { data: PlayerHomeData }) {
  if (data.pyramide.length === 0) return null;
  return (
    <section
      aria-labelledby="pyr-heading"
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="pyr-heading"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Uka i pyramiden
        </h2>
        <Link
          href={data.hrefs.sgHub}
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary hover:opacity-80"
        >
          Full
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
      <PyramidProgress rows={data.pyramide} />
      {data.pyramideNote && (
        <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
          {data.pyramideNote}
        </p>
      )}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Neste turnering — rad eller tom-tilstand "Ingen turnering planlagt ennå".
// ────────────────────────────────────────────────────────────────────────────

function NesteTurneringSeksjon({ data }: { data: PlayerHomeData }) {
  const t = data.nesteTurnering;

  if (t) {
    return (
      <Link
        href={t.href}
        className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <span className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-secondary py-1.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {t.dagKort}
          </span>
          <span className="font-mono text-lg font-bold leading-none tracking-[-0.01em] text-foreground">
            {t.datoTall}
          </span>
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <CalendarPlus className="h-3 w-3 shrink-0 text-primary" strokeWidth={2} aria-hidden />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Neste tee · {t.naar}
            </span>
          </span>
          <span className="mt-1 block truncate font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-foreground">
            {t.navn}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
            {t.sted}
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
      href={data.hrefs.turneringer}
      className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <CalendarPlus className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
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

// ────────────────────────────────────────────────────────────────────────────
// 5. Fra Caddie — handling-kort: lime ikon-boks (venstre) + type-pill (høyre),
//    eyebrow, brødtekst (sans), CTA-lenke.
// ────────────────────────────────────────────────────────────────────────────

const CADDIE_IKON: Record<CaddieInnsiktType, typeof Sparkles> = {
  HANDLING: Sparkles,
  OBSERVASJON: TrendingUp,
  MAAL: Target,
};

const CADDIE_LABEL: Record<CaddieInnsiktType, string> = {
  HANDLING: "Handling",
  OBSERVASJON: "Observasjon",
  MAAL: "Mål",
};

function FraCaddieSeksjon({ data }: { data: PlayerHomeData }) {
  const c = data.caddie;
  if (!c) return null;
  const Icon = CADDIE_IKON[c.type];

  return (
    <section aria-labelledby="caddie-heading" className="space-y-3">
      <h2
        id="caddie-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        Fra Caddie
      </h2>
      <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <span className="rounded-full bg-foreground px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-background">
            {CADDIE_LABEL[c.type]}
          </span>
        </div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {c.eyebrow}
        </p>
        <p className="text-[17px] font-medium leading-[1.45] tracking-[-0.005em] text-card-foreground">
          {c.body}
        </p>
        <Link
          href={c.cta.href}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
        >
          {c.cta.label}
          <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </article>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne. Skall (sidebar/bunn-nav) leveres av
// preview/portal-laget; her er det rene innholdet.
// ────────────────────────────────────────────────────────────────────────────

export function PlayerHome({ data }: { data: PlayerHomeData }) {
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-5 px-4 py-5 sm:px-0 md:max-w-[720px]">
      <FotoHero data={data} />
      <DagensOktSeksjon data={data} />
      <StrokesGainedSeksjon data={data} />
      <PyramideSeksjon data={data} />
      <NesteTurneringSeksjon data={data} />
      <FraCaddieSeksjon data={data} />
    </div>
  );
}
