"use client";

/* AK Golf HQ v2 — STRUKTUR (retning C «Presis», fase 4).
   Navigasjons- og strukturkomponenter: FAB, veksler, paginering, trekkspill,
   skjelett, kanban, hjelp, validering, data-forhåndsvisning, tema.
   Port av ui_kits/v2/v2-struktur.jsx → produksjons-TSX (diff-null).
   Tokens: T (@/lib/v2/tokens). Primitiver: "./core". Ikon: @/components/v2/icon. */

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { Caps, PillVelger, AvatarInit, AkseChip } from "./core";
import { Icon } from "@/components/v2/icon";

/* ── FAB: flytende handlingsknapp (lime = CTA) ────────── */
export interface FABProps {
  icon?: string;
  label?: ReactNode;
}
export function FAB({ icon = "plus", label }: FABProps) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      height: 52, minWidth: 52, padding: label ? "0 22px" : 0, borderRadius: 9999,
      background: T.lime, color: T.onLime, cursor: "pointer",
      boxShadow: "0 12px 30px color-mix(in srgb, var(--v2-lime) 24%, transparent), 0 4px 12px rgba(0,0,0,0.4)",
    }}>
      <Icon name={icon} size={20} strokeWidth={2} />
      {label && <span style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600 }}>{label}</span>}
    </span>
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
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <PillVelger options={[{ v: "spiller", l: "Spiller" }, { v: "gruppe", l: "Gruppe" }]} value={modus} onChange={onChange} />
      <span title="Søk og bytt — skriv for å filtrere" style={{
        display: "inline-flex", alignItems: "center", gap: 9, height: 38, padding: "0 12px 0 6px",
        borderRadius: 9999, background: T.panel2, border: `1px solid ${T.borderS}`, cursor: "pointer",
      }}>
        {erS
          ? <AvatarInit navn={valgt} size={26} />
          : <span style={{ width: 26, height: 26, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="users" size={13} style={{ color: T.fg2 }} /></span>}
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap" }}>{erS ? valgt : gruppe}</span>
        <Icon name="search" size={13} style={{ color: T.mut }} />
        <Icon name="chevron-down" size={14} style={{ color: T.mut }} />
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
      minWidth: 32, height: 32, padding: "0 6px", borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.mono, fontSize: 12, fontWeight: 700, cursor: dis ? "default" : "pointer", fontVariantNumeric: "tabular-nums",
      color: on ? T.bg : dis ? T.mut : T.fg2, background: on ? T.fg : T.panel2, border: `1px solid ${on ? T.fg : T.border}`, opacity: dis ? 0.5 : 1,
    }}>{children}</span>
  );
}
export function Paginering({ side = 2, antall = 8, tekst = "74 spillere" }: PagineringProps) {
  const synlig: (number | null)[] = [1, 2, 3, null, antall];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <PagKnapp dis><Icon name="chevron-left" size={14} /></PagKnapp>
      {synlig.map((s, i) => s === null
        ? <span key={i} style={{ fontFamily: T.mono, fontSize: 12, color: T.mut, padding: "0 3px" }}>…</span>
        : <PagKnapp key={i} on={s === side}>{s}</PagKnapp>)}
      <PagKnapp><Icon name="chevron-right" size={14} /></PagKnapp>
      <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginLeft: 8 }}>Side {side} av {antall} · {tekst}</span>
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
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "2px 20px" }}>
      {items.map((x, i) => {
        const er = aapen === i;
        const svarId = `trekkspill-svar-${i}`;
        return (
          <div key={i} style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <button
              type="button"
              onClick={() => setAapen(er ? null : i)}
              aria-expanded={er}
              aria-controls={x.c ? svarId : undefined}
              className="v2-focus"
              style={{ appearance: "none", cursor: "pointer", width: "100%", textAlign: "left", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0" }}
            >
              <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{x.t}</span>
              <Icon name={er ? "chevron-up" : "chevron-down"} size={15} style={{ color: er ? T.lime : T.mut, flex: "none" }} />
            </button>
            {er && x.c && <p id={svarId} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "-4px 0 14px" }}>{x.c}</p>}
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
    background: `linear-gradient(90deg, ${T.panel2} 25%, color-mix(in srgb, ${T.fg} 7%, ${T.panel2}) 50%, ${T.panel2} 75%)`,
    backgroundSize: "200% 100%", animation: "v2shim 1.4s ease infinite", borderRadius: 6,
  };
  const bredder = ["42%", "88%", "64%", "76%"];
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "18px 20px" }}>
      <style>{"@keyframes v2shim{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <span style={{ ...shim, display: "block", width: 90, height: 9 }} />
      {tall && <span style={{ ...shim, display: "block", width: 120, height: 34, marginTop: 14, borderRadius: 8 }} />}
      {Array.from({ length: linjer }, (_, i) => (
        <span key={i} style={{ ...shim, display: "block", width: bredder[i % bredder.length], height: 11, marginTop: i === 0 && !tall ? 14 : 10 }} />
      ))}
    </div>
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
    <div style={{ width: 270, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 6px 10px" }}>
        <Caps size={9} style={{ display: "inline" }}>{tittel}</Caps>
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, background: T.panel3, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "1px 7px" }}>{kort.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kort.length === 0 && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, textAlign: "center", padding: "20px 8px", border: `1px dashed ${T.border}`, borderRadius: T.rRow }}>Ingen kort her</div>}
        {kort.map((k, i) => (
          <div key={i} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rRow, padding: "11px 12px", cursor: "grab" }}>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, lineHeight: 1.35 }}>{k.t}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>{k.s}</span>
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
      <span style={{ width: 22, height: 22, borderRadius: 9999, background: T.panel2, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Icon name="help-circle" size={13} style={{ color: T.fg2 }} />
      </span>
      <div style={{ width: w, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 14, padding: "12px 14px", boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 13.5, color: T.fg }}>{tittel}</div>
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6, margin: "6px 0 0" }}>{tekst}</p>
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
    ok: { c: T.up, i: "check", d: "Ser bra ut" },
    advarsel: { c: T.warn, i: "alert-triangle", d: "Uvanlig høy verdi — sjekk gjerne tallet" },
    info: { c: T.info, i: "info", d: "Basert på 12 runder — flere gir sikrere tall" },
  };
  const m: ValideringsMeta = map[tone] || { c: T.info, i: "info", d: "" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 9999,
      background: `color-mix(in srgb,${m.c} 10%,transparent)`, border: `1px solid color-mix(in srgb,${m.c} 26%,transparent)`,
    }}>
      <Icon name={m.i} size={12} style={{ color: m.c, flex: "none" }} />
      <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 500, color: T.fg, lineHeight: 1.4 }}>{tekst || m.d}</span>
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
    <div style={{ position: "relative", width: w, background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "14px 0 6px" }}>
      <svg width={w} height={h} viewBox={`0 0 300 ${h}`} style={{ display: "block" }}>
        <polygon points={`0,${h} ${linje} 300,${h}`} fill="color-mix(in srgb, var(--v2-lime) 7%, transparent)" />
        <polyline points={linje} fill="none" stroke={T.lime} strokeWidth="2" strokeLinejoin="round" />
        <line x1={hx} y1={12} x2={hx} y2={h - 6} stroke={T.borderS} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={hx} cy={hy} r="5" fill={T.lime} stroke={T.panel} strokeWidth="2.5" />
      </svg>
      <div style={{ position: "absolute", left: 150, top: 10, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 10, padding: "7px 11px", boxShadow: "0 10px 26px rgba(0,0,0,0.4)" }}>
        <Caps size={8.5}>{dato}</Caps>
        <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{verdi}<span style={{ fontSize: 9.5, color: T.mut, marginLeft: 4 }}>{enhet}</span></span>
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
    <div style={{ display: "flex", gap: 2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: 3, width: "fit-content" }}>
      {valg.map((x) => {
        const on = value === x.v;
        return (
          <span key={x.v} title={x.l} onClick={() => onChange && onChange(x.v)} style={{
            width: 30, height: 30, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: on ? T.fg : "transparent", cursor: "pointer",
          }}>
            <Icon name={x.i} size={14} style={{ color: on ? T.bg : T.mut }} strokeWidth={on ? 2 : 1.5} />
          </span>
        );
      })}
    </div>
  );
}
