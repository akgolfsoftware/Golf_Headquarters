/**
 * BankID-skjerm — presentasjonell, props-drevet placeholder for /auth/bankid.
 *
 * Selvstendig SENTRERT kort på cream-bakgrunn, INGEN sidebar (auth-layout).
 * Samme grunnlayout mobil + desktop: kortet sentrert, maks ~440px.
 *
 * Pixel-fasit: public/design-handover/_screens/au-bankid.png
 * Spec: public/design-handover/_prompts/SKJERMER-RUNDE-1-AUTH-ONBOARDING.md §12
 *
 * Ingen DB/auth her — kun presentasjon. Tekst/lenker styres via props.
 */

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export type BankIdSkjermProps = {
  /** Mono-caps eyebrow over tittelen. */
  eyebrow?: string;
  /** Tittel-tekst før det italic-fremhevede ordet. */
  titlePrefix?: string;
  /** Ordet som rendres italic i primary-grønn (f.eks. "BankID"). */
  titleEmphasis?: string;
  /** Forklarende brødtekst under tittelen. */
  description?: string;
  /** Tekst på primær-CTA. */
  ctaLabel?: string;
  /** Rute primær-CTA peker til. */
  ctaHref?: string;
  /** Hjem-lenke bak logoen øverst. */
  logoHref?: string;
};

const DEFAULTS = {
  eyebrow: "BANKID · KOMMER POST-BETA",
  titlePrefix: "Verifiser med ",
  titleEmphasis: "BankID",
  description:
    "BankID-pålogging kommer på plass etter beta-perioden. Bruk e-post, passord eller Google for nå.",
  ctaLabel: "Tilbake til vanlig login →",
  ctaHref: "/auth/login",
  logoHref: "/",
} as const;

export function BankIdSkjerm({
  eyebrow = DEFAULTS.eyebrow,
  titlePrefix = DEFAULTS.titlePrefix,
  titleEmphasis = DEFAULTS.titleEmphasis,
  description = DEFAULTS.description,
  ctaLabel = DEFAULTS.ctaLabel,
  ctaHref = DEFAULTS.ctaHref,
  logoHref = DEFAULTS.logoHref,
}: BankIdSkjermProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-4 sm:p-8">
      <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">
        <div className="flex flex-col items-center">
          <Link
            href={logoHref}
            aria-label="AK Golf — hjem"
            className="mb-6 inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <AkGolfLogo width={56} />
          </Link>

          <div className="mb-6 grid h-[88px] w-[88px] place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-11 w-11" strokeWidth={1.5} aria-hidden />
          </div>

          <AthleticEyebrow tone="lime">{eyebrow}</AthleticEyebrow>

          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {titlePrefix}
            <em className="font-normal italic text-primary">{titleEmphasis}</em>
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="font-display inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-6 text-sm font-bold tracking-[-0.005em] text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
