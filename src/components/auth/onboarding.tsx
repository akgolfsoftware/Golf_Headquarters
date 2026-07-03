"use client";

/**
 * Onboarding — presentasjonell, props-drevet velkomst-skjerm (steg 1 av 7).
 *
 * Visuell fasit: [historisk fasit, fjernet 2026-07-03] _screens/pl-onboarding.png
 *
 * Selvstendig AUTH-skjerm: dyp forest-bakgrunn med hvit "ak"-logo øverst til
 * venstre, og ett SENTRERT hvitt kort (maks ~440px) som holder wizard-steget.
 * Samme grunnlayout på mobil og desktop (kortet sentreres). Ingen app-sidebar.
 *
 * Kortet inneholder, i rekkefølge:
 *   1. Progress-bar (7 segmenter, første aktiv/lime)
 *   2. Eyebrow-rad: "1 AV 7 · VELKOMMEN" (venstre) + "STEG 1 AV 7" (høyre)
 *   3. Hero-illustrasjon (mørk forest m/ diagonale striper, ak-merke + label)
 *   4. Overskrift m/ italic forest-aksent ("Vi gleder oss til å jobbe med deg.")
 *   5. Brødtekst (coach-invitasjon)
 *   6. Lime sitat-kort (coach-sitat + attribusjon)
 *   7. To linjer tilbakefall-tekst
 *   8. Primær CTA ("La oss starte →")
 * Pluss et statisk cookie-samtykke-overlay nederst (matcher fasiten).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon. Knapper er wiret med next/link
 * til ruter fra skjerm-manifestet (Auth §0 Onboarding-wizard).
 * Ingen hardkodet hex utenfor den dekorative hero-gradienten; kun DS-token-
 * klasser ellers. Ingen emoji — kun lucide-react.
 */

import Link from "next/link";
import { ArrowRight, Cookie, X } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

// ── Typer ────────────────────────────────────────────────────────────────────

export type OnboardingData = {
  /** Antall steg totalt (fasit: 7). */
  stegTotalt: number;
  /** Gjeldende steg (1-indeksert). */
  stegNaa: number;
  /** Eyebrow venstre, f.eks. "1 AV 7 · VELKOMMEN". */
  eyebrowVenstre: string;
  /** Eyebrow høyre, f.eks. "STEG 1 AV 7". */
  eyebrowHoyre: string;
  /** Mono-caps label nederst til høyre i hero-illustrasjonen. */
  heroLabel: string;
  /** Overskrift før den uthevede biten ("Vi "). */
  overskriftFor: string;
  /** Italic forest-aksent midt i overskriften ("gleder oss"). */
  overskriftAksent: string;
  /** Overskrift etter den uthevede biten (" til å jobbe med deg."). */
  overskriftEtter: string;
  /** Brødtekst under overskriften. */
  brodtekst: string;
  /** Coach-sitat (vises i italic i lime-kortet). */
  sitat: string;
  /** Attribusjon under sitatet (mono caps), f.eks. "Anders Kristiansen · Head Coach". */
  sitatNavn: string;
  /** Tilbakefall-linje 1 (muted), f.eks. "Du kan når som helst gå tilbake …". */
  tilbakefallTekst: string;
  /** Tilbakefall-linje 2 (uthevet), f.eks. "Ingenting er låst …". */
  tilbakefallUthevet: string;
  /** CTA-tekst, f.eks. "La oss starte". */
  ctaLabel: string;
  /** Rute CTA peker til (neste steg i wizarden). */
  ctaHref: string;
  /** Les mer-lenke i cookie-banneret. */
  vilkarHref: string;
};

// ── Underkomponent: progress-bar (segmenter) ─────────────────────────────────

function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-[3px]" role="presentation" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < current;
        const now = n === current;
        return (
          <span
            key={n}
            className={
              "h-[3px] flex-1 rounded-full " +
              (done ? "bg-primary" : now ? "bg-accent" : "bg-secondary")
            }
          />
        );
      })}
    </div>
  );
}

// ── Underkomponent: hero-illustrasjon ────────────────────────────────────────
// Bevisst dekorativt mørkt forest-kort med diagonale striper + lime-glød.
// Speiler .hero-illo i [historisk fasit, fjernet 2026-07-03] playerhq/components-onboarding.html.

function HeroIllo({ label }: { label: string }) {
  return (
    <div
      className="relative mb-3 flex h-[100px] items-end overflow-hidden rounded-xl p-3"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,88,64,0.92) 0%, rgba(15,42,34,0.97) 100%), repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,0.06) 14px 28px)",
        boxShadow:
          "0 8px 22px -10px rgba(15,42,34,0.55), 0 2px 6px -2px rgba(15,42,34,0.30)",
      }}
    >
      <span
        className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-full bg-accent opacity-20 blur-xl"
        aria-hidden
      />
      <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-base font-bold text-primary">
        ak
      </span>
      <span className="relative z-10 ml-auto font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        {label}
      </span>
    </div>
  );
}

// ── Underkomponent: lime sitat-kort ──────────────────────────────────────────

function SitatKort({ sitat, navn }: { sitat: string; navn: string }) {
  return (
    <figure className="my-4 rounded-2xl bg-accent px-5 py-5">
      <blockquote className="font-display text-[15px] font-medium italic leading-relaxed tracking-[-0.005em] text-primary">
        {sitat}
      </blockquote>
      <figcaption className="mt-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-primary">
        {navn}
      </figcaption>
    </figure>
  );
}

// ── Underkomponent: statisk cookie-banner (visuell replika for preview) ───────

function CookieBanner({ vilkarHref }: { vilkarHref: string }) {
  return (
    <div
      role="dialog"
      aria-label="Cookie-samtykke"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4"
    >
      <div className="pointer-events-auto flex w-full max-w-[440px] flex-col gap-3 rounded-t-2xl border border-border bg-card px-6 py-5 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cookie className="h-[18px] w-[18px] text-primary" strokeWidth={1.75} aria-hidden />
            <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
              Vi bruker informasjonskapsler
            </span>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="-mr-2 flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Vi bruker nødvendige informasjonskapsler for at plattformen skal
          fungere, og analyse-cookies (Plausible) for å forstå hvordan sidene
          brukes — ingen personopplysninger deles med tredjeparter.{" "}
          <Link href={vilkarHref} className="text-primary underline">
            Les mer
          </Link>
          .
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="h-11 min-w-[140px] flex-1 rounded-full bg-primary font-display text-[13px] font-bold text-accent transition-opacity hover:opacity-90"
          >
            Godta alle
          </button>
          <button
            type="button"
            className="h-11 min-w-[140px] flex-1 rounded-full border border-border bg-transparent font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            Kun nødvendige
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hovedkomponent ───────────────────────────────────────────────────────────

export function Onboarding({
  data,
  visKakebanner = true,
}: {
  data: OnboardingData;
  /** Vis statisk cookie-banner-overlay (matcher fasiten). Default true. */
  visKakebanner?: boolean;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-primary px-4 pb-28 pt-8 sm:pt-12">
      {/* Hvit ak-logo øverst, venstrejustert mot kortets bredde */}
      <div className="w-full max-w-[440px]">
        <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
          <AkGolfLogo variant="white" width={72} />
        </Link>
      </div>

      {/* Sentrert wizard-kort */}
      <div className="mt-6 w-full max-w-[440px] rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        {/* Progress */}
        <ProgressBar total={data.stegTotalt} current={data.stegNaa} />

        {/* Eyebrow-rad */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {data.eyebrowVenstre}
          </span>
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {data.eyebrowHoyre}
          </span>
        </div>

        {/* Hero-illustrasjon */}
        <div className="mt-4">
          <HeroIllo label={data.heroLabel} />
        </div>

        {/* Overskrift */}
        <h1 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          {data.overskriftFor}
          <em className="font-normal italic text-primary">{data.overskriftAksent}</em>
          {data.overskriftEtter}
        </h1>

        {/* Brødtekst */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {data.brodtekst}
        </p>

        {/* Sitat-kort */}
        <SitatKort sitat={data.sitat} navn={data.sitatNavn} />

        {/* Tilbakefall-tekst */}
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {data.tilbakefallTekst}
        </p>
        <p className="mt-1 text-[13px] font-bold leading-relaxed text-foreground">
          {data.tilbakefallUthevet}
        </p>

        {/* CTA */}
        <Link
          href={data.ctaHref}
          className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-base font-bold text-accent transition-opacity hover:opacity-90"
        >
          {data.ctaLabel}
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </Link>
      </div>

      {visKakebanner && <CookieBanner vilkarHref={data.vilkarHref} />}
    </main>
  );
}
