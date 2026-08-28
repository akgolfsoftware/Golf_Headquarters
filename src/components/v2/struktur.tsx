"use client";

/* AK Golf HQ v2 — STRUKTUR (retning C «Presis», fase 4).
   Navigasjons- og strukturkomponenter: FAB, veksler, paginering, trekkspill,
   skjelett, kanban, hjelp, validering, data-forhåndsvisning, tema.
   Port av ui_kits/v2/v2-struktur.jsx → produksjons-TSX (diff-null).
   Tokens: T (@/lib/v2/tokens). Primitiver: "./core". Ikon: @/components/v2/icon. */

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import { type AkseKey } from "@/lib/v2/format";
import { Caps, PillVelger, AvatarInit, AkseChip } from "./core";
import { Icon } from "@/components/v2/icon";
/* ── FAB: flytende handlingsknapp (lime = CTA) ────────── */
export interface FABProps {
  icon?: string;
  label?: ReactNode;
}
export function FAB({ icon = "plus", label }: FABProps) {
  return (
    <button
      type="button"
      aria-label={typeof label === "string" ? label : "Hovedhandling"}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        height: 56,
        minWidth: 56,
        minHeight: 56,
        padding: label ? "0 18px" : 0,
        borderRadius: TL.radius.pill,
        border: "none",
        background: TL.fill,
        color: TL.onFill,
        cursor: "pointer",
        boxShadow: `0 12px 30px color-mix(in srgb, var(--tl-fill) 24%, transparent), 0 4px 12px ${TL.scrim}`,
      }}
    >
      <Icon name={icon} size={18} strokeWidth={1.5} />
      {label && <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600 }}>{label}</span>}
    </button>
  );
}

/* ── SpillerGruppeVeksler: coach-toppbar (Spiller|Gruppe + søkbart valg) ── */
export interface SpillerGruppeVekslerProps {
  modus?: "spiller" | "gruppe";
  valgt?: string;
  gruppe?: string;
  onChange?: (v: string) => void;
}
export function SpillerGruppeVeksler({ modus = "spiller", valgt = "Øyvind Rohjan", gruppe = "WANG VG2 · 8 spillere", onChange }: SpillerGruppeVekslerProps) {
  const erS = modus === "spiller";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <PillVelger options={[{ v: "spiller", l: "Spiller" }, { v: "gruppe", l: "Gruppe" }]} value={modus} onChange={onChange} />
      <span title="Søk og bytt — skriv for å filtrere" style={{
        display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, height: 44, padding: "0 12px 0 6px",
        borderRadius: TL.radius.pill, background: TL.dock, border: `1px solid ${TL.hair}`, cursor: "pointer",
      }}>
        {erS
          ? <AvatarInit navn={valgt} size={26} />
          : <span style={{ width: 26, height: 26, borderRadius: 9999, background: TL.dim, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="users" size={13} style={{ color: TL.mute }} /></span>}
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text, whiteSpace: "nowrap" }}>{erS ? valgt : gruppe}</span>
        <Icon name="search" size={13} style={{ color: TL.mute }} />
        <Icon name="chevron-down" size={14} style={{ color: TL.mute }} />
      </span>
    </div>
  );
}

/* ── Paginering: mono-tall, aktiv = lys pille ─────────── */
export interface PagineringProps {
  side?: number;
  antall?: number;
  tekst?: string;
}
interface KnappProps {
  children?: ReactNode;
  on?: boolean;
  dis?: boolean;
}
function PagKnapp({ children, on, dis }: KnappProps) {
  return (
    <span style={{
      minWidth: 44, minHeight: 44, height: 44, padding: "0 8px", borderRadius: TL.radius.row, display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, cursor: dis ? "default" : "pointer", fontVariantNumeric: "tabular-nums",
      color: on ? TL.scene : dis ? TL.mute : TL.mute, background: on ? TL.text : TL.dock, border: `1px solid ${on ? TL.text : TL.hair}`, opacity: dis ? 0.4 : 1,
    }}>{children}</span>
  );
}
export function Paginering({ side = 2, antall = 8, tekst = "74 spillere" }: PagineringProps) {
  const synlig: (number | null)[] = [1, 2, 3, null, antall];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <PagKnapp dis><Icon name="chevron-left" size={14} /></PagKnapp>
      {synlig.map((s, i) => s === null
        ? <span key={i} style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, padding: "0 3px" }}>…</span>
        : <PagKnapp key={i} on={s === side}>{s}</PagKnapp>)}
      <PagKnapp><Icon name="chevron-right" size={14} /></PagKnapp>
      <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginLeft: 8 }}>Side {side} av {antall} · {tekst}</span>
    </div>
  );
}

/* ── Trekkspill: accordion m/ én åpen seksjon ─────────── */
export interface TrekkspillItem {
  t: string;
  c?: string;
  open?: boolean;
}
export interface TrekkspillProps {
  items?: TrekkspillItem[];
}
export function Trekkspill({ items = [
  { t: "Hva måler CS-testen?", c: "Combine-testen måler avstandskontroll på 60–180 m. Poeng per slag mot referansenivået ditt — snittet gir CS-tallet.", open: true },
  { t: "Hvordan beregnes SG?", c: "" },
  { t: "Hva betyr A–K-tallene?", c: "" },
] }: TrekkspillProps) {
  // Interaktiv: én åpen seksjon. Startverdi = første item merket open (mockup-troskap).
  const [aapen, setAapen] = useState<number | null>(() => {
    const i = items.findIndex((x) => x.open);
    return i >= 0 ? i : null;
  });
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "0 18px" }}>
      {items.map((x, i) => {
        const er = aapen === i;
        const svarId = `trekkspill-svar-${i}`;
        return (
          <div key={i} style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
            <button
              type="button"
              onClick={() => setAapen(er ? null : i)}
              aria-expanded={er}
              aria-controls={x.c ? svarId : undefined}
              className="v2-focus"
              style={{ appearance: "none", cursor: "pointer", width: "100%", minHeight: 44, textAlign: "left", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0" }}
            >
              <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{x.t}</span>
              <Icon name={er ? "chevron-up" : "chevron-down"} size={15} style={{ color: er ? TL.fill : TL.mute, flex: "none" }} />
            </button>
            {er && x.c && <p id={svarId} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "0 0 16px" }}>{x.c}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Skjelett: shimmer-plassholder ved lasting ────────── */
export interface SkjelettProps {
  linjer?: number;
  tall?: boolean;
}
export function Skjelett({ linjer = 3, tall = true }: SkjelettProps) {
  /* shimmer-highlight uttrykt via T for konsistens-vakten */
  const shim: CSSProperties = {
    background: `linear-gradient(90deg, ${TL.dock} 25%, color-mix(in srgb, ${TL.text} 7%, ${TL.dock}) 50%, ${TL.dock} 75%)`,
    backgroundSize: "200% 100%", animation: `v2shim 1.2s ${TL.motion.ease} infinite`, borderRadius: 3,
  };
  const bredder = ["42%", "88%", "64%", "76%"];
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "16px 18px 18px" }}>
      <style>{"@keyframes v2shim{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <span style={{ ...shim, display: "block", width: 90, height: 9 }} />
      {tall && <span style={{ ...shim, display: "block", width: 120, height: 34, marginTop: 14, borderRadius: TL.radius.row }} />}
      {Array.from({ length: linjer }, (_, i) => (
        <span key={i} style={{ ...shim, display: "block", width: bredder[i % bredder.length], height: 11, marginTop: i === 0 && !tall ? 14 : 10 }} />
      ))}
    </div>
  );
}

/* ── Skilje: strek m/ valgfri mono-etikett (bølge 11) ───
   Fasit: showroom `familie-structure.html` .div-lbl / .div-v. */
export interface SkiljeProps {
  /** Uten etikett = ren strek. */
  etikett?: string;
  /** "loddrett" = tynn strek mellom to elementer i en rad. */
  retning?: "vannrett" | "loddrett";
}
export function Skilje({ etikett, retning = "vannrett" }: SkiljeProps) {
  if (retning === "loddrett") {
    return <span aria-hidden style={{ width: 1, alignSelf: "stretch", background: TL.hair, flex: "none" }} />;
  }
  if (!etikett) {
    return <span aria-hidden style={{ display: "block", width: "100%", height: 1, background: TL.hair }} />;
  }
  const linje: CSSProperties = { flex: 1, height: 1, background: TL.hair };
  return (
    <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
      <span style={linje} />
      <Caps size={9.5} style={{ display: "inline", fontWeight: 600, letterSpacing: "0.08em", whiteSpace: "nowrap", flex: "none" }}>{etikett}</Caps>
      <span style={linje} />
    </div>
  );
}

/* ── Stegviser: veiviser-indikator (bølge 11) ────────────
   Fasit: showroom .stepper — fullført = lime-sirkel m/ hake, aktivt = lime-ramme,
   linjen grønnes etter fullført steg. I lys modus mapper lime til forest. */
export interface StegviserProps {
  steg?: string[];
  /** 1-indeksert aktivt steg. Steg før dette regnes som fullført. */
  aktiv?: number;
}
export function Stegviser({ steg = ["Profil", "Målsetting", "Baseline-test", "Plan"], aktiv = 3 }: StegviserProps) {
  return (
    <ol style={{ display: "flex", alignItems: "flex-start", listStyle: "none", margin: 0, padding: 0 }}>
      {steg.map((s, i) => {
        const nr = i + 1;
        const ferdig = nr < aktiv;
        const aktivtSteg = nr === aktiv;
        const sisteSteg = i === steg.length - 1;
        return (
          <li
            key={s}
            aria-current={aktivtSteg ? "step" : undefined}
            style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}
          >
            {!sisteSteg && (
              <span
                aria-hidden
                style={{
                  position: "absolute", top: 13, left: "calc(50% + 15px)", right: "calc(-50% + 15px)",
                  height: 1, background: ferdig ? TL.fill : TL.hair,
                  transition: `background ${180}ms ${TL.motion.ease}`,
                }}
              />
            )}
            <span
              style={{
                width: 26, height: 26, borderRadius: TL.radius.pill, display: "flex", alignItems: "center", justifyContent: "center",
                flex: "none", position: "relative", zIndex: 1,
                border: `1.5px solid ${ferdig || aktivtSteg ? TL.fill : TL.hair}`,
                background: ferdig ? TL.fill : aktivtSteg ? TL.dim : TL.scene,
                color: ferdig ? TL.onFill : aktivtSteg ? TL.text : TL.mute,
                fontFamily: TL.font.mono, fontSize: 11.5, fontWeight: 600,
                transition: `border-color ${180}ms ${TL.motion.ease}, background ${180}ms ${TL.motion.ease}, color ${180}ms ${TL.motion.ease}`,
              }}
            >
              {ferdig ? <Icon name="check" size={13} /> : nr}
            </span>
            <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 500, textAlign: "center", lineHeight: 1.3, color: aktivtSteg ? TL.text : ferdig ? TL.mute : TL.mute }}>
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ── KanbanKolonne: tittel + antall + kort-stabel ─────── */
export interface KanbanKort {
  t: string;
  s: string;
  a: AkseKey;
}
export interface KanbanKolonneProps {
  tittel?: string;
  kort?: KanbanKort[];
}
export function KanbanKolonne({ tittel = "Til vurdering", kort = [
  { t: "Øyvind Rohjan — ukeplan uke 29", s: "Sendt inn i går", a: "SPILL" },
  { t: "CS-test 24. jun — gjennomgang", s: "Venter på kommentar", a: "SLAG" },
  { t: "FYS-blokk august", s: "Utkast fra Anders Kristiansen", a: "FYS" },
] }: KanbanKolonneProps) {
  return (
    <div style={{ width: 270, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px 8px" }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tittel}</span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums", flex: "none" }}>{kort.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px 12px" }}>
        {kort.length === 0 && <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, textAlign: "center", padding: "24px 12px", border: `1px dashed ${TL.hair}`, borderRadius: TL.radius.row }}>Ingen kort her</div>}
        {kort.map((k, i) => (
          <div key={i} style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "11px 12px", cursor: "grab" }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text, lineHeight: 1.35 }}>{k.t}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute }}>{k.s}</span>
              <AkseChip a={k.a} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HjelpPopover: ?-ikon m/ forklaring (statisk åpen) ── */
export interface HjelpPopoverProps {
  tittel?: string;
  tekst?: string;
  w?: number;
}
export function HjelpPopover({ tittel = "Hva er SG?", tekst = "Strokes Gained sammenligner hvert slag med referansenivået. Positivt tall betyr at du vinner slag mot referansen — negativt at du taper.", w = 260 }: HjelpPopoverProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
      <span style={{ width: 28, height: 28, borderRadius: 9999, background: TL.dock, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Icon name="help-circle" size={14} style={{ color: TL.mute }} />
      </span>
      <div style={{ width: w, background: TL.dim, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: 12, boxShadow: "none" }}>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 13, color: TL.text }}>{tittel}</div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5, margin: "6px 0 0" }}>{tekst}</p>
      </div>
    </div>
  );
}

/* ── ValideringsChip: ok/advarsel/info i klarspråk — aldri sperre-språk ── */
export type ValideringsTone = "ok" | "advarsel" | "info";
export interface ValideringsChipProps {
  tone?: ValideringsTone;
  tekst?: ReactNode;
}
interface ValideringsMeta {
  c: string;
  i: string;
  d: string;
}
export function ValideringsChip({ tone = "advarsel", tekst }: ValideringsChipProps) {
  const map: Record<string, ValideringsMeta> = {
    ok: { c: TL.ok, i: "check", d: "Ser bra ut" },
    advarsel: { c: TL.warn, i: "alert-triangle", d: "Uvanlig høy verdi — sjekk gjerne tallet" },
    info: { c: TL.viz.target, i: "info", d: "Basert på 12 runder — flere gir sikrere tall" },
  };
  const m: ValideringsMeta = map[tone] || { c: TL.viz.target, i: "info", d: "" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8, minHeight: 28, padding: "0 12px", borderRadius: 9999,
      background: `color-mix(in srgb,${m.c} 10%,transparent)`, border: `1px solid color-mix(in srgb,${m.c} 26%,transparent)`,
    }}>
      <Icon name={m.i} size={12} style={{ color: m.c, flex: "none" }} />
      <span style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 500, color: TL.text, lineHeight: 1.4 }}>{tekst || m.d}</span>
    </span>
  );
}

/* ── DataForhaandsvisning: hover-verdi på graf (dato + verdi-boks) ── */
export interface DataForhaandsvisningProps {
  dato?: string;
  verdi?: string;
  enhet?: string;
  w?: number;
  h?: number;
}
export function DataForhaandsvisning({ dato = "24. jun", verdi = "+1,8", enhet = "SG", w = 300, h = 120 }: DataForhaandsvisningProps) {
  const pts: number[][] = [[0, 78], [38, 64], [76, 70], [114, 52], [152, 58], [190, 40], [228, 46], [266, 30], [300, 34]];
  const hx = 190, hy = 40;
  const linje = pts.map((p) => p.join(",")).join(" ");
  return (
    <div style={{ position: "relative", width: w, background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "14px 0 6px" }}>
      <svg width={w} height={h} viewBox={`0 0 300 ${h}`} style={{ display: "block" }}>
        <polygon points={`0,${h} ${linje} 300,${h}`} fill="color-mix(in srgb, var(--tl-fill) 7%, transparent)" />
        <polyline points={linje} fill="none" stroke={TL.fill} strokeWidth="2" strokeLinejoin="round" />
        <line x1={hx} y1={12} x2={hx} y2={h - 6} stroke={TL.hair} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={hx} cy={hy} r="5" fill={TL.fill} stroke={TL.elev} strokeWidth="2.5" />
      </svg>
      <div style={{ position: "absolute", left: 150, top: 10, background: TL.dim, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "8px 10px", boxShadow: "none" }}>
        <Caps size={9}>{dato}</Caps>
        <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{verdi}<span style={{ fontSize: 9.5, color: TL.mute, marginLeft: 4 }}>{enhet}</span></span>
      </div>
    </div>
  );
}

/* ── TemaVeksler: sol/måne-toggle (kun mock, AgencyOS) ── */
export interface TemaVekslerProps {
  value?: "lys" | "moerk";
  onChange?: (v: string) => void;
}
export function TemaVeksler({ value = "moerk", onChange }: TemaVekslerProps) {
  const valg = [{ v: "lys", i: "sun", l: "Lys modus" }, { v: "moerk", i: "moon", l: "Mørk modus" }];
  return (
    <div style={{ display: "flex", gap: 2, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 9999, padding: 2, width: "fit-content" }}>
      {valg.map((x) => {
        const on = value === x.v;
        return (
          <span key={x.v} title={x.l} onClick={() => onChange && onChange(x.v)} style={{
            width: 28, height: 28, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: on ? TL.text : "transparent", cursor: "pointer",
          }}>
            <Icon name={x.i} size={14} style={{ color: on ? TL.scene : TL.mute }} strokeWidth={on ? 2 : 1.5} />
          </span>
        );
      })}
    </div>
  );
}
