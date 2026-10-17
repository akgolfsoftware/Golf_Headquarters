/**
 * Felles ramme for de øvrige flatene i nytt design (utkast-flater, 15.10.2026):
 * konto (innlogging, oppstart, samtykke) og system (404, 500, vedlikehold, ikke tilgang,
 * frakoblet). Logo øverst og én lenke til høyre, deretter innholdet i én kolonne.
 *
 * Bevisst uten next/link og uten "use client": rammen brukes også i loading.tsx
 * (gotchas §Bygg og drift, CSP-nonce). Stilen bor i src/styles/flater-ny.css.
 */
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import "@/styles/flater-ny.css";

export type FlateLenke = { tekst: string; href: string };

export function FlateRamme({
  skall,
  toppLenke,
  tilbake,
  bred,
  iSkall,
  children,
}: {
  skall: "konto" | "system";
  /** Lenken øverst til høyre, f.eks. «Har du konto? Logg inn». */
  toppLenke?: FlateLenke;
  tilbake?: FlateLenke;
  /** Oppstarten bruker 820 px på PC i stedet for 480 px. */
  bred?: boolean;
  /** Ligger inni et annet skall (AgencyOS, PlayerHQ): ingen egen topplinje. */
  iSkall?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="fln" data-skall={skall} data-bred={bred ? "" : undefined} style={iSkall ? { minHeight: 0 } : undefined}>
      {!iSkall && (
        <div className="fl-konto-topp">
          <a href="/" aria-label="AK Golf HQ, til forsiden">
            {/* eslint-disable-next-line @next/next/no-img-element -- rammen er server-trygg uten next/image */}
            <img className="logo" src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={91} height={20} />
          </a>
          {toppLenke && <a href={toppLenke.href}>{toppLenke.tekst}</a>}
        </div>
      )}
      <main className="innhold">
        {tilbake && (
          <a className="fl-tilbake" href={tilbake.href}>
            <ChevronLeft className="ikon" aria-hidden="true" />
            {tilbake.tekst}
          </a>
        )}
        {children}
      </main>
    </div>
  );
}

/** Laster-tilstand med skjelett, som utkastets tilstandsflate. */
export function FlateLaster({ tekst = "Et øyeblikk …" }: { tekst?: string }) {
  return (
    <div className="tilstand-blokk" aria-busy="true">
      <p className="forklar">{tekst}</p>
      <i className="skjelett" style={{ height: 120 }} />
      <i className="skjelett" style={{ height: 72 }} />
      <i className="skjelett" style={{ height: 72 }} />
    </div>
  );
}

/** Tom- eller feilkort: tittel, forklaring og én vei videre. */
export function FlateMelding({ tittel, tekst, handling }: { tittel: string; tekst: string; handling?: ReactNode }) {
  return (
    <div className="tilstand-blokk">
      <div className="kort dempet">
        <b className="undertittel">{tittel}</b>
        <p className="forklar">{tekst}</p>
        {handling && <div className="knapper">{handling}</div>}
      </div>
    </div>
  );
}
