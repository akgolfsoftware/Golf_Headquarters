import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import type { LPhase } from "@/generated/prisma/client";
import { somOmrade, type Omrade } from "@/app/team-wang/_data/wang-trening-beregning";
import { wangSkjerm } from "@/lib/wang/wang-ruter";

import s from "./it.module.css";

/** Felles små byggeklosser for «I dag» og «Trening». Server-trygge. */

export { s as it };

/** Det skjermene får fra siden etter at porten `krevWangTrener()` har sluppet brukeren inn. */
export type WangSkjermKontekst = { gruppe: { id: string; name: string }; erDemo: boolean };

export type Palett = "kal" | "tr";

/** Lenke til øktdetaljen (WANG-18, /team-wang/trening/okter/[oktId]) fra rutekartet. */
export function oktHref(oktId: string): string {
  const mal = wangSkjerm("WANG-18").undersider?.[0];
  if (!mal) throw new Error("Rutekartet mangler øktdetaljen for WANG-18");
  return mal.replace("[oktId]", encodeURIComponent(oktId));
}

/** Klassenavn som setter --farge for et område i valgt palett. */
export function omradeKlasse(omrade: string, palett: Palett): string {
  const o = somOmrade(omrade);
  return o ? s[`${palett}-${o}`] : "";
}

export function Omradeprikk({ omrade, palett }: { omrade: Omrade | string; palett: Palett }) {
  return <span aria-hidden="true" className={`${s.pdot} ${omradeKlasse(omrade, palett)}`} />;
}

/** Sidehodet slik tegningene har det: metalinje, tittel og undertittel, med valg til høyre. */
export function Sidehode({ meta, tittel, undertittel, hoyre }: { meta: string; tittel: string; undertittel?: ReactNode; hoyre?: ReactNode }) {
  return (
    <header className={s.hode}>
      <div className={s.hodeTekst}>
        <p className={s.hodeMeta}>{meta}</p>
        <h1 className={s.h1}>{tittel}</h1>
        {undertittel ? <p className={s.undertittel}>{undertittel}</p> : null}
      </div>
      {hoyre ? <div className={s.hodeHoyre}>{hoyre}</div> : null}
    </header>
  );
}

/** Rosa tekstlenke med pil (tegningens «Åpne →»). */
export function Pillenke({ href, children, ariaLabel }: { href: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <Link href={href} className={s.lenke} aria-label={ariaLabel}>
      {children}
      <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
    </Link>
  );
}

export type Valg = { href: string; etikett: string; aktiv: boolean };

/** Filterknapper som lenker. Valget ligger i adressen. */
export function Chips({ valg, etikett }: { valg: Valg[]; etikett: string }) {
  return (
    <nav className={s.chips} aria-label={etikett}>
      {valg.map((v) => (
        <Link key={v.href} href={v.href} scroll={false} className={s.chip} aria-current={v.aktiv ? "true" : undefined}>
          {v.etikett}
        </Link>
      ))}
    </nav>
  );
}

/** Segmentvalg (to eller flere knapper i én rad) som lenker. */
export function Segment({ valg, etikett, jevn = false }: { valg: Valg[]; etikett: string; jevn?: boolean }) {
  return (
    <nav className={jevn ? s.seg2 : s.segRad} aria-label={etikett}>
      {valg.map((v) => (
        <Link key={v.href} href={v.href} scroll={false} className={s.seg} aria-current={v.aktiv ? "true" : undefined}>
          {v.etikett}
        </Link>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------- perioder

export type Periodekode = "GRUNN" | "SPES" | "TURN" | "ANNET";

const PERIODE: Record<LPhase, { kode: Periodekode; kort: string; navn: string }> = {
  GRUNN: { kode: "GRUNN", kort: "GRUNN", navn: "Grunnperiode" },
  SPESIAL: { kode: "SPES", kort: "SPES", navn: "Spesialperiode" },
  TURNERING: { kode: "TURN", kort: "TURN", navn: "Turneringsperiode" },
  EVALUERING: { kode: "ANNET", kort: "Evaluering", navn: "Evaluering" },
  TESTUKE: { kode: "ANNET", kort: "Testuke", navn: "Testuke" },
  FERIE: { kode: "ANNET", kort: "Ferie", navn: "Ferie" },
  TRENINGSSAMLING: { kode: "ANNET", kort: "Treningssamling", navn: "Treningssamling" },
  HELDAGSSAMLING: { kode: "ANNET", kort: "Heldagssamling", navn: "Heldagssamling" },
  RESTITUSJON: { kode: "ANNET", kort: "Restitusjon", navn: "Restitusjon" },
};

export function periodeInfo(fase: LPhase) {
  return PERIODE[fase];
}

/** Periodemerket (wg-ty): GRUNN lys, SPES hvit med kant, TURN mørk. */
export function Periodemerke({ fase }: { fase: LPhase }) {
  const p = PERIODE[fase];
  return <span className={`${s.ty} ${s[`ty-${p.kode}`]}`}>{p.kort}</span>;
}

export function NaaMerke({ children = "Nå" }: { children?: ReactNode }) {
  return <span className={s.naa}>{children}</span>;
}

/** Kjør en datalaster og gi en feiltilstand i stedet for å kaste. */
export async function lastTrygt<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    return { ok: true, data: await fn() };
  } catch (feil) {
    // Next sine redirect/notFound-signaler må slippe gjennom.
    if (feil && typeof feil === "object" && "digest" in feil && typeof (feil as { digest: unknown }).digest === "string" && (feil as { digest: string }).digest.startsWith("NEXT_")) throw feil;
    console.error("[wang-idag-trening] datalasting feilet", feil instanceof Error ? feil.message : "ukjent feil");
    return { ok: false };
  }
}
