"use client";

/**
 * AG-11 Workbench (coach) i Precision Athletics — nivåene Uke, Økt og
 * Målsetninger, med sidefeltet (øvelsesbank, fysisk program, øktmaler,
 * turneringer, ny teknisk plan, målsetninger). Tegning: Claude Design
 * 7d7c2994, ui_kits/agencyos/screens/AG-11-wb3.jsx + ui_kits/_shared/WB3.jsx
 * (runde 29): AG-11, AG-11-OKT, AG-11-MAL og AG-11-FYS.
 *
 * Bare visningen er ny. Uka skrives gjennom useUkeMotor (samme wb-actions som
 * WorkbenchUke: WorkbenchSession, publisering, serier, maler, kilder, sRPE).
 * År, Periode og Måned følger en egen beslutning (PR #995) og er lenker til
 * visningene som finnes. Stall, Live og Min kalender er lenker som før.
 *
 * Dra-og-slipp: aksene og øktkortene dras med peker (mus, penn og berøring).
 * På smal skjerm dras økta i grepet til høyre, så siden fortsatt kan rulles.
 * Øvelser fra sidefeltet kan dras med mus, eller trykkes og slippes på et
 * klokkeslett (også på telefon). Flytting og nye økter kan angres fra meldingen.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Dumbbell, GripVertical, Layers, LayoutTemplate, ListChecks, MoreHorizontal, Plus, RotateCcw, Search, Send, StickyNote, Target, Trophy, ClipboardList, X } from "lucide-react";
import { Ikon, Knapp, KnappLenke, AKSE_NAVN, TomTilstand, type Akse } from "@/components/precision/pa";
import { Ark, Nokkelverdi, Side, SideHode } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { AKSER, Aksestang, Caps, Fremdrift, Listerad, Oktkort, Valgpille, Velger, akseFra, akseStil } from "@/components/precision/pa-workbench";
import { useUkeMotor } from "@/components/workbench/useUkeMotor";
import { Ukeforslag } from "@/components/workbench/Ukeforslag";
import { lesKildeDataTransfer, settKildeDataTransfer } from "@/components/workbench/wb-drag";
import { osloIdag } from "@/components/workbench/WeekGrid";
import { AREA_LABEL, UI } from "@/lib/domain/workbench/labels";
import { addDays, isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { Drill, PlanningGoalSummary, PyramidArea, SourceItem, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WorkbenchFysTurneringData } from "@/lib/workbench/fys-turnering-data";
import { workbenchUrl, type WorkbenchSurface } from "@/lib/workbench/visning-url";
import { flyttPlanUke, parsePlanKontekst, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { UKEPLAN_TYPER } from "@/lib/workbench/ukeplan-schema";
import { PLAN_NIVAA_LABEL } from "@/lib/domain/maal-plannivaa";
import { CoachnotatArk, NyOktArk, OktArk, OvelseArk, PubliserArk, UkeplanArk, VelgerArk, UKENOTAT_NAVN, UKETYPE_NAVN, dagOgDato, kildeMerke, klokke, type NyOktUtkast } from "./AG11Ark";
import "@/styles/precision-a9.css";

export type AG11Niva = "uke" | "okt" | "vol" | "mal";
export type AG11Side = "bank" | "fys" | "maler" | "turn" | "tp" | "mal";

export type AG11Props = {
  playerId: string;
  spillerNavn: string;
  uke: WeekViewModel;
  kilder: SourceItem[];
  roster: readonly { id: string; navn: string }[];
  grupper: readonly { id: string; navn: string }[];
  goals: PlanningGoalSummary[];
  fys: WorkbenchFysTurneringData;
  niva?: AG11Niva;
  side?: AG11Side;
  valgtOktId?: string;
  routeSurface?: WorkbenchSurface;
  planKontekst?: PlanReferanse;
  role?: "coach" | "player";
};

const SIDEFELT: [AG11Side, string][] = [["bank", "Øvelsesbank"], ["fys", "Fysisk program"], ["maler", "Øktmaler"], ["turn", "Turneringer"], ["tp", "Ny teknisk plan"], ["mal", "Målsetninger"]];
const DAGNAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const PLAN_KEY: Record<PyramidArea, "plannedHoursFys" | "plannedHoursTek" | "plannedHoursSlag" | "plannedHoursSpill" | "plannedHoursTurn"> = {
  FYS: "plannedHoursFys", TEK: "plannedHoursTek", SLAG: "plannedHoursSlag", SPILL: "plannedHoursSpill", TURN: "plannedHoursTurn",
};

export const hm = (m: number) => `${Math.floor(m / 60)} t${m % 60 ? ` ${m % 60} min` : ""}`;
const ddmm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
const tellendeOkter = (w: WeekViewModel) => w.days.flatMap((d) => d.sessions).filter((s) => s.status !== "CANCELLED");

type Dra = { kind: "akse"; akse: Akse } | { kind: "okt"; session: WorkbenchSession };
type Drar = Dra & { x: number; y: number; over: string | null };

export function AG11Workbench({ playerId, spillerNavn, uke, kilder, roster, grupper, goals, fys, niva: niva0 = "uke", side: side0 = "bank", valgtOktId, routeSurface = "agency", planKontekst, role = "coach" }: AG11Props) {
  const router = useRouter();
  const motor = useUkeMotor({ playerId, uke });
  const { week, travel } = motor;
  const idag = osloIdag();
  const [niva, setNivaState] = useState<AG11Niva>(niva0);
  const [side, setSide] = useState<AG11Side>(side0);
  const [bankAkse, setBankAkse] = useState<Akse>("tek");
  const [arm, setArm] = useState<Akse | null>(null);
  const [armKilde, setArmKilde] = useState<SourceItem | null>(null);
  const [drag, setDrag] = useState<Drar | null>(null);
  const [dag, setDag] = useState(() => Math.max(0, uke.days.findIndex((d) => d.date === idag)));
  const [oktId, setOktId] = useState<string | undefined>(valgtOktId);
  const [arkOkt, setArkOkt] = useState<string | null>(null);
  const [nyOkt, setNyOkt] = useState<NyOktUtkast | null>(null);
  const [publiser, setPubliser] = useState(false);
  const [ukeplan, setUkeplan] = useState(false);
  const [notat, setNotat] = useState(false);
  const [velger, setVelger] = useState<"spiller" | "gruppe" | null>(null);
  const [mer, setMer] = useState(false);
  const [ovelseFor, setOvelseFor] = useState<WorkbenchSession | null>(null);
  const [drillTilRedigering, setDrillTilRedigering] = useState<Drill | null>(null);
  const [nettoppDratt, setNettoppDratt] = useState(false);

  const okter = useMemo(() => tellendeOkter(week), [week]);
  const alle = motor.alleOkter;
  const ukeNr = isoWeekNumber(week.weekStart);
  const ukeSlutt = addDays(week.weekStart, 6);
  const arkSession = arkOkt ? alle.find((s) => s.id === arkOkt) ?? null : null;
  const aktivOkt = okter.find((s) => s.id === oktId) ?? okter[0] ?? null;
  const harGruppeokter = alle.some((s) => s.sourceGroupSessionId);
  const idx = roster.findIndex((p) => p.id === playerId);
  const referanse: PlanReferanse = {
    ...(planKontekst ?? parsePlanKontekst({ uke: week.weekStart }).referanse),
    uke: week.weekStart,
    okt: oktId ?? planKontekst?.okt,
  };
  const wbUrl = (visning: Parameters<typeof workbenchUrl>[1], ref: PlanReferanse = {}) => workbenchUrl(playerId, visning, ref, routeSurface, referanse);
  const spillerHref = (id: string) => workbenchUrl(id, niva, {}, routeSurface, referanse);

  function byttNiva(n: AG11Niva, okt?: string) {
    setNivaState(n);
    if (okt) setOktId(okt);
    router.replace(wbUrl(n, okt ? { okt } : {}), { scroll: false });
  }

  const byttUke = (retning: -1 | 1 | 0) => {
    const ny = flyttPlanUke(retning === 0 ? idag : week.weekStart, retning);
    router.push(wbUrl(niva, { uke: ny }));
  };

  /* ---------- Slipp på klokkeslett ---------- */
  const timer = useMemo(() => {
    let fra = 6, til = 21;
    for (const d of week.days) {
      for (const s of d.sessions) { fra = Math.min(fra, Math.floor(s.startMinute / 60)); til = Math.max(til, Math.floor(s.startMinute / 60)); }
      for (const b of d.lockedBlocks) { fra = Math.min(fra, Math.floor(b.startMinute / 60)); til = Math.max(til, Math.floor(b.startMinute / 60)); }
    }
    fra = Math.max(0, fra); til = Math.min(23, til);
    return Array.from({ length: til - fra + 1 }, (_, i) => fra + i);
  }, [week]);

  function slippPa(dra: Dra, slot: string) {
    const [d, h] = slot.split("-").map(Number);
    const dato = week.days[d]?.date;
    if (!dato) return;
    if (dra.kind === "akse") { setArm(null); setNyOkt({ dato, startMinutt: h * 60, pyramide: AKSE_NAVN[dra.akse] as PyramidArea }); return; }
    const s = dra.session;
    const nyStart = h * 60 + (s.startMinute % 60);
    if (s.date === dato && s.startMinute === nyStart) return;
    motor.flytt(s.id, { newDate: dato, newStartMinute: nyStart, newDurationMinutes: s.durationMinutes }, { newDate: s.date, newStartMinute: s.startMinute, newDurationMinutes: s.durationMinutes });
  }

  function trykkNed(dra: Dra, e: React.PointerEvent) {
    if (e.button !== 0) return;
    const x0 = e.clientX, y0 = e.clientY;
    let aktiv: Drar | null = null;
    const flytt = (ev: PointerEvent) => {
      if (!aktiv && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const slot = el instanceof HTMLElement ? el.closest<HTMLElement>("[data-slot]") : null;
      aktiv = { ...dra, x: ev.clientX, y: ev.clientY, over: slot?.dataset.slot ?? null };
      setDrag(aktiv);
    };
    const slutt = (slipp: boolean) => () => {
      window.removeEventListener("pointermove", flytt);
      window.removeEventListener("pointerup", opp);
      window.removeEventListener("pointercancel", avbryt);
      const a = aktiv;
      setDrag(null);
      if (!a) return;
      setNettoppDratt(true);
      window.setTimeout(() => setNettoppDratt(false), 0);
      if (slipp && a.over) slippPa(dra, a.over);
    };
    const opp = slutt(true), avbryt = slutt(false);
    window.addEventListener("pointermove", flytt);
    window.addEventListener("pointerup", opp);
    window.addEventListener("pointercancel", avbryt);
  }

  function leggPa(d: number, h: number) {
    const dato = week.days[d]?.date;
    if (!dato) return;
    if (armKilde) { const k = armKilde; setArmKilde(null); motor.fraKilde(dato, h * 60, k.id, (id) => setArkOkt(id)); return; }
    setNyOkt({ dato, startMinutt: h * 60, pyramide: arm ? (AKSE_NAVN[arm] as PyramidArea) : null });
    setArm(null);
  }

  const merker = (s: WorkbenchSession) => {
    const k = kildeMerke(s);
    return <>
      {k === "egen" ? <span className="pa-status pa-status--info"><span className="pa-status__dot" />Egen</span> : k === "gruppe" ? <Caps>GRUPPE</Caps> : k === "spiller" ? <Caps>FRA SPILLER</Caps> : null}
      {s.status === "DRAFT" && <Caps>UTKAST</Caps>}
      {s.needsPlayerApproval && <Caps>VENTER PÅ SPILLER</Caps>}
      {s.hiddenByPlayer && <Caps>{UI.hiddenByPlayerBadge}</Caps>}
      {s.seriesId && <Caps>↻ SERIE</Caps>}
    </>;
  };

  const kort = (s: WorkbenchSession, medGrep: boolean) => <Oktkort key={s.id} akse={akseFra(s.pyramid)} tid={`${klokke(s.startMinute)} · ${s.durationMinutes} min`} tittel={s.title} merker={merker(s)}
    label={`${klokke(s.startMinute)} ${s.title}${s.seriesId ? ", del av serie" : ""}`} dempet={s.hiddenByPlayer || s.status === "CANCELLED"}
    dras={drag?.kind === "okt" && drag.session.id === s.id} valgt={arkOkt === s.id}
    onClick={() => { if (!nettoppDratt) setArkOkt(s.id); }}
    onPointerDown={medGrep ? undefined : (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") trykkNed({ kind: "okt", session: s }, e); }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => { e.preventDefault(); const id = lesKildeDataTransfer(e); if (id) motor.drillFraKilde(s.id, id); }}
    ekstra={medGrep ? <button type="button" className="a9-greip" aria-label={`Dra ${s.title} til et annet klokkeslett`} onPointerDown={(e) => trykkNed({ kind: "okt", session: s }, e)}><Ikon icon={GripVertical} size={18} /></button> : undefined} />;

  const slot = (d: number, h: number, medGrep: boolean) => {
    const dagen = week.days[d];
    const her = dagen.sessions.filter((s) => Math.floor(s.startMinute / 60) === h || (h === timer[0] && s.startMinute < timer[0] * 60));
    const opptatt = dagen.lockedBlocks.filter((b) => Math.floor(b.startMinute / 60) === h);
    const key = `${d}-${h}`;
    const klar = (arm || armKilde) && her.length === 0;
    return <div key={key} data-slot={key} role="listitem" aria-label={`${DAGNAVN[d]} kl. ${String(h).padStart(2, "0")}`} className="a9-slot"
      data-over={drag?.over === key || undefined} data-tom={her.length === 0 || undefined}
      onClick={(e) => { if (e.target === e.currentTarget) leggPa(d, h); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const id = lesKildeDataTransfer(e); if (id) motor.fraKilde(dagen.date, h * 60, id, (ny) => setArkOkt(ny)); }}>
      {opptatt.map((b) => <span key={b.id} className="a9-opptatt">{b.title}<span className="a9-caps">{klokke(b.startMinute)}–{klokke(b.startMinute + b.durationMinutes)}</span></span>)}
      {her.map((s) => kort(s, medGrep))}
      {klar && <button type="button" className="a9-slipp" onClick={() => leggPa(d, h)}
        aria-label={arm ? `Slipp ${AKSE_NAVN[arm]} på ${DAGNAVN[d]} kl. ${h}` : `Legg inn ${armKilde?.title ?? ""} ${DAGNAVN[d]} kl. ${h}`}>+ {arm ? AKSE_NAVN[arm] : "LEGG INN"}</button>}
    </div>;
  };

  /* ---------- Uka ---------- */
  const fordeling = AKSER.map((a) => {
    const p = AKSE_NAVN[a] as PyramidArea;
    const planTimer = week.weekPlan?.[PLAN_KEY[p]] ?? null;
    const lagt = okter.filter((s) => s.pyramid === p).reduce((sum, s) => sum + s.durationMinutes, 0);
    return { a, planMin: planTimer != null ? Math.round(planTimer * 60) : null, lagt };
  });
  const visFordeling = fordeling.some((f) => f.planMin != null || f.lagt > 0);
  const totalt = okter.reduce((sum, s) => sum + s.durationMinutes, 0);
  const typeNavn = UKEPLAN_TYPER.find((t) => t.id === week.weekPlan?.planningDetails?.weekType)?.navn
    ?? (week.weekPlan?.weekType ? UKETYPE_NAVN[week.weekPlan.weekType] : null);

  const ukeFlate = <>
    <div className="a9-ukenav">
      <button type="button" className="pa-iconbtn" aria-label={UI.weekNavPrev} onClick={() => byttUke(-1)}><Ikon icon={ChevronLeft} size={20} /></button>
      <span className="a9-ukenav__tittel">Uke {ukeNr} · {ddmm(week.weekStart)}–{ddmm(ukeSlutt)}{typeNavn ? ` · ${typeNavn}` : ""}</span>
      <button type="button" className="pa-iconbtn" aria-label={UI.weekNavNext} onClick={() => byttUke(1)}><Ikon icon={ChevronRight} size={20} /></button>
    </div>
    <div className="a9-rad">
      <Knapp variant="ghost" size="sm" icon={RotateCcw} onClick={() => byttUke(0)}>{UI.today}</Knapp>
      <Knapp variant="secondary" size="sm" icon={Plus} onClick={() => setNyOkt({ dato: week.days[dag]?.date ?? week.weekStart, startMinutt: 16 * 60, pyramide: null })}>{UI.createSession}</Knapp>
      {role === "player" && <Ukeforslag key={week.weekStart} weekStart={week.weekStart} onLagret={motor.lastPaaNytt} />}
      <span style={{ flex: 1 }} />
      <Knapp size="sm" icon={Send} disabled={motor.utkast.length === 0 || travel} onClick={() => setPubliser(true)}>{UI.publishWeek}{motor.utkast.length ? ` · ${motor.utkast.length}` : ""}</Knapp>
    </div>
    {week.weekPlan?.notes?.length ? <div className="a9-rad">{week.weekPlan.notes.map((n) => <span key={n} className="pa-status"><span className="pa-status__dot" />{UKENOTAT_NAVN[n] ?? n}</span>)}</div> : null}
    {visFordeling && <div className="a9-fordeling" aria-label="Timer per akse denne uka">
      {fordeling.map((f) => <div key={f.a} className="a9-fordeling__rad" style={akseStil(f.a)}>
        <span className="a9-fordeling__topp"><span>{AKSE_NAVN[f.a]}</span><span>{f.lagt ? hm(f.lagt) : "—"}</span></span>
        <Fremdrift pct={f.planMin ? (f.lagt / f.planMin) * 100 : null} label={`${AKSE_NAVN[f.a]} mot ukeplanen`} />
        <Caps>{f.planMin != null ? `PLAN ${hm(f.planMin).toUpperCase()}` : "PLAN —"}</Caps>
      </div>)}
    </div>}
    <Aksestang label="Pyramideakser · dra ut og slipp på klokkeslett" valgt={arm} onVelg={(a) => { setArm(a); setArmKilde(null); }}
      onPointerDown={(a, e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") trykkNed({ kind: "akse", akse: a }, e); }} />
    <Caps>{arm ? `TRYKK ET KLOKKESLETT FOR Å SLIPPE ${AKSE_NAVN[arm]}` : armKilde ? `TRYKK ET KLOKKESLETT FOR Å LEGGE INN «${armKilde.title.toUpperCase()}»` : "DRA EN AKSE UT OG SLIPP PÅ ET KLOKKESLETT · ELLER TRYKK AKSEN OG SÅ KLOKKESLETTET"}</Caps>
    {alle.length === 0 && <TomTilstand icon={Layers} title={`Uke ${ukeNr} er tom`} text="Dra en pyramideakse ut i kalenderen, eller bruk en øktmal fra sidefeltet." />}
    <div role="list" aria-label={`Uke ${ukeNr}`} className="a9-uke" data-dras={drag ? "true" : undefined}>
      <span />
      {week.days.map((d, i) => <span key={d.date} className="a9-dagnavn">{DAGNAVN[i]} <span className="a9-dagnavn__dato">{ddmm(d.date)}</span></span>)}
      {timer.map((h) => [
        <span key={`t${h}`} className="a9-time">{String(h).padStart(2, "0")}</span>,
        ...week.days.map((_, d) => slot(d, h, false)),
      ])}
    </div>
    <div className="a9-dagvisning" data-dras={drag ? "true" : undefined}>
      <div role="group" aria-label="Dag" className="a9-dagvelger">
        {week.days.map((d, i) => <button key={d.date} type="button" className="a9-dagknapp" aria-pressed={dag === i} onClick={() => setDag(i)}><span>{DAGNAVN[i]}</span><span>{d.date.slice(8, 10)}</span></button>)}
      </div>
      <div role="list" aria-label={`${DAGNAVN[dag]} ${ddmm(week.days[dag]?.date ?? week.weekStart)}`} className="a9-dag">
        {timer.map((h) => [<span key={`t${h}`} className="a9-time">{String(h).padStart(2, "0")}</span>, slot(dag, h, true)])}
      </div>
    </div>
    <Caps>{`${hm(totalt).toUpperCase()} PLANLAGT${motor.weeklyLoad.totalLoad > 0 ? ` · ${motor.weeklyLoad.totalLoad} sRPE` : ""} · FARGE = AKSE`}</Caps>
  </>;

  /* ---------- Økt ---------- */
  const oktFlate = !aktivOkt ? <TomTilstand icon={ListChecks} title="Ingen økt valgt" text="Uka har ingen økter. Legg inn den første i ukevisningen." actions={<Knapp variant="secondary" onClick={() => byttNiva("uke")}>{UI.openWeek}</Knapp>} /> : <>
    <div className="a9-kort__hode">
      <span className="a9-kort__tittel">{dagOgDato(aktivOkt.date)} · {klokke(aktivOkt.startMinute)} · {aktivOkt.title}</span>
      <Caps>{aktivOkt.drills.reduce((a, d) => a + d.durationMinutes, 0) || aktivOkt.durationMinutes} MIN</Caps>
    </div>
    <div className="a9-rad">{merker(aktivOkt)}</div>
    {okter.length > 1 && <label className="a9-felt">Økt i uka
      <select value={aktivOkt.id} onChange={(e) => byttNiva("okt", e.target.value)}>
        {okter.map((s) => <option key={s.id} value={s.id}>{dagOgDato(s.date)} · {klokke(s.startMinute)} · {s.title}</option>)}
      </select>
    </label>}
    <div className="a9-rad">
      {aktivOkt.status === "DRAFT"
        ? <Knapp size="sm" icon={Send} disabled={travel} onClick={() => motor.publiser([aktivOkt.id])}>Publiser økt</Knapp>
        : <Knapp variant="secondary" size="sm" disabled={travel} onClick={() => motor.trekkTilbake(aktivOkt.id)}>{UI.unpublish}</Knapp>}
      <Knapp variant="secondary" size="sm" onClick={() => setArkOkt(aktivOkt.id)}>Tid, belastning og mer</Knapp>
    </div>
    {aktivOkt.drills.length === 0 ? <Caps>INGEN ØVELSER · VELG PYRAMIDE OG LEGG TIL FRA BANKEN</Caps> : <div role="list" className="a9-ovelser">
      {aktivOkt.drills.map((d, i) => <div role="listitem" key={d.id} className="a9-ovelsesrad" style={akseStil(akseFra(d.akFormel.pyramid))}>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span className="a9-listerad__tittel">{d.title}</span>
          <Caps>{[d.akFormel.pyramid, AREA_LABEL[d.akFormel.area], `${d.durationMinutes} MIN`].join(" · ").toUpperCase()}</Caps>
        </span>
        <span className="a9-ovelsesrad__knapper">
          <button type="button" className="pa-iconbtn" aria-label={`Flytt ${d.title} opp`} disabled={travel || i === 0} onClick={() => motor.flyttDrill(aktivOkt, d.id, -1)}><Ikon icon={ArrowUp} size={18} /></button>
          <button type="button" className="pa-iconbtn" aria-label={`Flytt ${d.title} ned`} disabled={travel || i === aktivOkt.drills.length - 1} onClick={() => motor.flyttDrill(aktivOkt, d.id, 1)}><Ikon icon={ArrowDown} size={18} /></button>
          <button type="button" className="pa-iconbtn" aria-label={`Fjern ${d.title}`} disabled={travel} onClick={() => motor.fjernDrill(aktivOkt.id, d.id)}><Ikon icon={X} size={18} /></button>
        </span>
      </div>)}
    </div>}
    <Knapp variant="secondary" size="sm" icon={Plus} disabled={travel} onClick={() => { setDrillTilRedigering(null); setOvelseFor(aktivOkt); }}>Egen øvelse i {AKSE_NAVN[bankAkse]}</Knapp>
    <span className="kicker">{UI.formulaTitle}</span>
    <Nokkelverdi items={[
      [UI.pyramid, aktivOkt.drills[0]?.akFormel.pyramid ?? aktivOkt.pyramid],
      [UI.drillArea, aktivOkt.drills[0] ? AREA_LABEL[aktivOkt.drills[0].akFormel.area] : aktivOkt.skillArea ?? "—"],
      [UI.formelMal, aktivOkt.drills[0]?.techniqueFocus ?? aktivOkt.maalsetning ?? "—"],
      [UI.formelMate, aktivOkt.drills[0]?.description ?? "—"],
    ]} />
  </>;

  /* ---------- Målsetninger ---------- */
  const malRad = (g: PlanningGoalSummary) => <div role="listitem" key={g.id} className="a9-mal">
    <div className="a9-mal__topp">
      <span className="pa-status"><span className="pa-status__dot" />{g.category === "OUTCOME" ? "Resultatmål" : "Prosessmål"}</span>
      <span className="a9-mal__navn">{g.title}</span>
      <span className="a9-mal__pct">{g.fremdrift.hasData ? `${g.fremdrift.pct} %` : "—"}</span>
    </div>
    <Fremdrift pct={g.fremdrift.hasData ? g.fremdrift.pct : null} label={`Fremdrift ${g.title}`} />
    <Caps>{`${g.typeLabel} · ${g.targetDate ? `FRIST ${g.targetDate.slice(8, 10)}.${g.targetDate.slice(5, 7)}.${g.targetDate.slice(0, 4)}` : "INGEN FRIST"} · NIVÅ ${PLAN_NIVAA_LABEL[g.planNivaa]}${g.planNivaaKilde === "foreslatt" ? " (FORESLÅTT)" : ""}`.toUpperCase()}</Caps>
    <Caps>{`${g.fremdrift.detail}${g.spor ? ` · PLANLAGT ${g.spor.planlagt} · GJENNOMFØRT ${g.spor.gjennomfort} · UTEBLITT ${g.spor.uteblitt}` : ""}`.toUpperCase()}</Caps>
    <p className="a9-tekst">Neste: {g.nesteTiltak}</p>
  </div>;
  const malFlate = <>
    <div className="a9-kort__hode"><span className="a9-kort__tittel">Målsetninger · {spillerNavn}</span></div>
    {goals.length === 0 ? <TomTilstand icon={Target} title="Ingen målsetninger" text="Aktive resultat- og prosessmål vises her, med fremdrift fra plan, Stats, tester og runder." /> : <div role="list">{goals.map(malRad)}</div>}
  </>;

  /* ---------- Volum og belastning ---------- */
  const gjennomfortMin = motor.weeklyLoad.completedMinutes;
  const planMin = week.budget.plannedMinutes || totalt;
  const aktiveVarsler = week.budget.warnings?.filter((varsel) => varsel.aktiv) ?? [];
  const volumFlate = <>
    <div className="a9-kort__hode"><span className="a9-kort__tittel">Volum og belastning · uke {ukeNr}</span></div>
    <Caps>PLANLAGT MOT GJENNOMFØRT · MANGLENDE MÅLING VISES SOM —</Caps>
    <div className="a9-fordeling" aria-label="Volum denne uka">
      <Nokkelverdi items={[
        ["Planlagt", planMin > 0 ? hm(planMin) : "—"],
        ["Gjennomført", motor.weeklyLoad.totalSessionsCount > 0 ? hm(gjennomfortMin) : "—"],
        ["sRPE", motor.weeklyLoad.ratedSessionsCount > 0 ? String(motor.weeklyLoad.totalLoad) : "—"],
        ["Vurderte økter", `${motor.weeklyLoad.ratedSessionsCount} av ${motor.weeklyLoad.totalSessionsCount}`],
      ]} />
      {fordeling.map((f) => <div key={f.a} className="a9-fordeling__rad" style={akseStil(f.a)}>
        <span className="a9-fordeling__topp"><span>{AKSE_NAVN[f.a]}</span><span>{f.lagt ? hm(f.lagt) : "—"}</span></span>
        <Fremdrift pct={f.planMin ? (f.lagt / f.planMin) * 100 : null} label={`${AKSE_NAVN[f.a]} mot ukeplanen`} />
        <Caps>{f.planMin != null ? `PLAN ${hm(f.planMin).toUpperCase()}` : "PLAN —"}</Caps>
      </div>)}
    </div>
    <section className="a9-mal" aria-label="Belastningsgrunnlag">
      <div className="a9-mal__topp"><span className="pa-status"><span className="pa-status__dot" />Belastning</span><span className="a9-mal__navn">Opplevd anstrengelse</span><span className="a9-mal__pct">{motor.weeklyLoad.averageEffort ?? "—"}</span></div>
      <p className="a9-tekst">sRPE beregnes som registrerte minutter ganger opplevd anstrengelse. Uker uten registrering regnes ikke som null.</p>
    </section>
    {aktiveVarsler.length > 0 ? aktiveVarsler.map((varsel) => <InlineVarsel key={varsel.id} tone="warn" tittel={varsel.tittel}>{varsel.melding}</InlineVarsel>) : <InlineVarsel tone="info" tittel="Datagrunnlag">Ingen aktive varsler. Manglende historikk vises som — og brukes ikke som null.</InlineVarsel>}
    <div className="a9-rad">
      <Knapp variant="secondary" size="sm" icon={ListChecks} onClick={() => setUkeplan(true)}>Rediger ukebudsjett</Knapp>
      {role === "coach" ? <Knapp size="sm" icon={Plus} onClick={() => { byttNiva("uke"); setNyOkt({ dato: week.weekStart, startMinutt: 16 * 60, pyramide: null }); }}>Legg tiltak i Workbench</Knapp> : null}
    </div>
  </>;

  /* ---------- Sidefelt ---------- */
  const armer = (k: SourceItem) => { setArm(null); setArmKilde(armKilde?.id === k.id ? null : k); if (niva !== "uke") byttNiva("uke"); };
  const kildeRad = (k: SourceItem, i: number, handling: "okt" | "arm") => <div key={k.id} role="listitem" className={`a9-listerad a9-kilde${i ? " a9-listerad--skille" : ""}`} draggable
    onDragStart={(e) => settKildeDataTransfer(e, k.id)} style={k.pyramid ? akseStil(akseFra(k.pyramid)) : undefined}>
    <span className="a9-listerad__tekst"><span className="a9-listerad__tittel">{k.title}</span><Caps>{[k.area ? AREA_LABEL[k.area] : k.subtitle, k.durationMinutes ? `${k.durationMinutes} MIN` : null].filter(Boolean).join(" · ").toUpperCase() || "—"}</Caps></span>
    {handling === "okt" && aktivOkt
      ? <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label={`Legg ${k.title} i økta`} disabled={travel} onClick={() => motor.drillFraKilde(aktivOkt.id, k.id)}><Ikon icon={Plus} size={18} /></button>
      : <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-pressed={armKilde?.id === k.id} aria-label={`Legg ${k.title} på et klokkeslett`} onClick={() => armer(k)}><Ikon icon={Plus} size={18} /></button>}
  </div>;

  const bank = kilder.filter((k) => k.kind === "DRILL" && akseFra(k.pyramid) === bankAkse);
  const maler = kilder.filter((k) => k.kind === "TEMPLATE");
  const forrige = kilder.filter((k) => k.kind === "PREVIOUS_WEEK");
  const tek = kilder.filter((k) => k.kind === "TEK");
  const blokk = fys.physicalBlocks[0] ?? null;
  const fysOkter = blokk ? blokk.weeks.flatMap((w) => w.sessions).filter((s) => s.date >= idag).slice(0, 6) : [];
  const oktHandling = niva === "okt" ? "okt" : "arm";

  const sideInnhold = side === "bank" ? <>
    <Caps>1 · VELG PYRAMIDE FØRST</Caps>
    <div role="radiogroup" aria-label="Pyramide" className="a9-akser">{AKSER.map((a) => <Valgpille key={a} rolle="radio" akse={a} valgt={bankAkse === a} onClick={() => setBankAkse(a)}>{AKSE_NAVN[a]}</Valgpille>)}</div>
    <Caps>2 · BANKEN ER FILTRERT PÅ {AKSE_NAVN[bankAkse]}</Caps>
    {bank.length === 0 ? <Caps>INGEN ØVELSER I {AKSE_NAVN[bankAkse]}</Caps> : <div role="list" className="a9-liste">{bank.map((k, i) => kildeRad(k, i, oktHandling))}</div>}
    {niva === "okt" && aktivOkt ? <Knapp variant="secondary" size="sm" icon={Plus} onClick={() => { setDrillTilRedigering(null); setOvelseFor(aktivOkt); }}>Egen øvelse i {AKSE_NAVN[bankAkse]}</Knapp> : <Caps>ÅPNE EN ØKT FOR Å LAGE EN EGEN ØVELSE</Caps>}
  </> : side === "fys" ? <>
    {blokk ? <>
      <div className="a9-kort__hode"><span className="a9-kort__tittel">{blokk.title}</span><span className="pa-status"><span className="pa-status__dot" />{blokk.status}</span></div>
      <Caps>{`${ddmm(blokk.startDate)}–${ddmm(blokk.endDate)}${blokk.focus ? ` · ${blokk.focus}` : ""}`.toUpperCase()}</Caps>
      {fysOkter.length === 0 ? <Caps>INGEN KOMMENDE FYSISKE ØKTER</Caps> : <div role="list" className="a9-liste">{fysOkter.map((s, i) => <Listerad key={s.id} forste={i === 0} akse="fys" tittel={s.title} under={`${dagOgDato(s.date)} · ${s.type}`.toUpperCase()} verdi={s.durationMinutes != null ? `${s.durationMinutes} min` : "—"} />)}</div>}
    </> : <Caps>INGEN FYSISK BLOKK ENNÅ</Caps>}
    <KnappLenke variant="ghost" size="sm" icon={Dumbbell} iconRight={ChevronRight} href={`${routeSurface === "player" ? "/portal/planlegge/workbench" : `/admin/workbench/${playerId}`}?pille=fys`}>Åpne hele programmet</KnappLenke>
  </> : side === "maler" ? <>
    {maler.length === 0 && forrige.length === 0 ? <Caps>INGEN MALER ELLER ØKTER FRA FORRIGE UKE</Caps> : null}
    {maler.length > 0 && <><Caps>ØKTMALER</Caps><div role="list" className="a9-liste">{maler.map((k, i) => kildeRad(k, i, "arm"))}</div></>}
    {forrige.length > 0 && <><Caps>FORRIGE UKE · KOPIER INN</Caps><div role="list" className="a9-liste">{forrige.map((k, i) => kildeRad(k, i, "arm"))}</div></>}
    <Caps>LAGRE EN ØKT SOM MAL FRA ØKTARKET</Caps>
  </> : side === "turn" ? <>
    {fys.tournamentPlans.length === 0 ? <Caps>INGEN TURNERINGSPLANER</Caps> : <div role="list" className="a9-liste">{fys.tournamentPlans.slice(0, 6).map((t, i) => <Listerad key={t.id} forste={i === 0} akse="turn" tittel={t.title} under={`${ddmm(t.startDate)}–${ddmm(t.endDate)} · ${t.rounds.length} RUNDER`} verdi={<span className="pa-status"><span className="pa-status__dot" />{t.status}</span>} />)}</div>}
    <KnappLenke variant="ghost" size="sm" icon={Trophy} iconRight={ChevronRight} href={`${routeSurface === "player" ? "/portal/planlegge/workbench" : `/admin/workbench/${playerId}`}?pille=turn`}>Åpne turneringsmodulen</KnappLenke>
  </> : side === "tp" ? <>
    {tek.length === 0 ? <Caps>INGEN TEKNISKE OPPGAVER</Caps> : <div role="list" className="a9-liste">{tek.map((k, i) => kildeRad(k, i, oktHandling))}</div>}
    <KnappLenke variant="secondary" size="sm" icon={ClipboardList} href={role === "coach" ? `/admin/spillere/${playerId}/plan` : "/portal/coach/melding/ny?emne=teknisk-plan"}>{role === "coach" ? "Ny teknisk plan" : "Be coach lage teknisk plan"}</KnappLenke>
  </> : <>
    {goals.length === 0 ? <Caps>INGEN AKTIVE MÅLSETNINGER</Caps> : <div role="list" className="a9-liste">{goals.map((g, i) => <Listerad key={g.id} forste={i === 0} tittel={g.title} under={`${g.category === "OUTCOME" ? "RESULTATMÅL" : "PROSESSMÅL"} · ${PLAN_NIVAA_LABEL[g.planNivaa].toUpperCase()}`} verdi={g.fremdrift.hasData ? `${g.fremdrift.pct} %` : "—"} />)}</div>}
    <Knapp variant="secondary" size="sm" icon={Target} onClick={() => byttNiva("mal")}>Vis målsetninger i midtfeltet</Knapp>
  </>;

  const sidefelt = <section aria-label="Sidefelt" className="pa-card a9-sidefelt">
    <div role="tablist" aria-label="Sidefelt" className="a9-faner">{SIDEFELT.map(([k, l]) => <Valgpille key={k} rolle="tab" valgt={side === k} onClick={() => setSide(k)}>{l}</Valgpille>)}</div>
    {sideInnhold}
  </section>;

  /* ---------- Snarveier (A3) ---------- */
  const snarveier: [typeof Plus, string, () => void][] = [
    [LayoutTemplate, role === "coach" ? "Bruk mal på spiller" : "Bruk øktmal", () => setSide("maler")],
    ...(role === "coach" ? [[StickyNote, "Ukenotat", () => setNotat(true)] as [typeof Plus, string, () => void]] : []),
    [Search, "Søk i tekniske oppgaver", () => setSide("tp")],
    [ListChecks, "Ukeplan og mål", () => setUkeplan(true)],
  ];

  const nivaaer: [string, string, AG11Niva | string][] = [
    ["ar", "År", wbUrl("aar")],
    ["periode", "Periode", wbUrl("periode")],
    ["maned", "Måned", wbUrl("maned")],
    ["uke", "Uke", "uke"], ["okt", "Økt", "okt"], ["vol", "Volum", "vol"], ["mal", "Målsetninger", "mal"],
  ];

  return <Side max={1440}>
    <div className="a9">
      <SideHode kicker="Workbench · Spiller" title="Workbench" />
      {role === "coach" ? <Velger modus="spiller" navn={spillerNavn}
        onModus={(m) => { if (m === "gruppe") setVelger("gruppe"); }}
        onForrige={roster.length > 1 ? () => router.push(spillerHref(roster[(idx - 1 + roster.length) % roster.length].id)) : undefined}
        onNeste={roster.length > 1 ? () => router.push(spillerHref(roster[(idx + 1) % roster.length].id)) : undefined}
        onSok={() => setVelger("spiller")}
        meta={`${roster.length} ${roster.length === 1 ? "SPILLER" : "SPILLERE"} I STALLEN`} /> : <Caps>DIN PLAN · {spillerNavn.toUpperCase()}</Caps>}
      <div role="tablist" aria-label="Nivå" className="a9-faner">
        {nivaaer.map(([k, l, mal]) => mal === "uke" || mal === "okt" || mal === "vol" || mal === "mal"
          ? <Valgpille key={k} rolle="tab" valgt={niva === mal} controlId={`workbench-niva-${k}`} onClick={() => byttNiva(mal as AG11Niva)}>{l}</Valgpille>
          : <Valgpille key={k} rolle="tab" valgt={false} controlId={`workbench-niva-${k}`} href={mal}>{l}</Valgpille>)}
      </div>
      <div className="a9-snarveier" role="group" aria-label="Snarveier">
        {snarveier.map(([ic, l, fn]) => <Knapp key={l} variant="secondary" size="sm" icon={ic} onClick={fn}>{l}</Knapp>)}
      </div>
      <div className="a9-mer"><Knapp variant="secondary" size="sm" icon={MoreHorizontal} aria-expanded={mer} onClick={() => setMer(true)}>Mer</Knapp></div>
      {harGruppeokter && <Caps>GRUPPEØKTER LIGGER I PLANEN AUTOMATISK · TILPASSET = «EGEN»</Caps>}
      {week.legacyWeekPlanCandidate && <div className="a9-rad"><InlineVarsel tone="warn" tittel="Eldre ukeplan må gjennomgås">
        En eldre plan finnes med originalåret {week.legacyWeekPlanCandidate.isoYear} og uke {week.legacyWeekPlanCandidate.weekNumber}. {week.legacyWeekPlanCandidate.warning}
      </InlineVarsel></div>}
      {motor.feil && <div className="a9-rad"><InlineVarsel tone="warn" tittel="Workbench">{motor.feil}</InlineVarsel><Knapp variant="ghost" size="sm" onClick={() => void motor.lastPaaNytt()}>{UI.retry}</Knapp></div>}
      <div className="a9-hoved a9-hoved--sidefelt">
        <section aria-label={niva === "uke" ? "Uke" : niva === "okt" ? "Økt" : niva === "vol" ? "Volum" : "Målsetninger"} className="pa-card a9-kort">
          {niva === "uke" ? ukeFlate : niva === "okt" ? oktFlate : niva === "vol" ? volumFlate : malFlate}
        </section>
        {sidefelt}
      </div>
    </div>

    {drag && <div aria-hidden className="a9-drag" style={{ ...akseStil(drag.kind === "akse" ? drag.akse : akseFra(drag.session.pyramid)), left: drag.x - 40, top: drag.y - 20 }}>
      {drag.kind === "akse" ? AKSE_NAVN[drag.akse] : klokke(drag.session.startMinute)}
    </div>}
    {mer && <Ark open onClose={() => setMer(false)} kicker={`Workbench · ${spillerNavn}`} title="Mer" footer={<Knapp variant="ghost" fullWidth onClick={() => setMer(false)}>Lukk</Knapp>}>
      <div role="list" className="a9-liste">{snarveier.map(([ic, l, fn], i) => <button key={l} type="button" role="listitem" className={`a9-listerad${i ? " a9-listerad--skille" : ""}`} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", minHeight: 52, width: "100%", borderTop: i ? "1px solid var(--border-hairline)" : "none", font: "500 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}
        onClick={() => { setMer(false); fn(); }}><Ikon icon={ic} size={18} />{l}</button>)}</div>
    </Ark>}
    {arkSession && <OktArk key={`${arkSession.id}:${arkSession.date}:${arkSession.startMinute}:${arkSession.durationMinutes}`} session={arkSession} spillerNavn={spillerNavn} motor={motor}
      onLukk={() => setArkOkt(null)} onApneOkt={(id) => { setArkOkt(null); byttNiva("okt", id); }} onNyOvelse={(s) => { setDrillTilRedigering(null); setOvelseFor(s); }} onRedigerOvelse={(s, drill) => { setDrillTilRedigering(drill); setOvelseFor(s); }} />}
    {nyOkt && <NyOktArk key={`${nyOkt.dato}:${nyOkt.startMinutt}:${nyOkt.pyramide ?? ""}`} utkast={nyOkt} travel={travel} onLukk={() => setNyOkt(null)}
      onOpprett={(v) => motor.opprett(v, () => setNyOkt(null), true)} />}
    {publiser && <PubliserArk motor={motor} spillerNavn={spillerNavn} idag={idag} onLukk={() => setPubliser(false)} />}
    {ukeplan && <UkeplanArk weekPlan={week.weekPlan} ukeNr={ukeNr} travel={travel} onLukk={() => setUkeplan(false)} onLagre={(d) => { motor.lagreUkeplan(d, () => setUkeplan(false)); }} />}
    {notat && <CoachnotatArk notat={week.weekPlan?.customNotes ?? ""} ukeNr={ukeNr} spillerNavn={spillerNavn} travel={travel} onLukk={() => setNotat(false)} onLagre={(t) => { motor.lagreUkeplan({ customNotes: t }, () => setNotat(false)); }} />}
    {ovelseFor && <OvelseArk key={`${ovelseFor.id}:${bankAkse}:${drillTilRedigering?.id ?? "ny"}`} session={ovelseFor} drill={drillTilRedigering ?? undefined} pyramide={(AKSE_NAVN[bankAkse] as PyramidArea)} travel={travel} onLukk={() => { setOvelseFor(null); setDrillTilRedigering(null); }}
      onSubmit={(o, ferdig) => {
        const lagret = () => { ferdig(); setOvelseFor(null); setDrillTilRedigering(null); };
        if (drillTilRedigering) motor.oppdaterOvelse(ovelseFor.id, drillTilRedigering.id, o, lagret);
        else motor.leggTilOvelse(ovelseFor.id, o, lagret);
      }} />}
    {velger && <VelgerArk modus={velger} liste={velger === "gruppe" ? grupper : roster} valgtId={velger === "gruppe" ? null : playerId}
      hrefFor={(id) => velger === "gruppe" ? `/admin/grupper/${id}/workbench` : spillerHref(id)} onLukk={() => setVelger(null)} />}
  </Side>;
}
