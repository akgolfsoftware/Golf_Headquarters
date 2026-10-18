import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { ukenummer } from "@/lib/uke-helpers";
import { TN } from "@/lib/v2/team-norway";

/**
 * Byggeklosser for Team Norway-skjermene.
 * Fasit: docs/design-system/utkast-tn/felles/tn.css (pakke 1 grunnmur, 14.10.2026).
 * Utkast 2 (retning B, 16.10): overlinje i Lato, tittel og seksjonstittel i Jost,
 * kort med én hårstrek, IBM Plex Mono bare på tall. Hjørner 2, ingen skygger, ingen sirkler.
 * Avvik:
 *   - Filterknapper og månedsvalg er lenker med valget i adressen, ikke
 *     klientstate. Da virker de uten JavaScript.
 */

/** Utkast 2 (16.10): datolinje og etiketter i Lato. IBM Plex Mono bare på tall. */
const etikettStil: CSSProperties = {
  fontFamily: TN.font.body,
  fontWeight: 700,
  fontSize: 13,
  lineHeight: 1.3,
  letterSpacing: "0.02em",
  color: TN.ink500,
};

const dagFormat = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });

/** Sidehodet: datolinja i Lato, tittel i Jost, ingress, og handlinger under. */
export function TnSkjermhode({ tittel, ingress, overlinje, handling }: { tittel: string; ingress: string; overlinje?: string; handling?: ReactNode }) {
  const naa = new Date();
  return (
    <header style={{ display: "grid", gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <span style={etikettStil}>{overlinje ?? `${dagFormat.format(naa)} · uke ${ukenummer(naa)}`}</span>
        <h1 style={{ margin: "4px 0 0", fontFamily: TN.font.display, fontWeight: 400, fontSize: "clamp(30px, 3vw, 38px)", lineHeight: 1.12, letterSpacing: "0.03em", color: TN.navy900, overflowWrap: "anywhere" }}>{tittel}</h1>
        <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.6, color: TN.ink700, maxWidth: "52ch" }}>{ingress}</p>
      </div>
      {handling ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{handling}</div> : null}
    </header>
  );
}

/** Kort: hvit flate med én hårstrek, aldri skygge. */
export function TnFlate({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section style={{ background: TN.surfaceCard, border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.sm, padding: "16px 18px 18px", minWidth: 0, ...style }}>
      {children}
    </section>
  );
}

/** Seksjonstittel i Jost, med valgfri merknad til høyre. */
export function TnFlatehode({ tittel, merknad, children }: { tittel: string; merknad?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px 12px", alignItems: "baseline", paddingBottom: 12 }}>
      <h2 style={{ fontFamily: TN.font.display, fontWeight: 500, fontSize: 20, lineHeight: 1.25, letterSpacing: "0.02em", color: TN.navy900, margin: 0 }}>{tittel}</h2>
      {merknad !== undefined ? <span style={{ fontSize: 12.5, lineHeight: 1.45, color: TN.ink500 }}>{merknad}</span> : null}
      {children}
    </div>
  );
}

export function TnEtikett({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...etikettStil, ...style }}>{children}</div>;
}

/** Stor tittel inne i et kort, som stedet i samlingskortet. */
export function TnKorttittel({ overlinje, tittel, children }: { overlinje?: ReactNode; tittel: string; children?: ReactNode }) {
  return (
    <div>
      {overlinje ? <TnEtikett>{overlinje}</TnEtikett> : null}
      <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: 26, letterSpacing: "0.1em", textTransform: "uppercase", color: TN.navy900, marginTop: 6, lineHeight: 1.1, overflowWrap: "anywhere" }}>{tittel}</div>
      {children}
    </div>
  );
}

/** Rad med dato/tall i mono til venstre og tekst til høyre. */
export function TnDatoRad({ dato, tittel, tekst, datoFarge, datoBredde = 96, hoyre }: { dato: ReactNode; tittel: ReactNode; tekst?: ReactNode; datoFarge?: string; datoBredde?: number; hoyre?: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: hoyre ? `${datoBredde}px minmax(0, 1fr) auto` : `${datoBredde}px minmax(0, 1fr)`, gap: "6px 14px", padding: "13px 0", borderBottom: `1px solid ${TN.ink200}`, alignItems: "baseline" }}>
      <span style={{ fontFamily: TN.font.mono, fontSize: 13, color: datoFarge ?? TN.navy900, fontVariantNumeric: "tabular-nums" }}>{dato}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>{tittel}</div>
        {tekst ? <div style={{ fontSize: 13, color: TN.ink500, marginTop: 2, overflowWrap: "anywhere" }}>{tekst}</div> : null}
      </div>
      {hoyre}
    </div>
  );
}

/** Ærlig tomrad inne i en flate: sier hva som mangler og hvorfor. */
export function TnMangler({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.ink700, margin: "12px 0 0", maxWidth: "70ch" }}>{children}</p>;
}

/** Kilde og dato under en flate. */
export function TnFotnote({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 12.5, lineHeight: 1.45, color: TN.ink500, margin: "12px 0 0", maxWidth: "70ch" }}>{children}</p>;
}

/** Kvadratisk initialplate. Aldri sirkel. */
export function TnInitialer({ navn, storrelse = 36, mork = false }: { navn: string; storrelse?: number; mork?: boolean }) {
  const initialer = navn.split(/\s+/).filter(Boolean).slice(0, 2).map((del) => del[0]?.toUpperCase() ?? "").join("");
  return (
    <span aria-hidden="true" style={{ width: storrelse, height: storrelse, flex: "none", background: mork ? TN.rail.active : TN.navy100, color: mork ? TN.white : TN.navy900, fontFamily: TN.font.mono, fontSize: storrelse >= 60 ? 20 : 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {initialer || "?"}
    </span>
  );
}

/** Statusord med en liten kvadratisk markør, som merkene i grunnmuren. */
export function TnStatusmerke({ children, farge }: { children: ReactNode; farge: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TN.font.body, fontSize: 12, fontWeight: 700, lineHeight: 1.2, color: farge, whiteSpace: "nowrap" }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, background: farge, flex: "none" }} />
      {children}
    </span>
  );
}

export type TnFilterValg = { href: string; label: string; aktiv: boolean; antall?: number };

/** Filterknapper som vanlige lenker, så valget ligger i adressen og virker uten JavaScript. Brytes over flere linjer, aldri sidelengs. */
export function TnFilterknapper({ valg, etikett }: { valg: TnFilterValg[]; etikett: string }) {
  return (
    <nav aria-label={etikett} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {valg.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          scroll={false}
          aria-current={v.aktiv ? "page" : undefined}
          style={{ minHeight: 44, padding: "0 14px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: v.aktiv ? TN.navy900 : TN.white, color: v.aktiv ? TN.white : TN.navy900, fontFamily: TN.font.body, fontSize: 13.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", maxWidth: "100%" }}
        >
          {v.label}
          {v.antall !== undefined ? <span style={{ fontFamily: TN.font.mono, fontSize: 12, fontWeight: 500 }}>{v.antall}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

/** Tekstlenke: navy-600, understreket, minst 44 px høy. */
export function TnTekstlenke({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 44, minWidth: 44, fontSize: 14, fontWeight: 700, color: TN.navy600, textDecoration: "underline", textUnderlineOffset: 4, justifySelf: "start", alignSelf: "flex-start" }}>{children}</Link>;
}

/** Rad i en liste som blir kortrader på mobil: tekst til venstre, merke eller tall til høyre. */
export function TnListerad({ tittel, tekst, hoyre, foran }: { tittel: ReactNode; tekst?: ReactNode; hoyre?: ReactNode; foran?: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: foran ? "auto minmax(0, 1fr) auto" : "minmax(0, 1fr) auto", gap: "4px 12px", padding: "12px 0", borderBottom: `1px solid ${TN.ink200}`, alignItems: "center" }}>
      {foran}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>{tittel}</div>
        {tekst ? <div style={{ fontSize: 12.5, lineHeight: 1.45, color: TN.ink500, marginTop: 2, overflowWrap: "anywhere" }}>{tekst}</div> : null}
      </div>
      {hoyre ?? <span />}
    </div>
  );
}

/** Hendelse i en liste: dagen stort i mono, tittel og kilde, merke til høyre. Hele raden er lenke når `href` er satt. */
export function TnHendelserad({ dag, maned, tittel, tekst, hoyre, href, strek }: { dag: string; maned: string; tittel: ReactNode; tekst?: ReactNode; hoyre?: ReactNode; href?: string; strek?: string }) {
  const innhold = (
    <>
      <span style={{ display: "grid", justifyItems: "start", fontFamily: TN.font.mono, fontWeight: 500, fontSize: 22, lineHeight: 1, color: TN.navy900, borderLeft: strek ? `4px solid ${strek}` : undefined, paddingLeft: strek ? 8 : 0 }}>
        {dag}
        <small style={{ fontFamily: TN.font.body, fontWeight: 700, fontSize: 12.5, lineHeight: 1.35, letterSpacing: "0.01em", color: TN.ink500 }}>{maned}</small>
      </span>
      <span style={{ minWidth: 0 }}>
        <b style={{ display: "block", fontSize: 15, lineHeight: 1.3, overflowWrap: "anywhere" }}>{tittel}</b>
        {tekst ? <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.45, color: TN.ink500, overflowWrap: "anywhere" }}>{tekst}</span> : null}
      </span>
      {hoyre ?? <span />}
    </>
  );
  const stil: CSSProperties = { display: "grid", gridTemplateColumns: "64px minmax(0, 1fr) auto", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${TN.ink200}`, textDecoration: "none", color: "inherit", minHeight: 44 };
  return href ? <Link href={href} style={stil}>{innhold}</Link> : <div style={stil}>{innhold}</div>;
}

/** To- eller flerkolonne som stables under 360 px per kolonne. */
export function TnRutenett({ children, min = 360, style }: { children: ReactNode; min?: number; style?: CSSProperties }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 24, alignItems: "start", ...style }}>{children}</div>;
}
