/**
 * BankID-skjerm — presentasjonell, props-drevet placeholder for /auth/bankid.
 *
 * Selvstendig SENTRERT kort på cream-bakgrunn, INGEN sidebar (auth-layout).
 * Samme grunnlayout mobil + desktop: kortet sentrert, maks ~440px.
 *
 * Design-fasit (juni 2026): (historisk juni-fasit, fjernet fra repo) 
 *   playerhq-app/ph-auth.jsx → ABankID (start-fasen er det visuelle skallet:
 *   mørk BankID-badge → tittel «Logg inn med BankID.» → ingress → primær-CTA).
 *
 * Bevisste avvik fra fasit:
 * - Fasitens fødselsnummer-felt + «Start BankID»/verifying/ok-faser krever
 *   BankID-logikk som ikke finnes (kommer post-BETA) → utelatt. CTA peker
 *   tilbake til vanlig login, og «Avbryt»-knappen utgår av samme grunn.
 * - Fasitens badge-farge #39134C (BankID-lilla) er ikke DS-token, og ny token
 *   i globals.css er utenfor scope → foreground-token brukes (mørk flate).
 * - Eyebrow «KOMMER POST-BETA» beholdt (ærlig status — fasit har ingen eyebrow).
 * - Topp-logo beholdt for merkevare-kontekst på frittstående side.
 *
 * Ingen DB/auth her — kun presentasjon. Tekst/lenker styres via props.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export type BankIdSkjermProps = {
  /** Mono-caps eyebrow over tittelen. */
  eyebrow?: string;
  /** Tittel-tekst før det italic-fremhevede ordet. */
  titlePrefix?: string;
  /** Ordet som rendres italic i primary-grønn (f.eks. "BankID."). */
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
  titlePrefix: "Logg inn med ",
  titleEmphasis: "BankID.",
  description:
    "BankID-pålogging kommer på plass etter beta-perioden. Bruk e-post, passord eller Google for nå.",
  ctaLabel: "Tilbake til vanlig login",
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

          {/* BankID-badge — fasit: 64px mørkt kvadrat med ordmerke */}
          <span
            aria-hidden
            className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-foreground font-display text-[15px] font-extrabold tracking-[-0.02em] text-background"
          >
            BankID
          </span>

          <AthleticEyebrow>{eyebrow}</AthleticEyebrow>

          <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground [text-wrap:balance]">
            {titlePrefix}
            <em className="font-normal italic text-primary">{titleEmphasis}</em>
          </h1>

          <p className="mt-3 text-[14.5px] leading-[1.55] text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="font-display inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold tracking-[-0.005em] text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {ctaLabel}
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}
