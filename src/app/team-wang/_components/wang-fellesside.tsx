"use client";

// WANG Treningsplattform — Fellesside for golfgruppa (elever + foreldre).
// Portert fra Claude Design-skjermen «WANG Toppidrett Fredrikstad Golf v2».
// «Nå»-avhengig innhold beregnes Oslo-korrekt klient-side (hydreringstrygt via
// useSyncExternalStore), klampet til sesongspennet — deterministisk på server.

import { useState, useSyncExternalStore } from "react";

import {
  COMPS,
  MONTH_ORDER,
  MON_SHORT,
  PERIODS,
  PERIOD_COL,
  SESSIONS,
  SESSION_BY_ID,
  SPAN_START_ISO,
  TIMELINE_MARKS,
  TIMELINE_SEGS,
  TOTAL_WEEKS,
  byggHandlinger,
  daysLabel,
  daysUntil,
  fmtComp,
  iso,
  klampTilSesong,
  monthInfo,
  monthPk,
  pct,
  periodKey,
  rangeLabel,
  seasonWeek,
  weekStartOf,
  type Okt,
} from "../_data/wang-plan";
import type { WangLiveData } from "../_data/hent-wang-gruppe";
import {
  type LivePeriode,
  byggLivePerioder,
  liveMonthInfo,
  monthPkLive,
  periodeFarge,
  periodeForDato,
  pctFraSpenn,
  spennFraPerioder,
  tidslinjeMerker,
  tidslinjeSegs,
  turneringerFraHendelser,
} from "../_data/live-sesong";
import { Arshjul } from "./arshjul";
import { FaneForeldre } from "./fane-foreldre";
import { FaneKalender } from "./fane-kalender";
import { FaneSamlinger } from "./fane-samlinger";
import { FaneSkole } from "./fane-skole";
import { AgencyOsHendelser, GruppeRoster } from "./live-seksjoner";
import { HeroCard, IconChip, Tabs, navPillStyle } from "./primitiver";
import { OktDetalj } from "./okt-detalj";

export type Fane = "oversikt" | "plan" | "skole" | "foreldre";

const NAV: [Fane, string][] = [
  ["oversikt", "Oversikt"],
  ["plan", "Plan"],
  ["skole", "Skole"],
  ["foreldre", "Foreldre"],
];

// ---- Oslo-korrekt «i dag», klampet til sesongen (hydreringstrygt) ---------
function osloIdagIso(): string {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  return klampTilSesong(s);
}
const tomAbonnement = () => () => {};
let naaCache: string | null = null;
function klientNaa(): string {
  naaCache ??= osloIdagIso();
  return naaCache;
}

export function WangFellesside({ startFane, live = null }: { startFane: Fane; live?: WangLiveData | null }) {
  const naaIso = useSyncExternalStore(tomAbonnement, klientNaa, () => SPAN_START_ISO);
  const naa = new Date(naaIso + "T12:00:00");

  const [fane, setFane] = useState<Fane>(startFane);
  const [detaljId, setDetaljId] = useState<string | null>(null);
  const [planMain, setPlanMain] = useState<"Sesong" | "Kalender" | "Samlinger">("Sesong");
  const [planSub, setPlanSub] = useState<"Årshjul" | "Tidslinje">("Årshjul");
  const [selMonth, setSelMonth] = useState<string>(`${naa.getFullYear()}-${naa.getMonth()}`);
  const [weekOffset, setWeekOffset] = useState(0);

  const detalj: Okt | null = detaljId ? SESSION_BY_ID[detaljId] ?? null : null;
  const detaljIdx = detalj ? SESSIONS.findIndex((s) => s.id === detalj.id) : -1;
  const forrigeOkt = detaljIdx > 0 ? SESSIONS[detaljIdx - 1] : null;
  const nesteOkt = detaljIdx >= 0 && detaljIdx < SESSIONS.length - 1 ? SESSIONS[detaljIdx + 1] : null;
  const aapne = (id: string) => {
    setDetaljId(id);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--surface-card)", boxShadow: "var(--shadow-card-sm)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px clamp(16px,4vw,40px) 14px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statisk SVG-merke, ingen optimalisering nødvendig */}
          <img src="/team-wang/wang-logo-horizontal.svg" alt="WANG Toppidrett" style={{ height: 42, display: "block" }} />
          <div style={{ width: 1, height: 36, background: "var(--border-subtle)", flexShrink: 0 }} className="wang-skjul-mobil" />
          <div style={{ minWidth: 0, flex: 1 }} className="wang-skjul-mobil">
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.2 }}>Toppidrett Fredrikstad</div>
            <div className="t-label" style={{ color: "var(--text-secondary)", marginTop: 3, fontWeight: 600 }}>Golf · Fellesside for elever og foreldre</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 13px", borderRadius: 999, background: "var(--tint-teal)", color: "var(--wang-teal-text)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5, whiteSpace: "nowrap", flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--wang-mint)" }} />Sesong 2026–2027
          </span>
        </div>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px clamp(16px,4vw,40px)", boxSizing: "border-box", display: "flex", gap: 8, overflowX: "auto" }}>
          {NAV.map(([key, label]) => (
            <button
              key={key}
              className="wang-pressable"
              onClick={() => {
                setFane(key);
                setDetaljId(null);
              }}
              style={navPillStyle(!detalj && fane === key, true)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(20px,4vw,36px) clamp(16px,4vw,40px) 72px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22 }}>
        {detalj ? (
          <OktDetalj
            okt={detalj}
            naaIso={naaIso}
            onBack={() => setDetaljId(null)}
            onPrev={forrigeOkt ? () => aapne(forrigeOkt.id) : undefined}
            onNext={nesteOkt ? () => aapne(nesteOkt.id) : undefined}
            forrigeLabel={forrigeOkt?.short}
            nesteLabel={nesteOkt?.short}
          />
        ) : fane === "oversikt" ? (
          <Oversikt naaIso={naaIso} naa={naa} weekOffset={weekOffset} setWeekOffset={setWeekOffset} onOpen={aapne} goTo={(f) => { setFane(f); setDetaljId(null); }} setPlanMain={setPlanMain} live={live} />
        ) : fane === "plan" ? (
          <Plan
            naaIso={naaIso}
            planMain={planMain}
            setPlanMain={setPlanMain}
            planSub={planSub}
            setPlanSub={setPlanSub}
            selMonth={selMonth}
            setSelMonth={setSelMonth}
            onOpen={aapne}
            live={live}
          />
        ) : fane === "skole" ? (
          <FaneSkole live={live} />
        ) : (
          <FaneForeldre live={live} />
        )}
      </main>
    </div>
  );
}

// ============ OVERSIKT ============
function Oversikt({
  naaIso,
  naa,
  weekOffset,
  setWeekOffset,
  onOpen,
  goTo,
  setPlanMain,
  live,
}: {
  naaIso: string;
  naa: Date;
  weekOffset: number;
  setWeekOffset: (fn: (n: number) => number) => void;
  onOpen: (id: string) => void;
  goTo: (f: Fane) => void;
  setPlanMain: (v: "Sesong" | "Kalender" | "Samlinger") => void;
  live: WangLiveData | null;
}) {
  const neste = SESSIONS.find((s) => s.iso >= naaIso) ?? SESSIONS[SESSIONS.length - 1];
  const actions = byggHandlinger(naaIso);
  const uke = seasonWeek(naaIso);

  const livePerioder = live && live.perioder.length > 0 ? byggLivePerioder(live.perioder) : null;
  const periode = livePerioder
    ? (periodeForDato(livePerioder, naaIso) ?? livePerioder[0])
    : PERIODS.find((p) => p.key === periodKey(naa))!;
  const ukerIgjen = Math.max(1, Math.round((new Date(periode.end).getTime() - naa.getTime()) / (7 * 864e5)));

  const liveTurneringer = live ? turneringerFraHendelser(live.hendelser) : [];

  const ws = weekStartOf(naa);
  ws.setDate(ws.getDate() + weekOffset * 7);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);
  const wsIso = iso(ws);
  const weIso = iso(we);
  const ukeOkter = SESSIONS.filter((s) => s.iso >= wsIso && s.iso <= weIso);

  const cw0 = weekStartOf(naa);
  const cw1 = new Date(cw0);
  cw1.setDate(cw1.getDate() + 6);
  const denneUka = SESSIONS.filter((s) => s.iso >= iso(cw0) && s.iso <= iso(cw1));

  const nesteFrist = actions[0];
  const turneringVisning: { iso: string; name: string; place: string }[] = live
    ? liveTurneringer.map((c) => ({ iso: c.startIso, name: c.navn, place: c.sted ?? "Sted ikke oppgitt" }))
    : COMPS;
  const nesteComp = turneringVisning.find((c) => c.iso >= naaIso);
  const kommendeComps = turneringVisning.filter((c) => c.iso >= naaIso).slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <HeroCard label={`Neste økt · ${neste.dateLabel}`} title={neste.title}>
        <p style={{ margin: "0 0 16px", fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.9)", maxWidth: 660 }}>{neste.goal}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 34, padding: "0 14px", borderRadius: 999, background: "rgba(73,202,159,0.18)", color: "var(--wang-mint)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--wang-mint)" }} />{neste.timeLabel}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "var(--white)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>{neste.locName}</span>
          <span style={{ display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "var(--white)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>{neste.periodName} · uke {uke} av {TOTAL_WEEKS}</span>
          <button onClick={() => onOpen(neste.id)} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", height: 34, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", background: "var(--white)", color: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13 }}>Se full økt →</button>
        </div>
      </HeroCard>

      {actions.length > 0 ? (
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 2px 12px" }}>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Krever handling</div>
            <span className="wang-num" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, height: 24, padding: "0 7px", borderRadius: 999, background: "var(--tint-orange)", color: "var(--cat-orange)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 12 }}>{actions.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.slice(0, 3).map((a) => (
              <div key={a.iso + a.title} className="wang-card wang-pressable" onClick={() => { goTo("plan"); if (a.fane === "samlinger") setPlanMain("Samlinger"); }} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <IconChip icon={a.icon} color="orange" size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{a.title}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{a.sub}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span className="wang-num" style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 999, background: "var(--tint-orange)", color: "var(--cat-orange)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>{daysLabel(daysUntil(a.iso, naaIso))}</span>
                  <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{fmtComp(a.iso)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <AgencyOsHendelser live={live} naaIso={naaIso} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        <StatKort label="Aktiv periode" prikk={periode.color}>
          <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{periode.name}</span>
          <div className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>{ukerIgjen} uker igjen · uke {uke} av {TOTAL_WEEKS}</div>
        </StatKort>
        <StatKort label="Denne uka">
          <div className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginTop: 6 }}>{denneUka.filter((s) => s.iso < naaIso).length} av {denneUka.length}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>økter gjennomført</div>
        </StatKort>
        <StatKort label="Neste frist">
          <div className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginTop: 6 }}>{nesteFrist ? daysLabel(daysUntil(nesteFrist.iso, naaIso)) : "—"}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{nesteFrist ? `${nesteFrist.short} · ${fmtComp(nesteFrist.iso)}` : "Ingen kommende frister"}</div>
        </StatKort>
        <StatKort label="Neste turnering">
          <div className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginTop: 6 }}>{nesteComp ? daysLabel(daysUntil(nesteComp.iso, naaIso)) : "—"}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{nesteComp ? `${nesteComp.name} · ${fmtComp(nesteComp.iso)}` : "Ingen igjen denne sesongen"}</div>
        </StatKort>
      </div>

      {/* Ukens økter */}
      <section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "2px 2px 12px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>{weekOffset === 0 ? "Denne uka" : `Uke ${rangeLabel(ws, we)}`}</div>
            <div className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{rangeLabel(ws, we)} · {ukeOkter.filter((s) => s.iso < naaIso).length} av {ukeOkter.length} økter gjennomført</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <RundKnapp label="Forrige uke" onClick={() => setWeekOffset((n) => n - 1)}>←</RundKnapp>
            {weekOffset !== 0 ? (
              <button onClick={() => setWeekOffset(() => 0)} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", background: "var(--tint-teal)", color: "var(--wang-teal-text)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5 }}>Til denne uka</button>
            ) : null}
            <RundKnapp label="Neste uke" onClick={() => setWeekOffset((n) => n + 1)}>→</RundKnapp>
          </div>
        </div>
        {ukeOkter.length === 0 ? (
          <div className="wang-card" style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
            <IconChip icon="moon" color="blue" size={48} />
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15.5, color: "var(--text-primary)" }}>Ingen fellesøkter denne uka</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ukeOkter.map((s) => (
              <div key={s.id} className="wang-card wang-pressable" onClick={() => onOpen(s.id)} style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <IconChip icon={s.chipIcon} color={s.chipColor} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5, color: "var(--text-secondary)", textTransform: "capitalize" }}>{s.dateLabel}</span>
                    <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>· {s.timeLabel}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.typeLabel} · {s.locShort}</div>
                </div>
                {s.iso < naaIso ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: 999, background: "var(--tint-teal)", color: "var(--wang-teal-text)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap", flexShrink: 0 }}>Gjennomført</span>
                ) : s.id === neste.id ? (
                  <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, background: "var(--wang-navy)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 10.5, whiteSpace: "nowrap", flexShrink: 0 }}>Neste</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Kommende turneringer */}
      {kommendeComps.length > 0 ? (
        <section>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, margin: "2px 2px 12px", color: "var(--text-primary)" }}>Kommende turneringer</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {kommendeComps.map((c) => (
              <div key={c.iso + c.name} className="wang-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <IconChip icon="trophy" color="orange" size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{c.place}</div>
                </div>
                <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{fmtComp(c.iso)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

// ============ PLAN ============
function Plan({
  naaIso,
  planMain,
  setPlanMain,
  planSub,
  setPlanSub,
  selMonth,
  setSelMonth,
  onOpen,
  live,
}: {
  naaIso: string;
  planMain: "Sesong" | "Kalender" | "Samlinger";
  setPlanMain: (v: "Sesong" | "Kalender" | "Samlinger") => void;
  planSub: "Årshjul" | "Tidslinje";
  setPlanSub: (v: "Årshjul" | "Tidslinje") => void;
  selMonth: string;
  setSelMonth: (v: string) => void;
  onOpen: (id: string) => void;
  live: WangLiveData | null;
}) {
  const [selY, selM] = selMonth.split("-").map(Number);
  const [kalenderHopp, setKalenderHopp] = useState<string | null>(null);
  const hoppTilKalenderDag = (iso: string) => {
    setPlanMain("Kalender");
    setKalenderHopp(iso);
  };

  const livePerioder = live && live.perioder.length > 0 ? byggLivePerioder(live.perioder) : null;
  const isLive = livePerioder !== null;
  const spenn = livePerioder ? spennFraPerioder(livePerioder) : null;
  const liveTurneringer = live ? turneringerFraHendelser(live.hendelser) : [];

  const md = isLive
    ? liveMonthInfo({
        m: selM,
        y: selY,
        naaIso,
        perioder: livePerioder!,
        startIso: spenn!.startIso,
        endIso: spenn!.endIso,
        hendelser: live!.hendelser,
        turneringer: liveTurneringer,
        skoleDager: live!.skoleDager,
        fasteOkter: live!.fasteOkter,
      })
    : monthInfo(selM, selY, naaIso);

  const nowLeft = isLive
    ? `${Math.max(0, Math.min(100, pctFraSpenn(naaIso, spenn!.startIso, spenn!.endIso)))}%`
    : `${Math.max(0, Math.min(100, pct(naaIso)))}%`;

  const timelineSegs = isLive ? tidslinjeSegs(livePerioder!, spenn!.startIso, spenn!.endIso) : TIMELINE_SEGS;
  const timelineMarks = isLive ? tidslinjeMerker(liveTurneringer, spenn!.startIso, spenn!.endIso) : TIMELINE_MARKS;
  const periodeFargeKart: Record<string, string> = isLive ? periodeFarge(livePerioder!) : PERIOD_COL;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>Plan 2026–2027</h1>
        <Tabs options={["Sesong", "Kalender", "Samlinger"]} value={planMain} onChange={(v) => setPlanMain(v as typeof planMain)} />
      </div>

      {planMain === "Sesong" ? (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Tabs options={["Årshjul", "Tidslinje"]} value={planSub} onChange={(v) => setPlanSub(v as typeof planSub)} />
          </div>

          {planSub === "Årshjul" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 22, alignItems: "stretch" }}>
              <section className="wang-card" style={{ padding: "26px 24px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Årshjul 2026–2027</div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>Trykk på en måned</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
                  <Arshjul
                    selMonth={selMonth}
                    naaIso={naaIso}
                    onSelect={(m, y) => setSelMonth(`${y}-${m}`)}
                    perioder={livePerioder ?? undefined}
                    turneringer={isLive ? liveTurneringer : undefined}
                    liveInfo={isLive ? (md as ReturnType<typeof liveMonthInfo>) : undefined}
                  />
                </div>
                <PeriodeLegende perioder={livePerioder} />
              </section>
              <MaanedDetalj md={md} onOpenDag={hoppTilKalenderDag} />
            </div>
          ) : (
            <>
              <section className="wang-card" style={{ padding: 26 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, marginBottom: 24, color: "var(--text-primary)" }}>Sesongtidslinje 2026–2027</div>
                <div style={{ position: "relative", paddingTop: 26, paddingBottom: 34 }}>
                  <div style={{ display: "flex", height: 44, borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-card-sm)" }}>
                    {timelineSegs.map((g, i) => (
                      <div key={i} style={{ flex: `${g.w} 0 0%`, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
                        <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 6px" }}>{g.short}</span>
                      </div>
                    ))}
                  </div>
                  {/* Turneringsmerker UNDER baren (aldri oppå periodenavnet) — sikksakk i to rader så tette datoer ikke overlapper hverandre. */}
                  {timelineMarks.map((m, i) => (
                    <div key={i} style={{ position: "absolute", top: i % 2 === 0 ? 76 : 92, left: m.left, transform: "translateX(-50%)", pointerEvents: "none" }}>
                      <span style={{ display: "block", width: 9, height: 9, borderRadius: 999, background: "var(--cat-orange)", border: "2px solid var(--surface-card)", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div style={{ position: "absolute", top: 0, left: nowLeft, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 9px", borderRadius: 999, background: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 10.5, color: "var(--white)", whiteSpace: "nowrap", marginBottom: 3 }}>Du er her</span>
                    <span style={{ width: 2.5, height: 50, background: "var(--wang-navy)", borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 5, marginTop: 16 }}>
                  {MONTH_ORDER.map((mo) => {
                    const key = `${mo[1]}-${mo[0]}`;
                    const pk = isLive ? monthPkLive(mo[0], mo[1], livePerioder!) : monthPk(mo[0], mo[1]);
                    const isSel = key === selMonth;
                    return (
                      <button key={key} onClick={() => setSelMonth(key)} className="wang-pressable" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 2px 6px", borderRadius: 12, border: "none", cursor: "pointer", background: isSel ? "var(--wang-navy)" : "var(--neutral-50)", color: isSel ? "var(--white)" : "var(--text-secondary)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: isSel ? "var(--white)" : (periodeFargeKart[pk] ?? "var(--neutral-300)") }} />
                        {MON_SHORT[mo[0]].charAt(0).toUpperCase() + MON_SHORT[mo[0]].slice(1)}
                      </button>
                    );
                  })}
                </div>
              </section>
              <MaanedDetalj md={md} onOpenDag={hoppTilKalenderDag} />
            </>
          )}
        </>
      ) : planMain === "Kalender" ? (
        <FaneKalender key={kalenderHopp ?? "std"} onOpen={onOpen} naaIso={naaIso} live={live} startValgtDag={kalenderHopp} />
      ) : (
        <FaneSamlinger />
      )}
    </div>
  );
}

// ---- Delkomponenter ----------------------------------------------------
function StatKort({ label, prikk, children }: { label: string; prikk?: string; children: React.ReactNode }) {
  return (
    <div className="wang-card" style={{ padding: 18 }}>
      <div className="t-label" style={{ color: "var(--text-secondary)" }}>{label}</div>
      {prikk ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: prikk, flexShrink: 0 }} />
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function RundKnapp({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 999, border: "none", cursor: "pointer", background: "var(--neutral-50)", color: "var(--text-primary)", fontSize: 15 }}>
      {children}
    </button>
  );
}

function PeriodeLegende({ perioder }: { perioder: LivePeriode[] | null }) {
  const liste = perioder ?? PERIODS;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
      {liste.map((p) => (
        <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: p.color }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>{p.name}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--cat-orange)", boxShadow: "0 0 0 2px var(--surface-card)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>Turnering</span>
      </div>
    </div>
  );
}

function MaanedDetalj({
  md,
  onOpenDag,
}: {
  md: ReturnType<typeof monthInfo> | ReturnType<typeof liveMonthInfo>;
  onOpenDag: (iso: string) => void;
}) {
  return (
    <section className="wang-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="t-label" style={{ color: "var(--text-secondary)" }}>Måned i sesongen</div>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 23, color: "var(--text-primary)", marginTop: 3 }}>{md.name} {md.year}</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 32, padding: "0 14px", borderRadius: 999, background: "var(--neutral-50)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: md.periodColor }} />{md.periodName}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <TallRute value={md.sessionCount} label="Økter" bg="var(--neutral-50)" fg="var(--text-primary)" lblFg="var(--text-secondary)" />
        <TallRute value={md.compCount} label="Turneringer" bg="var(--tint-orange)" fg="var(--cat-orange)" lblFg="var(--cat-orange)" />
        <TallRute value={md.testCount} label="Tester" bg="var(--tint-purple)" fg="var(--cat-purple)" lblFg="var(--cat-purple)" />
      </div>
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>{md.focus}</p>
      {md.hasEvents ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="t-label" style={{ color: "var(--text-secondary)" }}>Nøkkelhendelser</div>
          {md.events.map((e, i) => (
            <div
              key={i}
              onClick={() => onOpenDag(e.iso)}
              className="wang-pressable"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 14, background: "var(--neutral-50)", cursor: "pointer" }}
            >
              <IconChip icon={e.icon} color={e.color} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>{e.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{e.sub}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{e.dateShort}</span>
                <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 10.5, color: "var(--wang-teal-text)", whiteSpace: "nowrap" }}>Se i kalender →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, background: "var(--neutral-50)" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Ingen turneringer, tester eller samlinger denne måneden.</span>
        </div>
      )}
    </section>
  );
}

function TallRute({ value, label, bg, fg, lblFg }: { value: number; label: string; bg: string; fg: string; lblFg: string }) {
  return (
    <div style={{ padding: "14px 12px", borderRadius: 16, background: bg }}>
      <div className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 24, color: fg }}>{value}</div>
      <div className="t-label" style={{ color: lblFg, marginTop: 2 }}>{label}</div>
    </div>
  );
}
