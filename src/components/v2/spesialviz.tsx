"use client";
import { TL } from "@/lib/v2/train-lock";

/* AK Golf HQ v2 — SPESIALVISUALISERINGER (retning C «Presis»).
   Sammenligning, runde, køller/TrackMan, belastning, kategori-progresjon,
   treningstid og marketing. Ren SVG (viewBox, ingen eksterne libs), tegnet
   enkelt og presist. Komponeres av kjernebiblioteket (./core).
   Regler: mono-tall m/ komma-desimal, «—» for manglende data, opp/ned =
   TL.ok/TL.danger (ALDRI lime), aksefarger fra T.ax, lime kun aksent/hero.
   Demo-data som default-props → alt rendres rett i galleriet.
   Port av ui_kits/v2/v2-spesialviz.jsx → produksjons-TSX (diff-null). */

import type { CSSProperties, ReactNode } from "react";
import { T, fmtSg, Kort, TomTilstand, Caps, DeltaChip, StatusPill, CTAPill } from "./core";
import type { AkseKey } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

/* ── Delte hjelpere ───────────────────────────────────── */
const kd = (v: number | null | undefined, d = 1): string =>
  v == null || Number.isNaN(Number(v)) ? "—" : Number(v).toFixed(d).replace(".", ",");
const mono = (size: number, color: string = TL.text, weight = 700): CSSProperties => ({
  fontFamily: TL.font.mono, fontSize: size, fontWeight: weight, color, fontVariantNumeric: "tabular-nums",
});
const eyebrowRow = (lbl: ReactNode, right?: ReactNode): ReactNode => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
    <Caps>{lbl}</Caps>
    {right && <span style={{ fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>{right}</span>}
  </div>
);
const svgTekst = (size = 9, fill: string = TL.mute, weight = 400): CSSProperties => ({
  fontFamily: TL.font.mono, fontSize: size, fontWeight: weight, fill,
});

/* ── CompareChart — to serier mot hverandre m/ legend ─── */
export interface CompareSerie {
  navn: string;
  farge: string;
  verdier: number[];
}
const CC_DEMO: CompareSerie[] = [
  { navn: "Deg", farge: TL.fill, verdier: [-1.2, -0.8, -1.0, -0.3, 0.1, -0.2, 0.5, 0.4, 0.9, 1.2] },
  { navn: "Kat. A-snitt", farge: TL.mute, verdier: [0.4, 0.5, 0.4, 0.6, 0.5, 0.5, 0.6, 0.5, 0.6, 0.6] },
];
export interface CompareChartProps {
  serier?: CompareSerie[];
  tittel?: string;
  enhet?: string;
  height?: number;
  fmt?: (v: number) => string;
  baseline?: number;
}
export function CompareChart({ serier = CC_DEMO, tittel = "SG Total — deg mot kategori A", enhet = "SG per runde", height = 150, fmt = fmtSg, baseline = 0 }: CompareChartProps) {
  const alle = serier.flatMap((s) => s.verdier);
  if (!alle.length) return <Kort eyebrow={tittel}><TomTilstand icon="trending-up" title="Ingen data ennå" sub="Serien tegnes når det finnes runder å sammenligne." /></Kort>;
  const W = 560, H = height, pl = 26, pr = 10, py = 14;
  const n = Math.max(...serier.map((s) => s.verdier.length));
  const lo = Math.min(baseline, ...alle), hi = Math.max(baseline, ...alle);
  const pad = (hi - lo) * 0.12 || 0.5;
  const x = (i: number) => pl + (i / (n - 1)) * (W - pl - pr);
  const y = (v: number) => py + (1 - (v - (lo - pad)) / ((hi + pad) - (lo - pad))) * (H - py * 2);
  return (
    <Kort>
      {eyebrowRow(tittel, enhet)}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={tittel}>
        <line x1={pl} y1={y(baseline)} x2={W - pr} y2={y(baseline)} stroke={TL.hair} strokeWidth="1" strokeDasharray="3 3" />
        <text x={4} y={y(baseline) + 3} style={svgTekst()}>{baseline}</text>
        {serier.map((s, si) => {
          const d = s.verdier.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
          const siste = s.verdier[s.verdier.length - 1];
          return (
            <g key={si}>
              <path d={d} fill="none" stroke={s.farge} strokeWidth={si === 0 ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={si === 0 ? "none" : "5 4"} opacity={si === 0 ? 1 : 0.7} />
              <circle cx={x(s.verdier.length - 1)} cy={y(siste)} r={si === 0 ? 4 : 3} fill={s.farge} stroke={TL.elev} strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        {serier.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>
            <span style={{ width: 14, height: 2.5, borderRadius: 2, background: s.farge, opacity: i === 0 ? 1 : 0.7 }} />
            {s.navn}
            <span style={{ ...mono(11, TL.text, 600) }}>{fmt(s.verdier[s.verdier.length - 1])}</span>
          </span>
        ))}
      </div>
    </Kort>
  );
}

/* ── HullStripe — 18 hull som fargede ruter ───────────── */
export interface HullData {
  nr: number;
  par: number;
  score: number;
}
const HS_DEMO: HullData[] = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4].map((par, i) => ({
  nr: i + 1, par, score: par + [0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, -1, 2, 0, 1, 0, 0][i],
}));
export interface HullStripeProps {
  hull?: HullData[];
  visLegende?: boolean;
}
export function HullStripe({ hull = HS_DEMO, visLegende = true }: HullStripeProps) {
  if (!hull.length) return <TomTilstand icon="flag" title="Ingen runde ennå" sub="Stripen tegnes når hullscorene er logget." />;
  const farge = (d: number): string | null => (d < 0 ? TL.ok : d === 0 ? null : d === 1 ? TL.warn : TL.danger);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${hull.length}, 1fr)`, gap: 3 }}>
        {hull.map((h) => {
          const d = h.score - h.par, c = farge(d);
          return (
            <div key={h.nr} title={`Hull ${h.nr} · par ${h.par} · ${h.score}`} style={{ aspectRatio: "1 / 1", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", background: c ? `color-mix(in srgb, ${c} ${d >= 2 || d <= -2 ? 34 : 22}%, ${TL.dock})` : TL.dock, border: `1px solid ${c ? `color-mix(in srgb, ${c} 45%, transparent)` : TL.hair}` }}>
              <span style={{ ...mono(10.5, c || TL.mute, 700) }}>{h.score}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ ...mono(8.5, TL.mute) }}>1</span><span style={{ ...mono(8.5, TL.mute) }}>9</span><span style={{ ...mono(8.5, TL.mute) }}>18</span>
      </div>
      {visLegende && (
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {[{ c: TL.ok, l: "Birdie+" }, { c: null as string | null, l: "Par" }, { c: TL.warn, l: "Bogey" }, { c: TL.danger, l: "Dobbel+" }].map((x, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: x.c ? `color-mix(in srgb, ${x.c} 30%, ${TL.dock})` : TL.dock, border: `1px solid ${x.c ? `color-mix(in srgb, ${x.c} 50%, transparent)` : TL.hair}` }} />{x.l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── LengdeAvvik — avstandsavvik per kølle ± ──────────── */
export interface KolleAvvik {
  navn: string;
  avvik: number | null;
}
const LA_DEMO: KolleAvvik[] = [
  { navn: "Driver", avvik: 4 }, { navn: "3-tre", avvik: -6 }, { navn: "5-jern", avvik: -2 },
  { navn: "7-jern", avvik: 1 }, { navn: "9-jern", avvik: -3 }, { navn: "PW", avvik: 8 },
];
export interface LengdeAvvikProps {
  koller?: KolleAvvik[];
  enhet?: string;
  grense?: number;
}
export function LengdeAvvik({ koller = LA_DEMO, enhet = "m", grense = 3 /* |avvik| innenfor = i rute */ }: LengdeAvvikProps) {
  const max = Math.max(grense * 2, ...koller.map((k) => Math.abs(k.avvik ?? 0))) * 1.1;
  const farge = (a: number | null): string => (a == null ? TL.mute : Math.abs(a) <= grense ? TL.ok : Math.abs(a) <= grense * 2 ? TL.warn : TL.danger);
  return (
    <Kort>
      {eyebrowRow("Lengdeavvik per kølle", `mot forventet carry · ± ${enhet}`)}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 4px 63px" }}>
        <span style={{ ...mono(8.5, TL.mute) }}>kort</span><span style={{ ...mono(8.5, TL.mute) }}>langt</span>
      </div>
      {koller.map((k, i) => {
        const a = k.avvik ?? 0, w = (Math.abs(a) / max) * 50, c = farge(k.avvik);
        return (
          <div key={k.navn} style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 0", borderBottom: i === koller.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
            <span style={{ width: 52, flex: "none", ...mono(10, TL.mute) }}>{k.navn}</span>
            <span style={{ flex: 1, position: "relative", height: 8, borderRadius: 9999, background: TL.hair }}>
              <span style={{ position: "absolute", left: "50%", top: -2, width: 1, height: 12, background: TL.hair }} />
              {k.avvik != null && <span style={{ position: "absolute", top: 0, height: "100%", borderRadius: 9999, width: `${Math.max(1.5, w)}%`, background: c, opacity: 0.85, ...(a >= 0 ? { left: "50%" } : { right: "50%" }) }} />}
            </span>
            <span style={{ width: 52, flex: "none", textAlign: "right", ...mono(11.5, c, 600) }}>
              {k.avvik == null ? "—" : `${a > 0 ? "+" : a < 0 ? "−" : ""}${kd(Math.abs(a), 0)} ${enhet}`}
            </span>
          </div>
        );
      })}
    </Kort>
  );
}

/* ── LoadChart — ACWR-belastning m/ soner 1,3 / 1,5 ───── */
export interface UkeLoad {
  uke: string;
  acwr: number;
}
const LC_DEMO: UkeLoad[] = [
  { uke: "21", acwr: 0.85 }, { uke: "22", acwr: 0.95 }, { uke: "23", acwr: 1.1 }, { uke: "24", acwr: 1.05 },
  { uke: "25", acwr: 1.2 }, { uke: "26", acwr: 1.38 }, { uke: "27", acwr: 1.32 }, { uke: "28", acwr: 1.46 },
];
export interface LoadChartProps {
  uker?: UkeLoad[];
  varselGrense?: number;
  risikoGrense?: number;
  height?: number;
}
export function LoadChart({ uker = LC_DEMO, varselGrense = 1.3, risikoGrense = 1.5, height = 160 }: LoadChartProps) {
  if (uker.length < 2) return <Kort eyebrow="Belastning · ACWR"><TomTilstand icon="activity" title="For lite treningsdata" sub="ACWR beregnes når minst to uker er logget." /></Kort>;
  const W = 560, H = height, pl = 30, pr = 10, py = 12;
  const vals = uker.map((u) => u.acwr);
  const lo = Math.min(0.6, ...vals), hi = Math.max(1.7, ...vals);
  const x = (i: number) => pl + (i / (uker.length - 1)) * (W - pl - pr);
  const y = (v: number) => py + (1 - (v - lo) / (hi - lo)) * (H - py * 2 - 14);
  const siste = vals[vals.length - 1];
  const sisteFarge = siste >= risikoGrense ? TL.danger : siste >= varselGrense ? TL.warn : TL.ok;
  const d = uker.map((u, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(u.acwr).toFixed(1)}`).join(" ");
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <Caps>Belastning · ACWR</Caps>
        <span style={{ ...mono(15, sisteFarge) }}>{kd(siste, 2)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`ACWR siste ${uker.length} uker, nå ${kd(siste, 2)}`}>
        <rect x={pl} y={py} width={W - pl - pr} height={Math.max(0, y(risikoGrense) - py)} fill={`color-mix(in srgb, ${TL.danger} 7%, transparent)`} />
        <rect x={pl} y={y(risikoGrense)} width={W - pl - pr} height={Math.max(0, y(varselGrense) - y(risikoGrense))} fill={`color-mix(in srgb, ${TL.warn} 7%, transparent)`} />
        <line x1={pl} y1={y(varselGrense)} x2={W - pr} y2={y(varselGrense)} stroke={TL.warn} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <text x={W - pr} y={y(varselGrense) - 4} textAnchor="end" style={svgTekst(8.5, TL.warn, 700)}>1,3</text>
        <line x1={pl} y1={y(risikoGrense)} x2={W - pr} y2={y(risikoGrense)} stroke={TL.danger} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <text x={W - pr} y={y(risikoGrense) - 4} textAnchor="end" style={svgTekst(8.5, TL.danger, 700)}>1,5</text>
        <text x={4} y={y(1) + 3} style={svgTekst()}>1,0</text>
        <line x1={pl} y1={y(1)} x2={W - pr} y2={y(1)} stroke={TL.hair} strokeWidth="1" />
        <path d={d} fill="none" stroke={TL.mute} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {uker.map((u, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(u.acwr)} r={i === uker.length - 1 ? 4 : 2.4} fill={i === uker.length - 1 ? sisteFarge : TL.mute} stroke={TL.elev} strokeWidth="1.5" />
            <text x={x(i)} y={H - 2} textAnchor="middle" style={svgTekst(8)}>{u.uke}</text>
          </g>
        ))}
      </svg>
      <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, display: "block", marginTop: 8 }}>
        {siste >= risikoGrense ? "Belastningen stiger raskt — anbefaler en roligere uke. Du velger selv." : siste >= varselGrense ? "Belastningen nærmer seg øvre sone — verdt å følge med." : "Belastningen er i trygg sone."}
      </span>
    </Kort>
  );
}

/* ── Radar — 5-akse spindeldiagram (FYS/TEK/SLAG/SPILL/TURN) ── */
export interface RadarPunkt {
  akse: AkseKey;
  verdi: number;
}
const RD_DEMO: RadarPunkt[] = [{ akse: "FYS", verdi: 82 }, { akse: "TEK", verdi: 64 }, { akse: "SLAG", verdi: 71 }, { akse: "SPILL", verdi: 58 }, { akse: "TURN", verdi: 45 }];
export interface RadarProps {
  data?: RadarPunkt[];
  sammenlign?: RadarPunkt[] | null;
  max?: number;
  size?: number;
}
export function Radar({ data = RD_DEMO, sammenlign = null, max = 100, size = 240 }: RadarProps) {
  const cx = size / 2, cy = size / 2 + 4, R = size / 2 - 34;
  const n = data.length;
  const pt = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, r = (Math.max(0, Math.min(max, v)) / max) * R;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poly = (vals: number[]): string => vals.map((v, i) => pt(i, v).map((c) => c.toFixed(1)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, height: "auto", display: "block" }} role="img" aria-label="Profil per akse">
      {[1 / 3, 2 / 3, 1].map((f, ri) => (
        <polygon key={ri} points={poly(data.map(() => max * f))} fill="none" stroke={TL.hair} strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const [ex, ey] = pt(i, max);
        const [lx, ly] = pt(i, max * 1.22);
        return (
          <g key={d.akse}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={TL.hair} strokeWidth="1" />
            <text x={lx} y={ly + 3} textAnchor="middle" style={svgTekst(9, T.ax[d.akse] || TL.mute, 700)}>{d.akse}</text>
          </g>
        );
      })}
      {sammenlign && <polygon points={poly(data.map((d) => (sammenlign.find((s) => s.akse === d.akse)?.verdi) ?? 0))} fill="none" stroke={TL.mute} strokeWidth="1.3" strokeDasharray="4 3" opacity="0.7" />}
      <polygon points={poly(data.map((d) => d.verdi))} fill={`color-mix(in srgb, ${TL.fill} 14%, transparent)`} stroke={TL.fill} strokeWidth="1.8" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [px, py] = pt(i, d.verdi);
        return <circle key={i} cx={px} cy={py} r="3" fill={TL.fill} stroke={TL.elev} strokeWidth="1.5" />;
      })}
    </svg>
  );
}

/* ── RadarProfil — generisk pentagon-radar m/ ord-akser (talent 1–10) ──
   Søster til Radar (som er låst til pyramidens AkseKey/FYS…TURN). Denne tar
   frie tekst-akser + valgfri max, for domener som talent-radaren
   (Fysisk/Teknikk/Taktikk/Mental/Motivasjon). null-verdi tegnes som 0 i
   polygonet (uvurdert), men skal vises «—» i tabellen ved siden av. */
export interface RadarProfilAkse {
  label: string;
  verdi: number | null;
}
export interface RadarProfilProps {
  akser: RadarProfilAkse[];
  /** Sammenlignings-serie (peer-snitt) justert 1:1 mot `akser`. */
  sammenlign?: (number | null)[] | null;
  max?: number;
  size?: number;
}
export function RadarProfil({ akser, sammenlign = null, max = 10, size = 300 }: RadarProfilProps) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 54;
  const n = akser.length;
  const dir = (i: number): [number, number] => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [Math.cos(a), Math.sin(a)];
  };
  const pt = (i: number, v: number): [number, number] => {
    const [dx, dy] = dir(i);
    const r = (Math.max(0, Math.min(max, v)) / max) * R;
    return [cx + dx * r, cy + dy * r];
  };
  const poly = (vals: number[]): string =>
    vals.map((v, i) => pt(i, v).map((c) => c.toFixed(1)).join(",")).join(" ");
  const egen = akser.map((a) => a.verdi ?? 0);
  const peer = sammenlign ? akser.map((_, i) => sammenlign[i] ?? 0) : null;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, height: "auto", display: "block" }} role="img" aria-label="Talentprofil per akse">
      {[1 / 3, 2 / 3, 1].map((f, ri) => (
        <polygon key={ri} points={poly(akser.map(() => max * f))} fill="none" stroke={TL.hair} strokeWidth="1" />
      ))}
      {akser.map((a, i) => {
        const [ex, ey] = pt(i, max);
        const [dx, dy] = dir(i);
        const lx = cx + dx * (R + 20), ly = cy + dy * (R + 20);
        const anchor = Math.abs(dx) < 0.35 ? "middle" : dx > 0 ? "start" : "end";
        return (
          <g key={a.label}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={TL.hair} strokeWidth="1" />
            <text x={lx} y={ly + 3} textAnchor={anchor} style={svgTekst(9, TL.mute, 700)}>{a.label}</text>
          </g>
        );
      })}
      {peer && (
        <polygon points={poly(peer)} fill="none" stroke={TL.mute} strokeWidth="1.3" strokeDasharray="4 3" opacity="0.7" />
      )}
      <polygon points={poly(egen)} fill={`color-mix(in srgb, ${TL.fill} 14%, transparent)`} stroke={TL.fill} strokeWidth="1.8" strokeLinejoin="round" />
      {akser.map((a, i) => {
        if (a.verdi == null) return null;
        const [px, py] = pt(i, a.verdi);
        return <circle key={a.label} cx={px} cy={py} r="3" fill={TL.fill} stroke={TL.elev} strokeWidth="1.5" />;
      })}
    </svg>
  );
}

/* ── StatStrip — horisontal KPI-remse m/ skillelinjer ─── */
export interface StatStripItem {
  l: string;
  v: string | null;
  delta?: string;
  dir?: "up" | "down";
  enhet?: string;
}
const SS_DEMO: StatStripItem[] = [
  { l: "Runder", v: "14" }, { l: "Snittscore", v: "73,4" }, { l: "SG Total", v: "+1,2", delta: "+0,4", dir: "up" },
  { l: "Beste runde", v: "68" }, { l: "Timer trent", v: "38,5", enhet: "t" },
];
export interface StatStripProps {
  items?: StatStripItem[];
}
export function StatStrip({ items = SS_DEMO }: StatStripProps) {
  return (
    <div style={{ display: "flex", background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, overflowX: "auto" }}>
      {items.map((x, i) => (
        <div key={i} style={{ flex: 1, minWidth: 92, padding: "14px 18px", borderLeft: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
          <Caps size={8.5}>{x.l}</Caps>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 8 }}>
            <span style={{ ...mono(20), lineHeight: 1 }}>{x.v == null ? "—" : x.v}{x.enhet && <span style={{ fontSize: 10, color: TL.mute, marginLeft: 3 }}>{x.enhet}</span>}</span>
            {x.delta && <DeltaChip v={x.delta} dir={x.dir} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── DispersionPlot — treffspredning m/ ellipse, V/H i meter ── */
export interface Skudd {
  side: number;
  lengde: number;
}
const DP_DEMO: Skudd[] = [
  { side: -6, lengde: 152 }, { side: 3, lengde: 158 }, { side: -2, lengde: 155 }, { side: 8, lengde: 149 },
  { side: -9, lengde: 160 }, { side: 1, lengde: 156 }, { side: 5, lengde: 153 }, { side: -4, lengde: 157 },
  { side: 11, lengde: 147 }, { side: -1, lengde: 159 }, { side: 2, lengde: 154 }, { side: -7, lengde: 151 },
];
export interface DispersionPlotProps {
  kolle?: string;
  skudd?: Skudd[];
  grunnlag?: string;
  maal?: number | null;
}
export function DispersionPlot({ kolle = "7-jern", skudd = DP_DEMO, grunnlag = "12 slag · TrackMan", maal = 155 /* siktemerke, meter */ }: DispersionPlotProps) {
  if (!skudd.length) return <Kort eyebrow="Spredning"><TomTilstand icon="crosshair" title="Ingen treffdata ennå" sub={`Kjør en TrackMan-økt med ${kolle}, så tegnes spredningen her.`} /></Kort>;
  const W = 340, H = 240, m = { l: 36, r: 12, t: 14, b: 26 };
  const sider = skudd.map((s) => s.side), lengder = skudd.map((s) => s.lengde);
  const sMax = Math.max(8, ...sider.map(Math.abs)) * 1.25;
  const lMin = Math.min(...lengder) - 4, lMax = Math.max(...lengder) + 4;
  const X = (v: number) => m.l + ((v + sMax) / (sMax * 2)) * (W - m.l - m.r);
  const Y = (v: number) => H - m.b - ((v - lMin) / (lMax - lMin)) * (H - m.t - m.b);
  const snitt = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a: number[], mu: number) => Math.sqrt(a.reduce((s, v) => s + (v - mu) * (v - mu), 0) / a.length);
  const muS = snitt(sider), muL = snitt(lengder);
  const rx = Math.max(6, sd(sider, muS) * 2 * ((W - m.l - m.r) / (sMax * 2)));
  const ry = Math.max(6, sd(lengder, muL) * 2 * ((H - m.t - m.b) / (lMax - lMin)));
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div>
          <Caps>Spredning</Caps>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text, marginTop: 5 }}>{kolle}</div>
          <div style={{ fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute, marginTop: 3 }}>{grunnlag || "Datagrunnlag mangler"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...mono(17), lineHeight: 1 }}>±{kd(sd(sider, muS), 1)} m</div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute, marginTop: 4 }}>sidespredning (1σ)</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Treffspredning ${kolle} — ${skudd.length} slag`}>
        <line x1={X(0)} y1={m.t} x2={X(0)} y2={H - m.b} stroke={TL.hair} strokeWidth="1" strokeDasharray="3 3" />
        {maal != null && (
          <g>
            <line x1={m.l} y1={Y(maal)} x2={W - m.r} y2={Y(maal)} stroke={TL.hair} strokeWidth="1" />
            <text x={4} y={Y(maal) + 3} style={svgTekst(8.5)}>{maal} m</text>
          </g>
        )}
        <ellipse cx={X(muS)} cy={Y(muL)} rx={rx} ry={ry} fill={`color-mix(in srgb, ${TL.fill} 8%, transparent)`} stroke={TL.fill} strokeWidth="1.3" strokeDasharray="5 4" />
        {skudd.map((s, i) => <circle key={i} cx={X(s.side)} cy={Y(s.lengde)} r="3" fill={TL.mute} stroke={TL.elev} strokeWidth="1" />)}
        <circle cx={X(muS)} cy={Y(muL)} r="3.6" fill={TL.fill} stroke={TL.elev} strokeWidth="1.5" />
        <text x={m.l} y={H - 8} style={svgTekst(8.5)}>V ← {Math.round(sMax)} m</text>
        <text x={W - m.r} y={H - 8} textAnchor="end" style={svgTekst(8.5)}>{Math.round(sMax)} m → H</text>
      </svg>
      <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, display: "block", marginTop: 8 }}>
        Snitt {kd(muL, 0)} m · {muS === 0 ? "midt i" : `${kd(Math.abs(muS), 1)} m ${muS > 0 ? "høyre" : "venstre"} for`} siktelinjen. Ellipsen dekker ~95 % av slagene.
      </span>
    </Kort>
  );
}

/* ── TrajectoryPlot — ballbaner i sidevisning ─────────── */
export interface Bane {
  carry: number;
  apex: number;
  beste?: boolean;
}
const TP_DEMO: Bane[] = [
  { carry: 148, apex: 24 }, { carry: 155, apex: 28 }, { carry: 152, apex: 26 },
  { carry: 158, apex: 30, beste: true }, { carry: 144, apex: 21 },
];
export interface TrajectoryPlotProps {
  kolle?: string;
  baner?: Bane[];
  grunnlag?: string;
}
export function TrajectoryPlot({ kolle = "7-jern", baner = TP_DEMO, grunnlag = "5 siste slag" }: TrajectoryPlotProps) {
  if (!baner.length) return <Kort eyebrow="Ballbane"><TomTilstand icon="activity" title="Ingen baner ennå" sub={`Kjør en TrackMan-økt med ${kolle}, så tegnes banene her.`} /></Kort>;
  const W = 560, H = 170, m = { l: 30, r: 14, t: 12, b: 24 };
  const bakke = H - m.b;
  const cMax = Math.max(...baner.map((b) => b.carry)) * 1.06;
  const aMax = Math.max(...baner.map((b) => b.apex)) * 1.2;
  const X = (v: number) => m.l + (v / cMax) * (W - m.l - m.r);
  const Yh = (v: number) => (v / aMax) * (bakke - m.t); /* høyde → piksler over bakken */
  return (
    <Kort>
      {eyebrowRow(`Ballbane · ${kolle}`, grunnlag)}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Ballbaner ${kolle} — ${baner.length} slag`}>
        <line x1={m.l} y1={bakke} x2={W - m.r} y2={bakke} stroke={TL.hair} strokeWidth="1" />
        {[50, 100, 150].filter((d) => d < cMax).map((d) => (
          <g key={d}>
            <line x1={X(d)} y1={bakke} x2={X(d)} y2={bakke + 4} stroke={TL.hair} strokeWidth="1" />
            <text x={X(d)} y={H - 6} textAnchor="middle" style={svgTekst(8.5)}>{d} m</text>
          </g>
        ))}
        {baner.map((b, i) => {
          const c = b.beste ? TL.fill : TL.mute;
          /* kvadratisk Bezier: kontrollpunkt-høyde = 2 × apex gir toppunkt = apex */
          const d = `M${X(0)},${bakke} Q${X(b.carry / 2)},${(bakke - Yh(b.apex * 2)).toFixed(1)} ${X(b.carry).toFixed(1)},${bakke}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={c} strokeWidth={b.beste ? 2 : 1.3} opacity={b.beste ? 1 : 0.55} />
              <circle cx={X(b.carry)} cy={bakke} r={b.beste ? 3.6 : 2.4} fill={c} stroke={TL.elev} strokeWidth="1.2" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>
          <span style={{ width: 14, height: 2.5, borderRadius: 2, background: TL.fill }} />Beste slag · {kd(Math.max(...baner.map((b) => b.carry)), 0)} m carry
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>
          <span style={{ width: 14, height: 2.5, borderRadius: 2, background: TL.mute, opacity: 0.55 }} />Øvrige slag
        </span>
      </div>
    </Kort>
  );
}

/* ── KolleStatKort — én kølle: snitt + spredning kompakt ── */
export interface KolleStatKortProps {
  kolle?: string;
  snitt?: number | null;
  enhet?: string;
  spredning?: number | null;
  side?: string | null;
  slag?: number | null;
  onClick?: () => void;
}
export function KolleStatKort({
  kolle = "7-jern", snitt = 156, enhet = "m", spredning = 8, side = "2 m høyre", slag = 24, onClick,
}: KolleStatKortProps) {
  return (
    <Kort pad="14px 16px" style={{ cursor: onClick ? "pointer" : "default" }}>
      <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: TL.dim, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono(11), flex: "none" }}>{kolle.length > 4 ? kolle.slice(0, 3) : kolle}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{kolle}</div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 2 }}>{slag != null ? `${slag} slag` : "Datagrunnlag mangler"}{side ? ` · snitt ${side}` : ""}</div>
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <span style={{ ...mono(21), lineHeight: 1 }}>{snitt == null ? "—" : kd(snitt, 0)}<span style={{ fontSize: 10, color: TL.mute, marginLeft: 3 }}>{enhet}</span></span>
          <span style={{ ...mono(10.5, TL.mute, 600), display: "block", marginTop: 4 }}>± {spredning == null ? "—" : kd(spredning, 0)} {enhet}</span>
        </div>
      </div>
    </Kort>
  );
}

/* ── TrackmanSammendrag — økt: slag, snitt-KPIer, beste ── */
export interface TrackmanKpi {
  l: string;
  v: string | null;
  enhet?: string;
}
const TS_KPI: TrackmanKpi[] = [
  { l: "Ballhastighet", v: "68,4", enhet: "m/s" }, { l: "Smash", v: "1,48" },
  { l: "Carry snitt", v: "231", enhet: "m" }, { l: "Spinn", v: "2 540", enhet: "rpm" },
];
export interface TrackmanSammendragProps {
  tittel?: string;
  dato?: string;
  slag?: number | null;
  kpier?: TrackmanKpi[];
  beste?: string | null;
}
export function TrackmanSammendrag({
  tittel = "sammendrag · trackman-økt",
  kpier = TS_KPI, beste = "Beste slag: 248 m carry · 1,51 smash (driver)",
}: TrackmanSammendragProps) {
  /* Fasit (playerhq-trackman-detalj.html): eyebrow «sammendrag · trackman-økt»
     + fire sentrerte KPI-fliser + beste slag som ren mutet prosa-linje. Slag-
     antallet lever i intro-linja over kortet — aldri som stort tall her. */
  return (
    <Kort>
      <Caps>{tittel}</Caps>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(4, kpier.length)}, 1fr)`, gap: 8, marginTop: 12 }}>
        {kpier.map((x, i) => (
          <div key={i} style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "9px 11px", textAlign: "center" }}>
            <Caps size={8}>{x.l}</Caps>
            <span style={{ ...mono(14), display: "block", marginTop: 5 }}>{x.v == null ? "—" : x.v}{x.enhet && x.v != null && <span style={{ fontSize: 8.5, color: TL.mute, marginLeft: 3 }}>{x.enhet}</span>}</span>
          </div>
        ))}
      </div>
      {beste && (
        <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "12px 0 0" }}>{beste}</p>
      )}
    </Kort>
  );
}

/* ── KategoriFjell — A–K-kategorifjell m/ nå-posisjon ─── */
const KF_KATS = ["K", "J", "I", "H", "G", "F", "E", "D", "C", "B", "A"]; /* venstre lavest → høyre høyest */
export interface KategoriFjellProps {
  kategorier?: string[];
  naa?: string;
  neste?: string | null;
  tekst?: string | null;
}
export function KategoriFjell({ kategorier = KF_KATS, naa = "D", neste = "C", tekst = "Du er i kategori D — 3 av 5 krav mot C er nådd." }: KategoriFjellProps) {
  const W = 560, H = 150, m = { l: 14, r: 14, t: 18, b: 26 };
  const n = kategorier.length;
  const X = (i: number) => m.l + (i / (n - 1)) * (W - m.l - m.r);
  const Y = (i: number) => H - m.b - (i / (n - 1)) * (H - m.t - m.b);
  const naaIdx = kategorier.indexOf(naa);
  const linje = kategorier.map((_, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(i).toFixed(1)}`).join(" ");
  const flate = `${linje} L${X(n - 1).toFixed(1)},${H - m.b} L${X(0).toFixed(1)},${H - m.b} Z`;
  return (
    <Kort>
      {eyebrowRow("Kategorifjellet", neste ? `neste: ${neste}` : null)}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Kategoristigen K til A — nå i ${naa}`}>
        <path d={flate} fill={`color-mix(in srgb, ${TL.fill} 30%, transparent)`} />
        <path d={linje} fill="none" stroke={TL.hair} strokeWidth="1.5" strokeLinejoin="round" />
        {kategorier.map((k, i) => {
          const er = i === naaIdx, naadd = naaIdx !== -1 && i < naaIdx;
          return (
            <g key={k}>
              {!er && <circle cx={X(i)} cy={Y(i)} r="2.6" fill={naadd ? TL.mute : TL.elev} stroke={naadd ? TL.mute : TL.hair} strokeWidth="1.2" />}
              <text x={X(i)} y={H - 8} textAnchor="middle" style={svgTekst(9.5, er ? TL.text : naadd ? TL.mute : TL.mute, er ? 700 : 400)}>{k}</text>
            </g>
          );
        })}
        {naaIdx !== -1 && (
          <g>
            <circle cx={X(naaIdx)} cy={Y(naaIdx)} r="6.5" fill={TL.fill} stroke={TL.elev} strokeWidth="2" />
            <text x={X(naaIdx)} y={Y(naaIdx) - 12} textAnchor="middle" style={svgTekst(8.5, TL.fill, 700)}>NÅ · {naa}</text>
          </g>
        )}
      </svg>
      {tekst && <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, display: "block", marginTop: 8, lineHeight: 1.55 }}>{tekst}</span>}
    </Kort>
  );
}

/* ── KategoriStige — kategoristige m/ krav per trinn ──── */
export interface KategoriTrinn {
  kat: string;
  krav: string;
}
const KS_DEMO: KategoriTrinn[] = [
  { kat: "A", krav: "Snittscore ≤ 72 · SG ≥ +1,5" },
  { kat: "B", krav: "Snittscore ≤ 74 · SG ≥ +0,5" },
  { kat: "C", krav: "Snittscore ≤ 76 · SG ≥ −0,5" },
  { kat: "D", krav: "Snittscore ≤ 79" },
  { kat: "E", krav: "Snittscore ≤ 82" },
];
export interface KategoriStigeProps {
  trinn?: KategoriTrinn[];
  naa?: string;
}
export function KategoriStige({ trinn = KS_DEMO /* øverst = best */, naa = "C" }: KategoriStigeProps) {
  const naaIdx = trinn.findIndex((t) => t.kat === naa);
  return (
    <Kort eyebrow="Kategoristigen" pad="15px 17px">
      {trinn.map((t, i) => {
        const er = i === naaIdx, naadd = naaIdx !== -1 && i > naaIdx;
        return (
          <div key={t.kat} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i === trinn.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono(13, er ? TL.onFill : naadd ? TL.mute : TL.mute), background: er ? TL.fill : TL.dim, border: `1px solid ${er ? "transparent" : TL.hair}` }}>{t.kat}</span>
            <span style={{ flex: 1, fontFamily: TL.font.sans, fontSize: 12, color: er ? TL.text : naadd ? TL.mute : TL.mute }}>{t.krav}</span>
            {er ? <StatusPill>Nå</StatusPill> : naadd ? <Icon name="check" size={13} style={{ color: TL.ok, flex: "none" }} /> : <span style={{ ...mono(8.5, TL.mute) }}>GJENSTÅR</span>}
          </div>
        );
      })}
    </Kort>
  );
}

/* ── TidsPyramide — treningstid fordelt på akser ──────── */
export interface TidAkse {
  akse: AkseKey;
  timer: number;
}
const TPY_DEMO: TidAkse[] = [
  { akse: "TURN", timer: 1.5 }, { akse: "SPILL", timer: 3 }, { akse: "SLAG", timer: 4.5 },
  { akse: "TEK", timer: 5.5 }, { akse: "FYS", timer: 6.5 },
]; /* øverst = topp av pyramiden */
export interface TidsPyramideProps {
  data?: TidAkse[];
  periode?: string;
}
export function TidsPyramide({ data = TPY_DEMO, periode = "denne uken" }: TidsPyramideProps) {
  const max = Math.max(0.1, ...data.map((d) => d.timer ?? 0));
  const sum = data.reduce((s, d) => s + (d.timer ?? 0), 0);
  return (
    <Kort>
      {eyebrowRow("Treningstid per akse", periode)}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        {data.map((d) => {
          const w = 28 + ((d.timer ?? 0) / max) * 72; /* % — topp aldri null-bredde */
          return (
            <div key={d.akse} style={{ width: `${w}%`, height: 30, borderRadius: 8, background: `color-mix(in srgb, ${T.ax[d.akse] || TL.mute} 26%, ${TL.dock})`, border: `1px solid color-mix(in srgb, ${T.ax[d.akse] || TL.mute} 45%, transparent)`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", minWidth: 150 }}>
              <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", color: TL.text }}>{d.akse}</span>
              <span style={{ ...mono(11.5, TL.mute, 600) }}>{kd(d.timer, 1)} t</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>Totalt <span style={{ ...mono(12, TL.text) }}>{kd(sum, 1)} t</span> {periode}</span>
      </div>
    </Kort>
  );
}

/* ── FeaturedCard — marketing-kort m/ bilde-plassholder + CTA ── */
export interface FeaturedCardProps {
  eyebrow?: string;
  tittel?: string;
  tekst?: string;
  cta?: string;
  ctaIcon?: string;
  badge?: string | null;
  bilde?: string | null;
  onClick?: () => void;
}
export function FeaturedCard({
  eyebrow = "AK Golf Academy", tittel = "Vintertrening med TrackMan",
  tekst = "Hold fremgangen gjennom vinteren — strukturerte økter med full ballflight-data og oppfølging fra coach.",
  cta = "Se program", ctaIcon = "arrow-right", badge = "Få plasser igjen", bilde = null, onClick,
}: FeaturedCardProps) {
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, overflow: "hidden", maxWidth: 400 }}>
      <div style={{ position: "relative", height: 150, background: bilde ? `url(${bilde}) center/cover` : `linear-gradient(140deg, ${T.farge.forestMerkeA55} 0%, ${TL.dim} 70%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!bilde && <Icon name="image" size={26} style={{ color: T.farge.hvitA22 }} />}
        {badge && <span style={{ position: "absolute", top: 12, left: 12, fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.onFill, background: TL.fill, borderRadius: 9999, padding: "4px 9px" }}>{badge}</span>}
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <Caps size={9}>{eyebrow}</Caps>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: TL.text, marginTop: 7, lineHeight: 1.15 }}>{tittel}</div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: "9px 0 0" }}>{tekst}</p>
        <div style={{ marginTop: 15 }} onClick={onClick}><CTAPill icon={ctaIcon}>{cta}</CTAPill></div>
      </div>
    </div>
  );
}
