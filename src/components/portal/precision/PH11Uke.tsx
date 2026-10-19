"use client";

/**
 * PH-11 Workbench · Uke og PH-11-GJENTA — spillerens uke i nytt design (pakke 3, godkjent 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, mal «uke». Stil: playerhq-ny.css + playerhq-ny-uke.css.
 * Erstatter Ukeverkstedet (WorkbenchSamlet) for spilleren (§SPILLERENS WORKBENCH FÅR NIVÅENE).
 * Coachens Workbench (AG-11 og de fire flatene) er urørt.
 *
 * Skrivesiden er den samme som før: useUkeMotor (wb-actions). Arkene for økt, ny økt, publisering,
 * ukeplan og øvelser er AG-11-arkene, så ingen funksjon forsvinner.
 *
 * Avvik fra tegningen:
 *   - «Fordelt» er ukeplanens timer (WeekPlan.plannedHours*). Har uka ingen, brukes periodens minutter
 *     per akse (vanlig eller lett uke). Mangler begge, står «—».
 *   - Øvelsesbanken er dagens øvelsesvelger (søk i alle øvelser, mest brukt først, «Ny øvelse», 16.10).
 *   - Gjenta lager kopier av økta som utkast i samme serie; konkurransedager hentes fra turneringsplanene.
 *   - Verktøy tegningen ikke viser (publiser, foreslå uke, ukeplan, ny økt med detaljer, volum, live og
 *     egen kalender) ligger nederst i sidefeltet.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, GripVertical, ListChecks, Play, Plus, Repeat, Send } from "lucide-react";
import { AKSE_NAVN, type Akse } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { AKSER, akseFra } from "@/components/precision/pa-workbench";
import { useUkeMotor } from "@/components/workbench/useUkeMotor";
import { Ukeforslag } from "@/components/workbench/Ukeforslag";
import { lesKildeDataTransfer } from "@/components/workbench/wb-drag";
import { NyOvelseArk, OvelseVelger } from "@/components/workbench/OvelseVelger";
import { NyOktArk, OktArk, OvelseArk, PubliserArk, UkeplanArk, klokke, type NyOktUtkast } from "@/components/admin/precision/AG11Ark";
import { PH11Nivaer } from "@/components/portal/precision/PH11Nivaer";
import { addDays, isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { Drill, LockedBlock, PlanningGoalSummary, PyramidArea, SourceItem, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WorkbenchFysTurneringData } from "@/lib/workbench/fys-turnering-data";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { flyttPlanUke, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { beregnGjentaDatoer, ukedag, type GjentaModus } from "@/lib/workbench/gjenta";
import "@/styles/precision-a9.css";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-uke.css";

export type PH11UkePeriode = {
  navn: string;
  /** Uke nr. i perioden (1-basert) og antall uker. */
  ukeIPerioden: number;
  antallUker: number;
  /** YYYY-MM-DD, siste dag i perioden. */
  slutt: string;
  /** Periodens minutter per akse for denne uka (vanlig eller lett). Null = ikke satt. */
  fordelt: Partial<Record<PyramidArea, number>> | null;
};

export type PH11UkeProps = {
  playerId: string;
  spillerNavn: string;
  uke: WeekViewModel;
  kilder: SourceItem[];
  goals: PlanningGoalSummary[];
  fys: WorkbenchFysTurneringData;
  referanse: PlanReferanse;
  periode: PH11UkePeriode | null;
  /** YYYY-MM-DD i Oslo. */
  idag: string;
  /** Minutter siden midnatt i Oslo, for nå-linja. */
  naMinutt: number;
};

const H = 48; // px per time i kalenderen
const DAGKORT = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const DAGLANG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const PLAN_KEY: Record<PyramidArea, "plannedHoursFys" | "plannedHoursTek" | "plannedHoursSlag" | "plannedHoursSpill" | "plannedHoursTurn"> = {
  FYS: "plannedHoursFys", TEK: "plannedHoursTek", SLAG: "plannedHoursSlag", SPILL: "plannedHoursSpill", TURN: "plannedHoursTurn",
};
const MND = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", month: "long" });
const KORTDATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** «1 t 30 min», «3 t», «45 min», 0 = «0». */
export function tid(min: number): string {
  if (min <= 0) return "0";
  const t = Math.floor(min / 60), m = Math.round(min % 60);
  return t === 0 ? `${m} min` : m === 0 ? `${t} t` : `${t} t ${m} min`;
}
/** «5.–11. oktober» eller «28. september–4. oktober». */
export function ukeSpenn(mandag: string): string {
  const a = utc(mandag), b = utc(addDays(mandag, 6));
  return a.getUTCMonth() === b.getUTCMonth()
    ? `${a.getUTCDate()}.–${b.getUTCDate()}. ${MND.format(b)}`
    : `${a.getUTCDate()}. ${MND.format(a)}–${b.getUTCDate()}. ${MND.format(b)}`;
}
/** Heldags turnering vises i heldagsraden, ikke som opptatt tid i timene. */
const iTimene = (b: LockedBlock) => !(b.kind === "TURNERING" && b.durationMinutes >= 12 * 60);
const pen = (iso: string) => `${DAGKORT[ukedag(iso)]}. ${KORTDATO.format(utc(iso))}`;

type Dra = { kind: "akse"; akse: Akse } | { kind: "okt"; session: WorkbenchSession };
type Over = { d: number; minutt: number };

export function PH11Uke({ playerId, spillerNavn, uke, kilder, goals, fys, referanse, periode, idag, naMinutt }: PH11UkeProps) {
  const router = useRouter();
  const motor = useUkeMotor({ playerId, uke });
  const { week, travel } = motor;
  const ukeNr = isoWeekNumber(week.weekStart);
  const [dag, setDag] = useState(() => Math.max(0, week.days.findIndex((d) => d.date === idag)));
  const [arm, setArm] = useState<Akse | null>(null);
  const [armKilde, setArmKilde] = useState<SourceItem | null>(null);
  const [drag, setDrag] = useState<(Dra & { x: number; y: number; over: Over | null }) | null>(null);
  const nettoppDratt = useRef(false);
  const [arkOkt, setArkOkt] = useState<string | null>(null);
  const [gjentaId, setGjentaId] = useState<string | null>(null);
  const [nyOkt, setNyOkt] = useState<NyOktUtkast | null>(null);
  const [publiser, setPubliser] = useState(false);
  const [ukeplan, setUkeplan] = useState(false);
  const [velgerQ, setVelgerQ] = useState("");
  const [velgerAkse, setVelgerAkse] = useState<PyramidArea | null>(null);
  const [velgerVersjon, setVelgerVersjon] = useState(0);
  const [nyOvelse, setNyOvelse] = useState<{ navn: string; okt: WorkbenchSession | null } | null>(null);
  const [ovelseFor, setOvelseFor] = useState<{ okt: WorkbenchSession; drill: Drill } | null>(null);

  const alle = motor.alleOkter;
  const tellende = alle.filter((s) => s.status !== "CANCELLED" && !s.hiddenByPlayer);
  const kontekst: PlanReferanse = { ...referanse, uke: week.weekStart };
  const url = (v: Parameters<typeof workbenchUrl>[1], ref: PlanReferanse = {}) => workbenchUrl(playerId, v, ref, "player", kontekst);

  /* ---------- Lagt inn mot fordelt ---------- */
  const akser = AKSER.map((a) => {
    const p = AKSE_NAVN[a] as PyramidArea;
    const plan = week.weekPlan?.[PLAN_KEY[p]];
    const fordelt = plan != null ? Math.round(plan * 60) : periode?.fordelt?.[p] ?? null;
    const lagt = tellende.filter((s) => s.pyramid === p).reduce((n, s) => n + s.durationMinutes, 0);
    return { a, p, fordelt, lagt };
  });
  const harFordelt = akser.some((x) => x.fordelt != null);
  const sumFordelt = akser.reduce((n, x) => n + (x.fordelt ?? 0), 0);
  const sumLagt = akser.reduce((n, x) => n + x.lagt, 0);
  const viste = akser.filter((x) => (x.fordelt ?? 0) > 0 || x.lagt > 0);
  const maks = Math.max(1, ...viste.map((x) => Math.max(x.fordelt ?? 0, x.lagt)));

  /* ---------- Kalenderens timer ---------- */
  const [fra, til] = useMemo(() => {
    let f = 7, t = 22;
    for (const d of week.days) {
      for (const s of d.sessions) { f = Math.min(f, Math.floor(s.startMinute / 60)); t = Math.max(t, Math.ceil((s.startMinute + s.durationMinutes) / 60)); }
      for (const b of d.lockedBlocks.filter(iTimene)) { f = Math.min(f, Math.floor(b.startMinute / 60)); t = Math.max(t, Math.ceil((b.startMinute + b.durationMinutes) / 60)); }
    }
    return [Math.max(0, f), Math.min(24, t)];
  }, [week]);
  const timer = Array.from({ length: til - fra }, (_, i) => fra + i);

  /* ---------- Konkurransedager (heldag og Gjenta) ---------- */
  const konkurranser = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of fys.tournamentPlans) {
      if (!t.startDate) continue;
      for (let d = t.startDate; d <= (t.endDate || t.startDate); d = addDays(d, 1)) m.set(d, t.title);
    }
    return m;
  }, [fys.tournamentPlans]);

  /* ---------- Legg inn og flytt ---------- */
  const leggInn = (d: number, minutt: number, akse: Akse | null, kilde: SourceItem | null) => {
    const dato = week.days[d]?.date;
    if (!dato) return;
    setArm(null); setArmKilde(null); setDag(d);
    if (kilde) { motor.fraKilde(dato, minutt, kilde.id, (id) => setGjentaId(id)); return; }
    if (!akse) return;
    const navn = AKSE_NAVN[akse];
    motor.opprett({ title: `Ny ${navn}-økt`, date: dato, startMinute: minutt, durationMinutes: 60, pyramid: navn as PyramidArea, repeatWeeks: 1 },
      (id) => { if (id) setGjentaId(id); }, true);
  };

  const minuttFra = (kol: HTMLElement, y: number) => {
    const r = kol.getBoundingClientRect();
    const m = fra * 60 + ((y - r.top) / H) * 60;
    return Math.min(til * 60 - 15, Math.max(fra * 60, Math.floor(m / 15) * 15));
  };
  const overFra = (x: number, y: number): Over | null => {
    const el = document.elementFromPoint(x, y);
    const kol = el instanceof HTMLElement ? el.closest<HTMLElement>("[data-kol]") : null;
    return kol ? { d: Number(kol.dataset.kol), minutt: minuttFra(kol, y) } : null;
  };

  function trykkNed(dra: Dra, e: React.PointerEvent) {
    if (e.button !== 0) return;
    const x0 = e.clientX, y0 = e.clientY;
    let aktiv: (Dra & { x: number; y: number; over: Over | null }) | null = null;
    const flytt = (ev: PointerEvent) => {
      if (!aktiv && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      aktiv = { ...dra, x: ev.clientX, y: ev.clientY, over: overFra(ev.clientX, ev.clientY) };
      setDrag(aktiv);
    };
    const slutt = (slipp: boolean) => () => {
      window.removeEventListener("pointermove", flytt);
      window.removeEventListener("pointerup", opp);
      window.removeEventListener("pointercancel", avbryt);
      const a = aktiv;
      setDrag(null);
      if (!a) return;
      nettoppDratt.current = true;
      window.setTimeout(() => { nettoppDratt.current = false; }, 0);
      if (!slipp || !a.over) return;
      if (dra.kind === "akse") { leggInn(a.over.d, a.over.minutt, dra.akse, null); return; }
      const s = dra.session, dato = week.days[a.over.d]?.date;
      if (!dato || (s.date === dato && s.startMinute === a.over.minutt)) return;
      motor.flytt(s.id, { newDate: dato, newStartMinute: a.over.minutt, newDurationMinutes: s.durationMinutes },
        { newDate: s.date, newStartMinute: s.startMinute, newDurationMinutes: s.durationMinutes });
    };
    const opp = slutt(true), avbryt = slutt(false);
    window.addEventListener("pointermove", flytt);
    window.addEventListener("pointerup", opp);
    window.addEventListener("pointercancel", avbryt);
  }

  const trykkAkse = (a: Akse) => { if (nettoppDratt.current) return; setArmKilde(null); setArm(arm === a ? null : a); };
  const trykkKolonne = (d: number, e: React.MouseEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget || (!arm && !armKilde)) return;
    leggInn(d, minuttFra(e.currentTarget, e.clientY), arm, armKilde);
  };
  const hjelp = arm ? `Trykk et klokkeslett for ${AKSE_NAVN[arm]}-økta.`
    : armKilde ? `Trykk et klokkeslett for «${armKilde.title}».`
      : "Dra en akse inn i kalenderen. Eller trykk aksen, så klokkeslettet.";

  /* ---------- Dagene ---------- */
  const dagSum = (i: number) => week.days[i].sessions.filter((s) => s.status !== "CANCELLED" && !s.hiddenByPlayer).reduce((n, s) => n + s.durationMinutes, 0);
  const prikker = (i: number) => [...new Set(week.days[i].sessions.map((s) => akseFra(s.pyramid)).filter((a): a is Akse => !!a))];
  const heldager = week.days.map((d) => konkurranser.get(d.date) ?? d.lockedBlocks.find((b) => !iTimene(b))?.title ?? null);
  const harHeldag = heldager.some(Boolean);

  const blokk = (s: WorkbenchSession) => {
    const a = akseFra(s.pyramid);
    const top = ((s.startMinute - fra * 60) / 60) * H;
    const hoyde = Math.max(22, (s.durationMinutes / 60) * H - 2);
    return <button key={s.id} type="button" className={`phn-blokk ${a ?? ""}`} style={{ top, height: hoyde }}
      data-dempet={s.hiddenByPlayer || s.status === "CANCELLED" || undefined} data-utkast={s.status === "DRAFT" || undefined}
      data-dras={drag?.kind === "okt" && drag.session.id === s.id || undefined}
      aria-label={`${klokke(s.startMinute)} ${s.title}${s.status === "DRAFT" ? ", utkast" : ""}${s.seriesId ? ", gjentas" : ""}`}
      onClick={() => { if (!nettoppDratt.current) setArkOkt(s.id); }}
      onPointerDown={(e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") trykkNed({ kind: "okt", session: s }, e); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const id = lesKildeDataTransfer(e); if (id) motor.drillFraKilde(s.id, id); }}>
      <b>{s.title}</b>
      <small>{klokke(s.startMinute)}–{klokke(s.startMinute + s.durationMinutes)}</small>
      {s.seriesId && <Repeat className="phn-blokk-serie" aria-hidden />}
    </button>;
  };

  const kolonne = (d: number) => {
    const dagen = week.days[d];
    const over = drag?.over?.d === d ? drag.over : null;
    return <div key={dagen.date} className="phn-ukol" data-kol={d} data-valgt={dag === d || undefined}
      data-klar={arm || armKilde ? "true" : undefined} style={{ height: timer.length * H }}
      role="group" aria-label={`${DAGLANG[d]} ${KORTDATO.format(utc(dagen.date))}`}
      onClick={(e) => trykkKolonne(d, e)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const id = lesKildeDataTransfer(e); if (id) motor.fraKilde(dagen.date, minuttFra(e.currentTarget, e.clientY), id, (ny) => setGjentaId(ny)); }}>
      {dagen.lockedBlocks.filter(iTimene).map((b) => <div key={b.id} className="phn-blokk opp" style={{ top: ((b.startMinute - fra * 60) / 60) * H, height: Math.max(22, (b.durationMinutes / 60) * H - 2) }}>
        <b>{b.title}</b><small>{klokke(b.startMinute)}–{klokke(b.startMinute + b.durationMinutes)}</small>
      </div>)}
      {dagen.sessions.map(blokk)}
      {dagen.date === idag && naMinutt >= fra * 60 && naMinutt <= til * 60 && <i className="phn-na" style={{ top: ((naMinutt - fra * 60) / 60) * H }} aria-hidden />}
      {over && <i className="phn-mal" style={{ top: ((over.minutt - fra * 60) / 60) * H, height: H }} aria-hidden />}
    </div>;
  };

  /* ---------- Sidefelt ---------- */
  const maler = kilder.filter((k) => k.kind === "TEMPLATE");
  const forrige = kilder.filter((k) => k.kind === "PREVIOUS_WEEK");
  const tek = kilder.filter((k) => k.kind === "TEK");
  const blokkFys = fys.physicalBlocks[0] ?? null;
  const nesteTurn = fys.tournamentPlans.find((t) => t.endDate >= idag) ?? null;
  const armer = (k: SourceItem) => { setArm(null); setArmKilde(armKilde?.id === k.id ? null : k); };
  const kildeKnapp = (k: SourceItem) => <button key={k.id} type="button" className="phn-kildeknapp" aria-pressed={armKilde?.id === k.id} onClick={() => armer(k)}>
    <i className={`akse-${akseFra(k.pyramid) ?? "ingen"}`} aria-hidden /><span><b>{k.title}</b><small>{k.durationMinutes ? `${k.durationMinutes} min` : k.subtitle ?? ""}</small></span><Plus className="phn-ikon" aria-hidden />
  </button>;
  const ukeMal = goals.filter((g) => g.planNivaa === "UKE" || g.planNivaa === "OKT").length;

  const gjentaOkt = gjentaId ? alle.find((s) => s.id === gjentaId) ?? null : null;
  const arkSession = arkOkt ? alle.find((s) => s.id === arkOkt) ?? null : null;

  return <div className="phn phn-uke">
    <header className="phn-topp">
      <div className="phn-topp-rad">
        <div>
          <div className="phn-dato">Workbench{periode ? ` · ${periode.navn} · uke ${periode.ukeIPerioden} av ${periode.antallUker}` : ""}</div>
          <h1 className="phn-tittel">Uke {ukeNr}</h1>
          <p className="phn-ingress">{ukeSpenn(week.weekStart)}. Dra en akse eller en øvelse inn på et klokkeslett.</p>
        </div>
        <div className="phn-knapper">
          <span className="phn-pil">
            <Link href={url("uke", { uke: flyttPlanUke(week.weekStart, -1) })} aria-label="Forrige uke"><ChevronLeft className="phn-ikon" aria-hidden /></Link>
            <Link href={url("uke", { uke: flyttPlanUke(week.weekStart, 1) })} aria-label="Neste uke"><ChevronRight className="phn-ikon" aria-hidden /></Link>
          </span>
          <Link className="phn-knapp sek" href="/portal/planlegge">Ferdig</Link>
        </div>
      </div>
      <PH11Nivaer playerId={playerId} aktiv="uke" referanse={kontekst} />
    </header>

    {motor.feil && <p className="phn-melding" role="alert">{motor.feil} <button type="button" className="phn-lenke" onClick={() => void motor.lastPaaNytt()}>Prøv igjen</button></p>}

    <div className="phn-wb">
      <div className="phn-seksjon phn-wb-hoved">
        <section className="phn-kort phn-wb-tall" aria-label="Lagt inn mot fordelt">
          <div className="phn-seksjon">
            <div className="phn-hoved"><strong>{Math.floor(sumLagt / 60)}<small>t{sumLagt % 60 ? ` ${sumLagt % 60} min` : ""}</small></strong></div>
            <p className="phn-forklar">{harFordelt ? `Lagt inn av ${tid(sumFordelt)} fordelt fra ${week.weekPlan && akser.some((x) => week.weekPlan?.[PLAN_KEY[x.p]] != null) ? "ukeplanen" : "perioden"}.` : "Lagt inn denne uka. Ingen tid er fordelt fra perioden ennå."}</p>
          </div>
          {viste.length > 0 && <div className="phn-akserader">
            {viste.map((x) => <div key={x.a} className="phn-akserad">
              <b className={`tekst-${x.a}`}>{AKSE_NAVN[x.a]}</b>
              <span className="phn-akserad-spor" role="img" aria-label={`${AKSE_NAVN[x.a]} ${tid(x.lagt)} av ${x.fordelt != null ? tid(x.fordelt) : "ikke fordelt"}`}>
                <span className={`akse-${x.a}`} style={{ width: `${(x.lagt / maks) * 100}%` }} />
                {x.fordelt != null && <em style={{ left: `calc(${(x.fordelt / maks) * 100}% - 1px)` }} />}
              </span>
              <span className="phn-akserad-v" data-over={x.fordelt != null && x.lagt > x.fordelt || undefined}>{tid(x.lagt)} av {x.fordelt != null ? tid(x.fordelt) : "—"}</span>
            </div>)}
          </div>}
        </section>

        <div className="phn-dagstripe" role="group" aria-label="Velg dag">
          {week.days.map((d, i) => <button key={d.date} type="button" aria-pressed={dag === i} onClick={() => setDag(i)}>
            {DAGKORT[i]}<strong>{utc(d.date).getUTCDate()}</strong>
            <span className="phn-prikker" aria-hidden>{prikker(i).map((a) => <i key={a} className={`akse-${a}`} />)}</span>
          </button>)}
        </div>

        <section className="phn-dra-rad" aria-label="Legg inn økt">
          <div className="phn-drakker">
            {AKSER.map((a) => <button key={a} type="button" className={`phn-dra ${a}`} aria-pressed={arm === a}
              onClick={() => trykkAkse(a)} onPointerDown={(e) => trykkNed({ kind: "akse", akse: a }, e)}>
              <GripVertical className="phn-ikon" aria-hidden />{AKSE_NAVN[a]}
            </button>)}
          </div>
          <p className="phn-kilde" aria-live="polite">{hjelp}</p>
        </section>

        <div className="phn-rutenett" style={{ ["--phn-h" as string]: `${H}px` }} data-dras={drag ? "true" : undefined}>
          <span className="phn-rut-hjorne" />
          {week.days.map((d, i) => <span key={d.date} className="phn-rut-dag" data-idag={d.date === idag || undefined} data-valgt={dag === i || undefined}>
            {DAGKORT[i]} {utc(d.date).getUTCDate()}<small>{tid(dagSum(i))}</small>
          </span>)}
          {harHeldag && <>
            <span className="phn-rut-hjorne" />
            {heldager.map((h, i) => <span key={i} className="phn-rut-heldag" data-valgt={dag === i || undefined}>{h && <span>{h}</span>}</span>)}
          </>}
          <div className="phn-tider" style={{ height: timer.length * H }} aria-hidden>
            {timer.slice(1).map((t) => <span key={t} style={{ top: (t - fra) * H }}>{String(t).padStart(2, "0")}:00</span>)}
          </div>
          {week.days.map((_, i) => kolonne(i))}
        </div>
        {alle.length === 0 && <p className="phn-forklar">Uke {ukeNr} er tom. Dra en akse inn i kalenderen, eller bruk en øktmal fra sidefeltet.</p>}
      </div>

      <aside className="phn-sidefelt" aria-label="Legg til">
        <details open>
          <summary>Øvelsesbank <small>Pyramiden først</small></summary>
          <div className="phn-inni">
            <OvelseVelger playerId={playerId} rolle="player" q={velgerQ} onQ={setVelgerQ} akse={velgerAkse} onAkse={setVelgerAkse}
              okt={null} travel={travel} oppdatert={velgerVersjon} onPlasser={armer} onLeggIOkt={() => {}}
              onNy={(navn) => setNyOvelse({ navn, okt: null })} />
          </div>
        </details>
        <details>
          <summary>Fysisk program <small>{blokkFys ? blokkFys.title : "Ingen ennå"}</small></summary>
          <div className="phn-inni">
            <p className="phn-forklar">{blokkFys ? `${KORTDATO.format(utc(blokkFys.startDate))}–${KORTDATO.format(utc(blokkFys.endDate))}${blokkFys.focus ? ` · ${blokkFys.focus}` : ""}. Hver økt kan endres etterpå.` : "Legg et fysisk program i planen. Hver økt kan endres etterpå."}</p>
            <Link className="phn-lenke" href="/portal/planlegge/workbench?pille=fys">Åpne fysisk program</Link>
          </div>
        </details>
        <details>
          <summary>Øktmaler <small>{maler.length}</small></summary>
          <div className="phn-inni">
            {maler.length === 0 && forrige.length === 0 && <p className="phn-forklar">Ingen øktmaler ennå. Lagre en økt som mal fra økta.</p>}
            {maler.map(kildeKnapp)}
            {forrige.length > 0 && <><p className="phn-kilde">Forrige uke · kopier inn</p>{forrige.map(kildeKnapp)}</>}
          </div>
        </details>
        <details>
          <summary>Turneringer <small>{nesteTurn ? `Neste ${KORTDATO.format(utc(nesteTurn.startDate))}` : "Ingen"}</small></summary>
          <div className="phn-inni">
            <p className="phn-forklar">{nesteTurn ? `${nesteTurn.title}, ${pen(nesteTurn.startDate)}. Legg inn en turnering, med reisedager.` : "Legg inn en turnering, med reisedager."}</p>
            <Link className="phn-lenke" href="/portal/planlegge/workbench?pille=turn">Åpne turneringer</Link>
          </div>
        </details>
        {tek.length > 0 && <details>
          <summary>Teknisk plan <small>{tek.length} oppgaver</small></summary>
          <div className="phn-inni">{tek.map(kildeKnapp)}</div>
        </details>}
        <Link className="phn-rad-lenke" href="/portal/coach/melding/ny?emne=teknisk-plan"><span><b>Ny teknisk plan</b><span className="phn-kilde">Oppgaver per P-posisjon</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>
        <Link className="phn-rad-lenke" href={url("mal")}><span><b>Målsetninger</b><span className="phn-kilde">{ukeMal ? `${ukeMal} knyttet til uka` : `${goals.length} aktive`}</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>

        <div className="phn-verktoy" role="group" aria-label="Flere verktøy">
          {motor.utkast.length > 0 && <button type="button" className="phn-knapp pri" disabled={travel} onClick={() => setPubliser(true)}><Send className="phn-ikon" aria-hidden />Publiser {motor.utkast.length} {motor.utkast.length === 1 ? "utkast" : "utkast"}</button>}
          <button type="button" className="phn-knapp sek" onClick={() => setNyOkt({ dato: week.days[dag]?.date ?? week.weekStart, startMinutt: 16 * 60, pyramide: null })}><Plus className="phn-ikon" aria-hidden />Ny økt med detaljer</button>
          <Ukeforslag key={week.weekStart} weekStart={week.weekStart} onLagret={motor.lastPaaNytt} />
          <button type="button" className="phn-knapp sek" onClick={() => setUkeplan(true)}><ListChecks className="phn-ikon" aria-hidden />Ukeplan og mål</button>
          <Link className="phn-knapp sek" href={url("vol")}><BarChart3 className="phn-ikon" aria-hidden />Volum og belastning</Link>
          <Link className="phn-knapp sek" href={url("live")}><Play className="phn-ikon" aria-hidden />Gjennomfør økt</Link>
          <Link className="phn-knapp sek" href={url("min")}><CalendarDays className="phn-ikon" aria-hidden />Min kalender og deling</Link>
        </div>
      </aside>
    </div>

    {drag && <div aria-hidden className={`phn-spokelse phn-dra ${drag.kind === "akse" ? drag.akse : akseFra(drag.session.pyramid) ?? ""}`} style={{ left: drag.x, top: drag.y }}>
      {drag.kind === "akse" ? AKSE_NAVN[drag.akse] : drag.session.title}
    </div>}

    {gjentaOkt && <GjentaArk key={gjentaOkt.id} okt={gjentaOkt} periode={periode} konkurranser={konkurranser} travel={travel}
      onLukk={() => setGjentaId(null)} onLagre={(datoer) => motor.gjenta(gjentaOkt.id, datoer, () => setGjentaId(null))} />}
    {arkSession && !gjentaOkt && <OktArk key={`${arkSession.id}:${arkSession.date}:${arkSession.startMinute}:${arkSession.durationMinutes}`} session={arkSession} spillerNavn={spillerNavn} motor={motor}
      onLukk={() => setArkOkt(null)} onApneOkt={(id) => router.push(url("okt", { okt: id }))}
      onNyOvelse={(s) => { setArkOkt(null); setNyOvelse({ navn: "", okt: s }); }}
      onRedigerOvelse={(s, drill) => setOvelseFor({ okt: s, drill })}
      onGjenta={(s) => { setArkOkt(null); setGjentaId(s.id); }} />}
    {nyOkt && <NyOktArk key={`${nyOkt.dato}:${nyOkt.startMinutt}`} utkast={nyOkt} travel={travel} onLukk={() => setNyOkt(null)}
      onOpprett={(v) => motor.opprett(v, () => setNyOkt(null), true)} />}
    {publiser && <PubliserArk motor={motor} spillerNavn={spillerNavn} idag={idag} onLukk={() => setPubliser(false)} />}
    {ukeplan && <UkeplanArk weekPlan={week.weekPlan} ukeNr={ukeNr} travel={travel} onLukk={() => setUkeplan(false)} onLagre={(d) => motor.lagreUkeplan(d, () => setUkeplan(false))} />}
    {ovelseFor && <OvelseArk key={`${ovelseFor.okt.id}:${ovelseFor.drill.id}`} session={ovelseFor.okt} drill={ovelseFor.drill} pyramide={ovelseFor.okt.pyramid} travel={travel}
      onLukk={() => setOvelseFor(null)} onSubmit={(o, ferdig) => motor.oppdaterOvelse(ovelseFor.okt.id, ovelseFor.drill.id, o, () => { ferdig(); setOvelseFor(null); })} />}
    {nyOvelse && <NyOvelseArk key={nyOvelse.okt?.id ?? "bank"} playerId={playerId} rolle="player" okt={nyOvelse.okt} startNavn={nyOvelse.navn}
      standardPyramide={velgerAkse ?? nyOvelse.okt?.pyramid ?? "SLAG"} onLukk={() => setNyOvelse(null)}
      onLagret={() => { setNyOvelse(null); setVelgerQ(""); setVelgerVersjon((v) => v + 1); void motor.lastPaaNytt(); }} />}
  </div>;
}

/* ---------- PH-11-GJENTA ---------- */
const REGLER: [GjentaModus | "ikke", string][] = [["ikke", "Ikke"], ["uke", "Hver uke"], ["annenhver", "Annenhver uke"], ["dager", "Valgte dager"]];

function GjentaArk({ okt, periode, konkurranser, travel, onLukk, onLagre }: {
  okt: WorkbenchSession; periode: PH11UkePeriode | null; konkurranser: ReadonlyMap<string, string>; travel: boolean;
  onLukk: () => void; onLagre: (datoer: string[]) => void;
}) {
  const kanPeriode = !!periode && periode.slutt > okt.date;
  const [regel, setRegel] = useState<GjentaModus | "ikke">("uke");
  const [valgte, setValgte] = useState<number[]>([ukedag(okt.date)]);
  const [sluttType, setSluttType] = useState<"periode" | "dato">(kanPeriode ? "periode" : "dato");
  const [dato, setDato] = useState(() => addDays(okt.date, 8 * 7));
  const [hopp, setHopp] = useState(true);
  const slutt = sluttType === "periode" && periode ? periode.slutt : dato;
  const alle = regel === "ikke" ? { datoer: [], hoppet: [] } : beregnGjentaDatoer({ fra: okt.date, modus: regel, slutt, ukedager: valgte });
  const kollisjoner = alle.datoer.filter((d) => konkurranser.has(d));
  const datoer = hopp ? alle.datoer.filter((d) => !konkurranser.has(d)) : alle.datoer;
  const n = datoer.length + 1;
  const dagtekst = regel === "dager" ? [...valgte].sort().map((i) => DAGLANG[i].toLowerCase()).join(", ") : DAGLANG[ukedag(okt.date)].toLowerCase();
  const siste = datoer.at(-1) ?? okt.date;
  const regeltekst = regel === "ikke" ? `Bare ${pen(okt.date)}` : `${regel === "annenhver" ? "Annenhver" : "Hver"} ${dagtekst} kl. ${klokke(okt.startMinute)} til ${pen(siste)}`;
  const vekslDag = (i: number) => setValgte((v) => v.includes(i) ? (v.length > 1 ? v.filter((x) => x !== i) : v) : [...v, i]);

  return <Ark open onClose={onLukk} kicker="Gjenta økt" title={okt.title}
    footer={<>
      <button type="button" className="phn-knapp pri phn-stor" disabled={travel} onClick={() => regel === "ikke" || datoer.length === 0 ? onLukk() : onLagre(datoer)}>
        {regel === "ikke" || datoer.length === 0 ? "Ferdig" : `Legg inn ${datoer.length} ${datoer.length === 1 ? "økt" : "økter"} til`}
      </button>
      <button type="button" className="phn-knapp sek phn-stor" onClick={onLukk}>Avbryt</button>
    </>}>
    <div className="phn-ark-innhold">
      <p className="phn-kilde">{DAGLANG[ukedag(okt.date)]} {KORTDATO.format(utc(okt.date))} kl. {klokke(okt.startMinute)}–{klokke(okt.startMinute + okt.durationMinutes)}</p>
      <div className="phn-felt"><span>Gjenta</span>
        <div className="phn-valg" role="group" aria-label="Gjenta">{REGLER.map(([r, l]) => <button key={r} type="button" aria-pressed={regel === r} onClick={() => setRegel(r)}>{l}</button>)}</div>
      </div>
      {regel === "dager" && <div className="phn-felt"><span>Dager</span>
        <div className="phn-ukedager" role="group" aria-label="Dager">{DAGKORT.map((d, i) => <button key={d} type="button" aria-pressed={valgte.includes(i)} aria-label={DAGLANG[i]} onClick={() => vekslDag(i)}>{d[0].toUpperCase()}</button>)}</div>
      </div>}
      {regel !== "ikke" && <div className="phn-felt"><span>Slutt</span>
        <div className="phn-valg" role="group" aria-label="Slutt">
          {kanPeriode && periode && <button type="button" aria-pressed={sluttType === "periode"} onClick={() => setSluttType("periode")}>Ut perioden · {KORTDATO.format(utc(periode.slutt))}</button>}
          <button type="button" aria-pressed={sluttType === "dato"} onClick={() => setSluttType("dato")}>Til dato</button>
        </div>
        {sluttType === "dato" && <input type="date" value={dato} min={addDays(okt.date, 1)} aria-label="Siste dato" onChange={(e) => e.target.value && setDato(e.target.value)} />}
      </div>}
      <div className="phn-sum-linje"><strong>{n} {n === 1 ? "økt" : "økter"}</strong><span className="phn-forklar">{regeltekst}</span></div>
      {kollisjoner.length > 0 && <label className="phn-sjekk">
        <input type="checkbox" checked={hopp} onChange={(e) => setHopp(e.target.checked)} />
        <span><b>Hopp over {kollisjoner.map(pen).join(", ")}</b><br />{[...new Set(kollisjoner.map((d) => konkurranser.get(d)))].join(", ")} · konkurransedag. Fjern haken for å legge den inn likevel.</span>
      </label>}
    </div>
  </Ark>;
}
