"use client";

/* AK Golf HQ v2 — FYSISK TRENINGSPLAN (retning C «Presis»).
   Verdensledende fysisk-modul per workbench-plan.md §11: sett×reps-logging m/
   spøkelsesverdier, tonnasje/volum-hero, intervall-blokker, pulssoner S1–S5,
   DnD-brikker for Workbench-lerretet og auto-progresjon som ANBEFALING (aldri
   sperre). Port av ui_kits/v2/v2-fysisk.jsx → produksjons-TSX (diff-null).
   Komponerer kjerne-primitivene fra "./core". */

import { useEffect, useRef, useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { HjelpTips } from "@/components/v2/hjelp";
import { Kort, Caps, DeltaChip } from "./core";

/* Lokal tall-formatter: komma-desimal, mono i bruksstedet */
const kg = (v: number): string => (v % 1 === 0 ? String(v) : v.toFixed(1).replace(".", ","));

/* Økt-typer (styrke/rotasjon/mobilitet/kondisjon) — ikon + etikett */
export type FysType = "styrke" | "rotasjon" | "mobilitet" | "kondisjon";
export const FYS_TYPER: Record<FysType, { icon: string; l: string }> = {
  styrke: { icon: "dumbbell", l: "Styrke" },
  rotasjon: { icon: "rotate-cw", l: "Rotasjon" },
  mobilitet: { icon: "move", l: "Mobilitet" },
  kondisjon: { icon: "heart-pulse", l: "Kondisjon" },
};

/* Pulssone-skala S1–S5 (lokal kategorisk skala — lav→makk intensitet).
   Lime brukes ALDRI her: soner er data, ikke aksent. */
export interface Sone {
  id: string;
  c: string;
  l: string;
  puls: string;
}
export const SONER: Sone[] = [
  { id: "S1", c: "rgb(90,169,240)", l: "Rolig", puls: "< 120" },
  { id: "S2", c: "rgb(79,208,138)", l: "Moderat", puls: "120–140" },
  { id: "S3", c: "rgb(232,180,60)", l: "Terskel−", puls: "140–160" },
  { id: "S4", c: "rgb(240,104,62)", l: "Terskel+", puls: "160–175" },
  { id: "S5", c: "rgb(229,72,77)", l: "Maks", puls: "> 175" },
];
const soneC = (id: string): string => (SONER.find((s) => s.id === id) || SONER[2]).c;

/* ── MuskelgruppeChip — liten kategori-chip ──────────────
   Flate: Begge. */
export interface MuskelgruppeChipProps {
  navn?: string;
}
export function MuskelgruppeChip({ navn = "Sete/hofte" }: MuskelgruppeChipProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px", whiteSpace: "nowrap" }}>
      <Icon name="dumbbell" size={9} style={{ color: T.mut }} />{navn}
    </span>
  );
}

/* Stepper-knapp: 44 px berøringsmål (mobil-først, §11) */
interface StepKnappProps {
  icon: string;
  onClick?: () => void;
  disabled?: boolean;
}
function StepKnapp({ icon, onClick, disabled }: StepKnappProps) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ appearance: "none", cursor: disabled ? "default" : "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: T.panel3, border: `1px solid ${T.borderS}`, color: disabled ? T.mut : T.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.45 : 1 }}>
      <Icon name={icon} size={16} />
    </button>
  );
}
interface StepVerdiProps {
  value: string | number;
  unit?: string;
}
function StepVerdi({ value, unit }: StepVerdiProps) {
  return (
    <span style={{ minWidth: 64, textAlign: "center", fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
      {value}{unit && <span style={{ fontSize: 10, color: T.mut, marginLeft: 3 }}>{unit}</span>}
    </span>
  );
}

/* ── SettRepsLogger — øvelse m/ sett-rader (§11 styrkeøkt) ─
   HVER øvelse logges manuelt vekt × reps per sett. Forrige økt
   vises som spøkelsesverdi («sist: 60 kg × 8») — aldri huske selv.
   Flate: Begge (44 px-mål dimensjonert for mobil). */
export interface SettRad {
  vekt: number;
  reps: number;
}
export interface SettRepsLoggerProps {
  ovelse?: string;
  muskelgrupper?: string[];
  del?: string;
  sist?: SettRad[];
  startSett?: SettRad[];
  vektSteg?: number;
  /** Varsler forelder om nye sett-verdier — brukt der loggen skal persisteres (f.eks. live-økt). */
  onChange?: (sett: SettRad[]) => void;
}
export function SettRepsLogger({
  ovelse = "Markløft",
  muskelgrupper = ["Sete/hofte", "Rygg"],
  del = "Hoveddel",
  sist = [{ vekt: 60, reps: 8 }, { vekt: 60, reps: 8 }, { vekt: 62.5, reps: 6 }],
  startSett = [{ vekt: 60, reps: 8 }, { vekt: 62.5, reps: 8 }],
  vektSteg = 2.5,
  onChange,
}: SettRepsLoggerProps) {
  const [sett, setSett] = useState<SettRad[]>(startSett);
  const endre = (i: number, felt: keyof SettRad, delta: number) =>
    setSett((s) => {
      const nx = s.map((r, j) => (j !== i ? r : { ...r, [felt]: Math.max(felt === "reps" ? 1 : 0, r[felt] + delta) }));
      onChange?.(nx);
      return nx;
    });
  const leggTil = () =>
    setSett((s) => {
      const nx = [...s, { ...(s[s.length - 1] || { vekt: 20, reps: 8 }) }];
      onChange?.(nx);
      return nx;
    });
  return (
    <Kort pad="16px 18px">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{ovelse}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
            {muskelgrupper.map((m) => <MuskelgruppeChip key={m} navn={m} />)}
          </div>
        </div>
        <Caps size={9}>{del}</Caps>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {sett.map((r, i) => {
          const g = sist[i];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>{i + 1}.</span>
                <StepKnapp icon="minus" onClick={() => endre(i, "vekt", -vektSteg)} disabled={r.vekt <= 0} />
                <StepVerdi value={kg(r.vekt)} unit="kg" />
                <StepKnapp icon="plus" onClick={() => endre(i, "vekt", vektSteg)} />
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut, padding: "0 2px" }}>×</span>
                <StepKnapp icon="minus" onClick={() => endre(i, "reps", -1)} disabled={r.reps <= 1} />
                <StepVerdi value={r.reps} />
                <StepKnapp icon="plus" onClick={() => endre(i, "reps", 1)} />
              </div>
              {g && (
                <span style={{ marginLeft: 34, fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>sist: {kg(g.vekt)} kg × {g.reps}</span>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={leggTil} style={{ appearance: "none", cursor: "pointer", marginTop: 14, height: 44, borderRadius: 12, background: "transparent", border: `1px dashed ${T.borderS}`, color: T.fg2, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <Icon name="plus" size={14} />Legg til sett
      </button>
    </Kort>
  );
}

/* ── TonnasjeHero — total kg løftet + volum (§11) ────────
   Count-up når økta avsluttes; mates inn i ACWR/ukevolum.
   Flate: Begge. */
export interface TonnasjeHeroProps {
  tonnasje?: number;
  sett?: number;
  reps?: number;
  delta?: string;
  dir?: "up" | "down";
  sub?: string;
  hjelp?: boolean;
}
export function TonnasjeHero({ tonnasje = 4320, sett = 24, reps = 186, delta = "+8 %", dir = "up", sub = "Mates inn i ACWR og ukevolum", hjelp }: TonnasjeHeroProps) {
  const [vist, setVist] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const t0 = performance.now(), dur = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      setVist(Math.round(tonnasje * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tonnasje]);
  return (
    <Kort tint eyebrow="Økt fullført — total belastning" action={hjelp ? <HjelpTips k="tonnasje" /> : undefined}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, color: T.lime, lineHeight: 0.9, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{vist.toLocaleString("nb-NO")}</span>
        <span style={{ fontFamily: T.mono, fontSize: 16, color: T.mut }}>kg løftet</span>
        {delta && <DeltaChip v={delta} dir={dir} />}
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{sett} <span style={{ color: T.mut, fontWeight: 400 }}>sett</span></span>
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{reps} <span style={{ color: T.mut, fontWeight: 400 }}>reps</span></span>
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{kg(tonnasje / (sett || 1) / 10)} <span style={{ color: T.mut, fontWeight: 400 }}>tonn/10 sett</span></span>
      </div>
      {sub && (
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, display: "flex", alignItems: "center", gap: 5, marginTop: 12 }}>
          {sub}
          {sub.includes("ACWR") && <HjelpTips k="acwr" size={11} />}
        </span>
      )}
    </Kort>
  );
}

/* ── IntervallBlokk — serier × minutter × pulssone (§11) ─
   Kondisjonsøktens byggekloss; kan dupliseres/dras.
   Flate: Begge. */
export interface IntervallBlokkProps {
  serier?: number;
  minutter?: number;
  sone?: string;
  pause?: string;
  navn?: string;
  onDupliser?: () => void;
}
export function IntervallBlokk({ serier = 4, minutter = 4, sone = "S4", pause = "2 min pause", navn = "Hovedaktivitet", onDupliser }: IntervallBlokkProps) {
  const c = soneC(sone);
  return (
    <div style={{ position: "relative", background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rRow + 4, padding: "13px 15px 13px 19px", overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: c }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <Caps size={9}>{navn}</Caps>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg }}>{serier}</span>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>×</span>
            <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg }}>{minutter}</span>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>min</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: c, background: `color-mix(in srgb,${c} 13%,transparent)`, borderRadius: 5, padding: "3px 7px" }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: c }} />{sone}
            </span>
          </div>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, display: "block", marginTop: 6 }}>{pause}</span>
        </div>
        <button onClick={onDupliser} title="Dupliser blokk" style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, color: T.fg2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="copy" size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── PulsSoneVelger — S1–S5 fargede bånd m/ valgt ────────
   Flate: Begge (44 px bånd). */
export interface PulsSoneVelgerProps {
  valgt?: string;
  onChange?: (id: string) => void;
}
export function PulsSoneVelger({ valgt = "S3", onChange }: PulsSoneVelgerProps) {
  const [v, setV] = useState(valgt);
  const velg = (id: string) => { setV(id); onChange?.(id); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {SONER.map((s) => {
        const on = v === s.id;
        return (
          <button key={s.id} onClick={() => velg(s.id)} style={{ appearance: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 11, height: 44, padding: "0 14px", borderRadius: 12, textAlign: "left", background: on ? `color-mix(in srgb,${s.c} 14%,${T.panel})` : T.panel2, border: `1px solid ${on ? `color-mix(in srgb,${s.c} 55%,transparent)` : T.border}` }}>
            <span style={{ width: 22, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: s.c }}>{s.id}</span>
            <span style={{ flex: "none", width: 34, height: 6, borderRadius: 9999, background: s.c, opacity: on ? 1 : 0.55 }} />
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? T.fg : T.fg2 }}>{s.l}</span>
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{s.puls} slag/min</span>
            {on && <Icon name="check" size={14} style={{ color: s.c }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ── FysOktKort — DnD-brikke til Workbench-lerretet (§11) ─
   Fysisk plan som kilde: brikken dras rett inn på dager i
   kalenderen (samme DnD v2 som golf-øktene). Flate: Desktop
   (mobil-motpart: FlyttTilArk i v2-wb-mobil). */
export interface FysOktKortProps {
  tittel?: string;
  type?: FysType;
  varighet?: string;
  muskelgrupper?: string[];
  loftet?: boolean;
  onClick?: () => void;
}
export function FysOktKort({
  tittel = "Underkropp maks",
  type = "styrke",
  varighet = "45 min",
  muskelgrupper = ["Sete/hofte", "Lår"],
  loftet = false,
  onClick,
}: FysOktKortProps) {
  const t = FYS_TYPER[type] || FYS_TYPER.styrke;
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rRow + 4, padding: "12px 14px", cursor: "grab",
      ...(loftet ? { transform: "scale(1.03) rotate(2deg)", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", borderColor: T.borderS } : null),
      transition: "transform 180ms cubic-bezier(0.2,0,0,1), box-shadow 180ms" }}>
      <Icon name="grip-vertical" size={14} style={{ color: T.mut, flex: "none" }} />
      <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, background: `color-mix(in srgb,${T.ax.FYS} 13%,transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={t.icon} size={16} style={{ color: T.ax.FYS }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2 }}>{t.l}</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{varighet}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flex: "none", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 150 }}>
        {muskelgrupper.map((m) => <MuskelgruppeChip key={m} navn={m} />)}
      </div>
    </div>
  );
}

/* ── AutoProgresjon — anbefalings-chip m/ godta/avvis (§11)
   «+2,5 kg neste gang» som ANBEFALING — aldri sperre-språk,
   spilleren bestemmer alltid selv. Flate: Begge. */
type ProgStatus = "venter" | "godtatt" | "avvist";
export interface AutoProgresjonProps {
  forslag?: string;
  grunnlag?: string;
  onGodta?: () => void;
  onAvvis?: () => void;
}
export function AutoProgresjon({ forslag = "+2,5 kg neste gang", grunnlag = "Alle sett fullført to økter på rad", onGodta, onAvvis }: AutoProgresjonProps) {
  const [status, setStatus] = useState<ProgStatus>("venter");
  if (status === "godtatt") return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="check" size={13} style={{ color: T.up, flex: "none" }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>Lagt inn: <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.fg }}>{forslag}</span></span>
    </div>
  );
  if (status === "avvist") return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="minus" size={13} style={{ color: T.mut, flex: "none" }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Beholder dagens vekt — du bestemmer.</span>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="sparkles" size={13} style={{ color: T.lime, flex: "none" }} />
      <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.45 }}>
        Anbefaling: <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.fg }}>{forslag}</span>
        <span style={{ display: "block", fontSize: 11, color: T.mut, marginTop: 2 }}>{grunnlag}</span>
      </span>
      <button onClick={() => { setStatus("godtatt"); onGodta?.(); }} title="Godta anbefaling" style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: T.lime, border: "none", color: T.onLime, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={16} />
      </button>
      <button onClick={() => { setStatus("avvist"); onAvvis?.(); }} title="Avvis — behold dagens vekt" style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
