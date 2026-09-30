"use client";

/**
 * PH-10 Plan — Precision Athletics, runde 21 (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-10.jsx, plan-parts.jsx, plan-sheets.jsx).
 *
 * Én flate i fire zoomnivåer: År · Måned · Uke · Dag. Golføkter, fysisk,
 * turneringer og samlinger ligger i samme plan; opptatt tid er eget lag.
 * «Rediger» åpner Workbench. PH-WB-FYS og PH-WB-TURN er lag i denne flaten.
 *
 * Bevisste avvik fra tegningen (finnes ikke som data eller funksjon ennå):
 *   - Google-kalender (inn og ut): ingen kobling for spillere. Laget og knappen vises ikke.
 *   - «Lagt inn av», WANG-arvede økter og oppmøteregistrering: økta har ingen slik kilde.
 *   - Forslag om lettere uke (over 130 % / under 70 %): regelen finnes ikke i koden.
 *   - Turneringsreisen (forberedelse, runder, score, evaluering) og «Flytt/Fjern turnering»:
 *     ingen datamodell. Arket viser fakta og lenker til påmelding og runde.
 *   - Veileder for årsplan: «Lag årsplan» åpner planbyggeren.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, Bus, CalendarCheck, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, CircleHelp, List, ListChecks, MessageSquare, Pencil,
  Play, Route, School, TriangleAlert, Trophy,
} from "lucide-react";
import { Ikon, Knapp, KnappLenke, Meta, Tall, TomTilstand, AkseMerke, StatusPille } from "@/components/precision/pa";
import { Ark, Nokkelverdi, SideHode } from "@/components/precision/pa-a4";
import { IkonKnapp, SegmentertValg } from "@/components/precision/pa-a2";
import { Valgpille } from "@/components/precision/pa-workbench";
import {
  ALLE_LAG, aksererDag, ddmm, dagnummer, filtrerHeldag, filtrerOkter, filtrerOpptatt, flytt, heldagPaaDag, hhmm, isoUke, krasjMed, mandagAv,
  maanedIndeks, maanedsUker, periodeForUke, plussDager, timerTekst, tilMin, ukeDatoer, ukedag, type PlanLag,
} from "@/lib/portal-plan/ph10-dato";
import {
  OPPTATT_NAVN, PERIODE_NAVN, PLAN_ZOOM, ZOOM_NAVN, type PlanData, type PlanHeldag, type PlanOkt, type PlanOpptatt, type PlanZoom,
} from "@/lib/portal-plan/ph10-typer";

const DAG = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const DAG_LANG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"] as const;
const MAANED = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"] as const;
const AKSER = ["fys", "tek", "slag", "spill", "turn"] as const;
const HATCH = "repeating-linear-gradient(135deg, var(--surface-sunken) 0 6px, var(--surface-flat) 6px 12px)";
const STATUS_TONE = { "Gjennomført": "ok", "Hoppet over": "warn", "Pågår": "live", "Avlyst": "warn", "Planlagt": "neutral" } as const;
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

const dagKort = (d: string) => `${DAG[ukedag(d)]} ${ddmm(d)}`;
const sluttKl = (t: string, min: number) => hhmm(Math.min(1440, tilMin(t) + min));

function OpptattIkon({ art }: { art: PlanOpptatt["art"] }) {
  return <Ikon icon={art === "reise" ? Bus : art === "jobb" ? Briefcase : art === "booking" ? CalendarCheck : art === "skole" ? School : CalendarDays} size={16} />;
}

/* ---------- Rader ---------- */

function HeldagChip({ a, onOpen, kompakt }: { a: PlanHeldag; onOpen: (a: PlanHeldag) => void; kompakt?: boolean }) {
  const turn = a.art === "turnering", samling = a.art === "samling";
  const etikett = turn ? "TURNERING" : samling ? "TRENINGSSAMLING" : a.art === "skole" ? "SKOLE" : "TESTFRIST";
  const klikkbar = turn || samling;
  const stil = { display: "flex", flexDirection: "column", gap: 2, minHeight: 44, padding: "6px 8px 6px 12px", borderRadius: 6, minWidth: 0, boxSizing: "border-box", textAlign: "left", width: "100%",
    background: klikkbar ? "var(--surface-card)" : HATCH, border: klikkbar ? `1px solid ${turn ? "var(--border-hairline)" : "var(--border-strong)"}` : "1px dashed var(--border-strong)",
    boxShadow: turn ? "inset 4px 0 0 var(--axis-turn)" : samling ? "inset 4px 0 0 var(--text-primary)" : "none" } as const;
  const innhold = <>
    <Meta style={ellipsis}>{etikett}{!kompakt && a.meta ? ` · ${a.meta.toUpperCase()}` : ""}</Meta>
    <span style={{ font: "500 13px/1.25 var(--font-sans)", color: "var(--text-primary)", ...ellipsis }}>{a.tittel}</span>
  </>;
  return klikkbar
    ? <button type="button" onClick={() => onOpen(a)} aria-label={`${turn ? "Turnering" : "Treningssamling"} ${a.tittel}`} style={{ ...stil, cursor: "pointer", font: "inherit" }}>{innhold}</button>
    : <div style={stil}>{innhold}</div>;
}

function OktRad({ o, onOpen, krasj, h }: { o: PlanOkt; onOpen: (o: PlanOkt) => void; krasj: PlanOpptatt | null; h?: number }) {
  const gjort = o.status === "Gjennomført", hoppet = o.status === "Hoppet over" || o.status === "Avlyst";
  const høy = h == null || h >= 34;
  return <button type="button" onClick={() => onOpen(o)} aria-label={`${o.tid} ${o.tittel} · ${o.status}${krasj ? ` · krasjer med ${krasj.tittel}` : ""}`}
    style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", height: h, minHeight: h == null ? 52 : undefined, boxSizing: "border-box", cursor: "pointer", textAlign: "left", font: "inherit",
      padding: h != null && h < 34 ? "2px 6px 2px 10px" : "6px 8px 6px 12px", borderRadius: 6, background: "var(--surface-card)", border: "1px solid var(--border-hairline)",
      boxShadow: `inset 4px 0 0 var(--axis-${o.akse})`, overflow: "hidden", opacity: hoppet ? 0.6 : 1, outline: krasj ? "2px dashed var(--warn)" : "none", outlineOffset: -2, minWidth: 0 }}>
    <span style={{ display: "flex", gap: 6, alignItems: "baseline", minWidth: 0 }}>
      <span style={{ font: "500 11px/1.2 var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{o.tid}{h == null ? `–${sluttKl(o.tid, o.min)}` : ""}</span>
      {!høy && <span style={{ font: "500 11px/1.2 var(--font-sans)", color: "var(--text-primary)", ...ellipsis }}>{o.tittel}</span>}
    </span>
    {høy && <span style={{ font: "500 13px/1.25 var(--font-sans)", color: "var(--text-primary)", textDecoration: hoppet ? "line-through" : "none", display: "-webkit-box", WebkitBoxOrient: "vertical",
      WebkitLineClamp: h == null ? 2 : Math.max(1, Math.floor((h - 22) / 16)), overflow: "hidden", overflowWrap: "anywhere" }}>{o.tittel}</span>}
    {h == null && <Meta style={ellipsis}>{o.akse.toUpperCase()} · {o.min} MIN{gjort ? " · GJENNOMFØRT" : hoppet ? ` · ${o.status.toUpperCase()}` : ""}</Meta>}
    {krasj && (h == null || h >= 52) && <span style={{ display: "flex", gap: 4, alignItems: "center", font: "600 10px/1.1 var(--font-mono)", color: "var(--warn)", letterSpacing: ".04em" }}>
      <Ikon icon={TriangleAlert} size={12} />KRASJER · {krasj.tittel.toUpperCase()}</span>}
  </button>;
}

function OpptattRad({ b, h }: { b: PlanOpptatt; h?: number }) {
  return <div aria-label={`Opptatt: ${b.tittel} ${b.tid}–${sluttKl(b.tid, b.min)}`}
    style={{ boxSizing: "border-box", height: h, minHeight: h == null ? 40 : undefined, display: "flex", flexDirection: h == null ? "row" : "column", alignItems: h == null ? "center" : "stretch",
      gap: h == null ? 8 : 2, padding: "4px 8px", borderRadius: 6, background: HATCH, border: "1px dashed var(--border-strong)", overflow: "hidden", minWidth: 0 }}>
    {h == null && <span style={{ display: "inline-flex", color: "var(--text-muted)" }}><OpptattIkon art={b.art} /></span>}
    <span style={{ font: "500 11px/1.2 var(--font-mono)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{b.tid}–{sluttKl(b.tid, b.min)}</span>
    <span style={{ flex: 1, minWidth: 0, font: "500 12px/1.25 var(--font-sans)", color: "var(--text-secondary)", ...ellipsis }}>{b.tittel}</span>
    <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{OPPTATT_NAVN[b.art].toUpperCase()}</span>
  </div>;
}

/* ---------- Visninger ---------- */

type Sett = { okter: PlanOkt[]; opptatt: PlanOpptatt[]; heldag: PlanHeldag[] };

function UkeListe({ mandag, s, iDag, onOpen, onDag }: { mandag: string; s: Sett; iDag: string; onOpen: (x: PlanOkt | PlanHeldag) => void; onDag: (d: string) => void }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: 12, minWidth: 0 }}>
    {ukeDatoer(mandag).map((d) => {
      const idag = d === iDag;
      const okter = s.okter.filter((o) => o.dato === d), blokker = s.opptatt.filter((o) => o.dato === d), hd = heldagPaaDag(s.heldag, d);
      const rader = [...okter.map((o) => ({ k: "o" as const, t: o.tid, o })), ...blokker.map((b) => ({ k: "b" as const, t: b.tid, b }))].sort((a, b) => a.t.localeCompare(b.t));
      const min = okter.reduce((a, o) => a + o.min, 0);
      return <section key={d} aria-label={`${DAG_LANG[ukedag(d)]} ${ddmm(d)}`} className="pa-card"
        style={{ padding: 12, gap: 8, minWidth: 0, boxShadow: idag ? "inset 0 0 0 1px var(--border-ink)" : undefined, borderColor: idag ? "var(--border-ink)" : undefined }}>
        <button type="button" onClick={() => onDag(d)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "baseline", gap: 8, minHeight: 44 }}>
          <span style={{ font: "600 15px/1 var(--font-sans)", color: "var(--text-primary)" }}>{DAG_LANG[ukedag(d)]}</span>
          <Tall style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>{ddmm(d)}</Tall>
          {idag && <Meta style={{ color: "var(--text-primary)" }}>I DAG</Meta>}
          <span style={{ flex: 1 }} /><Meta>{min ? timerTekst(min).toUpperCase() : "—"}</Meta>
        </button>
        {hd.map((a) => <HeldagChip key={a.id} a={a} onOpen={onOpen} />)}
        {rader.length === 0 && hd.length === 0 && <Meta>INGEN ØKTER</Meta>}
        {rader.map((r) => r.k === "o" ? <OktRad key={r.o.id} o={r.o} onOpen={onOpen} krasj={krasjMed(r.o, s.opptatt)} /> : <OpptattRad key={r.b.id} b={r.b} />)}
      </section>;
    })}
  </div>;
}

const H0 = 7, H1 = 22;
function Tidsrutenett({ dager, s, iDag, naaMin, onOpen, px = 40 }: { dager: string[]; s: Sett; iDag: string; naaMin: number; onOpen: (x: PlanOkt | PlanHeldag) => void; px?: number }) {
  const timer = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);
  const kol = `40px repeat(${dager.length},minmax(0,1fr))`;
  const topp = (t: string) => Math.max(0, ((tilMin(t) - H0 * 60) / 60) * px);
  const hoyde = (m: number) => Math.max(20, (m / 60) * px - 2);
  const hd = s.heldag.filter((a) => dager.some((d) => d >= a.fra && d <= a.til));
  const utenfor = s.okter.filter((o) => dager.includes(o.dato) && tilMin(o.tid) < H0 * 60).length;
  return <div className="pa-card" style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: kol, borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-flat)" }}>
      <span />
      {dager.map((d) => <div key={d} style={{ padding: "8px 6px", display: "flex", gap: 4, alignItems: "baseline", minWidth: 0, borderLeft: "1px solid var(--border-hairline)", boxShadow: d === iDag ? "inset 0 -2px 0 var(--border-ink)" : "none" }}>
        <span style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-primary)" }}>{DAG[ukedag(d)]}</span>
        <span style={{ font: "var(--type-num-s)", color: d === iDag ? "var(--text-primary)" : "var(--text-muted)" }}>{ddmm(d)}</span>
      </div>)}
    </div>
    {hd.length > 0 && <div style={{ display: "grid", gridTemplateColumns: kol, gap: 4, padding: "6px 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <Meta style={{ padding: "0 4px", alignSelf: "center" }}>HELE DAGEN</Meta>
      {hd.map((a) => {
        const f = dager.findIndex((d) => d >= a.fra && d <= a.til), t = dager.length - 1 - [...dager].reverse().findIndex((d) => d >= a.fra && d <= a.til);
        return <div key={a.id} style={{ gridColumn: `${f + 2} / ${t + 3}`, minWidth: 0, padding: "0 2px" }}><HeldagChip a={a} onOpen={onOpen} kompakt={t - f < 1} /></div>;
      })}
    </div>}
    <div style={{ display: "grid", gridTemplateColumns: kol }}>
      <div>{timer.map((h) => <div key={h} style={{ height: px, font: "var(--type-meta)", color: "var(--text-muted)", textAlign: "right", padding: "0 6px", boxSizing: "border-box", transform: "translateY(-6px)" }}>{h > H0 ? String(h).padStart(2, "0") : ""}</div>)}</div>
      {dager.map((d) => <div key={d} style={{ position: "relative", height: timer.length * px, borderLeft: "1px solid var(--border-hairline)",
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${px - 1}px, var(--border-hairline) ${px - 1}px ${px}px)` }}>
        {s.opptatt.filter((b) => b.dato === d).map((b) => <div key={b.id} style={{ position: "absolute", left: 2, right: 2, top: topp(b.tid), zIndex: 1 }}><OpptattRad b={b} h={hoyde(b.min)} /></div>)}
        {s.okter.filter((o) => o.dato === d).map((o) => <div key={o.id} style={{ position: "absolute", left: 6, right: 2, top: topp(o.tid), zIndex: 2 }}><OktRad o={o} h={hoyde(o.min)} onOpen={onOpen} krasj={krasjMed(o, s.opptatt)} /></div>)}
        {d === iDag && naaMin >= H0 * 60 && naaMin <= H1 * 60 && <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: ((naaMin - H0 * 60) / 60) * px, height: 2, background: "var(--border-ink)", zIndex: 3 }} />}
      </div>)}
    </div>
    {utenfor > 0 && <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-hairline)" }}><Meta>{utenfor} ØKT FØR {String(H0).padStart(2, "0")}:00 · SE UKELISTEN</Meta></div>}
  </div>;
}

function Maanedsrutenett({ aar, maaned, s, iDag, mob, onDag }: { aar: number; maaned: number; s: Sett; iDag: string; mob: boolean; onDag: (d: string) => void }) {
  const uker = maanedsUker(aar, maaned);
  return <div className="pa-card" style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", background: "var(--surface-flat)", borderBottom: "1px solid var(--border-hairline)" }}>
      {DAG.map((n) => <span key={n} style={{ padding: "8px 6px", font: "var(--type-meta)", color: "var(--text-muted)" }}>{n.toUpperCase()}</span>)}
    </div>
    {uker.map((m) => <div key={m} style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", borderBottom: "1px solid var(--border-hairline)" }}>
      {ukeDatoer(m).map((d, i) => {
        const annen = maanedIndeks(d) !== maaned, idag = d === iDag, axes = aksererDag(s.okter, d), hd = heldagPaaDag(s.heldag, d).filter((a) => a.art === "turnering" || a.art === "samling");
        const etikett = `${dagnummer(d)}. ${MAANED[maanedIndeks(d)]}${axes.length ? ` · ${axes.map((a) => a.toUpperCase()).join(" ")}` : " · ingen økter"}${hd.length ? ` · ${hd.map((a) => a.tittel).join(", ")}` : ""}`;
        return <button key={d} type="button" onClick={() => onDag(d)} aria-label={etikett}
          style={{ minHeight: mob ? 60 : 84, border: 0, borderLeft: i ? "1px solid var(--border-hairline)" : 0, background: idag ? "var(--surface-flat)" : "transparent", boxShadow: idag ? "inset 0 0 0 2px var(--border-ink)" : "none",
            padding: 4, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 4, cursor: "pointer", minWidth: 0, textAlign: "left", font: "inherit" }}>
          <span style={{ font: "600 12px/1 var(--font-mono)", color: annen ? "var(--text-faint)" : "var(--text-primary)", padding: "2px 2px 0" }}>{dagnummer(d)}</span>
          {axes.length > 0 && <span style={{ display: "flex", gap: 3, flexWrap: "wrap", padding: "0 2px" }}>{axes.map((a) => <span key={a} style={{ width: 6, height: 6, borderRadius: 999, background: `var(--axis-${a})` }} />)}</span>}
          {hd.map((a) => <span key={a.id} style={{ display: "block", height: mob ? 6 : 18, borderRadius: 2, background: "var(--surface-card)", border: "1px solid var(--border-hairline)",
            boxShadow: `inset 3px 0 0 ${a.art === "turnering" ? "var(--axis-turn)" : "var(--text-primary)"}`, font: "500 10px/16px var(--font-mono)", color: "var(--text-secondary)", paddingLeft: 6, ...ellipsis }}>
            {mob ? "" : d === a.fra || i === 0 ? (a.art === "turnering" ? "TURN" : "SAMLING") : ""}</span>)}
        </button>;
      })}
    </div>)}
  </div>;
}

function Aarsvisning({ data, mob, onPeriode }: { data: PlanData; mob: boolean; onPeriode: (dato: string) => void }) {
  const { perioder, heldag, aar, iDag } = data;
  const naaUke = aarAvUke(iDag, aar);
  const merker = heldag.filter((h) => h.art === "turnering" || h.art === "samling").map((h) => ({ uke: Math.min(52, Math.max(1, isoUke(h.fra))), turn: h.art === "turnering", tittel: h.tittel }));
  if (perioder.length === 0) return <TomTilstand icon={Route} title="Ingen årsplan ennå" text={`Årsplanen for ${aar} har ingen perioder. Du lager den i planbyggeren, og du kan endre alt etterpå.`}
    actions={<><KnappLenke icon={Route} href="/portal/planlegge/bygger">Lag årsplan</KnappLenke></>} />;
  return <section aria-label="Året" className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
    <div role="img" aria-label="Periodene uke 1–52" style={{ display: "grid", gridTemplateColumns: "repeat(52,minmax(0,1fr))", gap: 1, minWidth: 0 }}>
      {Array.from({ length: 52 }, (_, i) => { const w = i + 1, p = periodeForUke(perioder, w);
        return <span key={w} style={{ height: 36, background: p ? `var(--period-${p.type})` : "var(--surface-sunken)", position: "relative", zIndex: w === naaUke ? 1 : 0,
          boxShadow: w === naaUke ? "0 0 0 2px var(--surface-card), 0 0 0 4px var(--border-ink)" : "none" }} />; })}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(52,minmax(0,1fr))", gap: 1, height: 12, minWidth: 0 }}>
      {Array.from({ length: 52 }, (_, i) => { const m = merker.find((x) => x.uke === i + 1);
        return <span key={i} title={m?.tittel} style={{ height: m ? 12 : 0, background: m ? (m.turn ? "var(--axis-turn)" : "var(--text-primary)") : "transparent" }} />; })}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, minWidth: 0 }}>
      {(mob ? ["JAN", "APR", "JUL", "OKT", "DES"] : ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"]).map((m) => <Meta key={m}>{m}</Meta>)}
    </div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {(Object.keys(PERIODE_NAVN) as (keyof typeof PERIODE_NAVN)[]).map((t) => <span key={t} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <span style={{ width: 12, height: 12, background: `var(--period-${t})` }} /><Meta>{PERIODE_NAVN[t].toUpperCase()}</Meta></span>)}
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 4, height: 12, background: "var(--axis-turn)" }} /><Meta>TURNERING</Meta></span>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 4, height: 12, background: "var(--text-primary)" }} /><Meta>SAMLING</Meta></span>
    </div>
    <div role="list">
      {perioder.map((p) => { const na = naaUke >= p.fraUke && naaUke <= p.tilUke;
        const tekst = merker.filter((m) => m.uke >= p.fraUke && m.uke <= p.tilUke).map((m) => ` · ${m.tittel.toUpperCase()}`).join("");
        return <button role="listitem" key={p.id} type="button" onClick={() => onPeriode(p.fraDato)}
          style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "12px minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: "1px solid var(--border-hairline)", padding: "6px 0" }}>
          <span style={{ width: 12, height: 28, background: `var(--period-${p.type})` }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ font: `${na ? 600 : 500} 14px/1.3 var(--font-sans)`, color: "var(--text-primary)" }}>{p.navn}{na ? " · nå" : ""}</span>
            <Meta>UKE {p.fraUke}–{p.tilUke}{tekst}</Meta>
          </span>
          <Tall style={{ font: "var(--type-num-s)", textAlign: "right" }}>{p.gjortTimer == null ? "—" : String(p.gjortTimer).replace(".", ",")} / {p.planTimer == null ? "—" : String(p.planTimer).replace(".", ",")} t</Tall>
        </button>; })}
    </div>
    <Meta>TIMER GJENNOMFØRT / PLAN · WORKBENCH {aar}</Meta>
  </section>;
}
const aarAvUke = (iDag: string, aar: number) => (iDag.startsWith(String(aar)) ? Math.min(52, isoUke(iDag)) : 0);

/* ---------- Ark ---------- */

function OktArk({ o, krasj, onClose }: { o: PlanOkt; krasj: PlanOpptatt | null; onClose: () => void }) {
  const ferdig = o.status === "Gjennomført";
  return <Ark open onClose={onClose} kicker={`${dagKort(o.dato)} · ${o.tid}–${sluttKl(o.tid, o.min)}`} title={o.tittel}
    footer={<>
      {o.startHref && <KnappLenke size="xl" fullWidth icon={Play} href={o.startHref}>{o.status === "Pågår" ? "Fortsett økt" : "Start økt"}</KnappLenke>}
      <KnappLenke variant={ferdig || !o.startHref ? "primary" : "secondary"} fullWidth icon={List} href={o.href}>Se økta</KnappLenke>
      <KnappLenke variant="ghost" fullWidth icon={Pencil} href="/portal/planlegge/workbench">Rediger i Workbench</KnappLenke>
    </>}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><AkseMerke axis={o.akse} /><StatusPille tone={STATUS_TONE[o.status]}>{o.status}</StatusPille></div>
    <Nokkelverdi items={[["Tid", timerTekst(o.min)], ["Sted", o.sted ?? "—", { mono: false }]]} />
    {o.ovelser.length > 0 && <div role="list">{o.ovelser.map((e, i) => <div role="listitem" key={`${e.navn}-${i}`}
      style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 44, borderTop: "1px solid var(--border-hairline)" }}>
      <span style={{ font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{e.navn}</span><Tall style={{ font: "var(--type-num-s)" }}>{e.min} min</Tall></div>)}</div>}
    {krasj && <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: 12, borderRadius: 8, background: "var(--warn-tint)" }}>
      <span style={{ color: "var(--warn)", display: "inline-flex", paddingTop: 2 }}><Ikon icon={TriangleAlert} size={16} /></span>
      <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>Krasjer med {krasj.tittel} {krasj.tid}–{sluttKl(krasj.tid, krasj.min)}. Flytt økta i Workbench, eller behold den.</span></div>}
  </Ark>;
}

function HeldagArk({ a, onClose }: { a: PlanHeldag; onClose: () => void }) {
  const turn = a.art === "turnering";
  return <Ark open onClose={onClose} kicker={`${turn ? "Turnering" : "Treningssamling"} · uke ${isoUke(a.fra)}`} title={a.tittel}
    footer={<>
      {turn && a.turneringId && <KnappLenke fullWidth icon={Trophy} href={`/portal/tren/turneringer/${a.turneringId}`}>Påmelding og runde</KnappLenke>}
      <Knapp variant={turn && a.turneringId ? "ghost" : "secondary"} fullWidth onClick={onClose}>Lukk</Knapp>
    </>}>
    <Nokkelverdi items={a.detaljer.map(([k, v]) => [k, v, { mono: k === "Dato" || k === "Påmeldingsfrist" }] as const)} />
    <Meta>{turn ? "BRUTTO SCORE · RESULTATER FØRES I RUNDEN" : "ØKTENE LEGGES INN I UKENE I PLAN"}</Meta>
  </Ark>;
}

const HJELP: Record<PlanZoom | "rediger", [string, string]> = {
  aar: ["Året i perioder", "Grunnperiode, Spesialperiode, Turneringsperiode, Evaluering, Ferie og Restitusjon. Turneringer og samlinger ligger oppå. Trykk en periode for å se månedene."],
  maaned: ["Måneden", "Hver dag viser aksene som er planlagt. Turneringer og samlinger ligger som striper over dagene. Trykk en dag for å se den."],
  uke: ["Uka", "Golføkter, fysisk trening, turneringer og opptatt tid i samme plan. Trykk en økt for å se den eller starte den."],
  dag: ["Dagen", "Timeplan for én dag. Opptatt tid vises med stiplet kant, øktene med aksestripe."],
  rediger: ["Workbench", "Velg akse i pyramiderekkefølge: FYS, TEK, SLAG, SPILL, TURN. Legg økter på en dag og dra dem. Du kan endre alt selv."],
};

/* ---------- Skjerm ---------- */

const LAG_VALG: { id: keyof PlanLag; label: string }[] = [
  { id: "fys", label: "Fysisk" }, { id: "turn", label: "Turneringer" }, { id: "samling", label: "Samlinger" }, { id: "opptatt", label: "Opptatt tid" },
];

export function PH10Plan({ data, startMedHjelp }: { data: PlanData; /** Åpner hjelpearket ved første visning (skjermprøven). */ startMedHjelp?: boolean }) {
  const router = useRouter();
  const { zoom, dato, iDag, naaMin, aar } = data;
  const [lag, setLag] = useState<PlanLag>(ALLE_LAG);
  const [hjelp, setHjelp] = useState(!!startMedHjelp);
  const [aapen, setAapen] = useState<{ okt?: PlanOkt; heldag?: PlanHeldag } | null>(() => {
    const okt = data.aapneOktId ? data.okter.find((o) => o.id === data.aapneOktId) : undefined;
    const heldag = data.aapneHeldagId ? data.heldag.find((h) => h.id === data.aapneHeldagId) : undefined;
    return okt ? { okt } : heldag ? { heldag } : null;
  });
  const ref = useRef<HTMLDivElement>(null);
  const [bredde, setBredde] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBredde(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const mob = bredde > 0 && bredde < 640, rutenett = bredde >= 900;

  const s: Sett = useMemo(() => ({ okter: filtrerOkter(data.okter, lag), opptatt: filtrerOpptatt(data.opptatt, lag), heldag: filtrerHeldag(data.heldag, lag) }), [data, lag]);
  const gaa = (z: PlanZoom, d: string) => router.push(`/portal/planlegge?zoom=${z}&dato=${d}`);
  const mandag = mandagAv(dato), uke = isoUke(dato);
  const periode = periodeForUke(data.perioder, aarAvUke(iDag, aar) || uke);
  const label = zoom === "aar" ? String(aar) : zoom === "maaned" ? `${stor(MAANED[maanedIndeks(dato)])} ${aar}` : zoom === "dag" ? `${DAG_LANG[ukedag(dato)]} ${ddmm(dato)}`
    : `Uke ${uke} · ${ddmm(mandag)}–${ddmm(plussDager(mandag, 6))}`;
  const ukeTom = zoom === "uke" && data.okter.length === 0 && data.opptatt.length === 0 && data.heldag.length === 0;
  const helTom = data.perioder.length === 0 && data.okter.length === 0 && data.heldag.filter((h) => h.art === "turnering" || h.art === "samling").length === 0 && zoom !== "aar";
  const kicker = `Plan${periode ? ` · ${periode.navn}` : ""} · uke ${isoUke(iDag)}`;
  const aapneHeldag = (a: PlanHeldag) => setAapen({ heldag: a });

  return <div ref={ref} className="pa-side" style={{ maxWidth: 1320 }}>
    <SideHode kicker={kicker} title="Plan"
      actions={<>
        <KnappLenke variant="secondary" icon={MessageSquare} href="/portal/coach/melding/ny">Be coach endre</KnappLenke>
        <KnappLenke variant={helTom ? "secondary" : "primary"} icon={Pencil} href="/portal/planlegge/workbench">Rediger</KnappLenke>
      </>} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ flex: mob ? "1 1 100%" : "0 1 auto", minWidth: 0 }}>
        <SegmentertValg label="Nivå" value={zoom} options={PLAN_ZOOM.map((z) => ({ id: z, label: ZOOM_NAVN[z] }))} onChange={(z) => gaa(z, dato)} />
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", flex: "1 1 auto", minWidth: 0 }}>
        <IkonKnapp icon={ChevronLeft} name="chevron-left" aria-label="Forrige" onClick={() => gaa(zoom, flytt(zoom, dato, -1))} />
        <span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)", minWidth: 0, flex: "0 1 auto", padding: "0 4px", ...ellipsis }}>{label}</span>
        <IkonKnapp icon={ChevronRight} name="chevron-right" aria-label="Neste" onClick={() => gaa(zoom, flytt(zoom, dato, 1))} />
        <span style={{ flex: 1 }} />
        <IkonKnapp icon={CircleHelp} name="circle-help" aria-label={`Hjelp · ${ZOOM_NAVN[zoom]}`} onClick={() => setHjelp(true)} />
      </div>
    </div>
    <div role="group" aria-label="Lag i planen" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {LAG_VALG.map((l) => <Valgpille key={l.id} valgt={lag[l.id]} onClick={() => setLag((x) => ({ ...x, [l.id]: !x[l.id] }))}>{l.label}</Valgpille>)}
      <KnappLenke variant="ghost" size="sm" icon={CalendarDays} href="/portal/kalender/opptatt">Egne avtaler</KnappLenke>
    </div>

    {helTom && zoom !== "aar"
      ? <TomTilstand icon={Route} title="Ingen årsplan ennå" text="Planbyggeren tar deg gjennom sesong, turneringer, perioder og treningsplan. Du kan også legge inn økter selv i Workbench."
        actions={<><KnappLenke icon={Route} href="/portal/planlegge/bygger">Lag årsplan</KnappLenke><KnappLenke variant="secondary" icon={ListChecks} href="/portal/planlegge/bygger">Velg treningsplan</KnappLenke></>} />
      : zoom === "aar" ? <Aarsvisning data={data} mob={mob} onPeriode={(d) => gaa("maaned", d)} />
        : zoom === "maaned" ? <Maanedsrutenett aar={aar} maaned={maanedIndeks(dato)} s={s} iDag={iDag} mob={mob} onDag={(d) => gaa("dag", d)} />
          : zoom === "dag" ? <Tidsrutenett dager={[dato]} s={s} iDag={iDag} naaMin={naaMin} px={48} onOpen={(x) => "akse" in x ? setAapen({ okt: x }) : aapneHeldag(x)} />
            : ukeTom ? <TomTilstand icon={CalendarRange} title={`Uke ${uke} er ikke planlagt`} text="Legg inn økter i Workbench, eller kopier forrige uke."
              actions={<KnappLenke icon={Pencil} href="/portal/planlegge/workbench">Rediger</KnappLenke>} />
              : rutenett ? <Tidsrutenett dager={ukeDatoer(mandag)} s={s} iDag={iDag} naaMin={naaMin} onOpen={(x) => "akse" in x ? setAapen({ okt: x }) : aapneHeldag(x)} />
                : <UkeListe mandag={mandag} s={s} iDag={iDag} onOpen={(x) => "akse" in x ? setAapen({ okt: x }) : aapneHeldag(x)} onDag={(d) => gaa("dag", d)} />}

    {zoom !== "aar" && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {AKSER.map((a) => <span key={a} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 4, height: 14, background: `var(--axis-${a})` }} /><Meta>{a.toUpperCase()}</Meta></span>)}
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 14, height: 14, borderRadius: 3, background: HATCH, border: "1px dashed var(--border-strong)" }} /><Meta>OPPTATT</Meta></span>
    </div>}

    {data.fysiskePlaner && <section aria-label="Fysiske planer" className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
      <span className="kicker">Fysiske planer</span>
      {data.fysiskePlaner.length === 0
        ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Du har ingen fysisk plan ennå. Fysiske økter legges inn i Workbench, eller be coachen om en plan.</p>
        : data.fysiskePlaner.map((p) => <div key={p.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 44, borderTop: "1px solid var(--border-hairline)" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{p.navn}</span>
            <Meta>{p.uker} UKER · {p.okter} ØKTER · UKE {p.ukeNaa} AV {p.uker}</Meta>
          </span>
          <StatusPille tone={p.status === "ACTIVE" ? "ok" : "neutral"}>{p.status === "ACTIVE" ? "Aktiv" : p.status === "DRAFT" ? "Utkast" : "Arkivert"}</StatusPille>
        </div>)}
    </section>}

    {aapen?.okt && <OktArk o={aapen.okt} krasj={krasjMed(aapen.okt, data.opptatt)} onClose={() => setAapen(null)} />}
    {aapen?.heldag && <HeldagArk a={aapen.heldag} onClose={() => setAapen(null)} />}
    <Ark open={hjelp} onClose={() => setHjelp(false)} kicker={`Hjelp · ${ZOOM_NAVN[zoom]}`} title={HJELP[zoom][0]}
      footer={<Knapp variant="secondary" fullWidth onClick={() => setHjelp(false)}>Lukk</Knapp>}>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{HJELP[zoom][1]}</p>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}><strong>{HJELP.rediger[0]}.</strong> {HJELP.rediger[1]}</p>
    </Ark>
  </div>;
}

