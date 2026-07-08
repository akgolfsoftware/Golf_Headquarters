/**
 * LoggetUtSkjerm — presentasjonell «logget ut»-bekreftelse for AK Golf HQ.
 *
 * Selvstendig sentrert kort på cream-bakgrunn, INGEN app-sidebar. Samme
 * grunnlayout på mobil og desktop (kort sentrert, maks ~440px).
 *
 * Portet fra v10-fasit: [historisk fasit, fjernet 2026-07-03] _screens/au-loggetut.png
 * (AK-logo → lime CheckCircle i accent-sirkel → lime eyebrow «AK GOLF · TAKK
 * FOR DENNE GANG» → display «Vi ses snart» → sub-tekst → primær-CTA «Logg inn
 * på nytt →» → ghost «Tilbake til akgolf.no» → divider + feedback-footer).
 *
 * Rent presentasjonelt + props-drevet: ingen Prisma/DB/Supabase/auth.
 */

import { Eyebrow } from "@/components/athletic/golfdata";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

export type LoggetUtSkjermProps = {
  /** Lenke bak logoen — vanligvis marketing-forsiden. */
  hjemHref?: string;
  /** Lenke til ny innlogging (primær-CTA). */
  loggInnHref?: string;
  /** Lenke «Tilbake til akgolf.no» (sekundær/ghost-CTA). */
  marketingHref?: string;
  /** E-postadresse for feedback-lenken i footer. */
  feedbackEpost?: string;
};

export function LoggetUtSkjerm({
  hjemHref = "/",
  loggInnHref = "/auth/login",
  marketingHref = "/",
  feedbackEpost = "post@akgolf.no",
}: LoggetUtSkjermProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">
        {/* Topp: logo + sjekk-merke + eyebrow + tittel + sub */}
        <div className="flex flex-col items-center">
          <Link
            href={hjemHref}
            aria-label="AK Golf — hjem"
            className="mb-6 inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <AkGolfLogo width={56} />
          </Link>

          <div className="mb-6 grid h-[88px] w-[88px] place-items-center rounded-full bg-accent text-primary">
            <CheckCircle className="h-11 w-11" strokeWidth={1.5} aria-hidden />
          </div>

          <Eyebrow as="span" tone="signal">
            AK GOLF · TAKK FOR DENNE GANG
          </Eyebrow>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            Vi <em className="font-normal italic text-primary">ses</em> snart
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Din sesjon er avsluttet. Logg inn igjen når du er klar.
          </p>
        </div>

        {/* CTA-er */}
        <div className="mt-8 flex flex-col gap-2">
          <Link
            href={loggInnHref}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-primary px-6 font-display text-base font-bold tracking-[-0.005em] text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Logg inn på nytt <span aria-hidden>→</span>
          </Link>
          <Link
            href={marketingHref}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-transparent px-6 font-display text-base font-bold tracking-[-0.005em] text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tilbake til akgolf.no
          </Link>
        </div>

        {/* Feedback-footer */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Hadde du en god økt? Del feedback med oss på{" "}
            <a
              href={`mailto:${feedbackEpost}`}
              className="font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {feedbackEpost}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
