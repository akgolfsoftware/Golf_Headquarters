"use client";

/* AK Golf HQ v2 — SKJEMA-KOMPONENTER (retning C «Presis»).
   Alle inndata-kontroller for v2-skjermer. Kontrollert der onChange gis, ellers
   intern state m/ demo-default → alt kan rendres og prøves rett. Port av
   ui_kits/v2/v2-skjema.jsx → produksjons-TSX (diff-null). Delt grunnstein:
   T (@/lib/v2/tokens), Icon (@/components/v2/icon), CTAPill (./core). */

import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { CTAPill, Caps } from "./core";

/* Delte felt-stiler */
const FELT: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg,
  outline: "none", lineHeight: 1.4,
};
interface EtikettProps {
  children?: ReactNode;
}
function Etikett({ children }: EtikettProps) {
  return <label style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, display: "block", marginBottom: 7 }}>{children}</label>;
}

/* ── Inndata — tekstfelt m/ label ─────────────────────── */
export interface InndataProps {
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  suffix?: ReactNode;
  onChange?: (value: string) => void;
}
export function Inndata({ label = "Navn", value, defaultValue = "Øyvind Rohjan", placeholder, type = "text", mono, suffix, onChange }: InndataProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <div style={{ position: "relative" }}>
        <input
          type={type} value={val} placeholder={placeholder}
          onChange={(e) => { setV(e.target.value); onChange?.(e.target.value); }}
          style={{ ...FELT, fontFamily: mono ? T.mono : T.ui, fontVariantNumeric: mono ? "tabular-nums" : undefined, paddingRight: suffix ? 44 : 13 }}
        />
        {suffix && <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{suffix}</span>}
      </div>
    </div>
  );
}

/* ── ProfilFelt — skrivebeskyttet visningsfelt (label + statisk boks) ──
   Auth/profil-idiomet fra ui_kits/v2/auth-profil.jsx (lokal `Felt`). Viser en
   verdi i en panel-boks; tom verdi → placeholder i mut. Ikke et inndatafelt —
   redigering skjer på /portal/meg/profil. */
export interface ProfilFeltProps {
  label?: ReactNode;
  value?: ReactNode;
  placeholder?: ReactNode;
  trailing?: ReactNode;
  hint?: ReactNode;
  mono?: boolean;
}
export function ProfilFelt({ label, value, placeholder, trailing, hint, mono }: ProfilFeltProps) {
  return (
    <div>
      <Caps size={9} style={{ marginBottom: 7 }}>{label}</Caps>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 14px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.borderS}` }}>
        <span style={{ flex: 1, fontFamily: mono ? T.mono : T.ui, fontSize: 13.5, fontWeight: 500, color: value ? T.fg : T.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || placeholder}</span>
        {trailing}
      </div>
      {hint && <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "7px 2px 0" }}>{hint}</p>}
    </div>
  );
}

/* ── Velger — select m/ chevron ───────────────────────── */
export interface VelgerProps {
  label?: ReactNode;
  options?: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}
export function Velger({ label = "Treningsområde", options = ["Nærspill", "Tee-slag", "Innspill 100–150 m", "Putting"], value, defaultValue = "Nærspill", onChange }: VelgerProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <div style={{ position: "relative" }}>
        <select
          value={val}
          onChange={(e) => { setV(e.target.value); onChange?.(e.target.value); }}
          style={{ ...FELT, paddingRight: 38, cursor: "pointer" }}
        >
          {options.map((o) => <option key={o} value={o} style={{ background: T.panel3, color: T.fg }}>{o}</option>)}
        </select>
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "inline-flex" }}><Icon name="chevron-down" size={14} style={{ color: T.mut }} /></span>
      </div>
    </div>
  );
}

/* ── TekstOmraade — flerlinje ─────────────────────────── */
export interface TekstOmraadeProps {
  label?: ReactNode;
  defaultValue?: string;
  value?: string;
  rows?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
}
export function TekstOmraade({ label = "Notat til coach", defaultValue = "Kjente at P4-følelsen satt bedre i dag. Litt stiv i hoftene på slutten.", value, rows = 4, placeholder, onChange }: TekstOmraadeProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <textarea
        value={val} rows={rows} placeholder={placeholder}
        onChange={(e) => { setV(e.target.value); onChange?.(e.target.value); }}
        style={{ ...FELT, resize: "vertical", lineHeight: 1.55 }}
      />
    </div>
  );
}

/* ── Bryter — toggle. På = lime. ──────────────────────── */
export interface BryterProps {
  label?: ReactNode;
  sub?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}
export function Bryter({ label = "Varsle meg før økter", sub = "Push-varsel 30 minutter før", checked, defaultChecked = true, onChange }: BryterProps) {
  const [on, setOn] = useState(defaultChecked);
  const val = checked !== undefined ? checked : on;
  return (
    <div onClick={() => { setOn(!val); onChange?.(!val); }} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{label}</div>
        {sub && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ width: 42, height: 24, borderRadius: 9999, background: val ? T.lime : T.panel3, border: `1px solid ${val ? "transparent" : T.borderS}`, position: "relative", flex: "none", transition: "background 120ms" }}>
        <span style={{ position: "absolute", top: 2, left: val ? 20 : 2, width: 18, height: 18, borderRadius: 9999, background: val ? T.onLime : T.fg2, transition: "left 120ms" }} />
      </span>
    </div>
  );
}

/* ── Avkryssing — checkbox. Avkrysset = lime. ─────────── */
export interface AvkryssingProps {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}
export function Avkryssing({ label = "Jeg godtar vilkårene for PlayerHQ", checked, defaultChecked = false, onChange }: AvkryssingProps) {
  const [on, setOn] = useState(defaultChecked);
  const val = checked !== undefined ? checked : on;
  return (
    <div onClick={() => { setOn(!val); onChange?.(!val); }} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span style={{ width: 20, height: 20, borderRadius: 6, background: val ? T.lime : T.panel2, border: `1px solid ${val ? "transparent" : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        {val && <Icon name="check" size={13} style={{ color: T.onLime }} />}
      </span>
      <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>{label}</span>
    </div>
  );
}

/* ── RadioGruppe — ett valg m/ ring-dot ───────────────── */
export interface RadioOption {
  v: string;
  l: string;
  sub?: string;
}
export interface RadioGruppeProps {
  label?: ReactNode;
  options?: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
}
export function RadioGruppe({
  label = "Hastighet",
  options = [{ v: "DRY", l: "Tørrsving", sub: "Uten ball" }, { v: "LAV", l: "Lav fart", sub: "CS50–CS70" }, { v: "FULL", l: "Full fart", sub: "CS80–CS100" }],
  value, defaultValue = "LAV", onChange,
}: RadioGruppeProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((o) => { const on = val === o.v; return (
          <div key={o.v} onClick={() => { setV(o.v); onChange?.(o.v); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: on ? T.panel3 : T.panel2, border: `1px solid ${on ? T.borderS : T.border}`, cursor: "pointer" }}>
            <span style={{ width: 18, height: 18, borderRadius: 9999, border: `2px solid ${on ? T.lime : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              {on && <span style={{ width: 8, height: 8, borderRadius: 9999, background: T.lime }} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: on ? 700 : 500, color: T.fg }}>{o.l}</span>
              {o.sub && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginLeft: 8 }}>{o.sub}</span>}
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}

/* ── Glider — slider m/ lime fylling + mono-verdi ─────── */
export interface GliderProps {
  label?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  enhet?: string;
  fmt?: (v: number) => string;
  onChange?: (n: number) => void;
}
export function Glider({ label = "Innsats (RPE)", min = 1, max = 10, step = 1, value, defaultValue = 7, enhet = "", fmt, onChange }: GliderProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  const pct = ((val - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
        {label && <Etikett>{label}</Etikett>}
        <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{fmt ? fmt(val) : String(val).replace(".", ",")}{enhet && <span style={{ fontSize: 10, color: T.mut }}> {enhet}</span>}</span>
      </div>
      <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 7, borderRadius: 9999, background: T.track }} />
        <div style={{ position: "absolute", left: 0, width: pct + "%", height: 7, borderRadius: 9999, background: T.lime, opacity: 0.9 }} />
        <span style={{ position: "absolute", left: `calc(${pct}% - 9px)`, width: 18, height: 18, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel}`, pointerEvents: "none" }} />
        <input
          type="range" min={min} max={max} step={step} value={val}
          onChange={(e) => { const n = Number(e.target.value); setV(n); onChange?.(n); }}
          style={{ position: "absolute", left: 0, right: 0, width: "100%", opacity: 0, cursor: "pointer", height: 24, margin: 0 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{min}</span>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{max}</span>
      </div>
    </div>
  );
}

/* ── Stegteller — stepper +/- m/ mono-verdi ───────────── */
export interface StegtellerProps {
  label?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  enhet?: string;
  onChange?: (n: number) => void;
}
function StegKnapp({ icon, onClick }: { icon: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ appearance: "none", cursor: "pointer", width: 36, height: 36, borderRadius: 11, background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon name={icon} size={15} />
    </button>
  );
}
export function Stegteller({ label = "Repetisjoner", min = 0, max = 999, step = 5, value, defaultValue = 30, enhet = "reps", onChange }: StegtellerProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  const set = (n: number) => { const c = Math.max(min, Math.min(max, n)); setV(c); onChange?.(c); };
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <StegKnapp icon="minus" onClick={() => set(val - step)} />
        <span style={{ minWidth: 72, textAlign: "center", fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{val}<span style={{ fontSize: 10, color: T.mut, marginLeft: 5 }}>{enhet}</span></span>
        <StegKnapp icon="plus" onClick={() => set(val + step)} />
      </div>
    </div>
  );
}

/* ── DatoVelger — kompakt: felt + 7-dagers stripe ─────── */
export interface DatoDag {
  d: string;
  n: number;
}
export interface DatoVelgerProps {
  label?: ReactNode;
  dager?: DatoDag[];
  maaned?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (n: number) => void;
}
export function DatoVelger({
  label = "Dato",
  dager = [{ d: "Man", n: 13 }, { d: "Tir", n: 14 }, { d: "Ons", n: 15 }, { d: "Tor", n: 16 }, { d: "Fre", n: 17 }, { d: "Lør", n: 18 }, { d: "Søn", n: 19 }],
  maaned = "Juli 2026", value, defaultValue = 16, onChange,
}: DatoVelgerProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <div style={{ background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11, padding: "11px 13px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}><Icon name="calendar" size={13} style={{ color: T.mut }} />{maaned}</span>
          <span style={{ display: "inline-flex", gap: 4 }}>
            <Icon name="chevron-left" size={14} style={{ color: T.mut, cursor: "pointer" }} />
            <Icon name="chevron-right" size={14} style={{ color: T.mut, cursor: "pointer" }} />
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {dager.map((x) => { const on = val === x.n; return (
            <div key={x.n} onClick={() => { setV(x.n); onChange?.(x.n); }} style={{ textAlign: "center", padding: "6px 0 7px", borderRadius: 9, background: on ? T.lime : "transparent", cursor: "pointer" }}>
              <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: on ? T.onLime : T.mut, display: "block" }}>{x.d}</span>
              <span style={{ fontFamily: T.mono, fontSize: 13.5, fontWeight: 700, color: on ? T.onLime : T.fg, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 2 }}>{x.n}</span>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}

/* ── KodeInput — engangskode i separate mono-bokser ───── */
export interface KodeInputProps {
  label?: ReactNode;
  lengde?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (s: string) => void;
}
export function KodeInput({ label = "Engangskode fra e-post", lengde = 6, value, defaultValue = "4", onChange }: KodeInputProps) {
  const [v, setV] = useState(defaultValue);
  const val = value !== undefined ? value : v;
  const set = (s: string) => { const c = s.replace(/\D/g, "").slice(0, lengde); setV(c); onChange?.(c); };
  return (
    <div>
      {label && <Etikett>{label}</Etikett>}
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ display: "flex", gap: 7 }}>
          {Array.from({ length: lengde }, (_, i) => { const aktiv = i === val.length; return (
            <span key={i} style={{ width: 40, height: 48, borderRadius: 11, background: T.panel2, border: `1px solid ${aktiv ? T.lime : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{val[i] || ""}</span>
          ); })}
        </div>
        <input
          value={val} onChange={(e) => set(e.target.value)} inputMode="numeric" autoComplete="one-time-code"
          style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "text", fontSize: 16 }}
        />
      </div>
    </div>
  );
}

/* ── SkjemaFelt — wrapper: label + hjelp + feil ───────── */
export interface SkjemaFeltProps {
  label?: ReactNode;
  hjelp?: ReactNode;
  feil?: ReactNode;
  children?: ReactNode;
}
export function SkjemaFelt({ label = "Handicap", hjelp = "Bruk komma som desimaltegn, f.eks. 4,2.", feil, children }: SkjemaFeltProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        {label && <Etikett>{label}</Etikett>}
        {feil && <span style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 600, color: T.down }}>{feil}</span>}
      </div>
      <div style={feil ? { borderRadius: 11, outline: `1px solid ${T.down}` } : undefined}>
        {children || <Inndata label={null} defaultValue="4,2" mono />}
      </div>
      {hjelp && !feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, display: "block", marginTop: 6 }}>{hjelp}</span>}
    </div>
  );
}

/* ── Veiviser — stegindikator + tilbake/neste ─────────── */
export interface VeiviserProps {
  steg?: string[];
  aktiv?: number;
  onTilbake?: () => void;
  onNeste?: () => void;
  nesteTekst?: string;
  tilbakeTekst?: string;
  sisteTekst?: string;
}
export function Veiviser({
  steg = ["Spiller", "Mål", "Plan", "Bekreft"], aktiv = 1,
  onTilbake, onNeste, nesteTekst = "Neste", tilbakeTekst = "Tilbake", sisteTekst = "Fullfør",
}: VeiviserProps) {
  const siste = aktiv >= steg.length - 1;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steg.map((s, i) => {
          const done = i < aktiv, on = i === aktiv;
          return (
            <Fragment key={i}>
              {i > 0 && <span style={{ flex: 1, height: 2, borderRadius: 2, background: done || on ? "rgba(209,248,67,0.45)" : T.track, margin: "0 8px", marginBottom: 20 }} />}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "none" }}>
                <span style={{ width: 28, height: 28, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                  background: done ? T.lime : on ? "transparent" : T.panel2,
                  border: `2px solid ${done || on ? T.lime : T.borderS}`,
                  color: done ? T.onLime : on ? T.lime : T.mut }}>
                  {done ? <Icon name="check" size={13} /> : i + 1}
                </span>
                <span style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? T.fg : T.mut, whiteSpace: "nowrap" }}>{s}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <span onClick={onTilbake} style={{ visibility: aktiv === 0 ? "hidden" : "visible" }}><CTAPill ghost icon="arrow-left">{tilbakeTekst}</CTAPill></span>
        <span onClick={onNeste}><CTAPill icon={siste ? "check" : "arrow-right"}>{siste ? sisteTekst : nesteTekst}</CTAPill></span>
      </div>
    </div>
  );
}
