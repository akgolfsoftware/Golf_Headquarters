"use client";

/**
 * LoginSkjerm — presentasjonell innloggings-skjerm for AK Golf HQ.
 *
 * Selvstendig sentrert kort på cream-bakgrunn, INGEN app-sidebar. Samme
 * grunnlayout på mobil og desktop (kort sentrert, maks ~440px).
 *
 * Portet fra v10-fasit (autoritativ kilde):
 *   public/design-handover/v10/playerhq-app/auth/screens.jsx → Login (linje 33-56)
 *   public/design-handover/v10/playerhq-app/auth/shell.jsx   → AuthField (linje 30)
 *
 * Struktur (v10): lime-logo-boks → eyebrow «LOGG INN» (muted) →
 * «Velkommen tilbake.» (tilbake = grønn italic) → lead → e-post (mail-ikon)
 * → passord (lock-ikon) → «Glemt passord?» (høyrejustert, alene) →
 * primær-CTA «Logg inn ➜» → ELLER → BankID → footer «Ny spiller? Opprett konto».
 *
 * Rent presentasjonelt + props-drevet: ingen Prisma/DB/Supabase/auth.
 * Lokal UI-state finnes kun for de to inputs.
 */

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { Button } from "@/components/ui/button";
import { AthleticBadge } from "@/components/athletic/badge";

export type LoginSkjermProps = {
  /** Lenke bak logoen — vanligvis marketing-forsiden. */
  hjemHref?: string;
  /** Lenke til «Glemt passord?». */
  glemtPassordHref?: string;
  /** Lenke til «Opprett konto» (footer). */
  opprettKontoHref?: string;
  /**
   * @deprecated Footer går nå til signup (v10). Beholdt for bakoverkompat
   * med preview-indeks-siden som fortsatt sender denne.
   */
  bookHref?: string;
  /** Vis feil-badge over CTA (f.eks. «Feil e-post eller passord»). */
  feil?: string | null;
  /** Laster-tilstand: CTA disables og bytter tekst. */
  laster?: boolean;
  /** Forhåndsutfylt e-post (demo/preview). */
  startEpost?: string;
};

export function LoginSkjerm({
  hjemHref = "/",
  glemtPassordHref = "/auth/forgot-password",
  opprettKontoHref = "/auth/signup",
  feil = null,
  laster = false,
  startEpost = "",
}: LoginSkjermProps) {
  const [epost, setEpost] = useState(startEpost);
  const [passord, setPassord] = useState("");

  const feilId = "login-feil";

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        {/* Topp: lime-logo-boks + eyebrow + tittel + lead */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href={hjemHref}
            aria-label="AK Golf — hjem"
            className="mb-6 inline-flex rounded-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className="grid h-12 w-12 place-items-center rounded-[11px] bg-accent font-display text-xl font-extrabold leading-none text-primary"
            >
              ak
            </span>
          </Link>
          <AthleticEyebrow>LOGG INN</AthleticEyebrow>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            Velkommen{" "}
            <em className="font-normal italic text-primary">tilbake.</em>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Logg inn for å se dagens program og tallene dine.
          </p>
        </div>

        {/* Form — presentasjonell, ingen reell submit */}
        <form
          className="space-y-4"
          noValidate
          aria-describedby={feil ? feilId : undefined}
          onSubmit={(e) => e.preventDefault()}
        >
          {/* E-post — mail-ikon til venstre (v10 AuthField) */}
          <div>
            <label
              htmlFor="login-epost"
              className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
            >
              E-post
            </label>
            <div className="relative">
              <Mail
                aria-hidden
                strokeWidth={1.75}
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="login-epost"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={epost}
                onChange={(e) => setEpost(e.target.value)}
                placeholder="navn@klubb.no"
                aria-invalid={feil ? true : undefined}
                className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-sm"
              />
            </div>
          </div>

          {/* Passord — lock-ikon til venstre (v10 AuthField, ingen vis-toggle) */}
          <div>
            <label
              htmlFor="login-passord"
              className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Passord
            </label>
            <div className="relative">
              <Lock
                aria-hidden
                strokeWidth={1.75}
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="login-passord"
                name="password"
                type="password"
                autoComplete="current-password"
                value={passord}
                onChange={(e) => setPassord(e.target.value)}
                placeholder="Passord"
                aria-invalid={feil ? true : undefined}
                className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-sm"
              />
            </div>
          </div>

          {/* Glemt passord — høyrejustert, alene (v10) */}
          <div className="flex justify-end">
            <Link
              href={glemtPassordHref}
              className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Glemt passord?
            </Link>
          </div>

          {/* Feil-state */}
          <div role="alert" aria-live="polite" aria-atomic="true" id={feilId}>
            {feil && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
                <AthleticBadge variant="urgent">Feil</AthleticBadge>
                <span className="text-sm text-destructive">{feil}</span>
              </div>
            )}
          </div>

          {/* Primær-CTA — arrow-right (v10) */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={laster}
            aria-busy={laster || undefined}
            className="h-12 w-full text-base"
          >
            {laster ? (
              "Logger inn…"
            ) : (
              <>
                Logg inn
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </>
            )}
          </Button>

          {/* ELLER-divider */}
          <div className="relative py-1">
            <div aria-hidden className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span
                aria-hidden
                className="bg-card px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Eller
              </span>
            </div>
          </div>

          {/* BankID (presentasjonell) — v10 BankIDButton.
              #39134c er BankID-merkevarefargen, hardkodet i v10-fasiten;
              det finnes ingen designsystem-token for den. */}
          <button
            type="button"
            aria-label="Logg inn med BankID"
            className="flex h-12 w-full items-center justify-center gap-1.5 rounded-md font-display font-extrabold tracking-[-0.02em] text-white transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ backgroundColor: "#39134c" }}
          >
            BankID
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </form>

        {/* Footer — «Ny spiller? Opprett konto» (v10) */}
        <div className="mt-6 border-t border-border pt-6 text-center font-mono text-xs">
          <span className="text-muted-foreground">Ny spiller? </span>
          <Link
            href={opprettKontoHref}
            className="font-bold text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Opprett konto
          </Link>
        </div>
      </div>
    </main>
  );
}
