/**
 * ForgotSkjerm — presentasjonell "Glemt passord"-skjerm for AK Golf HQ.
 *
 * Selvstendig, sentrert kort på cream-bakgrunn (ingen sidebar). Pixel-fasit:
 * public/design-handover/_screens/au-forgot.png.
 *
 * Innhold (rekkefølge): AK-logo → lime eyebrow "BISTAND · PASSORD" →
 * display-tittel "Glemt passord?" (italic "Glemt") → muted sub-tekst →
 * E-POST-label → e-post-input → primær grønn-knapp "Send reset-lenke" →
 * "Husket passordet? Logg inn"-lenke.
 *
 * Cookie-banneret i fasiten kommer fra den globale <CookieBanner /> i
 * root-layouten — ikke fra denne skjermen (unngår dobbelt banner).
 *
 * Props-drevet og uten side-effekter — ingen Prisma/DB/auth her.
 */
import Link from "next/link";

import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AkLogo } from "@/components/auth/ak-logo";

export type ForgotSkjermProps = {
  /** Rute for "Logg inn"-lenken og skjema-submit. */
  loginHref?: string;
};

export function ForgotSkjerm({ loginHref = "/auth/login" }: ForgotSkjermProps) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-5 py-16 sm:py-20">
      <div className="w-full max-w-[440px]">
        <div className="rounded-3xl bg-card px-6 pb-14 pt-12 shadow-[0_1px_3px_rgba(10,31,23,0.04),0_12px_40px_-12px_rgba(10,31,23,0.12)] sm:px-10">
          {/* Logo */}
          <div className="flex justify-center">
            <AkLogo className="h-14 w-auto" />
          </div>

          {/* Eyebrow */}
          <div className="mt-8 text-center">
            <AthleticEyebrow tone="lime">BISTAND · PASSORD</AthleticEyebrow>
          </div>

          {/* Tittel */}
          <h1 className="mt-4 text-center font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground">
            <em className="font-display font-medium italic text-primary">
              Glemt{" "}
            </em>
            passord?
          </h1>

          {/* Sub-tekst */}
          <p className="mx-auto mt-4 max-w-[20rem] text-center text-[1.0625rem] leading-relaxed text-muted-foreground">
            Skriv inn e-posten din. Vi sender en lenke for å lage nytt passord.
          </p>

          {/* Skjema */}
          <form className="mt-10" action={loginHref}>
            <label
              htmlFor="forgot-email"
              className="block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              E-post
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className="mt-2.5 h-14 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40"
            />

            <button
              type="submit"
              className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Send reset-lenke
            </button>
          </form>

          {/* Tilbake til login */}
          <p className="mt-8 text-center text-base text-muted-foreground">
            Husket passordet?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Logg inn
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
