import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import s from "./wang-ui.module.css";

/**
 * Byggeklosser for WANG-trenerskjermene (alt under src/app/team-wang/(trener)/).
 * Server-trygge (ingen hooks). Skjermene setter bare innhold inn her — ingen
 * egne farger, radier eller skygger. Fasit: «WANG Golf Trening.dc.html» og
 * «WANG Golf Skjermoversikt.dc.html» i Claude Design 6cfa623c.
 *
 * Manglende tall vises som «—» (bruk `visVerdi`), aldri som 0 eller et gjett.
 */

/** Ytre ramme for en skjerm: loddrett stabel med 20 px mellomrom. */
export function WangSide({ children }: { children: ReactNode }) {
  return <div className={s.side}>{children}</div>;
}

/** Sidehodet: «WANG-42 · undertittel» i Montserrat 12, tittel i Montserrat 300 40/28 px. */
export function WangSidehode({ skjermId, undertittel, tittel, ingress, handling }: { skjermId: string; undertittel?: string; tittel: string; ingress?: ReactNode; handling?: ReactNode }) {
  return (
    <header className={s.hode}>
      <div className={s.hodeTekst}>
        <p className={s.meta}>{undertittel ? `${skjermId} · ${undertittel}` : skjermId}</p>
        <h1 className={s.h1}>{tittel}</h1>
        {ingress ? <p className={s.ingress}>{ingress}</p> : null}
      </div>
      {handling ? <div className={s.hodeHandling}>{handling}</div> : null}
    </header>
  );
}

/** Hvitt kort, 1 px #D2D2D2, radius 4. Med `tittel` får kortet et hode (h2 17 px + meta 13 px). */
export function WangKort({ tittel, meta, handling, polstret = false, children, style }: { tittel?: string; meta?: ReactNode; handling?: ReactNode; polstret?: boolean; children?: ReactNode; style?: CSSProperties }) {
  return (
    <section className={polstret ? `${s.kort} ${s.kortPolstret}` : s.kort} style={style}>
      {tittel ? (
        <div className={s.kortHode}>
          <h2 className={s.h2}>{tittel}</h2>
          {meta !== undefined ? <span className={s.kortMeta}>{meta}</span> : null}
          {handling}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Forklaringstekst under kortets hode. */
export function WangKortTekst({ children }: { children: ReactNode }) {
  return <p className={s.kortTekst}>{children}</p>;
}

/** To kolonner som stables under 440 px per kolonne. */
export function WangRutenett({ children }: { children: ReactNode }) {
  return <div className={s.rutenett}>{children}</div>;
}

export type WangNokkeltall = { etikett: string; verdi: ReactNode; forklaring?: ReactNode };

/** Tallrad inne i et kort: 4 kolonner, 2 under 1180 px. Verdi i Montserrat 800 40 px. */
export function WangNokkeltallRad({ tall }: { tall: WangNokkeltall[] }) {
  return (
    <div className={s.kpi}>
      {tall.map((t) => (
        <div key={t.etikett}>
          <span className={s.kpiEtikett}>{t.etikett}</span>
          <span className={s.kpiVerdi}>{t.verdi}</span>
          {t.forklaring ? <span className={s.kpiForklaring}>{t.forklaring}</span> : null}
        </div>
      ))}
    </div>
  );
}

/** Listerad i et kort: tittel og undertekst til venstre, noe kort til høyre. */
export function WangRad({ tittel, under, hoyre }: { tittel: ReactNode; under?: ReactNode; hoyre?: ReactNode }) {
  return (
    <div className={s.rad}>
      <div style={{ minWidth: 0 }}>
        <div className={s.radTittel}>{tittel}</div>
        {under ? <div className={s.radUnder}>{under}</div> : null}
      </div>
      {hoyre ?? <span />}
    </div>
  );
}

export type WangKolonne = {
  key: string;
  etikett: string;
  /** CSS-grid-bredde på desktop, f.eks. "minmax(0,1.6fr)" eller "auto". Standard minmax(0,1fr). */
  bredde?: string;
  tall?: boolean;
  /** På mobil: kolonnen får hele bredden (første kolonne bør ha det). */
  helBredde?: boolean;
};

/**
 * Tabell som blir kortrader på mobil (tegningens tr-erad/tr-ehead). Under
 * 820 px forsvinner hodet, og raden blir to kolonner: celler med `helBredde`
 * tar hele linjen, resten deler seg. Aldri sidelengs rulling.
 */
export function WangTabell({ kolonner, rader, beskrivelse }: { kolonner: WangKolonne[]; rader: Array<{ id: string; celler: Record<string, ReactNode> }>; beskrivelse: string }) {
  const mal = kolonner.map((k) => k.bredde ?? "minmax(0,1fr)").join(" ");
  const stil = { "--kolonner": mal } as CSSProperties;
  return (
    <div role="table" aria-label={beskrivelse}>
      <div role="row" className={`${s.tabellRad} ${s.tabellHode}`} style={stil}>
        {kolonner.map((k) => (
          <span role="columnheader" key={k.key}>{k.etikett}</span>
        ))}
      </div>
      {rader.map((r) => (
        <div role="row" key={r.id} className={s.tabellRad} style={stil}>
          {kolonner.map((k) => (
            <span role="cell" key={k.key} className={[k.tall ? s.tall : "", k.helBredde ? s.helBredde : ""].filter(Boolean).join(" ") || undefined}>
              {r.celler[k.key] ?? "—"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Rosa tekstlenke med pil (tegningens «Åpne →»). */
export function WangLenke({ href, children, ariaLabel }: { href: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <Link href={href} className={s.lenke} aria-label={ariaLabel}>
      {children}
      <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
    </Link>
  );
}

type KnappVariant = "primar" | "sekundar";

/** Primær (rosa, én per flate) eller sekundær (hvit med blå kant). Som lenke når `href` er satt. */
export function WangKnapp({ href, variant = "sekundar", children, type = "button", disabled }: { href?: string; variant?: KnappVariant; children: ReactNode; type?: "button" | "submit"; disabled?: boolean }) {
  const klasse = `${s.knapp} ${variant === "primar" ? s.primar : s.sekundar}`;
  if (href) {
    return <Link href={href} className={klasse}>{children}</Link>;
  }
  return <button type={type} className={klasse} disabled={disabled}>{children}</button>;
}

export type WangChipValg = { href: string; etikett: string; aktiv: boolean; antall?: number };

/** Filterknapper som lenker — valget ligger i adressen. Brytes over flere linjer. */
export function WangChips({ valg, etikett }: { valg: WangChipValg[]; etikett: string }) {
  return (
    <nav className={s.chips} aria-label={etikett}>
      {valg.map((v) => (
        <Link key={v.href} href={v.href} scroll={false} className={s.chip} aria-current={v.aktiv ? "page" : undefined}>
          {v.etikett}
          {v.antall !== undefined ? <span className={s.tall}>{v.antall}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function WangTag({ children }: { children: ReactNode }) {
  return <span className={s.tag}>{children}</span>;
}

export type WangStatusTone = "planlagt" | "pagar" | "ferdig" | "fravaer" | "varsel";
const TONE: Record<WangStatusTone, string> = { planlagt: s.planned, pagar: s.active, ferdig: s.done, fravaer: s.absent, varsel: s.alert };

/** Statusmerke. Farge betyr noe: planlagt (lyseblå), pågår (oransje), ferdig (grønn), fravær (lilla), varsel (rosa). */
export function WangStatus({ tone, children }: { tone: WangStatusTone; children: ReactNode }) {
  return <span className={`${s.status} ${TONE[tone]}`}>{children}</span>;
}

/** Ærlig tom tilstand: hva som mangler og hvorfor. Brukes inne i et kort eller alene. */
export function WangTom({ tittel, tekst, handling }: { tittel: string; tekst: ReactNode; handling?: ReactNode }) {
  return (
    <div className={s.tom}>
      <p className={s.tomTittel}>{tittel}</p>
      <p className={s.tomTekst}>{tekst}</p>
      {handling}
    </div>
  );
}

/** Feiltilstand i et kort med rosa kant til venstre. */
export function WangFeil({ tittel = "Kunne ikke hente dataene", tekst, handling }: { tittel?: string; tekst: ReactNode; handling?: ReactNode }) {
  return (
    <section className={`${s.kort} ${s.feil}`} role="alert">
      <WangTom tittel={tittel} tekst={tekst} handling={handling} />
    </section>
  );
}

/** Grå plassholder mens noe laster. */
export function WangSkjelett({ hoyde = 16, bredde = "100%" }: { hoyde?: number; bredde?: number | string }) {
  return <span aria-hidden="true" className={s.skjelett} style={{ display: "block", height: hoyde, width: bredde }} />;
}

/** Standard lastetilstand for en skjerm: sidehode og to kort som plassholdere. */
export function WangLasterSide() {
  return (
    <div className={s.side} aria-busy="true" aria-label="Laster">
      <WangSkjelett hoyde={12} bredde={180} />
      <WangSkjelett hoyde={40} bredde="min(420px, 100%)" />
      <section className={`${s.kort} ${s.kortPolstret}`}>
        <div style={{ display: "grid", gap: 12 }}>
          <WangSkjelett hoyde={18} bredde="40%" />
          <WangSkjelett />
          <WangSkjelett />
          <WangSkjelett bredde="70%" />
        </div>
      </section>
    </div>
  );
}

/** Merknad om at gruppen er en demogruppe med oppdiktede elever. */
export function WangDemoMerknad() {
  return <p className={s.demo}>Demogruppe · alle elever og tall her er oppdiktet for demonstrasjon.</p>;
}

/** Tall i Montserrat med tabelltall. */
export function WangTall({ children }: { children: ReactNode }) {
  return <span className={s.tall}>{children}</span>;
}

/** «—» for manglende verdier. Aldri 0 eller et gjett. */
export function visVerdi(verdi: number | string | null | undefined, formater?: (v: number) => string): string {
  if (verdi === null || verdi === undefined || verdi === "") return "—";
  if (typeof verdi === "number") return Number.isFinite(verdi) ? (formater ? formater(verdi) : String(verdi).replace(".", ",")) : "—";
  return verdi;
}
