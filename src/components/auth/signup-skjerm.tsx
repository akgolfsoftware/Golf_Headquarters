"use client";

/**
 * SignupSkjerm — presentasjonell, props-drevet registrer-konto-skjerm.
 *
 * Visuell fasit: public/design-handover/_screens/au-signup.png
 *
 * Selvstendig SENTRERT kort på cream-bakgrunn (ingen app-sidebar). Samme
 * grunnlayout på mobil og desktop — kortet er maks ~440px og sentreres.
 *
 * INGEN Prisma/DB/auth her. Tier-/rolle-/checkbox-valg er ren lokal UI-state
 * for visuell demonstrasjon. Knapper er wiret med next/link til ruter fra
 * skjerm-manifestet (Auth §0).
 */

import { useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

// ── Typer ──────────────────────────────────────────────────────────────────

export type TierKort = {
  id: string;
  navn: string;
  pris: string;
  beskrivelse: string;
  /** Lime pill øverst til høyre, overlappende kortkanten (f.eks. "Mest populær"). */
  toppBadge?: string;
  /** Lime pill inne i kortet under prisen (f.eks. "1. måned gratis"). */
  inlineBadge?: string;
};

export type RolleValg = {
  id: string;
  label: string;
};

export type SignupSkjermData = {
  eyebrow: string;
  /** Italic-aksent (forest) først i overskriften, f.eks. "Velkommen". */
  overskriftItalic: string;
  /** Resten av overskriften (mørk), f.eks. "til AK Golf". */
  overskriftResten: string;
  underTekst: string;
  medlemskapLabel: string;
  tiers: TierKort[];
  /** Id på tier som er forhåndsvalgt. */
  valgtTierId: string;
  fornavnLabel: string;
  etternavnLabel: string;
  roller: RolleValg[];
  valgtRolleId: string;
  ctaLabel: string;
  loggInnPrefiks: string;
  loggInnLabel: string;
  loggInnHref: string;
  ctaHref: string;
  vilkarHref: string;
  personvernHref: string;
};

// ── Underkomponent: tier-kort ────────────────────────────────────────────────

function TierRad({
  tier,
  valgt,
  onClick,
}: {
  tier: TierKort;
  valgt: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={valgt}
      className={
        "relative block w-full rounded-xl border p-4 text-left transition-colors " +
        (valgt
          ? "border-primary bg-primary/[0.06]"
          : "border-border bg-card hover:border-muted-foreground/30")
      }
    >
      {tier.toppBadge && (
        <span className="absolute -top-2.5 right-3 inline-flex items-center rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-accent-foreground">
          {tier.toppBadge}
        </span>
      )}

      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-[17px] font-bold tracking-[-0.01em] text-foreground">
          {tier.navn}
        </span>
        <span className="font-mono text-sm font-semibold tracking-[0.02em] text-primary">
          {tier.pris}
        </span>
      </div>

      {tier.inlineBadge && (
        <span className="mt-2 inline-flex items-center rounded-md bg-accent/35 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-accent-foreground">
          {tier.inlineBadge}
        </span>
      )}

      <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
        {tier.beskrivelse}
      </p>
    </button>
  );
}

// ── Underkomponent: statisk cookie-banner (visuell replika for preview) ───────

function KakeBanner({
  vilkarHref,
}: {
  vilkarHref: string;
}) {
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

export function SignupSkjerm({
  data,
  visKakebanner = true,
}: {
  data: SignupSkjermData;
  /** Vis statisk cookie-banner-overlay (matcher fasiten). Default true. */
  visKakebanner?: boolean;
}) {
  const [valgtTier, setValgtTier] = useState(data.valgtTierId);
  const [valgtRolle, setValgtRolle] = useState(data.valgtRolleId);
  const [godtar, setGodtar] = useState(false);

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
            <AkGolfLogo width={64} />
          </Link>
          <div className="mt-5">
            <AthleticEyebrow tone="lime">{data.eyebrow}</AthleticEyebrow>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground">
            <em className="font-normal italic text-primary">
              {data.overskriftItalic}
            </em>{" "}
            {data.overskriftResten}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{data.underTekst}</p>
        </div>

        {/* Medlemskap */}
        <div className="mt-8">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {data.medlemskapLabel}
          </p>
          <div className="space-y-3">
            {data.tiers.map((t) => (
              <TierRad
                key={t.id}
                tier={t}
                valgt={t.id === valgtTier}
                onClick={() => setValgtTier(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Navn */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Felt id="fornavn" label={data.fornavnLabel} autoComplete="given-name" />
          <Felt id="etternavn" label={data.etternavnLabel} autoComplete="family-name" />
        </div>

        {/* Rolle-toggle */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.roller.map((r) => {
            const aktiv = r.id === valgtRolle;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setValgtRolle(r.id)}
                aria-pressed={aktiv}
                className={
                  "h-12 rounded-xl border text-[15px] font-medium transition-colors " +
                  (aktiv
                    ? "border-primary bg-primary/[0.06] font-semibold text-primary"
                    : "border-border bg-card text-foreground hover:border-muted-foreground/30")
                }
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Vilkår-checkbox */}
        <label className="mt-6 flex items-start gap-3 text-[15px] text-muted-foreground">
          <input
            type="checkbox"
            checked={godtar}
            onChange={(e) => setGodtar(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded-[4px] accent-primary"
          />
          <span>
            Jeg godtar{" "}
            <Link href={data.vilkarHref} className="text-primary hover:underline">
              vilkårene
            </Link>{" "}
            og{" "}
            <Link href={data.personvernHref} className="text-primary hover:underline">
              personvernerklæringen
            </Link>
            .
          </span>
        </label>

        {/* CTA */}
        <Link
          href={data.ctaHref}
          className="mt-6 flex h-[60px] w-full items-center justify-center rounded-xl bg-primary font-display text-base font-bold text-accent transition-opacity hover:opacity-90"
        >
          {data.ctaLabel}
        </Link>

        {/* Logg inn-lenke */}
        <p className="mt-6 text-center text-base text-muted-foreground">
          {data.loggInnPrefiks}{" "}
          <Link
            href={data.loggInnHref}
            className="font-semibold text-primary hover:underline"
          >
            {data.loggInnLabel}
          </Link>
        </p>
      </div>

      {visKakebanner && <KakeBanner vilkarHref={data.vilkarHref} />}
    </main>
  );
}

// ── Underkomponent: navn-felt ────────────────────────────────────────────────

function Felt({
  id,
  label,
  autoComplete,
}: {
  id: string;
  label: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
