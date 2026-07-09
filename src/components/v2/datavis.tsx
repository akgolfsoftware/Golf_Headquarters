"use client";

/* AK Golf HQ v2 — DATAVISUALISERING (retning C «Presis»).
   Gjenskaping av golfdata/-datakontraktene i v2-idiomet: samme props/innhold,
   nytt uttrykk. Komponeres av kjernen (T-tokens, Kort, TallHero, chips).
   Regler: mono-tall m/ komma-desimal, «—» for manglende data, opp/ned = T.up/T.down
   (ALDRI lime), aksefarger fra T.ax, lime kun som aksent/hero.
   Demo-data som default-props → rendres rett i galleriet.
   Port av ui_kits/v2/v2-datavis.jsx → produksjons-TSX (diff-null). */

import type { CSSProperties, ReactNode } from "react";
import { Fragment, useState } from "react";
import { T, fmtSg, type AkseKey } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { Kort, TallHero, Caps, TomTilstand, CTAPill, AkseChip, InnsiktChip, DeltaChip, AvatarInit, AKSE_NAVN } from "./core";

/* ── Delte hjelpere ───────────────────────────────────── */
const kd = (v: number | null | undefined, d = 1): string =>
  v == null || Number.isNaN(Number(v)) ? "—" : Number(v).toFixed(d).replace(".", ",");
const mono = (size: number, color: string = T.fg, weight = 700): CSSProperties => ({
  fontFamily: T.mono, fontSize: size, fontWeight: weight, color, fontVariantNumeric: "tabular-nums",
});
const eyebrowRow = (lbl: ReactNode, right?: ReactNode) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
    <Caps>{lbl}</Caps>
    {right && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{right}</span>}
  </div>
);
interface TrendTagProps {
  v?: string | null;
  god?: boolean;
}
function TrendTag({ v, god }: TrendTagProps) { /* liten trend uten pil — farge etter dom (invertert-trygg) */
  if (v == null) return <span style={{ ...mono(11, T.mut) }}>—</span>;
  const c = god ? T.up : T.down;
  return <span style={{ ...mono(10.5, c), background: `color-mix(in srgb,${c} 12%,transparent)`, borderRadius: 5, padding: "2px 6px" }}>{v}</span>;
}

/* ── RingMaaler — sirkulær måler for én avgrenset metrikk ── */
export interface RingZone {
  from: number;
  to: number;
  color: string;
  label?: string;
}
export interface RingMaalerProps {
  label?: ReactNode;
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  size?: number;
  thickness?: number;
  color?: string;
  zones?: RingZone[] | null;
  decimals?: number;
}
export function RingMaaler({ label = "Gjennomføring", value = 78, min = 0, max = 100, unit = "%", size = 120, thickness = 9, color = T.lime, zones = null, decimals = 0 }: RingMaalerProps) {
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const zone = zones && zones.length ? (zones.find((z) => value >= z.from && value < z.to) || zones[zones.length - 1]) : null;
  const arc = zone ? zone.color : color;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.track} strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={arc} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <span style={{ ...mono(size >= 100 ? 27 : 18), lineHeight: 1 }}>
          {kd(value, decimals)}<span style={{ fontSize: "0.5em", color: T.mut, marginLeft: 2 }}>{unit}</span>
        </span>
        {label && <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>{label}</span>}
      </div>
      {zone && zone.label && <span style={{ position: "absolute", left: 0, right: 0, bottom: -18, textAlign: "center", fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>{zone.label}</span>}
    </div>
  );
}

/* ── ProgresjonsBar — bar · segment · streak ─────────────── */
export type ProgresjonsBarVariant = "bar" | "segment" | "streak";
export interface ProgresjonsBarProps {
  variant?: ProgresjonsBarVariant;
  value?: number;
  max?: number;
  label?: ReactNode;
  color?: string;
  total?: number;
  filled?: number;
  active?: number;
  flame?: boolean;
  showValue?: boolean;
}
export function ProgresjonsBar({ variant = "bar", value = 64, max = 100, label = "Ukesvolum", color = T.lime, total = 7, filled = 4, active = 0, flame = true, showValue = true }: ProgresjonsBarProps) {
  if (variant === "streak") {
    const n = active || filled;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {Array.from({ length: total }).map((_, i) =>
          flame && i === n - 1
            ? <Icon key={i} name="flame" size={17} style={{ color }} />
            : <span key={i} style={{ width: 10, height: 10, borderRadius: 9999, background: i < n ? color : T.track }} />
        )}
        {label && <span style={{ ...mono(11.5, T.fg2, 600), marginLeft: 4 }}>{label}</span>}
      </div>
    );
  }
  if (variant === "segment") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => <span key={i} style={{ flex: 1, height: 8, borderRadius: 3, background: i < filled ? color : T.track }} />)}
        </div>
        {showValue && <span style={{ ...mono(11.5, T.fg2, 600) }}>{filled} / {total}{label ? ` · ${label}` : ""}</span>}
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          {label && <span style={{ ...mono(11.5, T.fg2, 600) }}>{label}</span>}
          {showValue && <span style={{ ...mono(11.5) }}>{Math.round(pct)} %</span>}
        </div>
      )}
      <div style={{ height: 8, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 9999, background: color, opacity: 0.9 }} />
      </div>
    </div>
  );
}

/* ── VarmeKart — intensitet-grid (uke × ukedag, time × dag) ── */
const VK_ROWS = ["Uke 25", "Uke 26", "Uke 27", "Uke 28"];
const VK_COLS = ["M", "T", "O", "T", "F", "L", "S"];
const VK_VALS: number[][] = [
  [0.4, 0, 0.7, 0.3, 0.9, 0, 0.2], [0.6, 0.2, 0, 0.8, 0.5, 0.3, 0],
  [0, 0.5, 0.9, 0.4, 1, 0, 0.6], [0.3, 0, 0.6, 0.7, 0.4, 0.8, 0],
];
export interface VarmeKartProps {
  rows?: string[];
  cols?: string[];
  values?: number[][];
  color?: string;
  cell?: number;
  gap?: number;
  fmt?: (v: number) => string;
}
export function VarmeKart({ rows = VK_ROWS, cols = VK_COLS, values = VK_VALS, color = T.lime, cell = 24, gap = 3, fmt = (v) => `${Math.round(v * 100)} %` }: VarmeKartProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `52px repeat(${cols.length}, ${cell}px)`, gridTemplateRows: `16px repeat(${rows.length}, ${cell}px)`, gap, alignItems: "center" }}>
      <span />
      {cols.map((c, i) => <span key={i} style={{ ...mono(9, T.mut), textAlign: "center" }}>{c}</span>)}
      {rows.map((r, ri) => (
        <Fragment key={ri}>
          <span style={{ ...mono(9, T.mut) }}>{r}</span>
          {cols.map((_, ci) => {
            const v = Math.max(0, Math.min(1, (values[ri] || [])[ci] ?? 0));
            return (
              <span key={ci} title={fmt(v)} style={{
                width: cell, height: cell, borderRadius: 6,
                background: v === 0 ? T.track : `color-mix(in srgb, ${color} ${Math.round(v * 80)}%, ${T.panel2})`,
              }} />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

/* ── DataTabell — tett sorterbar tabell ──────────────────── */
export interface DataTabellColumn {
  key: string;
  label: string;
  mono?: boolean;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  delta?: boolean;
}
export type DataTabellRow = Record<string, string | number | null | undefined>;
const DT_COLS: DataTabellColumn[] = [
  { key: "navn", label: "Spiller" },
  { key: "runder", label: "Runder", mono: true, align: "right", sortable: true },
  { key: "sg", label: "SG", mono: true, delta: true, align: "right", sortable: true },
];
const DT_ROWS: DataTabellRow[] = [
  { navn: "Øyvind Rohjan", runder: 14, sg: 1.2 }, { navn: "Emma Berg", runder: 11, sg: 0.4 },
  { navn: "Jonas Lie", runder: 9, sg: -0.6 }, { navn: "Sara Holm", runder: 12, sg: -1.1 },
];
export interface DataTabellProps {
  columns?: DataTabellColumn[];
  rows?: DataTabellRow[];
  sortKey?: string;
  sortDir?: "asc" | "desc";
}
export function DataTabell({ columns = DT_COLS, rows = DT_ROWS, sortKey = "sg", sortDir = "desc" }: DataTabellProps) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: sortKey, dir: sortDir });
  if (!rows.length) return <TomTilstand icon="list" title="Ingen rader" sub="Tabellen fylles når det finnes data å vise." />;
  const sorted = [...rows].sort((a, b) => {
    const va = a[sort.key], vb = b[sort.key];
    const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va ?? "").localeCompare(String(vb ?? ""));
    return sort.dir === "desc" ? -c : c;
  });
  const th: CSSProperties = { padding: "7px 10px", textAlign: "left", fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, borderBottom: `1px solid ${T.borderS}`, whiteSpace: "nowrap" };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>
        {columns.map((c) => (
          <th key={c.key} style={{ ...th, textAlign: c.align || "left", cursor: c.sortable ? "pointer" : "default" }}
            onClick={c.sortable ? () => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === "desc" ? "asc" : "desc" })) : undefined}>
            {c.label}{sort.key === c.key && c.sortable ? (sort.dir === "desc" ? " ↓" : " ↑") : ""}
          </th>
        ))}
      </tr></thead>
      <tbody>
        {sorted.map((row, ri) => (
          <tr key={ri}>
            {columns.map((c) => {
              const v = row[c.key];
              const col = c.delta && typeof v === "number" ? (v > 0 ? T.up : v < 0 ? T.down : T.fg2) : T.fg;
              /* Tall alltid komma-desimal (aldri rå JS-float/punktum). Delta → fmtSg;
                 øvrige numeriske → nb-NO m/ tusenskille + komma; tomt → «—». */
              let vis: ReactNode;
              if (v == null) vis = "—";
              else if (c.delta && typeof v === "number") vis = fmtSg(v);
              else if (typeof v === "number") vis = v.toLocaleString("nb-NO", { maximumFractionDigits: 2 });
              else vis = v;
              return (
                <td key={c.key} style={{ padding: "9px 10px", textAlign: c.align || "left", borderBottom: ri === sorted.length - 1 ? "none" : `1px solid ${T.border}`, fontFamily: c.mono || c.delta ? T.mono : T.ui, fontSize: c.mono || c.delta ? 12.5 : 13, fontWeight: c.delta ? 700 : c.mono ? 600 : 500, color: col, fontVariantNumeric: "tabular-nums" }}>
                  {vis}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── SgTotal — SG total mot navngitt baseline ────────────── */
export interface SgTotalProps {
  verdi?: string | null;
  enhet?: string;
  baseline?: string;
  runder?: number;
  trend?: string | null;
  begrunnelse?: ReactNode;
  benchmark?: ReactNode | null;
}
export function SgTotal({ verdi = "+1,2", enhet = "slag", baseline = "Broadie scratch", runder = 10, trend = "+0,4", begrunnelse = "Innspill løfter totalen — putting trekker fortsatt ned.", benchmark = null }: SgTotalProps) {
  const dir: "up" | "down" = trend != null && /^[−-]/.test(trend) ? "down" : "up";
  return (
    <Kort tint eyebrow="SG Total">
      <TallHero value={verdi == null ? "—" : verdi} unit={enhet} delta={trend ?? undefined} dir={dir} size={52}
        sub={`siste ${runder} runder · mot ${baseline}`} />
      {begrunnelse && <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>{begrunnelse}</p>}
      {benchmark && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 8 }}>{benchmark}</span>}
    </Kort>
  );
}

/* ── SgKategorier — divergerende SG-stolper fra nullbaseline ── */
export interface SgKategori {
  akse: string;
  sg: number;
}
const SGK_DEMO: SgKategori[] = [{ akse: "OTT", sg: 0.3 }, { akse: "APP", sg: 0.6 }, { akse: "ARG", sg: -0.4 }, { akse: "PUTT", sg: -1.2 }];
const SGK_NAVN: Record<string, string> = { OTT: "Tee-slag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" };
export interface SgKategorierProps {
  kategorier?: SgKategori[];
  baseline?: string;
  fagkoder?: boolean;
}
export function SgKategorier({ kategorier = SGK_DEMO, baseline = "Broadie scratch", fagkoder = false }: SgKategorierProps) {
  const max = Math.max(0.5, ...kategorier.map((k) => Math.abs(k.sg)));
  const verst = kategorier.reduce((wi, k, i, a) => (k.sg < a[wi].sg ? i : wi), 0);
  return (
    <Kort>
      {eyebrowRow("SG per kategori", `mot ${baseline}`)}
      {kategorier.map((k, i) => {
        const gain = k.sg >= 0, w = (Math.abs(k.sg) / max) * 50;
        return (
          <div key={k.akse} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: i === kategorier.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <span style={{ width: 74, flex: "none", fontFamily: fagkoder ? T.mono : T.ui, fontSize: fagkoder ? 10 : 12.5, fontWeight: 600, color: T.fg2 }}>{fagkoder ? k.akse : SGK_NAVN[k.akse] || k.akse}</span>
            <span style={{ flex: 1, position: "relative", height: 8, borderRadius: 9999, background: T.track }}>
              <span style={{ position: "absolute", left: "50%", top: -2, width: 1, height: 12, background: T.borderS }} />
              <span style={{ position: "absolute", top: 0, height: "100%", borderRadius: 9999, width: `${w}%`, background: gain ? T.up : T.down, ...(gain ? { left: "50%" } : { right: "50%" }) }} />
            </span>
            <span style={{ width: 78, flex: "none", textAlign: "right", ...mono(12, gain ? T.up : T.down) }}>
              {fmtSg(k.sg)}{i === verst && <span style={{ display: "block", fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.down }}>størst tap</span>}
            </span>
          </div>
        );
      })}
    </Kort>
  );
}

/* ── SgTrendKort — SG over tid m/ hendelsesmarkører ──────── */
export interface SgTrendPunkt {
  sg: number;
}
export interface SgTrendHendelse {
  idx: number;
  navn: string;
}
const SGT_DEMO: SgTrendPunkt[] = [-1.4, -0.9, -1.1, -0.3, 0.2, -0.4, 0.6, 0.4, 1.0, 1.2].map((sg) => ({ sg }));
const SGT_HEND: SgTrendHendelse[] = [{ idx: 3, navn: "NGF-test" }, { idx: 7, navn: "SPES →" }];
export interface SgTrendKortProps {
  punkter?: SgTrendPunkt[];
  hendelser?: SgTrendHendelse[];
  baseline?: string;
  height?: number;
}
export function SgTrendKort({ punkter = SGT_DEMO, hendelser = SGT_HEND, baseline = "Broadie scratch", height = 140 }: SgTrendKortProps) {
  if (punkter.length < 2) return <Kort eyebrow="SG-trend"><TomTilstand icon="trending-up" title="For få runder" sub={`Spill flere runder for å se SG-utviklingen mot ${baseline}.`} /></Kort>;
  const W = 560, H = height, pl = 26, pr = 10, py = 16;
  const vals = punkter.map((p) => p.sg);
  const lo = Math.min(-0.5, ...vals), hi = Math.max(0.5, ...vals);
  const x = (i: number) => pl + (i / (punkter.length - 1)) * (W - pl - pr);
  const y = (v: number) => py + (1 - (v - lo) / (hi - lo)) * (H - py * 2);
  const d = punkter.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.sg).toFixed(1)}`).join(" ");
  const last = punkter[punkter.length - 1];
  return (
    <Kort>
      {eyebrowRow("SG-trend", `mot ${baseline}`)}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`SG-trend over ${punkter.length} runder`}>
        <line x1={pl} y1={y(0)} x2={W - pr} y2={y(0)} stroke={T.borderS} strokeWidth="1" strokeDasharray="3 3" />
        <text x={4} y={y(0) + 3} style={{ fontFamily: T.mono, fontSize: 9, fill: T.mut }}>0</text>
        {hendelser.map((e, i) => (
          <g key={i}>
            <line x1={x(e.idx)} y1={py} x2={x(e.idx)} y2={H - py} stroke={T.border} strokeWidth="1" />
            <text x={x(e.idx) + 4} y={py + 8} style={{ fontFamily: T.mono, fontSize: 8.5, fill: T.mut }}>{e.navn}</text>
          </g>
        ))}
        <path d={d} fill="none" stroke={T.fg2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {punkter.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.sg)} r={i === punkter.length - 1 ? 4 : 2.4}
            fill={i === punkter.length - 1 ? (last.sg >= 0 ? T.up : T.down) : T.mut} stroke={T.panel} strokeWidth="1.5" />
        ))}
      </svg>
    </Kort>
  );
}

/* ── Scorekort — 18 hull m/ birdie/bogey-farger + SG per hull ── */
export interface ScorekortHull {
  nr: number;
  par: number;
  score: number;
  sg?: number | null;
}
export interface ScorekortSammendrag {
  score: number;
  par: number;
  sg: number;
}
const SK_DEMO: ScorekortHull[] = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4].map((par, i) => ({
  nr: i + 1, par,
  score: par + [0, 0, -1, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, 2, 0, 0, -1, 0][i],
  sg: [0.1, 0, 0.6, 0.1, -0.8, 0.2, 0, 0.7, -0.1, 0.1, -0.9, 0, 0.2, -1.6, 0.1, 0, 0.8, 0.1][i],
}));
const skFarge = (d: number): string => (d < 0 ? T.up : d > 1 ? T.down : d === 1 ? T.warn : T.fg);
export interface ScorekortProps {
  hull?: ScorekortHull[];
  sammendrag?: ScorekortSammendrag | null;
  baseline?: string;
}
export function Scorekort({ hull = SK_DEMO, sammendrag = null, baseline = "Broadie scratch" }: ScorekortProps) {
  if (!hull.length) return <Kort eyebrow="Scorekort"><TomTilstand icon="flag" title="Ingen runder ennå" sub="Logg en runde for å se hull-for-hull med Strokes Gained." /></Kort>;
  const score = sammendrag ? sammendrag.score : hull.reduce((s, h) => s + h.score, 0);
  const par = sammendrag ? sammendrag.par : hull.reduce((s, h) => s + h.par, 0);
  const sg = sammendrag ? sammendrag.sg : hull.reduce((s, h) => s + (h.sg || 0), 0);
  const rel = score - par;
  return (
    <Kort eyebrow="Scorekort" action={<span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>mot {baseline}</span>}>
      <div style={{ display: "flex", gap: 28, alignItems: "baseline", marginBottom: 14 }}>
        <span style={{ ...mono(34), lineHeight: 1 }}>{score} <span style={{ fontSize: 14, color: skFarge(rel > 1 ? 2 : rel) }}>{rel === 0 ? "E" : rel > 0 ? `+${rel}` : rel}</span></span>
        <span style={{ ...mono(20, sg >= 0 ? T.up : T.down) }}>{fmtSg(sg)} <span style={{ fontSize: 10, color: T.mut }}>SG</span></span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 4 }}>
        {hull.map((h) => {
          const d = h.score - h.par;
          return (
            <div key={h.nr} style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.mut }}>{h.nr} · P{h.par}</div>
              <div style={{ ...mono(15, skFarge(d)), lineHeight: 1.3 }}>{h.score}</div>
              <div style={{ ...mono(8.5, h.sg == null ? T.mut : h.sg >= 0 ? T.up : T.down, 600) }}>{h.sg == null ? "—" : fmtSg(h.sg)}</div>
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

/* ── TigerFive — fem kjernemetrikker m/ status + trend ────── */
export interface TigerFiveMetrikk {
  navn: string;
  verdi: string;
  status: string;
  trend?: string | null;
  invertert?: boolean;
  enhet?: string;
}
const T5_DEMO: TigerFiveMetrikk[] = [
  { navn: "Bogeyfrie 9-hull", verdi: "3", status: "god", trend: "+1" },
  { navn: "Doble+", verdi: "2", status: "varsel", trend: "+1", invertert: true },
  { navn: "3-putt", verdi: "1", status: "god", trend: "−2", invertert: true },
  { navn: "Bogey par 5", verdi: "0", status: "god", trend: "0" },
  { navn: "Straffeslag", verdi: "4", status: "risiko", trend: "+2", invertert: true },
];
const T5_TONE: Record<string, string> = { god: T.up, varsel: T.warn, risiko: T.down, noytral: T.mut };
export interface TigerFiveProps {
  metrikker?: TigerFiveMetrikk[];
}
export function TigerFive({ metrikker = T5_DEMO }: TigerFiveProps) {
  return (
    <Kort eyebrow="Tiger Five">
      {metrikker.map((m, i) => {
        const pos = m.trend != null && !/^[−-]/.test(m.trend) && m.trend !== "0";
        const god = m.trend === "0" ? true : m.invertert ? !pos : pos;
        return (
          <div key={m.navn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i === metrikker.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: T5_TONE[m.status] || T.mut, flex: "none" }} />
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>{m.navn}</span>
            <span style={{ ...mono(14) }}>{m.verdi}{m.enhet && <span style={{ fontSize: 9, color: T.mut }}> {m.enhet}</span>}</span>
            <TrendTag v={m.trend} god={god} />
          </div>
        );
      })}
    </Kort>
  );
}

/* ── PuttModell — innslag-% per bånd mot IUP-baseline (alltid ft) ── */
export interface PuttBaand {
  band: string;
  pct: number;
  baseline?: number | null;
}
const PM_DEMO: PuttBaand[] = [
  { band: "0–3 ft", pct: 99, baseline: 99 }, { band: "3–6 ft", pct: 84, baseline: 91 },
  { band: "6–10 ft", pct: 52, baseline: 60 }, { band: "10–20 ft", pct: 28, baseline: 31 },
  { band: "20+ ft", pct: 9, baseline: 8 },
];
export interface PuttModellProps {
  band?: PuttBaand[];
  baseline?: string;
}
export function PuttModell({ band = PM_DEMO, baseline = "Team Norway IUP" }: PuttModellProps) {
  return (
    <Kort>
      {eyebrowRow("Puttemodell · innslag-%", `mot ${baseline}`)}
      {band.map((b, i) => {
        const d = b.baseline != null ? Math.round(b.pct - b.baseline) : null;
        return (
          <div key={b.band} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: i === band.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <span style={{ width: 58, flex: "none", ...mono(10, T.fg2) }}>{b.band}</span>
            <span style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
              <span style={{ display: "block", width: `${Math.max(0, Math.min(100, b.pct))}%`, height: "100%", borderRadius: 9999, background: T.lime, opacity: 0.9 }} />
            </span>
            <span style={{ width: 40, flex: "none", textAlign: "right", ...mono(12) }}>{b.pct} %</span>
            <span style={{ width: 52, flex: "none", textAlign: "right", ...mono(10.5, d == null ? T.mut : d >= 0 ? T.up : T.down, 600) }}>
              {d == null ? "—" : `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)} pp`}
            </span>
          </div>
        );
      })}
    </Kort>
  );
}

/* ── Gapping — carry per kølle m/ ±spredning + gap-varsler ── */
export interface GapKolle {
  navn: string;
  carry: number;
  spredning?: number;
}
export type GapVarsel = string | { tekst: string };
const GAP_DEMO: GapKolle[] = [
  { navn: "Driver", carry: 248, spredning: 14 }, { navn: "3-tre", carry: 224, spredning: 12 },
  { navn: "5-jern", carry: 178, spredning: 9 }, { navn: "7-jern", carry: 156, spredning: 8 },
  { navn: "9-jern", carry: 128, spredning: 7 }, { navn: "PW", carry: 112, spredning: 6 },
];
export interface GappingProps {
  koller?: GapKolle[];
  varsler?: GapVarsel[];
}
export function Gapping({ koller = GAP_DEMO, varsler = ["Gap 3-tre → 5-jern er 46 m — vurder hybrid."] }: GappingProps) {
  const max = Math.max(...koller.map((k) => k.carry + (k.spredning || 0))) * 1.05;
  return (
    <Kort>
      {eyebrowRow("Køllegapping · carry", "meter · ± spredning")}
      {koller.map((k) => {
        const w = (k.carry / max) * 100, sp = ((k.spredning || 0) / max) * 100;
        return (
          <div key={k.navn} style={{ display: "flex", alignItems: "center", gap: 11, padding: "6px 0" }}>
            <span style={{ width: 52, flex: "none", ...mono(10, T.fg2) }}>{k.navn}</span>
            <span style={{ flex: 1, position: "relative", height: 8, borderRadius: 9999, background: T.track }}>
              <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${w}%`, borderRadius: 9999, background: `color-mix(in srgb, ${T.fg} 34%, transparent)` }} />
              {k.spredning ? <span style={{ position: "absolute", top: 1, height: 6, borderRadius: 9999, left: `${w - sp}%`, width: `${sp * 2}%`, background: `color-mix(in srgb, ${T.lime} 30%, transparent)` }} /> : null}
            </span>
            <span style={{ width: 48, flex: "none", textAlign: "right", ...mono(12) }}>{k.carry} m</span>
          </div>
        );
      })}
      {varsler.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, padding: "9px 11px", borderRadius: T.rRow, background: `color-mix(in srgb, ${T.down} 9%, transparent)` }}>
          <Icon name="alert-triangle" size={13} style={{ color: T.down, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{typeof v === "string" ? v : v.tekst}</span>
        </div>
      ))}
    </Kort>
  );
}

/* ── LaunchWindow — launch/spinn-scatter mot optimalt vindu ── */
export interface LaunchSkudd {
  launch: number;
  spinn: number;
}
export interface LaunchVindu {
  launchMin: number;
  launchMax: number;
  spinnMin: number;
  spinnMax: number;
}
const LW_SKUDD: LaunchSkudd[] = [
  { launch: 11.2, spinn: 2900 }, { launch: 12.4, spinn: 2450 }, { launch: 13.1, spinn: 2300 },
  { launch: 10.4, spinn: 3150 }, { launch: 12.9, spinn: 2600 }, { launch: 14.2, spinn: 2100 },
  { launch: 11.8, spinn: 2750 }, { launch: 13.6, spinn: 2350 }, { launch: 12.1, spinn: 3050 }, { launch: 13.3, spinn: 2500 },
];
const LW_VINDU: LaunchVindu = { launchMin: 12, launchMax: 14.5, spinnMin: 2100, spinnMax: 2600 };
export interface LaunchWindowProps {
  kolle?: string;
  csNivaa?: string;
  skudd?: LaunchSkudd[];
  vindu?: LaunchVindu | null;
  meterIgjen?: number | string | null;
  grunnlag?: string;
  dom?: ReactNode;
}
export function LaunchWindow({ kolle = "Driver", csNivaa = "CS90", skudd = LW_SKUDD, vindu = LW_VINDU, meterIgjen = 9, grunnlag = "26 slag · TrackMan", dom = "Spinnen ligger ~400 rpm for høyt — det ligger 9 meter igjen i vinduet." }: LaunchWindowProps) {
  if (!skudd.length || !vindu) return <Kort eyebrow="Launch-vindu"><TomTilstand icon="crosshair" title="Ingen TrackMan-data ennå" sub={`Kjør en TrackMan-økt med ${kolle}, så tegnes vinduet for ${csNivaa} her.`} /></Kort>;
  const W = 340, H = 190, m = { l: 38, r: 10, t: 10, b: 22 };
  const xs = skudd.map((s) => s.launch).concat([vindu.launchMin, vindu.launchMax]);
  const ys = skudd.map((s) => s.spinn).concat([vindu.spinnMin, vindu.spinnMax]);
  const xMin = Math.min(...xs) - 1, xMax = Math.max(...xs) + 1, yMin = Math.min(...ys) - 250, yMax = Math.max(...ys) + 250;
  const X = (v: number) => m.l + ((v - xMin) / (xMax - xMin)) * (W - m.l - m.r);
  const Y = (v: number) => H - m.b - ((v - yMin) / (yMax - yMin)) * (H - m.t - m.b);
  const er = (s: LaunchSkudd) => s.launch >= vindu.launchMin && s.launch <= vindu.launchMax && s.spinn >= vindu.spinnMin && s.spinn <= vindu.spinnMax;
  const inne = skudd.filter(er).length;
  const meter = meterIgjen == null ? "—" : typeof meterIgjen === "string" ? meterIgjen : `${String(meterIgjen).replace(".", ",")} m`;
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div>
          <Caps>Launch-vindu</Caps>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 5 }}>{kolle}</div>
          <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 3 }}>{csNivaa}{grunnlag ? ` · ${grunnlag}` : " · datagrunnlag mangler"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...mono(26), lineHeight: 1 }}>{meter}</div>
          <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, marginTop: 4 }}>ligger i vinduet</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Launch mot spinn — ${inne} av ${skudd.length} slag i vinduet`}>
        <text x={m.l + 4} y={m.t + 2} style={{ fontFamily: T.mono, fontSize: 8, fill: T.mut }}>rpm</text>
        <text x={W - m.r} y={m.t + 2} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 8, fill: T.mut }}>launch °</text>
        <rect x={X(vindu.launchMin)} y={Y(vindu.spinnMax)} width={X(vindu.launchMax) - X(vindu.launchMin)} height={Y(vindu.spinnMin) - Y(vindu.spinnMax)}
          rx="5" fill={`color-mix(in srgb, ${T.up} 10%, transparent)`} stroke={`color-mix(in srgb, ${T.up} 45%, transparent)`} strokeDasharray="4 3" strokeWidth="1" />
        <text x={X(vindu.launchMin) + 6} y={Y(vindu.spinnMax) + 12} style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, fill: T.up }}>Vindu · {csNivaa}</text>
        {skudd.map((s, i) => er(s)
          ? <circle key={i} cx={X(s.launch)} cy={Y(s.spinn)} r="3.4" fill={T.up} />
          : <circle key={i} cx={X(s.launch)} cy={Y(s.spinn)} r="3" fill="none" stroke={T.mut} strokeWidth="1.4" />)}
      </svg>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 8 }}>{inne} av {skudd.length} slag i vinduet ({Math.round((inne / skudd.length) * 100)} %)</div>
      {dom && <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{dom}</p>}
    </Kort>
  );
}

/* ── StrikeSmash — treffpunkt-heat (3×3) + smash per sone ── */
export interface StrikeSone {
  andel: number;
  smash: number | null;
}
const SS_DEMO: StrikeSone[] = [
  { andel: 0.04, smash: 1.42 }, { andel: 0.08, smash: 1.46 }, { andel: 0.03, smash: 1.44 },
  { andel: 0.16, smash: 1.44 }, { andel: 0.38, smash: 1.49 }, { andel: 0.12, smash: 1.47 },
  { andel: 0.11, smash: 1.41 }, { andel: 0.08, smash: 1.45 }, { andel: 0, smash: null },
];
export interface StrikeSmashProps {
  kolle?: string;
  soner?: StrikeSone[];
  idealSmash?: number;
  grunnlag?: string;
  dom?: ReactNode;
}
export function StrikeSmash({ kolle = "Driver", soner = SS_DEMO, idealSmash = 1.5, grunnlag = "86 slag · TrackMan", dom = "Lav hæl-treff koster 0,06 smash — tee ballen litt høyere." }: StrikeSmashProps) {
  if (soner.length !== 9) return <Kort eyebrow="Treff & smash"><TomTilstand icon="target" title="Ingen treffdata ennå" sub="Kjør en TrackMan-økt med treffpunkt-måling, så tegnes bladet her." /></Kort>;
  const maks = Math.max(0.01, ...soner.map((z) => z.andel ?? 0));
  const smashFarge = (z: StrikeSone): string => {
    if (z.smash == null || (z.andel ?? 0) < 0.005) return T.mut;
    const diff = idealSmash - z.smash;
    return diff <= 0.015 ? T.up : diff <= 0.045 ? T.warn : T.down;
  };
  const celle: CSSProperties = { aspectRatio: "2 / 1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <Kort>
      <Caps>Treff &amp; smash</Caps>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 5 }}>{kolle}</div>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 3 }}>{grunnlag || "Datagrunnlag mangler"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
        {[0, 1].map((panel) => (
          <div key={panel}>
            <Caps size={8.5}>{panel === 0 ? "Treffpunkt" : "Smash per sone"}</Caps>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, marginTop: 8, background: panel === 0 ? T.panel2 : "transparent", border: panel === 0 ? `1px solid ${T.border}` : "none", borderRadius: 10, padding: panel === 0 ? 6 : 0 }}>
              {soner.map((z, i) => {
                const tom = (z.andel ?? 0) < 0.005;
                return panel === 0
                  ? <span key={i} style={{ ...celle, background: tom ? "transparent" : `color-mix(in srgb, ${T.fg} ${Math.round(6 + ((z.andel ?? 0) / maks) * 46)}%, transparent)`, border: `1px ${tom ? "dashed" : "solid"} ${T.border}` }} />
                  : <span key={i} style={{ ...celle, ...mono(11.5, smashFarge(z), 600), background: T.panel2, border: `1px solid ${T.border}` }}>{z.smash == null || tom ? "—" : kd(z.smash, 2)}</span>;
              })}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.mut, textAlign: "center", marginTop: 5 }}>Hæl ← → Tå</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
        {dom && <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.55, margin: 0, flex: 1 }}>{dom}</p>}
        <span style={{ ...mono(10, T.mut, 600), flex: "none" }}>Ideal {kd(idealSmash, 2)}</span>
      </div>
    </Kort>
  );
}

/* ── SlagLekkasje — heat per avstandsbånd, trykkbar analytikerkjede ── */
export interface SlagBaand {
  id: string;
  label: string;
  sg?: number;
  slag?: number;
}
const SL_DEMO: SlagBaand[] = [
  { id: "tee", label: "Tee-slag", sg: 0.2, slag: 98 },
  { id: "app150", label: "Innspill 150–100 m", sg: -0.8, slag: 62 },
  { id: "app100", label: "Innspill 100–50 m", sg: -0.3, slag: 44 },
  { id: "arg", label: "Nærspill", sg: 0.1, slag: 51 },
  { id: "putt6", label: "Putting 0–6 ft", sg: -0.6, slag: 88 },
];
export interface SlagLekkasjeProps {
  baand?: SlagBaand[];
  baseline?: string;
  grunnlag?: string;
  tittel?: ReactNode;
  valgtId?: string | null;
  onVelgBaand?: ((b: SlagBaand) => void) | null;
}
export function SlagLekkasje({ baand = SL_DEMO, baseline = "Broadie scratch", grunnlag = "14 runder", tittel = "Hvor slagene forsvinner", valgtId = null, onVelgBaand = null }: SlagLekkasjeProps) {
  const maks = Math.max(0.4, ...baand.map((b) => Math.abs(b.sg ?? 0)));
  const sum = baand.reduce((a, b) => a + (b.sg ?? 0), 0);
  return (
    <Kort>
      <Caps>Slaglekkasje</Caps>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 5 }}>{tittel}</div>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, margin: "3px 0 12px" }}>SG per runde · mot {baseline}{grunnlag ? ` · ${grunnlag}` : ""}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {baand.map((b) => {
          const sg = b.sg ?? 0, t = Math.min(1, Math.abs(sg) / maks), noytral = Math.abs(sg) < 0.05;
          const heat = noytral ? T.panel2 : sg < 0 ? `color-mix(in srgb, ${T.down} ${Math.round(8 + t * 24)}%, ${T.panel2})` : `color-mix(in srgb, ${T.up} ${Math.round(6 + t * 15)}%, ${T.panel2})`;
          return (
            <div key={b.id} onClick={onVelgBaand ? () => onVelgBaand(b) : undefined}
              style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, padding: "8px 13px", borderRadius: T.rRow, background: heat, border: `1px solid ${valgtId === b.id ? T.borderS : "transparent"}`, cursor: onVelgBaand ? "pointer" : "default" }}>
              <span style={{ flex: 1 }}>
                <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, display: "block" }}>{b.label}</span>
                {b.slag != null && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{b.slag} slag</span>}
              </span>
              <span style={{ ...mono(13.5, noytral ? T.mut : sg < 0 ? T.down : T.up) }}>{fmtSg(sg)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{ ...mono(10, sum < 0 ? T.down : T.up, 600) }}>Sum {fmtSg(sum)} slag/runde</span>
        {onVelgBaand && <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>Trykk et bånd for analyse</span>}
      </div>
    </Kort>
  );
}

/* ── Diagnose — symptom → bevis → resept (analytikerkjeden) ── */
export interface DiagnoseBevisDel {
  label: string;
  verdi: number | string;
}
export interface DiagnoseBevis {
  enhet?: string;
  spiller: DiagnoseBevisDel;
  baseline: DiagnoseBevisDel;
}
export interface DiagnoseResept {
  akse?: AkseKey;
  kode?: string;
  tekst?: string;
}
const DG_BEVIS: DiagnoseBevis = { enhet: "%", spiller: { label: "Deg", verdi: 52 }, baseline: { label: "Kat. A-snitt", verdi: 68 } };
const DG_RESEPT: DiagnoseResept = { akse: "SLAG", kode: "CS90", tekst: "Kravtrening på innspill 100–150 m — tre økter per uke." };
export interface DiagnoseProps {
  symptom?: ReactNode;
  bevis?: DiagnoseBevis | null;
  grunnlag?: string;
  resept?: DiagnoseResept | null;
  ctaTekst?: ReactNode;
}
export function Diagnose({ symptom = "Mister 0,8 slag på innspill 100–150 m", bevis = DG_BEVIS, grunnlag = "14 runder · 62 innspill", resept = DG_RESEPT, ctaTekst = "Planlegg dette" }: DiagnoseProps) {
  const maks = Math.max(Number(bevis?.spiller?.verdi) || 0, Number(bevis?.baseline?.verdi) || 0) * 1.08 || 1;
  const steg = (lbl: ReactNode, siste: boolean, body: ReactNode) => (
    <div style={{ display: "flex", gap: 12 }}>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.borderS, marginTop: 4, flex: "none" }} />
        {!siste && <span style={{ width: 1, flex: 1, background: T.border }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: siste ? 0 : 16 }}>
        <Caps size={8.5}>{lbl}</Caps>
        <div style={{ marginTop: 6 }}>{body}</div>
      </div>
    </div>
  );
  return (
    <Kort eyebrow="Diagnose">
      {steg("Symptom", false, <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16.5, color: T.fg, lineHeight: 1.25 }}>{symptom}</div>)}
      {steg("Bevis", false, (
        <div>
          {bevis && [{ d: bevis.spiller, fyll: `color-mix(in srgb, ${T.down} 62%, transparent)` }, { d: bevis.baseline, fyll: T.borderS }].map(({ d, fyll }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "3px 0" }}>
              <span style={{ width: 84, flex: "none", fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>{d.label}</span>
              <span style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
                <span style={{ display: "block", width: `${Math.min(100, (Number(d.verdi) / maks) * 100)}%`, height: "100%", borderRadius: 9999, background: fyll }} />
              </span>
              <span style={{ width: 48, flex: "none", textAlign: "right", ...mono(11.5, T.fg, 600) }}>{String(d.verdi).replace(".", ",")}{bevis.enhet ? ` ${bevis.enhet}` : ""}</span>
            </div>
          ))}
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, display: "block", marginTop: 6 }}>{grunnlag || "Datagrunnlag mangler — diagnosen er usikker"}</span>
        </div>
      ))}
      {steg("Resept", true, (
        <div>
          {resept?.tekst && <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "0 0 10px" }}>{resept.tekst}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CTAPill icon="calendar-plus">{ctaTekst}</CTAPill>
            {resept?.akse && <AkseChip a={resept.akse} />}
            {resept?.kode && <span style={{ ...mono(9.5, T.mut, 600) }}>{resept.kode}</span>}
          </div>
        </div>
      ))}
    </Kort>
  );
}

/* ── NesteFokus — dommen, ikke grafen ─────────────────────── */
export interface NesteFokusProps {
  omrade?: ReactNode;
  akse?: string;
  sgTap?: string | null;
  baseline?: string;
  begrunnelse?: ReactNode;
  handlingTekst?: ReactNode;
  formelAkse?: string | null;
}
export function NesteFokus({ omrade = "Putting innenfor 6 ft er største lekkasje", akse = "PUTT", sgTap = "−1,2", baseline = "Broadie scratch", begrunnelse = "Innslagsprosenten på 3–6 ft ligger 7 pp under nivåkravet — det koster deg mest per runde.", handlingTekst = "Legg inn treningsøkt", formelAkse = null }: NesteFokusProps) {
  const AKSE: Record<string, string> = { OTT: "Tee-slag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" };
  return (
    <Kort tint>
      <Caps>Neste fokus</Caps>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, lineHeight: 1.22, margin: "10px 0 0" }}>{omrade}</div>
      {sgTap != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
          <DeltaChip v={`${sgTap} slag`} dir={/^[−-]/.test(sgTap) ? "down" : "up"} />
          <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>{AKSE[akse] || akse} · mot {baseline}</span>
        </div>
      )}
      {begrunnelse && <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "10px 0 0" }}>{begrunnelse}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <CTAPill icon="plus">{handlingTekst}</CTAPill>
        {formelAkse && <span style={{ ...mono(9.5, T.mut, 600) }}>Tren {formelAkse}</span>}
      </div>
    </Kort>
  );
}

/* ── KategoriKrav — A–K-nivå: bestått/gjenstår per protokoll ── */
export interface KategoriKravRad {
  navn: string;
  bestatt: boolean;
  verdi?: string | null;
  mal?: string | null;
}
const KK_DEMO: KategoriKravRad[] = [
  { navn: "Snittscore ≤ 74", bestatt: true, verdi: "72,8", mal: "74" },
  { navn: "SG Total ≥ +0,5", bestatt: true, verdi: "+1,2", mal: "+0,5" },
  { navn: "Innslag 3–6 ft ≥ 88 %", bestatt: false, verdi: "84 %", mal: "88 %" },
  { navn: "Driver-carry ≥ 245 m", bestatt: true, verdi: "248 m", mal: "245 m" },
  { navn: "FYS-protokoll nivå A", bestatt: false, verdi: "B", mal: "A" },
];
export interface KategoriKravProps {
  nivaa?: string;
  nesteNivaa?: string;
  krav?: KategoriKravRad[];
  nesteKrav?: ReactNode;
}
export function KategoriKrav({ nivaa = "B", nesteNivaa = "A", krav = KK_DEMO, nesteKrav = "Løft innslag 3–6 ft fra 84 % til 88 % — fire pp igjen." }: KategoriKravProps) {
  const bestatt = krav.filter((k) => k.bestatt).length;
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: 13, background: T.panel3, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono(20), flex: "none" }}>{nivaa || "—"}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Kategori {nivaa}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 3 }}>{bestatt} av {krav.length} krav bestått{nesteNivaa ? ` · neste: ${nesteNivaa}` : ""}</div>
        </div>
      </div>
      {krav.map((k, i) => (
        <div key={k.navn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i === krav.length - 1 ? "none" : `1px solid ${T.border}` }}>
          <Icon name={k.bestatt ? "check" : "circle"} size={14} style={{ color: k.bestatt ? T.up : T.mut, flex: "none" }} />
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: k.bestatt ? T.fg : T.fg2 }}>{k.navn}</span>
          {k.verdi != null && <span style={{ ...mono(11, T.fg2, 600) }}>{k.verdi}{k.mal ? <span style={{ color: T.mut }}> / {k.mal}</span> : null}</span>}
        </div>
      ))}
      {nesteKrav && <InnsiktChip>{nesteKrav}</InnsiktChip>}
    </Kort>
  );
}

/* ── SpillerTilstand — coach-cockpitens 5-sekunderssvar ───── */
export type SpillerTilstandTone = "god" | "stabil" | "varsel" | "risiko";
const ST_TONE: Record<string, { c: string; t: string }> = { god: { c: T.up, t: "God form" }, stabil: { c: T.mut, t: "Stabil" }, varsel: { c: T.warn, t: "Følg opp" }, risiko: { c: T.down, t: "Risiko" } };
export interface SpillerTilstandProps {
  navn?: string;
  tilstand?: SpillerTilstandTone | string;
  formTekst?: ReactNode | null;
  sgTrend?: string | null;
  sisteAktivitet?: string | null;
  flagg?: ReactNode;
  onClick?: (() => void) | null;
}
export function SpillerTilstand({ navn = "Øyvind Rohjan", tilstand = "varsel", formTekst = null, sgTrend = "−0,3", sisteAktivitet = "2 t siden", flagg = "ACWR 1,46", onClick = null }: SpillerTilstandProps) {
  const tone = ST_TONE[tilstand] || ST_TONE.stabil;
  return (
    <Kort pad="13px 16px" style={{ flexDirection: "row", alignItems: "center", gap: 12, cursor: onClick ? "pointer" : "default" }}>
      <AvatarInit navn={navn} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{navn}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...mono(9, tone.c, 700) }}>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: tone.c }} />{formTekst || tone.t}
          </span>
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>{sisteAktivitet ? `Sist aktiv ${sisteAktivitet}` : "Ingen aktivitet ennå"}</div>
      </div>
      {sgTrend != null && <DeltaChip v={sgTrend} dir={/^[−-]/.test(sgTrend) ? "down" : "up"} />}
      {flagg && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...mono(9.5, T.down, 700), background: `color-mix(in srgb, ${T.down} 12%, transparent)`, borderRadius: 6, padding: "4px 8px", flex: "none" }}>
          <Icon name="alert-triangle" size={11} />{flagg}
        </span>
      )}
    </Kort>
  );
}

/* ── Pyramide — fem akser faktisk vs plan (aksefarger fra T.ax) ── */
export interface PyramideData {
  akse: string;
  value: number;
  plan?: number | null;
}
const PY_DEMO: PyramideData[] = [
  { akse: "TURN", value: 40, plan: 45 }, { akse: "SPILL", value: 62, plan: 60 },
  { akse: "SLAG", value: 71, plan: 78 }, { akse: "TEK", value: 84, plan: 80 },
  { akse: "FYS", value: 90, plan: 88 },
];
export interface PyramideProps {
  data?: PyramideData[];
  max?: number;
  showValues?: boolean;
}
export function Pyramide({ data = PY_DEMO, max = 100, showValues = true }: PyramideProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {data.map((d) => {
        const pct = Math.max(0, Math.min(100, (d.value / max) * 100));
        const planPct = d.plan != null ? Math.max(0, Math.min(100, (d.plan / max) * 100)) : null;
        return (
          <div key={d.akse} style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ width: 72, flex: "none", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2 }}>{AKSE_NAVN[d.akse as AkseKey] || d.akse}</span>
            <div style={{ flex: 1, position: "relative", height: 9, borderRadius: 9999, background: T.track }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 9999, background: T.ax[d.akse as AkseKey] || T.mut, opacity: 0.85 }} />
              {planPct != null && <span title={`Plan ${d.plan}`} style={{ position: "absolute", top: -3, left: `calc(${planPct}% - 1px)`, width: 2, height: 15, background: T.fg, borderRadius: 1 }} />}
            </div>
            {showValues && (
              <span style={{ width: 58, flex: "none", textAlign: "right", ...mono(11, T.fg2, 600) }}>
                {d.value}{d.plan != null && <span style={{ color: T.mut }}>/{d.plan}</span>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── PercentilBar — plassering i stallen, benchmark-tick ─── */
export interface PercentilBarProps {
  percentile?: number;
  benchmark?: number | null;
  label?: ReactNode;
  valueLabel?: ReactNode;
}
export function PercentilBar({ percentile = 78, benchmark = 54, label = "SG Total i stallen", valueLabel = "78." }: PercentilBarProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <Caps size={9}>{label}</Caps>
        {valueLabel != null && <span style={{ ...mono(13) }}>{valueLabel}</span>}
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 9999, background: T.track }}>
        {[25, 50, 75].map((q) => <span key={q} style={{ position: "absolute", left: `${q}%`, top: 1, width: 1, height: 6, background: T.borderS }} />)}
        {benchmark != null && <span title={`Snitt: ${benchmark}.`} style={{ position: "absolute", left: `${benchmark}%`, top: -3, width: 2, height: 14, background: T.fg2, borderRadius: 1, transform: "translateX(-1px)" }} />}
        <span style={{ position: "absolute", left: `${percentile}%`, top: -4, width: 16, height: 16, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel}`, transform: "translateX(-8px)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        {["0", "50", "100"].map((s) => <span key={s} style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{s}</span>)}
      </div>
      {benchmark != null && <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, display: "block", marginTop: 6 }}>Stall-snitt {benchmark}. · {percentile - benchmark >= 0 ? "+" : "−"}{Math.abs(percentile - benchmark)} vs. snitt</span>}
    </div>
  );
}
