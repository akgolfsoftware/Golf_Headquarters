import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Lock, type LucideIcon } from "lucide-react";

import { WangKort, WangTom } from "@/components/wang/trener/wang-ui";
import { isoTilKort } from "@/app/team-wang/_data/wang-elever-regler";

import s from "./me.module.css";

/**
 * Felles byggeklosser for WANG Meldinger og Elever. Server-trygge. Bygger på
 * wang-ui (delt) og legger bare til det tegningene for disse skjermene har i
 * tillegg: lås-pillen, kortets hode med meta, område-merket og tidstekstene.
 */

/** Lås-pillen fra «WANG Golf Batch 5» (wg-lock). */
export function Laas({ ikon: Ikon = Lock, children }: { ikon?: LucideIcon; children: ReactNode }) {
  return (
    <span className={s.laas}>
      <Ikon size={14} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none" }} />
      {children}
    </span>
  );
}

/** Kortets hode (ep-card: h2 17 px og meta 13 px under). */
export function KortHode({ tittel, meta, handling }: { tittel: ReactNode; meta?: ReactNode; handling?: ReactNode }) {
  if (handling) {
    return (
      <div className={s.kortHodeRad}>
        <div className={s.kolonne} style={{ flex: 1 }}>
          <h2 className={s.h2}>{tittel}</h2>
          {meta ? <span className={s.metaTekst}>{meta}</span> : null}
        </div>
        {handling}
      </div>
    );
  }
  return (
    <div className={s.kortHode}>
      <h2 className={s.h2}>{tittel}</h2>
      {meta ? <span className={s.metaTekst}>{meta}</span> : null}
    </div>
  );
}

const OMR_KLASSE: Record<string, string> = { FYS: s.omrFYS, TEK: s.omrTEK, SLAG: s.omrSLAG, SPILL: s.omrSPILL, TURN: s.omrTURN };

/** Pyramideområdet med farget firkant (tegningens OMRF). */
export function OmradeMerke({ omrade }: { omrade: string }) {
  const kode = omrade.toUpperCase();
  return <span className={`${s.omrade} ${OMR_KLASSE[kode] ?? ""}`}>{kode}</span>;
}

/** Tilbakelenke med pil til venstre (tegningens «Alle elever»). */
export function Tilbake({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={s.tilbake}>
      <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
      {children}
    </Link>
  );
}

/** Kort med ærlig tom tilstand når funksjonen ikke har lagring ennå. */
export function IkkeKobletKort({ tittel, tekst }: { tittel: string; tekst: ReactNode }) {
  return (
    <WangKort>
      <WangTom tittel={tittel} tekst={tekst} />
    </WangKort>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** «08:00–10:00» fra startminutt og varighet. */
export function tidTekst(startMinutt: number, varighetMin: number): string {
  const slutt = startMinutt + varighetMin;
  const f = (m: number) => `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`;
  return `${f(startMinutt)}–${f(slutt)}`;
}

const DAGNAVN = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

/** «Mandag 28.09» fra «YYYY-MM-DD». */
export function dagTekst(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return `${DAGNAVN[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${isoTilKort(iso)}`;
}

export { s as meStil };
