/**
 * IkkeFunnet — presentasjonell 404 «Siden ble ikke funnet»-side for AK Golf HQ.
 *
 * Minimal, sentrert systemside uten app-sidebar. Bygget pixel-mot v10-fasit:
 * [historisk fasit, fjernet 2026-07-03] _screens/mx-404.png — stor muted «404» med golfball-
 * detalj i nullen, H1 «Siden ble ikke funnet», kort forklaring og én primær
 * CTA «Tilbake til forsiden» (forest fyll + lime tekst, pill-radius).
 *
 * Rent presentasjonelt + props-drevet: ingen Prisma/DB/Supabase/auth.
 * Brukes både av app-ruten (app/not-found) og preview-ruten.
 */

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export type IkkeFunnetProps = {
  /** Lenke bak primær-CTA-en — vanligvis marketing-forsiden. */
  hjemHref?: string;
  /** Tekst på primær-CTA-en. */
  knappTekst?: string;
  /** Overskrift. */
  tittel?: string;
  /** Forklarende undertekst. */
  beskrivelse?: string;
};

export function IkkeFunnet({
  hjemHref = "/",
  knappTekst = "Tilbake til forsiden",
  tittel = "Siden ble ikke funnet",
  beskrivelse = "Siden du leter etter eksisterer ikke, eller har blitt flyttet.",
}: IkkeFunnetProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* Stor «404» med golfball-detalj i nullen */}
        <p
          aria-hidden="true"
          className="font-display flex select-none items-center justify-center text-[96px] font-semibold leading-none tracking-tight text-muted-foreground/30 sm:text-[140px]"
        >
          <span>4</span>
          <span className="relative inline-flex items-center justify-center">
            0
            <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/30 sm:h-3.5 sm:w-3.5" />
          </span>
          <span>4</span>
        </p>

        {/* Overskrift */}
        <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-foreground sm:mt-8 sm:text-4xl">
          {tittel}
        </h1>

        {/* Forklaring */}
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
          {beskrivelse}
        </p>

        {/* Primær-CTA */}
        <Link
          href={hjemHref}
          className={buttonClasses({
            variant: "primary",
            size: "lg",
            className: "mt-10 rounded-full px-8",
          })}
        >
          {knappTekst}
        </Link>
      </div>
    </main>
  );
}
