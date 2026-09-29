import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { TN } from "@/lib/v2/team-norway";

/**
 * Små byggeklosser for Daglig og Spillere, hentet fra «Team Norway App.dc.html»
 * (Claude Design bc3e41fc). Tallene (størrelser, avstander) er kopiert fra
 * tegningen. Fargene er TN-tokenene som tilsvarer tegningens hex:
 * #012B5D navy900 · #E3ECF6 navy100 · #C9D6E5 navy200 · #F2F7FC navy50 ·
 * #5E6E7F textSecondary · #D70232 red600 · #1F6B45 status.greenText.
 */

export const etikett: CSSProperties = {
  fontFamily: TN.font.display,
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: TN.textSecondary,
};

export const mono = (storrelse: number, farge?: string): CSSProperties => ({
  fontFamily: TN.font.mono,
  fontSize: storrelse,
  fontVariantNumeric: "tabular-nums",
  color: farge,
});

/** Nøkkeltallsrad: hvite celler med 1 px navy100-mellomrom (tegningens ftStats/kaStats/kpi). */
export function KpiRad({ tall, min = 140, stor = 22 }: { tall: { verdi: string; etikett: string; farge?: string }[]; min?: number; stor?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}` }}>
      {tall.map((t) => (
        <div key={t.etikett} style={{ background: TN.white, padding: "12px 14px", minWidth: 0 }}>
          <div style={{ ...mono(stor, t.farge ?? TN.ink900), overflowWrap: "anywhere" }}>{t.verdi}</div>
          <div style={{ ...etikett, marginTop: 4 }}>{t.etikett}</div>
        </div>
      ))}
    </div>
  );
}

/** Faner med 3 px rød strek under aktiv fane (tegningens ppTabs). Lenker, så de virker uten JavaScript. */
export function Fanerad({ faner, aktiv, etikett: navn }: { faner: { id: string; navn: string; href: string }[]; aktiv: string; etikett: string }) {
  return (
    <nav aria-label={navn} style={{ display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${TN.navy100}` }}>
      {faner.map((f) => {
        const erAktiv = f.id === aktiv;
        return (
          <Link
            key={f.id}
            href={f.href}
            aria-current={erAktiv ? "page" : undefined}
            style={{
              flex: "1 0 auto",
              minHeight: 48,
              padding: "0 16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: -1,
              borderBottom: `3px solid ${erAktiv ? TN.red600 : "transparent"}`,
              color: erAktiv ? TN.navy900 : TN.textSecondary,
              fontFamily: TN.font.display,
              fontSize: 12.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            {f.navn}
          </Link>
        );
      })}
    </nav>
  );
}

/** Tekstlenke i Jost med pil (tegningens «Punch resultater →»). */
export function PilLenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ alignSelf: "flex-start", color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
      {children} <ArrowRight size={16} aria-hidden />
    </Link>
  );
}

/** Sekundærknapp som lenke: hvit, 1 px navy200-kant (tegningens «Åpne profil»). */
export function Sekundarlenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ minHeight: 44, padding: "0 16px", border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none" }}>
      {children} <ArrowRight size={16} aria-hidden />
    </Link>
  );
}

/** Primærknapp som lenke: navy flate, hvit tekst (tegningens «Før test»). */
export function Primarlenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ minHeight: 44, padding: "0 18px", background: TN.navy900, color: TN.white, borderRadius: TN.radius.sm, fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap" }}>
      {children}
    </Link>
  );
}

/** Stiplet merke for noe som mangler fra kilden (tegningens «Norm fra Team Norway mangler»). */
export function ManglerMerke({ children }: { children: ReactNode }) {
  return <span style={{ ...mono(10.5, TN.textSecondary), letterSpacing: "0.04em", padding: "4px 7px", border: `1px dashed ${TN.navy300}`, borderRadius: TN.radius.sm, whiteSpace: "nowrap" }}>{children}</span>;
}

/** Statusmerke med ramme i samme farge som teksten (tegningens «GODTATT», «VENTER»). */
export function Rammemerke({ children, farge }: { children: ReactNode; farge: string }) {
  return <span style={{ ...mono(10.5, farge), letterSpacing: "0.08em", padding: "4px 7px", border: `1px solid ${farge}`, borderRadius: TN.radius.sm, whiteSpace: "nowrap" }}>{children}</span>;
}

/** Resultatbrikke: forkortelse, verdi og eventuell merknad (tegningens chips i «Nivå per spiller»). */
export function Resultatbrikke({ kort, verdi, merknad, merknadFarge }: { kort: string; verdi: string; merknad?: string; merknadFarge?: string }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", padding: "5px 8px", border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, minWidth: 0, maxWidth: "100%" }}>
      <span style={{ ...mono(10.5, TN.textSecondary), overflowWrap: "anywhere" }}>{kort}</span>
      <span style={mono(13)}>{verdi}</span>
      {merknad ? <span style={{ ...mono(11, merknadFarge ?? TN.textSecondary), fontWeight: 700 }}>{merknad}</span> : null}
    </span>
  );
}

/** Infoboks med ikon til venstre (tegningens forklaring øverst i Kartlegging). */
export function Infoboks({ children }: { children: ReactNode }) {
  return (
    <section style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
      <span style={{ width: 36, height: 36, flex: "none", border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, color: TN.navy900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Info size={18} aria-hidden />
      </span>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0, maxWidth: "72ch", minWidth: 0 }}>{children}</p>
    </section>
  );
}

/** Tom tilstand i en seksjon: tittel i Jost og forklaring (tegningens plNone/dEmpty). */
export function TomTilstand({ tittel, children }: { tittel: string; children?: ReactNode }) {
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ fontFamily: TN.font.display, fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase", color: TN.navy900 }}>{tittel}</div>
      {children ? <p style={{ fontSize: 14.5, lineHeight: 1.6, color: TN.textSecondary, margin: "8px 0 0", maxWidth: "64ch" }}>{children}</p> : null}
    </div>
  );
}

/** Nedtrekksvalg i et GET-skjema (filter som lever i adressen). */
export function Nedtrekk({ navn, etikett: tekst, verdi, valg }: { navn: string; etikett: string; verdi: string; valg: { verdi: string; tekst: string }[] }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={etikett}>{tekst}</span>
      <select name={navn} defaultValue={verdi} style={{ minHeight: 44, padding: "0 12px", border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.ink900, fontSize: 15, width: "100%", minWidth: 0 }}>
        {valg.map((v) => <option key={v.verdi} value={v.verdi}>{v.tekst}</option>)}
      </select>
    </label>
  );
}

/** Knapp som sender et GET-skjema. */
export function Sendknapp({ children }: { children: ReactNode }) {
  return (
    <button type="submit" style={{ minHeight: 44, padding: "0 18px", background: TN.navy900, color: TN.white, border: 0, borderRadius: TN.radius.sm, fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", alignSelf: "end" }}>
      {children}
    </button>
  );
}

/** Kvadratisk initialplate (tegningens avatar: 2 px hjørner, navy50-bunn). */
export function Initialplate({ navn, storrelse = 44 }: { navn: string; storrelse?: number }) {
  const ord = navn.trim().split(/\s+/).filter(Boolean);
  const initialer = ord.length === 0 ? "?" : `${ord[0][0]}${ord.length > 1 ? ord[ord.length - 1][0] : ""}`.toUpperCase();
  return (
    <span aria-hidden style={{ width: storrelse, height: storrelse, flex: "none", borderRadius: TN.radius.sm, background: TN.navy50, border: `1px solid ${TN.navy100}`, color: TN.navy900, fontFamily: TN.font.display, fontSize: storrelse >= 80 ? 26 : 14, letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {initialer}
    </span>
  );
}
