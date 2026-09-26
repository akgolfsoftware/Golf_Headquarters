import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { ukenummer } from "@/lib/uke-helpers";
import { TN } from "@/lib/v2/team-norway";

/**
 * Byggeklosser for skjermene TN-04 til TN-10.
 * Fasit: Claude Design-prosjektet «Team Norway App delivery»
 * (bc3e41fc), fila «Team Norway App.dc.html». Hvit flate med én hårstrek,
 * seksjonstittel i sperret Jost over en 2 px navy strek, tall i IBM Plex Mono.
 * Hjørner 2 og 4, ingen skygger, ingen sirkler.
 */

const etikettStil: CSSProperties = {
  fontFamily: TN.font.display,
  fontSize: "0.6875rem",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: TN.textSecondary,
};

const dagFormat = new Intl.DateTimeFormat("nb-NO", { weekday: "long", timeZone: "Europe/Oslo" });
const datoFormat = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });

/** Sidehodet: rute i mono, tittel i tynn sperret Jost, ingress, dato og uke til høyre. */
export function TnSkjermhode({ rute, tittel, ingress, handling }: { rute: string; tittel: string; ingress: string; handling?: ReactNode }) {
  const naa = new Date();
  return (
    <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 32px", paddingBottom: 22, borderBottom: `1px solid ${TN.navy100}` }}>
      <div style={{ minWidth: 0, flex: "1 1 320px" }}>
        <div style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: "0.08em", color: TN.textSecondary, overflowWrap: "anywhere" }}>{rute}</div>
        <h1 style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.1, letterSpacing: "0.1em", textTransform: "uppercase", margin: "10px 0 0", color: TN.navy900 }}>{tittel}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: TN.textSecondary, maxWidth: "64ch", margin: "10px 0 0" }}>{ingress}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        <div style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, whiteSpace: "nowrap", textTransform: "uppercase" }}>
          {dagFormat.format(naa)} {datoFormat.format(naa)} · uke {ukenummer(naa)}
        </div>
        {handling}
      </div>
    </header>
  );
}

export function TnFlate({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section style={{ background: TN.surfaceCard, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", minWidth: 0, ...style }}>
      {children}
    </section>
  );
}

/** Seksjonstittel over en 2 px navy strek, med valgfri mono-merknad til høyre. */
export function TnFlatehode({ tittel, merknad, children }: { tittel: string; merknad?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px 14px", alignItems: "baseline", paddingBottom: 12, borderBottom: `2px solid ${TN.navy900}` }}>
      <h2 style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900, margin: 0 }}>{tittel}</h2>
      {merknad !== undefined ? <span style={{ whiteSpace: "nowrap", fontFamily: TN.font.mono, fontSize: TN.text.micro, color: TN.textSecondary }}>{merknad}</span> : null}
      {children}
    </div>
  );
}

export function TnEtikett({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...etikettStil, ...style }}>{children}</div>;
}

/** Stor tittel inne i et kort, som «Mar Menor» i samlingskortet. */
export function TnKorttittel({ overlinje, tittel, children }: { overlinje?: ReactNode; tittel: string; children?: ReactNode }) {
  return (
    <div>
      {overlinje ? <TnEtikett>{overlinje}</TnEtikett> : null}
      <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(20px, 2.2vw, 26px)", letterSpacing: "0.1em", textTransform: "uppercase", color: TN.navy900, marginTop: 6, lineHeight: 1.2, overflowWrap: "anywhere" }}>{tittel}</div>
      {children}
    </div>
  );
}

/** Rad med dato/tall i mono til venstre og tekst til høyre. */
export function TnDatoRad({ dato, tittel, tekst, datoFarge, datoBredde = 96, hoyre }: { dato: ReactNode; tittel: ReactNode; tekst?: ReactNode; datoFarge?: string; datoBredde?: number; hoyre?: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: hoyre ? `${datoBredde}px minmax(0, 1fr) auto` : `${datoBredde}px minmax(0, 1fr)`, gap: "6px 14px", padding: "13px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
      <span style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: datoFarge ?? TN.navy900, fontVariantNumeric: "tabular-nums" }}>{dato}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{tittel}</div>
        {tekst ? <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{tekst}</div> : null}
      </div>
      {hoyre}
    </div>
  );
}

/** Ærlig tomrad inne i en flate: sier hva som mangler og hvorfor. */
export function TnMangler({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 14, lineHeight: 1.6, color: TN.textSecondary, margin: "16px 0 0", maxWidth: "70ch" }}>{children}</p>;
}

export function TnFotnote({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 13, lineHeight: 1.6, color: TN.textSecondary, margin: "14px 0 0", maxWidth: "70ch" }}>{children}</p>;
}

/** Kvadratisk initialplate. Aldri sirkel. */
export function TnInitialer({ navn, storrelse = 44, mork = false }: { navn: string; storrelse?: number; mork?: boolean }) {
  const initialer = navn.split(/\s+/).filter(Boolean).slice(0, 2).map((del) => del[0]?.toUpperCase() ?? "").join("");
  return (
    <span aria-hidden="true" style={{ width: storrelse, height: storrelse, flex: "none", borderRadius: TN.radius.sm, background: mork ? TN.navy900 : TN.navy50, border: mork ? "none" : `1px solid ${TN.navy100}`, color: mork ? TN.white : TN.navy900, fontFamily: TN.font.display, fontSize: storrelse >= 60 ? 20 : 14, letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {initialer || "?"}
    </span>
  );
}

/** Statusord i mono med en liten kvadratisk markør. */
export function TnStatusmerke({ children, farge }: { children: ReactNode; farge: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: "0.06em", color: farge, whiteSpace: "nowrap", textTransform: "uppercase" }}>
      <span aria-hidden="true" style={{ width: 8, height: 8, background: farge, flex: "none" }} />
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
          style={{ minHeight: 44, padding: "0 16px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: v.aktiv ? TN.navy900 : TN.white, color: v.aktiv ? TN.white : TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", maxWidth: "100%" }}
        >
          {v.label}
          {v.antall !== undefined ? <span style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, opacity: 0.75 }}>{v.antall}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

/** To- eller flerkolonne som stables under 360 px per kolonne. */
export function TnRutenett({ children, min = 360, style }: { children: ReactNode; min?: number; style?: CSSProperties }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 20, alignItems: "start", ...style }}>{children}</div>;
}
