"use client";

/* AK Golf HQ v2 — WORKBENCH MOBIL (retning C «Presis»).
   Mobil-motparter per flate-skille-regelen (workbench-plan.md §3 + §8):
   drag-and-drop erstattes av bunn-ark, zoom-brødsmulen kompaktes, mål-sporet
   kollapser til chip. Alt dimensjonert for 390-flaten m/ 44 px berøringsmål.
   Port av ui_kits/v2/v2-wb-mobil.jsx → produksjons-TSX (diff-null).
   Primitiver fra "./core", grunnstein fra @/lib/v2 + @/components/v2/icon. */

import type { ReactNode } from "react";
import { Fragment, useState } from "react";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { Caps, Kort, Rad, AkseChip, StatusPill, CTAPill } from "./core";

/* Bunn-ark-ramme (delt av FlyttTilArk/PreviewArk): avrundet topp,
   drag-håndtak, tittellinje m/ lukk. Rendres inline i galleriet. */
export interface ArkProps {
  tittel: ReactNode;
  under?: ReactNode;
  children?: ReactNode;
  onLukk?: () => void;
}
export function Ark({ tittel, under, children, onLukk }: ArkProps) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: "24px 24px 0 0", padding: "10px 18px 22px", boxShadow: "0 -18px 48px rgba(0,0,0,0.45)" }}>
      <span style={{ display: "block", width: 38, height: 4, borderRadius: 9999, background: T.borderS, margin: "0 auto 12px" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{tittel}</div>
          {under && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>{under}</div>}
        </div>
        <button onClick={onLukk} title="Lukk" style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, color: T.fg2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ── ZoomBrodsmule — kompakt zoom-sti (§1/§8) ────────────
   År › Juli › Uke 28 › Ons — trykk hvor som helst for å
   hoppe ut til det nivået. Flate: Mobil. */
export interface ZoomBrodsmuleProps {
  sti?: string[];
  onHopp?: (i: number) => void;
}
export function ZoomBrodsmule({ sti = ["År", "Juli", "Uke 28", "Ons"], onHopp }: ZoomBrodsmuleProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto", paddingBottom: 2 }}>
      {sti.map((s, i) => {
        const siste = i === sti.length - 1;
        return (
          <Fragment key={i}>
            {i > 0 && <Icon name="chevron-right" size={11} style={{ color: T.mut, flex: "none" }} />}
            <button onClick={() => onHopp && onHopp(i)} style={{ appearance: "none", cursor: siste ? "default" : "pointer", fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap", padding: "8px 9px", minHeight: 36, borderRadius: 9, border: "none", color: siste ? T.fg : T.mut, background: siste ? T.panel2 : "transparent" }}>{s}</button>
          </Fragment>
        );
      })}
    </div>
  );
}

/* ── FlyttTilArk — DnD-erstatter på mobil (§3) ───────────
   Langt trykk → økta løftes → dette arket m/ dag/tid-velger.
   Anbefaling vises i klarspråk på valgt slipp — aldri sperre.
   Flate: Mobil. */
export interface DagValg {
  id: string;
  l: string;
  d: string;
  varsel: string | null;
}
export interface FlyttTilArkProps {
  okt?: ReactNode;
  dager?: DagValg[];
  tider?: string[];
  kapasitet?: ReactNode;
  onFlytt?: (valg: { dag: string; tid: string }) => void;
  onLukk?: () => void;
}
export function FlyttTilArk({
  okt = "Teknikk — P4 topp-posisjon",
  dager = [
    { id: "man", l: "Man", d: "13", varsel: null },
    { id: "tir", l: "Tir", d: "14", varsel: null },
    { id: "ons", l: "Ons", d: "15", varsel: null },
    { id: "tor", l: "Tor", d: "16", varsel: "Tett på NM — vurder lettere økt" },
    { id: "fre", l: "Fre", d: "17", varsel: null },
    { id: "lor", l: "Lør", d: "18", varsel: null },
    { id: "son", l: "Søn", d: "19", varsel: "Hviledag i planen" },
  ],
  tider = ["07:00", "09:00", "12:00", "15:00", "17:30", "19:00"],
  kapasitet = "2,5 av 3 t brukt onsdag",
  onFlytt,
  onLukk,
}: FlyttTilArkProps) {
  const [dag, setDag] = useState("ons");
  const [tid, setTid] = useState("15:00");
  const valgtDag = dager.find((d) => d.id === dag);
  return (
    <Ark tittel="Flytt økt" under={okt} onLukk={onLukk}>
      <Caps size={9} style={{ marginTop: 16 }}>Dag</Caps>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginTop: 8 }}>
        {dager.map((d) => {
          const on = dag === d.id;
          return (
            <button key={d.id} onClick={() => setDag(d.id)} style={{ appearance: "none", cursor: "pointer", minHeight: 52, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: on ? T.lime : T.panel2, border: `1px solid ${on ? "transparent" : T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", color: on ? T.onLime : T.mut }}>{d.l}</span>
              <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: on ? T.onLime : T.fg, fontVariantNumeric: "tabular-nums" }}>{d.d}</span>
            </button>
          );
        })}
      </div>
      {valgtDag && valgtDag.varsel && (
        <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 10, padding: "8px 11px", borderRadius: 10, background: `color-mix(in srgb,${T.warn} 10%,transparent)` }}>
          <Icon name="info" size={12} style={{ color: T.warn, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2, lineHeight: 1.45 }}>{valgtDag.varsel} — du velger selv.</span>
        </div>
      )}
      <Caps size={9} style={{ marginTop: 16 }}>Tid</Caps>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 8 }}>
        {tider.map((t) => {
          const on = tid === t;
          return (
            <button key={t} onClick={() => setTid(t)} style={{ appearance: "none", cursor: "pointer", height: 44, borderRadius: 12, fontFamily: T.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: on ? T.onLime : T.fg2, background: on ? T.lime : T.panel2, border: `1px solid ${on ? "transparent" : T.border}` }}>{t}</button>
          );
        })}
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, display: "block", marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{kapasitet}</span>
      <button onClick={() => onFlytt && onFlytt({ dag, tid })} style={{ appearance: "none", cursor: "pointer", width: "100%", height: 48, marginTop: 14, borderRadius: 9999, background: T.lime, border: "none", color: T.onLime, fontFamily: T.ui, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="arrow-right" size={15} />Flytt hit
      </button>
    </Ark>
  );
}

/* ── PreviewArk — økt-preview som bunn-ark (§4/§8) ───────
   Langtrykk på økt-brikke → øvelser m/ mål, AK-formel-chips,
   hurtighandlinger. Flate: Mobil (desktop: hover-kort). */
export interface FormelChip {
  l: string;
  v: string;
}
export interface PreviewOvelse {
  navn: string;
  mal: string;
}
export interface PreviewArkProps {
  tittel?: ReactNode;
  axis?: AkseKey;
  varighet?: ReactNode;
  formel?: FormelChip[];
  ovelser?: PreviewOvelse[];
  sist?: ReactNode;
  onLukk?: () => void;
  onRediger?: () => void;
  onDupliser?: () => void;
  onFlytt?: () => void;
}
export function PreviewArk({
  tittel = "Teknikk — P4 topp-posisjon",
  axis = "TEK",
  varighet = "90 min",
  formel = [{ l: "Akse", v: "TEK" }, { l: "L-fase", v: "L2" }, { l: "CS", v: "CS100" }, { l: "PR", v: "P4" }, { l: "Miljø", v: "Range" }],
  ovelser = [
    { navn: "P4-stopp m/ stang", mal: "3 × 10 — hold 2 s i topp" },
    { navn: "Speilkontroll topp-posisjon", mal: "15 svinger m/ video" },
    { navn: "Overføring: driver", mal: "20 baller, 80 % tempo" },
  ],
  sist = "Sist gjennomført: 6. juli — kvalitet 4 av 5",
  onLukk,
  onRediger,
  onDupliser,
  onFlytt,
}: PreviewArkProps) {
  const handlinger: { l: string; icon: string; on?: () => void }[] = [
    { l: "Rediger", icon: "pencil", on: onRediger },
    { l: "Dupliser", icon: "copy", on: onDupliser },
    { l: "Flytt", icon: "arrow-right", on: onFlytt },
  ];
  return (
    <Ark tittel={tittel} under={varighet} onLukk={onLukk}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
        <AkseChip a={axis} />
        {formel.map((f) => (
          <span key={f.l} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px" }}>
            <span style={{ color: T.mut }}>{f.l}</span>{f.v}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <Caps size={9}>Øvelser og mål</Caps>
        <div style={{ marginTop: 4 }}>
          {ovelser.map((o, i) => (
            <Rad key={i} title={o.navn} sub={o.mal} trailing={null} last={i === ovelser.length - 1}
              leading={<span style={{ width: 22, flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>{i + 1}.</span>} />
          ))}
        </div>
      </div>
      {sist && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, display: "block", marginTop: 10 }}>{sist}</span>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginTop: 14 }}>
        {handlinger.map((h) => (
          <button key={h.l} onClick={h.on} style={{ appearance: "none", cursor: "pointer", height: 44, borderRadius: 12, background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon name={h.icon} size={14} />{h.l}
          </button>
        ))}
      </div>
    </Ark>
  );
}

/* Prosessmål-ring (liten SVG-fremdriftsring) */
export interface RingProps {
  pct?: number;
  size?: number;
  label?: string;
}
export function Ring({ pct = 60, size = 34, label }: RingProps) {
  const r = (size - 5) / 2, o = 2 * Math.PI * r;
  return (
    <span title={label} style={{ position: "relative", width: size, height: size, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.track} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.up} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * o} ${o}`} />
      </svg>
      <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{pct}</span>
    </span>
  );
}

/* ── MaalStripe — mål-sporet på mobil (§1/§8) ────────────
   Resultatmål m/ nedtelling + prosessmål-ringer; kollapser
   til chip (trykk for å veksle). Flate: Mobil. */
export interface ProsessMal {
  l: string;
  pct: number;
}
export interface MaalStripeProps {
  resultatmal?: string;
  dagerIgjen?: number;
  prosessmal?: ProsessMal[];
  startApen?: boolean;
}
export function MaalStripe({
  resultatmal = "NM topp 10",
  dagerIgjen = 26,
  prosessmal = [
    { l: "Putting < 3 m", pct: 72 },
    { l: "Nærspill-økter", pct: 55 },
    { l: "FYS-volum", pct: 88 },
  ],
  startApen = true,
}: MaalStripeProps) {
  const [apen, setApen] = useState(startApen);
  if (!apen) return (
    <button onClick={() => setApen(true)} style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 13px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="target" size={12} style={{ color: T.lime }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg }}>{resultatmal}</span>
      <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{dagerIgjen} d</span>
      <Icon name="chevron-down" size={12} style={{ color: T.mut }} />
    </button>
  );
  return (
    <Kort pad="13px 15px" hover style={{ cursor: "pointer" }}>
      <div onClick={() => setApen(false)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            <Icon name="target" size={14} style={{ color: T.lime, flex: "none" }} />
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resultatmal}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
            <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{dagerIgjen}<span style={{ fontSize: 10, color: T.mut, marginLeft: 2 }}>dager igjen</span></span>
            <Icon name="chevron-up" size={13} style={{ color: T.mut }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
          {prosessmal.map((p) => (
            <span key={p.l} style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <Ring pct={p.pct} label={p.l} />
              <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, lineHeight: 1.3 }}>{p.l}</span>
            </span>
          ))}
        </div>
      </div>
    </Kort>
  );
}

/* ── SerieVelger — repeterende økt (Apple Kalender-stil) ─
   Aldri / Hver uke / Hver 2. uke / Egendefinert. Ved endring
   av eksisterende serie: «endre denne / alle fremtidige».
   Flate: Begge (44 px-rader). */
export interface SerieVelgerProps {
  valgt?: string;
  eksisterende?: boolean;
  onChange?: (id: string) => void;
  onOmfang?: (id: string) => void;
}
export function SerieVelger({ valgt = "uke", eksisterende = true, onChange, onOmfang }: SerieVelgerProps) {
  const [v, setV] = useState(valgt);
  const [omfang, setOmfang] = useState("denne");
  const valg = [
    { id: "aldri", l: "Aldri" },
    { id: "uke", l: "Hver uke" },
    { id: "touke", l: "Hver 2. uke" },
    { id: "egen", l: "Egendefinert…" },
  ];
  return (
    <Kort pad="14px 16px" eyebrow="Gjenta økt">
      <div>
        {valg.map((o, i) => {
          const on = v === o.id;
          return (
            <button key={o.id} onClick={() => { setV(o.id); onChange?.(o.id); }} style={{ appearance: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", minHeight: 44, padding: "0 2px", textAlign: "left", background: "transparent", border: "none", borderBottom: i === valg.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: on ? 600 : 500, color: on ? T.fg : T.fg2 }}>{o.l}</span>
              {on && <Icon name="check" size={15} style={{ color: T.lime }} />}
            </button>
          );
        })}
      </div>
      {eksisterende && v !== "aldri" && (
        <div style={{ marginTop: 14 }}>
          <Caps size={9}>Endringen gjelder</Caps>
          <div style={{ display: "flex", gap: 2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: 3, marginTop: 8 }}>
            {[{ id: "denne", l: "Bare denne økta" }, { id: "fremtidige", l: "Alle fremtidige" }].map((o) => {
              const on = omfang === o.id;
              return (
                <button key={o.id} onClick={() => { setOmfang(o.id); onOmfang?.(o.id); }} style={{ appearance: "none", cursor: "pointer", flex: 1, fontFamily: T.ui, fontSize: 12, fontWeight: 600, minHeight: 38, borderRadius: 9999, color: on ? T.bg : T.fg2, background: on ? T.fg : "transparent", border: "none", whiteSpace: "nowrap" }}>{o.l}</button>
              );
            })}
          </div>
        </div>
      )}
    </Kort>
  );
}

/* ── EgentreningVindu — gruppeøkt m/ egentrening-del ─────
   Del av gruppeøkta er satt av til egentrening: tidsrammen
   markeres på øktas tidslinje + CTA for å planlegge egen økt.
   Flate: Begge. */
export interface EgentreningVinduProps {
  gruppeokt?: ReactNode;
  dag?: ReactNode;
  tid?: ReactNode;
  vindu?: ReactNode;
  vinduAndel?: [number, number];
  planlagt?: boolean;
  onPlanlegg?: () => void;
}
export function EgentreningVindu({
  gruppeokt = "WANG — fellesøkt",
  dag = "Onsdag",
  tid = "17:00–19:00",
  vindu = "18:00–18:45",
  vinduAndel = [0.5, 0.875],
  planlagt = false,
  onPlanlegg,
}: EgentreningVinduProps) {
  const [v0, v1] = vinduAndel;
  return (
    <Kort pad="15px 17px" eyebrow="Gruppeøkt med egentrening">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gruppeokt}</div>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, display: "block", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{dag} · {tid}</span>
        </div>
        <AkseChip a="SPILL" />
      </div>
      <div style={{ position: "relative", height: 26, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, marginTop: 13, overflow: "hidden" }}>
        <span style={{ position: "absolute", left: `${v0 * 100}%`, width: `${(v1 - v0) * 100}%`, top: 0, bottom: 0, background: `color-mix(in srgb,${T.lime} 16%,transparent)`, borderLeft: `2px solid ${T.lime}`, borderRight: `2px solid ${T.lime}` }} />
        <span style={{ position: "absolute", left: `${v0 * 100}%`, width: `${(v1 - v0) * 100}%`, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.lime }}>Egentrening</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Din tid: <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{vindu}</span> — velg selv hva du fyller den med.</span>
        {planlagt
          ? <StatusPill tone="up">Økt planlagt</StatusPill>
          : <span onClick={onPlanlegg}><CTAPill icon="plus">Planlegg din økt</CTAPill></span>}
      </div>
    </Kort>
  );
}
