"use client";

/* AK Golf HQ v2 — KALENDER (retning C «Presis»).
   Gjenskaping av golfdata/-kalenderkontraktene i v2-idiomet: samme data,
   nytt uttrykk. Statisk visning for galleriet (ingen DnD — det er prod-jobb).
   Regler: aksefarger fra T.ax, lime kun som signal (i dag / nå-linje / aktiv fane),
   mono-tall, norsk uke (man først), aldri emoji. Demo-data som default-props.
   Port av ui_kits/v2/v2-kalender.jsx → produksjons-TSX (diff-null). */

import type { CSSProperties } from "react";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { StatusPill } from "./core";
import { Icon } from "@/components/v2/icon";

/* ── Lokale stil/format-helpere (som i mockupen) ────────── */
const mono = (size: number, color: string = T.fg, weight: number = 700): CSSProperties => ({ fontFamily: T.mono, fontSize: size, fontWeight: weight, color, fontVariantNumeric: "tabular-nums" });
const fmtTime = (t: number): string => `${String(Math.floor(t)).padStart(2, "0")}:${t % 1 ? "30" : "00"}`;
const aksesoft = (a: AkseKey, pct: number = 12): string => `color-mix(in srgb, ${T.ax[a] || T.mut} ${pct}%, ${T.panel2})`;

/* ── UkeGrid — 7-kolonners uke, økter farget etter akse ──── */
export type ComplianceKey = "on" | "off" | "none" | "planned";
export interface UkeSession {
  time?: string;
  title: string;
  axis: AkseKey;
  compliance?: ComplianceKey;
}
export interface UkeDag {
  date: number | null;
  today?: boolean;
  sessions: UkeSession[];
}
const UG_DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const UG_COMP: Record<ComplianceKey, string> = { on: T.up, off: T.down, none: T.mut, planned: `color-mix(in srgb, ${T.fg} 28%, transparent)` };
const UG_DEMO: UkeDag[] = [
  { date: 6, sessions: [{ time: "07:00", title: "FYS styrke", axis: "FYS", compliance: "on" }] },
  { date: 7, sessions: [{ time: "16:00", title: "Teknikk driver", axis: "TEK", compliance: "off" }] },
  { date: 8, today: true, sessions: [{ time: "08:00", title: "Kravtrening innspill", axis: "SLAG", compliance: "planned" }, { time: "17:00", title: "Putting 3–6 ft", axis: "SLAG", compliance: "planned" }] },
  { date: 9, sessions: [{ time: "15:30", title: "Spill 9 hull", axis: "SPILL", compliance: "planned" }] },
  { date: 10, sessions: [] },
  { date: 11, sessions: [{ time: "09:00", title: "Treningsrunde", axis: "SPILL", compliance: "planned" }] },
  { date: 12, sessions: [{ title: "Klubbturnering", axis: "TURN", compliance: "planned" }] },
];
export interface UkeGridProps {
  week?: UkeDag[];
  onSessionClick?: ((s: UkeSession) => void) | null;
}
export function UkeGrid({ week = UG_DEMO, onSessionClick = null }: UkeGridProps) {
  const days = week.slice(0, 7);
  while (days.length < 7) days.push({ date: null, sessions: [] });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }} role="grid" aria-label="Ukekalender">
      {days.map((day, i) => (
        <div key={i} style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 7px" }}>
            <span style={{ ...mono(9, T.mut), letterSpacing: "0.08em", textTransform: "uppercase" }}>{UG_DAGER[i]}</span>
            <span style={{ ...mono(11, day.today ? T.onLime : T.fg2), ...(day.today ? { background: T.lime, borderRadius: 9999, padding: "2px 7px" } : {}) }}>{day.date != null ? day.date : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, minHeight: 96, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
            {(day.sessions || []).map((s, j) => (
              <div key={j} onClick={onSessionClick ? () => onSessionClick(s) : undefined}
                style={{ borderRadius: 9, padding: "6px 8px 6px 10px", background: aksesoft(s.axis), borderLeft: `2px solid ${T.ax[s.axis] || T.mut}`, cursor: onSessionClick ? "pointer" : "default" }}>
                {s.time && <span style={{ ...mono(8.5, T.mut, 600), display: "block" }}>{s.time}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 9999, background: UG_COMP[s.compliance || "planned"], flex: "none" }} />
                  <span style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: 600, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── TidsGrid — dagstidslinje m/ posisjonerte blokker + nå-linje ── */
export interface TidsBlokk {
  fra: number;
  til: number;
  akse: AkseKey;
  tittel: string;
  sub?: string;
}
export interface TidsKolonne {
  header: string;
  idag?: boolean;
  blokker: TidsBlokk[];
}
const TG_DEMO: TidsKolonne[] = [
  { header: "Man 6", blokker: [{ fra: 8, til: 10, akse: "FYS", tittel: "FYS styrke", sub: "Basen" }, { fra: 16, til: 17.5, akse: "SLAG", tittel: "Putting", sub: "3–6 ft" }] },
  { header: "Tir 7", blokker: [{ fra: 15, til: 17, akse: "TEK", tittel: "Teknikk driver", sub: "M2" }] },
  { header: "Ons 8", idag: true, blokker: [{ fra: 9, til: 11, akse: "SLAG", tittel: "Kravtrening", sub: "Innspill 100–150 m" }, { fra: 14, til: 16, akse: "SPILL", tittel: "Spill 9 hull", sub: "Banen" }] },
];
export interface TidsGridProps {
  fraTime?: number;
  tilTime?: number;
  timeHoyde?: number;
  naa?: number | null;
  kolonner?: TidsKolonne[];
  onBlokkKlikk?: ((b: TidsBlokk, k: TidsKolonne) => void) | null;
}
export function TidsGrid({ fraTime = 7, tilTime = 18, timeHoyde = 44, naa = 12.5, kolonner = TG_DEMO, onBlokkKlikk = null }: TidsGridProps) {
  const timer: number[] = [];
  for (let t = fraTime; t <= tilTime; t++) timer.push(t);
  const hoyde = (tilTime - fraTime) * timeHoyde, hdH = 30;
  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      <div style={{ width: 44, flex: "none", position: "relative", marginTop: hdH }}>
        {timer.map((t) => <span key={t} style={{ position: "absolute", top: (t - fraTime) * timeHoyde - 5, right: 8, ...mono(8.5, T.mut, 600) }}>{fmtTime(t)}</span>)}
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${kolonner.length}, 1fr)`, gap: 6, position: "relative" }}>
        {kolonner.map((k, ki) => (
          <div key={ki} style={{ minWidth: 0 }}>
            <div style={{ height: hdH, display: "flex", alignItems: "center", gap: 6, padding: "0 2px" }}>
              {k.idag && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.lime }} />}
              <span style={{ ...mono(10.5, k.idag ? T.fg : T.fg2, k.idag ? 700 : 600) }}>{k.header}</span>
            </div>
            <div style={{ position: "relative", height: hoyde, borderTop: `1px solid ${T.borderS}` }}>
              {timer.slice(1).map((t) => <div key={t} style={{ position: "absolute", left: 0, right: 0, top: (t - fraTime) * timeHoyde, height: 1, background: T.border }} />)}
              {(k.blokker || []).map((b, bi) => (
                <div key={bi} onClick={onBlokkKlikk ? () => onBlokkKlikk(b, k) : undefined}
                  style={{ position: "absolute", left: 3, right: 3, top: (b.fra - fraTime) * timeHoyde + 1, height: Math.max((b.til - b.fra) * timeHoyde - 4, 20), borderRadius: 8, padding: "5px 8px 5px 9px", overflow: "hidden", background: aksesoft(b.akse), borderLeft: `2px solid ${T.ax[b.akse] || T.mut}`, cursor: onBlokkKlikk ? "pointer" : "default" }}>
                  <span style={{ ...mono(8, T.mut, 600), display: "block" }}>{fmtTime(b.fra)}–{fmtTime(b.til)}</span>
                  <span style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 600, color: T.fg, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.tittel}</span>
                  {b.sub && <span style={{ fontFamily: T.ui, fontSize: 9.5, color: T.mut, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.sub}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {naa != null && naa >= fraTime && naa <= tilTime && (
          <div style={{ position: "absolute", left: 0, right: 0, top: hdH + (naa - fraTime) * timeHoyde, height: 0, borderTop: `1.5px solid ${T.lime}`, zIndex: 2 }}>
            <span style={{ position: "absolute", left: -3, top: -3.5, width: 7, height: 7, borderRadius: 9999, background: T.lime }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tidslinje — horisontale baner: periodebarer + hendelsespunkter ── */
export type TidslinjeVariant = "turnering" | "peak";
export interface TidslinjeBar {
  fra: number;
  til: number;
  akse: AkseKey;
  tekst: string;
}
export interface TidslinjePunkt {
  ved: number;
  variant: TidslinjeVariant;
  etikett: string;
}
export interface TidslinjeBane {
  etikett: string;
  barer: TidslinjeBar[];
  punkter: TidslinjePunkt[];
}
export interface TidslinjeTick {
  ved: number;
  tekst: string;
}
const TL_DEMO: TidslinjeBane[] = [
  { etikett: "Øyvind Rohjan", barer: [{ fra: 0, til: 10, akse: "FYS", tekst: "Grunnperiode" }, { fra: 10, til: 20, akse: "TEK", tekst: "Spesialisering" }, { fra: 20, til: 30, akse: "SPILL", tekst: "Spillfase" }], punkter: [{ ved: 24, variant: "turnering", etikett: "Norgescup" }, { ved: 28, variant: "peak", etikett: "NM" }] },
  { etikett: "Emma Berg", barer: [{ fra: 4, til: 16, akse: "SLAG", tekst: "Kravtrening" }, { fra: 18, til: 30, akse: "TURN", tekst: "Turneringsblokk" }], punkter: [{ ved: 21, variant: "turnering", etikett: "Srixon Tour" }] },
];
const TL_TICKS: TidslinjeTick[] = [{ ved: 0, tekst: "Jan" }, { ved: 9, tekst: "Mar" }, { ved: 18, tekst: "Mai" }, { ved: 26, tekst: "Jul" }];
export interface TidslinjeProps {
  total?: number;
  ticks?: TidslinjeTick[];
  naa?: number | null;
  baner?: TidslinjeBane[];
  etikettBredde?: number;
}
export function Tidslinje({ total = 30, ticks = TL_TICKS, naa = 22, baner = TL_DEMO, etikettBredde = 128 }: TidslinjeProps) {
  const pct = (v: number) => `${(v / total) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex" }}>
        <span style={{ width: etikettBredde, flex: "none" }} />
        <div style={{ flex: 1, position: "relative", height: 18 }}>
          {ticks.map((t, i) => <span key={i} style={{ position: "absolute", left: pct(t.ved), ...mono(8.5, T.mut, 600) }}>{t.tekst}</span>)}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        {baner.map((bane, bi) => (
          <div key={bi} style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${T.border}`, minHeight: 46 }}>
            <span style={{ width: etikettBredde, flex: "none", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, paddingRight: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bane.etikett}</span>
            <div style={{ flex: 1, position: "relative", height: 46 }}>
              {(bane.barer || []).map((b, i) => (
                <span key={i} style={{ position: "absolute", top: 10, height: 26, left: pct(b.fra), width: pct(b.til - b.fra), borderRadius: 7, background: aksesoft(b.akse, 16), borderLeft: `2px solid ${T.ax[b.akse] || T.mut}`, display: "inline-flex", alignItems: "center", padding: "0 8px", overflow: "hidden" }}>
                  <span style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.tekst}</span>
                </span>
              ))}
              {(bane.punkter || []).map((p, i) => (
                <span key={i} title={p.etikett} style={{ position: "absolute", top: 18, left: `calc(${pct(p.ved)} - 5px)`, width: 10, height: 10, borderRadius: 9999, background: p.variant === "peak" ? T.lime : T.ax.TURN, border: `2px solid ${T.bg}` }} />
              ))}
            </div>
          </div>
        ))}
        {naa != null && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${etikettBredde}px + (100% - ${etikettBredde}px) * ${naa / total})`, width: 0, borderLeft: `1.5px solid ${T.lime}` }} />
        )}
      </div>
    </div>
  );
}

/* ── Periodeplan — år/sesong-gantt m/ frie fasenavn + turneringer ── */
export type PrioKey = "A" | "B" | "C";
export interface Fase {
  navn: string;
  fraUke: number;
  uker: number;
}
export interface Turnering {
  navn: string;
  uke: number;
  prio: PrioKey;
}
const PP_RAMP = ["rgb(36,49,42)", T.forest, "rgb(62,122,78)", "rgb(110,154,78)", T.lime];
const PP_MND = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];
const PP_FASER: Fase[] = [
  { navn: "Grunnperiode", fraUke: 1, uker: 14 }, { navn: "Spesialisering", fraUke: 15, uker: 12 },
  { navn: "Turneringsperiode", fraUke: 27, uker: 16 }, { navn: "Restitusjon", fraUke: 43, uker: 10 },
];
const PP_TURN: Turnering[] = [{ navn: "Norgescup 1", uke: 24, prio: "B" }, { navn: "NM junior", uke: 30, prio: "A" }, { navn: "Klubbmesterskap", uke: 34, prio: "C" }, { navn: "Norgescup-finale", uke: 38, prio: "A" }];
const PP_PRIO: Record<PrioKey, string> = { A: T.ax.TURN, B: T.ax.SPILL, C: T.ax.SLAG };
export interface PeriodeplanProps {
  faser?: Fase[];
  turneringer?: Turnering[];
  totalUker?: number;
  maaneder?: string[];
}
export function Periodeplan({ faser = PP_FASER, turneringer = PP_TURN, totalUker = 52, maaneder = PP_MND }: PeriodeplanProps) {
  const left = (uke: number) => `${((uke - 1) / totalUker) * 100}%`;
  const width = (uker: number) => `${(uker / totalUker) * 100}%`;
  const rampe = (i: number) => PP_RAMP[faser.length < 2 ? 0 : Math.round((i / (faser.length - 1)) * (PP_RAMP.length - 1))];
  return (
    <div>
      <div style={{ position: "relative", height: 30 }}>
        {faser.map((f, i) => {
          const bg = rampe(i);
          return (
            <span key={i} title={`${f.navn} · uke ${f.fraUke}–${f.fraUke + f.uker - 1}`}
              style={{ position: "absolute", top: 0, height: 30, left: left(f.fraUke), width: width(f.uker), borderRadius: 8, background: bg, display: "inline-flex", alignItems: "center", padding: "0 9px", overflow: "hidden" }}>
              <span style={{ ...mono(8.5, i >= faser.length - 2 && bg === T.lime ? T.onLime : T.fg, 700), letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{f.navn}</span>
            </span>
          );
        })}
      </div>
      {turneringer.length > 0 && (
        <div style={{ position: "relative", height: 22, marginTop: 6 }}>
          {turneringer.map((t, i) => (
            <span key={i} title={`${t.navn || ""} · uke ${t.uke}`}
              style={{ position: "absolute", top: 2, left: left(t.uke), width: 17, height: 17, borderRadius: 5, background: PP_PRIO[t.prio] || T.mut, display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono(8.5, T.bg, 700) }}>
              {t.prio}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", marginTop: 7 }}>
        {maaneder.map((m, i) => <span key={i} style={{ flex: 1, ...mono(8.5, T.mut, 600) }}>{m}</span>)}
      </div>
    </div>
  );
}

/* ── MndKalender — månedsgrid m/ lime-varme etter øktmengde ── */
export interface MndDag {
  date: number;
  oktAntall?: number;
  today?: boolean;
}
const MK_DOW = ["M", "T", "O", "T", "F", "L", "S"];
const MK_DEMO: MndDag[] = [
  { date: 1, oktAntall: 1 }, { date: 2, oktAntall: 2 }, { date: 4, oktAntall: 1 }, { date: 6, oktAntall: 3 },
  { date: 7, oktAntall: 1 }, { date: 8, oktAntall: 2, today: true }, { date: 11, oktAntall: 1 },
  { date: 13, oktAntall: 2 }, { date: 15, oktAntall: 1 }, { date: 18, oktAntall: 3 }, { date: 21, oktAntall: 1 },
];
export interface MndKalenderProps {
  year?: number;
  month?: number;
  days?: MndDag[];
  valgt?: number | null;
  onChange?: ((date: number) => void) | null;
}
export function MndKalender({ year = 2026, month = 6, days = MK_DEMO, valgt = null, onChange = null }: MndKalenderProps) {
  const first = new Date(year, month, 1);
  const antall = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: antall }, (_, i) => i + 1)];
  const map: Record<number, MndDag> = {};
  days.forEach((d) => { map[d.date] = d; });
  const maks = Math.max(1, ...days.map((d) => d.oktAntall || 0));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {MK_DOW.map((d, i) => <span key={i} style={{ ...mono(9, T.mut), textAlign: "center", letterSpacing: "0.08em" }}>{d}</span>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const info: Partial<MndDag> = map[date] ?? {};
          const heat = info.oktAntall ? info.oktAntall / maks : 0;
          const aktiv = date === valgt;
          return (
            <button key={i} type="button" onClick={onChange ? () => onChange(date) : undefined}
              aria-current={info.today ? "date" : undefined}
              style={{ appearance: "none", cursor: onChange ? "pointer" : "default", position: "relative", aspectRatio: "1 / 1", borderRadius: 10, border: `1px solid ${info.today ? T.lime : aktiv ? T.borderS : T.border}`, background: aktiv ? T.fg : T.panel2, overflow: "hidden", ...mono(11.5, aktiv ? T.bg : T.fg2, 600) }}>
              {heat > 0 && !aktiv && <span style={{ position: "absolute", inset: 0, background: T.lime, opacity: 0.07 + heat * 0.2 }} />}
              <span style={{ position: "relative" }}>{date}</span>
              {info.oktAntall && info.oktAntall > 0 && !aktiv && <span style={{ position: "absolute", left: "50%", bottom: 4, width: 4, height: 4, borderRadius: 9999, background: T.mut, transform: "translateX(-2px)" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── DagStripe — M T O T F L S m/ dato-piller ─────────────── */
export interface StripeDag {
  dow: string;
  date: number;
  today?: boolean;
  state?: "done";
}
const DS_DEMO: StripeDag[] = [
  { dow: "M", date: 6, state: "done" }, { dow: "T", date: 7, state: "done" }, { dow: "O", date: 8, today: true },
  { dow: "T", date: 9 }, { dow: "F", date: 10 }, { dow: "L", date: 11 }, { dow: "S", date: 12 },
];
export interface DagStripeProps {
  days?: StripeDag[];
  value?: number | null;
  onChange?: ((date: number, d: StripeDag) => void) | null;
}
export function DagStripe({ days = DS_DEMO, value = 8, onChange = null }: DagStripeProps) {
  const aktiv = value != null ? value : days[0] && days[0].date;
  return (
    <div style={{ display: "flex", gap: 5 }} role="tablist">
      {days.map((d, i) => {
        const on = d.date === aktiv;
        return (
          <button key={i} type="button" role="tab" aria-selected={on} onClick={onChange ? () => onChange(d.date, d) : undefined}
            style={{ appearance: "none", cursor: onChange ? "pointer" : "default", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0 7px", borderRadius: 12, background: on ? T.fg : T.panel2, border: `1px solid ${on ? T.fg : T.border}` }}>
            <span style={{ ...mono(8.5, on ? T.bg : T.mut, 600), letterSpacing: "0.08em" }}>{d.dow}</span>
            <span style={{ ...mono(13.5, on ? T.bg : T.fg) }}>{d.date}</span>
            <span style={{ width: 4, height: 4, borderRadius: 9999, background: d.today ? T.lime : d.state === "done" ? (on ? T.bg : T.mut) : "transparent", opacity: d.today ? 1 : 0.6 }} />
          </button>
        );
      })}
    </div>
  );
}

/* ── AgendaRad — tid · blokk m/ ikon, tittel, varighet ────── */
export type AgendaState = "upcoming" | "live" | "done";
export interface AgendaRadProps {
  time?: string;
  icon?: string;
  title?: string;
  subtitle?: string;
  duration?: string;
  state?: AgendaState;
  onClick?: (() => void) | null;
}
export function AgendaRad({ time = "16:00", icon = "dumbbell", title = "Kravtrening innspill", subtitle = "100–150 m · M2", duration = "60 min", state = "upcoming", onClick = null }: AgendaRadProps) {
  const live = state === "live", done = state === "done";
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 12, opacity: done ? 0.55 : 1 }}>
      <span style={{ width: 42, flex: "none", ...mono(11, T.fg2, 600), paddingTop: 13 }}>{time}</span>
      <div onClick={onClick || undefined}
        style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: T.rRow, background: T.panel2, border: `1px solid ${live ? `color-mix(in srgb, ${T.lime} 40%, transparent)` : T.border}`, cursor: onClick ? "pointer" : "default" }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name={done ? "check" : icon} size={15} style={{ color: done ? T.up : live ? T.lime : T.fg2 }} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
            {live && <StatusPill>Nå</StatusPill>}
          </div>
          {subtitle && <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 1 }}>{subtitle}</div>}
        </div>
        {duration && <span style={{ ...mono(10.5, T.mut, 600), flex: "none" }}>{duration}</span>}
      </div>
    </div>
  );
}

/* ── VisningsVelger — dag/uke/måned/år-hode m/ periode + nav ── */
const VV_NAVN: Record<string, string> = { dag: "Dag", agenda: "Agenda", uke: "Uke", maned: "Måned", tidslinje: "Tidslinje", aar: "År" };
export interface VisningsVelgerProps {
  visning?: string;
  onVisning?: ((v: string) => void) | null;
  visninger?: string[];
  periode?: string;
  onForrige?: (() => void) | null;
  onNeste?: (() => void) | null;
  onIdag?: (() => void) | null;
}
export function VisningsVelger({ visning = "uke", onVisning = null, visninger = ["dag", "uke", "maned", "aar"], periode = "Uke 28 · juli 2026", onForrige = null, onNeste = null, onIdag = null }: VisningsVelgerProps) {
  const pil = (name: string, onClickFn: (() => void) | null, lbl: string) => (
    <button type="button" onClick={onClickFn || undefined} aria-label={lbl}
      style={{ appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.fg2 }}>
      <Icon name={name} size={14} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 2 }} role="tablist" aria-label="Kalendervisning">
        {visninger.map((v) => {
          const on = visning === v;
          return (
            <button key={v} type="button" role="tab" aria-selected={on} onClick={onVisning ? () => onVisning(v) : undefined}
              style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", padding: "6px 10px 8px", fontFamily: T.ui, fontSize: 13, fontWeight: on ? 700 : 500, color: on ? T.fg : T.mut, borderBottom: `2px solid ${on ? T.lime : "transparent"}` }}>
              {VV_NAVN[v] || v}
            </button>
          );
        })}
      </div>
      {periode && <span style={{ flex: 1, fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{periode}</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {onIdag !== null && (
          <button type="button" onClick={onIdag || undefined}
            style={{ appearance: "none", cursor: "pointer", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "6px 13px" }}>
            I dag
          </button>
        )}
        {pil("chevron-left", onForrige, "Forrige periode")}
        {pil("chevron-right", onNeste, "Neste periode")}
      </div>
    </div>
  );
}
