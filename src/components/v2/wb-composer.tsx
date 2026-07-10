"use client";

/* AK Golf HQ v2 — WORKBENCH COMPOSER-BITER (retning C: forenkle, fjern ingen funksjon).
   Presentasjonsbiter for Workbench-lerretet som dekker forenklingsgrepene fra
   docs/redesign-v2/workbench-eksisterende-analyse.md:
     · AiForslagStrip — én samlet AI-inngang (grep 2)
     · PalettSok      — ett søkbart palett (grep 4)
     · AngreStrip     — angre siste flytting (grep 9)
     · BalanseRail    — kollapsbar rail-datadybde (grep 8)
   Bygger KUN på v2-core (./core). Aldri egen token/farge. Port av
   ui_kits/v2/wb-composer.jsx (window.V2WBC) → produksjons-TSX (diff-null). */

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { T, Kort, Caps, Trend, FordelingRad, AkseBar } from "./core";
import type { AkseKey } from "@/lib/v2/tokens";
import { Icon } from "./icon";

/* ── AiForslagStrip — én AI-inngang (grep 2) ────────────
   Vises når «Foreslå uke» er trykket: strip over ukegridet.
   Anbefaling, aldri tvang → Godta alle / Juster / Avvis. Flate: Begge. */
export interface AiForslagStripProps {
  antall?: number;
  onGodta?: () => void;
  onJuster?: () => void;
  onAvvis?: () => void;
  mobile?: boolean;
}
export function AiForslagStrip({ antall = 3, onGodta, onJuster, onAvvis, mobile }: AiForslagStripProps) {
  const knapp = (primary: boolean): CSSProperties => ({
    appearance: "none", cursor: "pointer", fontFamily: T.ui, fontSize: 12, fontWeight: 600,
    padding: "7px 13px", borderRadius: 9999, whiteSpace: "nowrap",
    color: primary ? T.onLime : T.fg2, background: primary ? T.lime : T.panel3,
    border: primary ? "none" : `1px solid ${T.border}`,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "11px 14px", borderRadius: 14, minWidth: 0,
      background: "rgba(209,248,67,0.06)", border: "1px dashed rgba(209,248,67,0.4)" }}>
      <Icon name="sparkles" size={15} style={{ color: T.lime, flex: "none" }} />
      <span style={{ flex: mobile ? "1 1 100%" : 1, minWidth: 0, fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>
        <span style={{ fontWeight: 700 }}>AI-forslag</span>
        <span style={{ color: T.mut }}> · {antall} økter lagt inn som utkast — juster fritt eller behold</span>
      </span>
      <div style={{ display: "flex", gap: 7, flex: "none" }}>
        <button onClick={onGodta} style={knapp(true)}>Godta alle</button>
        <button onClick={onJuster} style={knapp(false)}>Juster</button>
        <button onClick={onAvvis} style={knapp(false)}>Avvis</button>
      </div>
    </div>
  );
}

/* ── PalettSok — ett samlet søkefelt (grep 4) ───────────
   Erstatter de 6 spredte veiene til «legg inn økt». Flate: Begge. */
export interface PalettSokProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}
export function PalettSok({ value = "", onChange, placeholder = "Søk økt, drill, mal…" }: PalettSokProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, minWidth: 0 }}>
      <Icon name="search" size={14} style={{ color: T.mut, flex: "none" }} />
      <input value={value} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, appearance: "none", background: "transparent", border: "none", outline: "none", color: T.fg, fontFamily: T.ui, fontSize: 12.5 }} />
      {value ? <button onClick={() => onChange && onChange("")} title="Tøm" style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", color: T.mut, display: "inline-flex", flex: "none", padding: 0 }}><Icon name="x" size={13} /></button> : null}
    </div>
  );
}

/* ── BalanseRail — kollapsbar balanse (grep 8) ──────────
   Standard: 3 tall (ACWR · Pyramide-treff · Ukevolum). Klikk → full:
   ACWR-graf, SG-fordeling, aksebarer. Datadybde uten å ta plass. Flate: Begge. */
export interface BalanseRailProps {
  startApen?: boolean;
}
export function BalanseRail({ startApen = false }: BalanseRailProps) {
  const [apen, setApen] = useState(startApen);
  const acwr = [0.88, 0.94, 1.0, 1.08, 1.14, 1.19, 1.22];
  const fmtA = (v: number) => v.toFixed(1).replace(".", ",");
  const topp: [string, string][] = [["ACWR", "1,22"], ["Pyramide", "82 %"], ["Ukevolum", "9,5 t"]];
  const sg: [string, number, string, boolean][] = [["Tee", 62, "+0,4", false], ["Innspill", 48, "+0,1", false], ["Nærspill", 30, "−0,3", true], ["Putt", 55, "+0,2", false]];
  const volum: [AkseKey, number, number][] = [["FYS", 2, 3], ["TEK", 3, 2], ["SLAG", 3, 3], ["SPILL", 2, 3], ["TURN", 0, 1]];
  return (
    <Kort eyebrow="Balanse" action={
      <button onClick={() => setApen((a) => !a)} style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", color: T.mut, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em" }}>
        {apen ? "SKJUL" : "VIS ALT"}<Icon name={apen ? "chevron-up" : "chevron-down"} size={12} />
      </button>
    }>
      <div style={{ display: "flex" }}>
        {topp.map(([l, v], i) => (
          <div key={l} style={{ flex: 1, minWidth: 0, paddingLeft: i > 0 ? 12 : 0, paddingRight: i < 2 ? 12 : 0, borderRight: i < 2 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontFamily: T.mono, fontSize: 19, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", display: "block", lineHeight: 1 }}>{v}</span>
            <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, display: "block", marginTop: 5 }}>{l}</span>
          </div>
        ))}
      </div>
      {apen && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Caps size={9} style={{ marginBottom: 6 }}>ACWR · 4 uker <span style={{ color: T.mut }}>(mål 0,8–1,3)</span></Caps>
            <Trend series={acwr} height={80} yMin={0.6} yMax={1.5} baseline={1.3} fmt={fmtA} xLabels={["4 u", "3 u", "2 u", "Nå"]} />
          </div>
          <div>
            <Caps size={9} style={{ marginBottom: 4 }}>Strokes gained</Caps>
            {sg.map(([l, pct, val, neg], i) => (
              <FordelingRad key={l} label={l} signal pct={pct} value={val} neg={neg} last={i === 3} />
            ))}
          </div>
          <div>
            <Caps size={9} style={{ marginBottom: 4 }}>Ukevolum mot mål</Caps>
            {volum.map(([a, v, m], i) => (
              <AkseBar key={a} a={a} v={v} m={m} max={4} enhet="t" last={i === 4} />
            ))}
          </div>
        </div>
      )}
    </Kort>
  );
}

/* ── AngreStrip — angre siste flytting (grep 9) ─────────
   Tynn strip nederst i lerretet, forsvinner-stil. Flate: Begge. */
export interface AngreStripProps {
  tekst?: ReactNode;
  onAngre?: () => void;
  onLukk?: () => void;
}
export function AngreStrip({ tekst = "flyttet Intervall-økt til torsdag", onAngre, onLukk }: AngreStripProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 13px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, minWidth: 0 }}>
      <Icon name="info" size={12} style={{ color: T.mut, flex: "none" }} />
      <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 11.5, color: T.fg2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <span style={{ color: T.mut }}>Sist: </span>{tekst}
      </span>
      <button onClick={onAngre} style={{ appearance: "none", cursor: "pointer", flex: "none", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.lime, background: "transparent", border: "none", padding: 0 }}>
        <Icon name="rotate-cw" size={12} />Angre
      </button>
      {onLukk ? <button onClick={onLukk} title="Lukk" style={{ appearance: "none", cursor: "pointer", flex: "none", background: "transparent", border: "none", color: T.mut, display: "inline-flex", padding: 0 }}><Icon name="x" size={12} /></button> : null}
    </div>
  );
}
