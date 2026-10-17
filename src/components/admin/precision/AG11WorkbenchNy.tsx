"use client";

/**
 * AG-11 Workbench for coach i nytt design (designbrevet 13.10.2026, pakke 4).
 * Fasit: docs/design-system/utkast-agencyos/workbench.html, skjerm «AG-11 Spiller».
 * Stil: src/styles/agencyos-ny-workbench.css. Spillerens Workbench (PH-11)
 * bruker fortsatt AG11Workbench; denne gjelder bare /admin/workbench/[playerId].
 *
 * Det som virker som før (useUkeMotor og wb-actions): legge inn, flytte,
 * åpne, publisere, trekke tilbake og slette økter, øvelser fra banken og
 * serier. Nytt: coachen kan legge inn, endre og slette spillerens perioder
 * (coachLagrePeriode/coachSlettPeriode, som ikke hadde noen kaller), privat
 * coachnotat (coachLagreNotat), dupliser uke (coachDuplicateWeek) og dupliser
 * økt (coachDuplicateSession). Lenke til hele Øvelsesbanken (/admin/ovelser).
 *
 * Avvik:
 *   - «Sist brukt» finnes ikke: appen lagrer ikke hvilke spillere coachen
 *     åpnet sist. Lista er utelatt.
 *   - Gjenta: appen gjentar bare «hver uke» i N uker (serie). «Annenhver uke»,
 *     «valgte dager», «til dato» og «ut perioden» finnes ikke og vises ikke.
 *   - Kvitteringen etter lagring sier hva som ble lagret, ikke hvilke nivåer
 *     som ble oppdatert: nivåene leser samme økter (§PLANNIVÅENE HENGER SAMMEN),
 *     men appen teller ikke opp uker og måneder i kvitteringen.
 *   - «Bruk mal på spiller» åpner malene i Plan; appen har ingen handling som
 *     legger en mal rett inn i uka herfra.
 *   - Bildene på øvelsene og fylte øktkort med bilde er ikke i datamodellen.
 */
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronRight as Pil, Copy, FileText, Search, StickyNote, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useUkeMotor } from "@/components/workbench/useUkeMotor";
import { osloIdag } from "@/components/workbench/WeekGrid";
import { Avatar } from "@/components/admin/agencyos-ny/ny";
import { NyOktArk, OktArk, OvelseArk, PubliserArk, VelgerArk, kildeMerke, klokke, type NyOktUtkast } from "./AG11Ark";
import { PERIODE_KLASSE, PERIODE_NAVN, PeriodeArk, type PeriodeArkPeriode } from "./AG11PeriodeArk";
import { formatMinutes } from "@/lib/domain/workbench/labels";
import { addDays, isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { Drill, PlanningGoalSummary, PyramidArea, SourceItem, WeekViewModel, WorkbenchSession, YearPeriodBand } from "@/lib/domain/workbench/types";
import type { WorkbenchFysTurneringData } from "@/lib/workbench/fys-turnering-data";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { flyttPlanUke, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { coachDuplicateSession, coachDuplicateWeek, coachLagreNotat, coachLagrePeriode, coachSlettPeriode } from "@/lib/workbench/session-actions";
import type { PeriodeInput } from "@/lib/workbench/perioder";
import { formaterVarighet } from "@/lib/format-tall";
import "@/styles/agencyos-ny-workbench.css";

export type AG11NyProps = {
  playerId: string;
  spillerNavn: string;
  uke: WeekViewModel;
  kilder: SourceItem[];
  roster: readonly { id: string; navn: string }[];
  grupper: readonly { id: string; navn: string }[];
  goals: PlanningGoalSummary[];
  fys: WorkbenchFysTurneringData;
  /** Spillerens perioder i året uka ligger i (loadYear). */
  perioder: YearPeriodBand[];
  /** Coachens private notater om spilleren, nyeste først. */
  notater: { id: string; content: string; createdAt: string }[];
  planKontekst?: PlanReferanse;
  valgtOktId?: string;
  /** Åpner et nivå i flaten: perioder eller målsetninger. */
  startNiva?: "uke" | "periode" | "mal";
};

const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const AKSE_KL: Record<PyramidArea, string> = { FYS: "f", TEK: "t", SLAG: "s", SPILL: "p", TURN: "u" };
const DAGNAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const HENDELSER = new Set(["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"]);
const ddmm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
const kort = (iso: string) => new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" }).format(new Date(`${iso}T12:00:00Z`)).replace(".", "");
const ak = (p: PyramidArea) => p.toLowerCase();

function akseTimer(uke: WeekViewModel): Partial<Record<PyramidArea, number>> | null {
  const wp = uke.weekPlan;
  if (!wp) return null;
  const m: Partial<Record<PyramidArea, number>> = {
    FYS: (wp.plannedHoursFys ?? 0) * 60, TEK: (wp.plannedHoursTek ?? 0) * 60, SLAG: (wp.plannedHoursSlag ?? 0) * 60, SPILL: (wp.plannedHoursSpill ?? 0) * 60, TURN: (wp.plannedHoursTurn ?? 0) * 60,
  };
  return Object.values(m).some((v) => (v ?? 0) > 0) ? m : null;
}

function periodeNaa(perioder: YearPeriodBand[], weekStart: string): string {
  const slutt = addDays(weekStart, 6);
  const p = perioder.find((x) => !HENDELSER.has(x.type) && x.startDate <= slutt && x.endDate >= weekStart);
  if (!p) return "Ingen periode";
  const uker = Math.max(1, Math.round((Date.parse(p.endDate) - Date.parse(p.startDate)) / 604_800_000) + (p.endDate.slice(5) === p.startDate.slice(5) ? 0 : 0));
  const nr = Math.max(1, Math.floor((Date.parse(weekStart) - Date.parse(p.startDate)) / 604_800_000) + 1);
  return `${PERIODE_NAVN[p.type]}${p.focus ? ` · ${p.focus}` : ""} · uke ${Math.min(nr, uker)} av ${uker}`;
}

export function AG11WorkbenchNy({ playerId, spillerNavn, uke, kilder, roster, grupper, goals, fys, perioder, notater, planKontekst, valgtOktId, startNiva = "uke" }: AG11NyProps) {
  const router = useRouter();
  const motor = useUkeMotor({ playerId, uke });
  const { week, travel, utkast, alleOkter } = motor;
  const idag = osloIdag();
  const referanse: PlanReferanse = { ...planKontekst, uke: week.weekStart };
  const url = (visning: Parameters<typeof workbenchUrl>[1], ref: PlanReferanse = {}) => workbenchUrl(playerId, visning, ref, "agency", referanse);
  const ukeNr = isoWeekNumber(week.weekStart);
  const aar = Number(week.weekStart.slice(0, 4));

  const [niva, setNiva] = useState<"uke" | "periode" | "mal">(startNiva);
  const [akse, setAkse] = useState<PyramidArea | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [dra, setDra] = useState<{ type: "akse"; akse: PyramidArea } | { type: "okt"; id: string } | { type: "kilde"; id: string } | null>(null);
  const [nyOkt, setNyOkt] = useState<NyOktUtkast | null>(null);
  const [apenOktId, setApenOktId] = useState<string | null>(valgtOktId ?? null);
  const [ovelse, setOvelse] = useState<{ session: WorkbenchSession; drill?: Drill } | null>(null);
  const [publiser, setPubliser] = useState(false);
  const [velger, setVelger] = useState<"spiller" | "gruppe" | null>(null);
  const [periodeArk, setPeriodeArk] = useState<{ periode: PeriodeArkPeriode | null } | null>(null);
  const [dupliserVelg, setDupliserVelg] = useState(false);
  const [bankAkse, setBankAkse] = useState<PyramidArea>("SLAG");
  const [notatApent, setNotatApent] = useState(false);
  const [notatTekst, setNotatTekst] = useState("");
  const [lokaleNotater, setLokaleNotater] = useState(notater);
  const [venter, start] = useTransition();

  const apenOkt = useMemo(() => alleOkter.find((s) => s.id === apenOktId) ?? null, [alleOkter, apenOktId]);
  const fordelt = useMemo(() => akseTimer(week), [week]);
  const lagtInn = useMemo(() => {
    const m: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    for (const s of alleOkter) m[s.pyramid] += s.durationMinutes;
    return m;
  }, [alleOkter]);
  const sumLagt = AKSER.reduce((s, a) => s + lagtInn[a], 0);
  const sumFordelt = fordelt ? AKSER.reduce((s, a) => s + (fordelt[a] ?? 0), 0) : 0;
  const idx = roster.findIndex((r) => r.id === playerId);
  const bytt = (d: number) => roster.length > 1 && idx >= 0 && router.push(workbenchUrl(roster[(idx + d + roster.length) % roster.length].id, "uke", {}, "agency", planKontekst));
  const gaaUke = (d: number) => router.push(url("uke", { uke: flyttPlanUke(week.weekStart, d) }));
  const bankKilder = kilder.filter((k) => (k.kind === "DRILL" || k.kind === "TEK") && k.pyramid === bankAkse).slice(0, 6);
  const maler = kilder.filter((k) => k.kind === "TEMPLATE");
  const blokk = fys.physicalBlocks[0] ?? null;
  const nesteTurn = fys.tournamentPlans.find((t) => t.endDate >= idag) ?? fys.tournamentPlans[0] ?? null;
  const treningsperioder = perioder.filter((p) => !HENDELSER.has(p.type));

  const slippPaa = (dato: string) => {
    setOver(null);
    if (dra?.type === "akse") setNyOkt({ dato, startMinutt: 16 * 60, pyramide: dra.akse });
    else if (dra?.type === "okt") {
      const s = alleOkter.find((x) => x.id === dra.id);
      if (s && s.date !== dato) motor.flytt(s.id, { newDate: dato, newStartMinute: s.startMinute, newDurationMinutes: s.durationMinutes }, { newDate: s.date, newStartMinute: s.startMinute, newDurationMinutes: s.durationMinutes });
    } else if (dra?.type === "kilde") motor.fraKilde(dato, 16 * 60, dra.id, (id) => setApenOktId(id));
    setDra(null);
  };
  const trykkDag = (dato: string) => {
    if (akse) { setNyOkt({ dato, startMinutt: 16 * 60, pyramide: akse }); setAkse(null); }
    else setNyOkt({ dato, startMinutt: 16 * 60, pyramide: null });
  };
  const dupliserUke = () => start(async () => {
    const r = await coachDuplicateWeek(playerId, 1);
    if (!r.ok) { toast.error(r.error ?? "Uka ble ikke duplisert."); return; }
    toast.success(`${r.count ?? 0} økter er lagt inn i uke ${isoWeekNumber(flyttPlanUke(week.weekStart, 1))}`);
    router.refresh();
  });
  const dupliserOkt = (id: string) => start(async () => {
    const r = await coachDuplicateSession(playerId, id);
    setDupliserVelg(false);
    if (!r.ok) { toast.error(r.error ?? "Økta ble ikke duplisert."); return; }
    toast.success("Økta er duplisert som utkast");
    await motor.lastPaaNytt();
  });
  const lagreNotat = () => start(async () => {
    const r = await coachLagreNotat(playerId, notatTekst);
    if (!r.ok) { toast.error(r.error ?? "Notatet ble ikke lagret."); return; }
    setLokaleNotater((n) => [{ id: `ny-${Date.now()}`, content: notatTekst.trim(), createdAt: new Date().toISOString() }, ...n].slice(0, 3));
    setNotatTekst("");
    toast.success("Coachnotat lagret · bare for deg");
  });
  const lagrePeriode = (input: PeriodeInput, id?: string) => coachLagrePeriode(playerId, input, id);
  const slettPeriode = (id: string) => coachSlettPeriode(playerId, id);

  const topp = <div className="topp">
    <div className="velgerlinje">
      <div className="rad">
        <div className="valg" role="group" aria-label="Plan for">
          <button type="button" aria-pressed="true">Spiller</button>
          <button type="button" aria-pressed="false" onClick={() => (grupper.length === 1 ? router.push(`/admin/grupper/${grupper[0].id}/workbench`) : setVelger("gruppe"))} disabled={grupper.length === 0}>Gruppe</button>
        </div>
        <div className="hvem"><Avatar navn={spillerNavn} liten /><b>{spillerNavn}</b><button type="button" className="sok" onClick={() => setVelger("spiller")} aria-label="Søk etter spiller"><Search className="ikon" aria-hidden style={{ width: 16, height: 16, verticalAlign: -3, marginRight: 6 }} />Søk</button></div>
        <span className="pil"><button type="button" aria-label="Forrige spiller" disabled={roster.length < 2} onClick={() => bytt(-1)}><ChevronLeft className="ikon" aria-hidden /></button><button type="button" aria-label="Neste spiller" disabled={roster.length < 2} onClick={() => bytt(1)}><ChevronRight className="ikon" aria-hidden /></button></span>
      </div>
    </div>
    <div className="topp-rad">
      <div><div className="dato">{periodeNaa(perioder, week.weekStart)}</div><h1 className="tittel">Uke {ukeNr}</h1></div>
      <div className="knapper">
        <span className="pil"><button type="button" aria-label="Forrige uke" onClick={() => gaaUke(-1)}><ChevronLeft className="ikon" aria-hidden /></button><button type="button" aria-label="Neste uke" onClick={() => gaaUke(1)}><ChevronRight className="ikon" aria-hidden /></button></span>
        {utkast.length > 0 && <button type="button" className="knapp pri" onClick={() => setPubliser(true)}>Publiser {utkast.length} {utkast.length === 1 ? "utkast" : "utkast"}</button>}
      </div>
    </div>
    <div className="nivaer" role="group" aria-label="Nivå">
      <Link href={url("aar", { aar: String(aar) })}>År</Link>
      <button type="button" aria-pressed={niva === "periode"} onClick={() => setNiva(niva === "periode" ? "uke" : "periode")}>Periode</button>
      <Link href={url("maned", { maned: week.weekStart.slice(0, 7) })}>Måned</Link>
      <button type="button" aria-pressed={niva === "uke"} onClick={() => setNiva("uke")}>Uke</button>
      <button type="button" aria-pressed={false} disabled={alleOkter.length === 0} onClick={() => setApenOktId(apenOkt?.id ?? alleOkter[0]?.id ?? null)}>Økt</button>
      <button type="button" aria-pressed={niva === "mal"} onClick={() => setNiva(niva === "mal" ? "uke" : "mal")}>Målsetninger</button>
    </div>
    <div className="snarveier">
      <button type="button" disabled={venter || alleOkter.length === 0} onClick={dupliserUke}><Copy className="ikon" aria-hidden />Dupliser uke</button>
      <button type="button" disabled={venter || alleOkter.length === 0} onClick={() => setDupliserVelg(true)}>Dupliser økt</button>
      <Link href="/admin/plan?fane=ukemaler">Bruk mal på spiller</Link>
      <button type="button" aria-pressed={notatApent} onClick={() => setNotatApent((v) => !v)}><StickyNote className="ikon" aria-hidden />Coachnotat</button>
      <Link href={`/admin/spillere/${playerId}/plan`}><FileText className="ikon" aria-hidden />Søk i tekniske oppgaver</Link>
    </div>
  </div>;

  const akserader = <section className="kort" aria-label="Lagt inn mot fordelt">
    <div className="hoved"><strong>{sumLagt > 0 ? formaterVarighet(sumLagt) : "—"}</strong><span className="forklar">{fordelt ? `lagt inn av ${formaterVarighet(sumFordelt)} fordelt fra perioden` : "lagt inn · ingen timer fordelt fra perioden ennå"}</span></div>
    <div className="akserader">
      {AKSER.map((a) => {
        const f = fordelt?.[a] ?? 0;
        const pct = f > 0 ? Math.min(100, (lagtInn[a] / f) * 100) : lagtInn[a] > 0 ? 100 : 0;
        return <div key={a} className="akserad">
          <b><i className={`akse-prikk a-${ak(a)}`} aria-hidden style={{ marginRight: 6 }} />{a}</b>
          <span className="stolpe" role="img" aria-label={`${a}: ${formatMinutes(lagtInn[a])} lagt inn${f ? ` av ${formatMinutes(f)}` : ""}`}><span className={AKSE_KL[a]} style={{ width: `${pct}%` }} /></span>
          <span className="v">{lagtInn[a] ? formatMinutes(lagtInn[a]) : "—"}{f ? ` / ${formatMinutes(f)}` : ""}</span>
        </div>;
      })}
    </div>
    {!fordelt && <p className="kildetekst kilde">Fordelt kommer fra perioden eller ukeplanen. Legg inn timer per akse i perioden, så vises de her.</p>}
  </section>;

  const coachnotat = notatApent && <div className="coachnotat">
    <b>Coachnotat · bare for deg</b>
    {lokaleNotater.length > 0 && <div className="tidl">{lokaleNotater.map((n) => <span key={n.id}><time dateTime={n.createdAt}>{kort(n.createdAt.slice(0, 10))}</time>{n.content}</span>)}</div>}
    <textarea aria-label="Nytt coachnotat" value={notatTekst} onChange={(e) => setNotatTekst(e.target.value)} placeholder="Turnering lørdag. Hold torsdag lett." maxLength={2000} />
    <div className="knapper"><button type="button" className="knapp sek" disabled={venter || !notatTekst.trim()} onClick={lagreNotat}>Lagre notat</button></div>
    <span className="kilde">Spilleren ser aldri coachnotatene.</span>
  </div>;

  const ukegrid = <div className="ukegrid" role="list" aria-label="Uka">
    {week.days.map((d, i) => {
      const dato = d.date;
      const erIdag = dato === idag;
      return <div key={dato} role="listitem" className={`wb-dag${erIdag ? " idag" : ""}`} data-over={over === dato ? "" : undefined}
        onDragOver={(e) => { if (dra) { e.preventDefault(); setOver(dato); } }} onDragLeave={() => setOver((o) => (o === dato ? null : o))} onDrop={(e) => { e.preventDefault(); slippPaa(dato); }}>
        <h3>{DAGNAVN[i]}<span>{ddmm(dato)}</span></h3>
        {d.lockedBlocks.map((b) => <span key={b.id} className="wb-opptatt">{klokke(b.startMinute)} {b.title}</span>)}
        {d.sessions.map((s) => {
          const merke = kildeMerke(s);
          return <button key={s.id} type="button" className={`wb-okt ${ak(s.pyramid)}${s.status === "DRAFT" ? " utkast" : ""}${s.status === "COMPLETED" ? " ferdig" : ""}`}
            aria-pressed={apenOktId === s.id} draggable onDragStart={() => setDra({ type: "okt", id: s.id })} onDragEnd={() => { setDra(null); setOver(null); }}
            onClick={() => setApenOktId(s.id)} aria-label={`${klokke(s.startMinute)} ${s.title}, ${s.pyramid}, ${formatMinutes(s.durationMinutes)}${s.status === "DRAFT" ? ", utkast" : ""}`}>
            <span className="kl">{klokke(s.startMinute)}</span><b>{s.title}</b><span>{formatMinutes(s.durationMinutes)}{s.drills.length ? ` · ${s.drills.length} øvelser` : ""}{s.status === "DRAFT" ? " · utkast" : s.status === "COMPLETED" ? " · gjennomført" : ""}</span>
            {merke === "gruppe" && <span className="merke">Gruppe</span>}{merke === "egen" && <span className="merke egen">Egen</span>}
          </button>;
        })}
        <button type="button" className={`slipp${akse || dra ? " klar" : ""}`} onClick={() => trykkDag(dato)}>{akse ? `+ ${akse}-økt` : "+ Legg inn"}</button>
      </div>;
    })}
  </div>;

  const perioderPanel = <section className="seksjon" aria-label="Perioder">
    <div className="sek-topp"><h2>Perioder {aar}</h2><button type="button" className="knapp sek" onClick={() => setPeriodeArk({ periode: null })}>Ny periode</button></div>
    {treningsperioder.length === 0
      ? <div className="kort dempet"><b className="undertittel">Ingen perioder i {aar}</b><p className="forklar">En periode fordeler timer per akse på ukene. Legg inn den første, så får ukene timene herfra.</p></div>
      : <div className="periodeliste">{treningsperioder.map((p) => <button key={p.id} type="button" className="periode" onClick={() => setPeriodeArk({ periode: { id: p.id, type: p.type, startDate: p.startDate, endDate: p.endDate, focus: p.focus, notat: p.notat, axisMinutes: p.axisMinutes, axisMinutesLight: p.axisMinutesLight, fraGruppe: p.fraGruppe } })}>
        <i className={PERIODE_KLASSE[p.type]} aria-hidden /><span><b>{PERIODE_NAVN[p.type]}{p.focus ? ` · ${p.focus}` : ""}</b><span className="kilde">{kort(p.startDate)}–{kort(p.endDate)} · {p.axisMinutes ? `${formaterVarighet(AKSER.reduce((s, a) => s + (p.axisMinutes?.[a] ?? 0), 0))} per uke` : "ingen timer fordelt"}{p.fraGruppe ? " · Fra gruppa" : ""}</span></span><Pil className="ikon" aria-hidden />
      </button>)}</div>}
    <Link className="lenke" href={url("periode", { aar: String(aar) })}>Fordeling og uker i perioden</Link>
  </section>;

  const malPanel = <section className="seksjon" aria-label="Målsetninger">
    <div className="sek-topp"><h2>Målsetninger</h2><Link className="lenke" href={url("mal")}>Alle målsetninger</Link></div>
    {goals.length === 0 ? <div className="kort dempet"><b className="undertittel">Ingen målsetninger</b><p className="forklar">Spilleren har ikke lagt inn målsetninger ennå.</p></div>
      : <div className="liste">{goals.map((g) => <div key={g.id}><span className="ikonboks"><Trophy className="ikon" aria-hidden /></span><span><b>{g.title}</b><span className="kilde">{g.typeLabel}{g.targetDate ? ` · innen ${kort(g.targetDate)}` : ""} · {g.fremdrift.hasData ? g.fremdrift.detail : "ingen data ennå"}</span></span><span className="mono">{g.fremdrift.hasData ? `${g.fremdrift.pct} %` : "—"}</span></div>)}</div>}
  </section>;

  const sidefelt = <aside className="sidefelt">
    <details open>
      <summary>Øvelsesbank <small>Pyramiden først</small></summary>
      <div className="inni">
        <div className="akse-chips" role="group" aria-label="Pyramide">{AKSER.map((a) => <button key={a} type="button" className={ak(a)} aria-pressed={bankAkse === a} onClick={() => setBankAkse(a)}>{a}</button>)}</div>
        {bankKilder.length === 0 ? <p className="kilde">Ingen øvelser for {bankAkse} i banken ennå.</p>
          : bankKilder.map((k) => <button key={k.id} type="button" className="ovelse" draggable onDragStart={() => setDra({ type: "kilde", id: k.id })} onDragEnd={() => { setDra(null); setOver(null); }}
            onClick={() => (apenOkt ? motor.drillFraKilde(apenOkt.id, k.id) : toast.message("Åpne en økt først, eller dra øvelsen til en dag."))} aria-label={`${k.title}: legg i åpen økt eller dra til en dag`}>
            <b>{k.title}</b><span className="kilde">{k.durationMinutes ? `${k.durationMinutes} min` : k.subtitle ?? "—"}</span>{k.drill?.akFormel?.label && <code>{k.drill.akFormel.label}</code>}
          </button>)}
        <Link className="lenke" href="/admin/ovelser">Hele øvelsesbanken</Link>
        <Link className="lenke" href="/admin/plan?fane=ovelser">+ Egen øvelse</Link>
      </div>
    </details>
    <details><summary>Fysisk program <small>{blokk ? blokk.title : "—"}</small></summary><div className="inni"><p className="forklar">{blokk ? `${blokk.weeks.length} uker · ${blokk.weeks.reduce((s, w) => s + w.sessions.length, 0)} økter` : "Ingen fysisk plan ennå."}</p><Link className="lenke" href={`/admin/workbench/${playerId}?pille=fys`}>Åpne fysisk plan</Link></div></details>
    <details><summary>Øktmaler <small>{maler.length}</small></summary><div className="inni"><p className="forklar">{maler.length ? maler.slice(0, 4).map((m) => m.title).join(" · ") : "Ingen maler i banken."}</p><Link className="lenke" href="/admin/plan?fane=ukemaler">Alle maler</Link></div></details>
    <details><summary>Turneringer <small>{nesteTurn ? kort(nesteTurn.startDate) : "—"}</small></summary><div className="inni"><p className="forklar">{nesteTurn ? `${nesteTurn.title} · ${kort(nesteTurn.startDate)}–${kort(nesteTurn.endDate)}` : "Ingen turneringsplan ennå."}</p><Link className="lenke" href={`/admin/workbench/${playerId}?pille=turn`}>Åpne turneringer</Link></div></details>
    <Link className="rad-lenke" href={`/admin/spillere/${playerId}/plan`}><b>Teknisk plan</b><Pil className="ikon" aria-hidden /></Link>
  </aside>;

  return <div className="agn-s">
    {topp}
    {motor.feil && <div className="varsel advarsel" role="alert"><b className="undertittel">Noe gikk galt</b><p className="forklar">{motor.feil}</p></div>}
    {niva === "periode" && perioderPanel}
    {niva === "mal" && malPanel}
    <div className="wb">
      <div className="seksjon" style={{ gap: "var(--r5)" }}>
        {akserader}
        {coachnotat}
        <section className="seksjon" aria-label="Legg inn økt">
          <div className="drakker" role="group" aria-label="Legg inn økt">{AKSER.map((a) => <button key={a} type="button" className={ak(a)} aria-pressed={akse === a} draggable onDragStart={() => setDra({ type: "akse", akse: a })} onDragEnd={() => { setDra(null); setOver(null); }} onClick={() => setAkse(akse === a ? null : a)}>{a}</button>)}</div>
          <p className="kilde">Dra en akse inn på en dag. Eller trykk aksen, så dagen.</p>
        </section>
        {ukegrid}
      </div>
      {sidefelt}
    </div>

    {nyOkt && <NyOktArk utkast={nyOkt} travel={travel} onLukk={() => setNyOkt(null)} onOpprett={(v) => motor.opprett(v, (id) => { setNyOkt(null); if (id) setApenOktId(id); }, true)} />}
    {apenOkt && <OktArk key={apenOkt.id} session={apenOkt} spillerNavn={spillerNavn} motor={motor} onLukk={() => setApenOktId(null)} onApneOkt={(id) => setApenOktId(id)} onNyOvelse={(s) => setOvelse({ session: s })} onRedigerOvelse={(s, d) => setOvelse({ session: s, drill: d })} />}
    {ovelse && <OvelseArk session={ovelse.session} pyramide={ovelse.session.pyramid} drill={ovelse.drill} travel={travel} onLukk={() => setOvelse(null)}
      onSubmit={(o, ferdig) => (ovelse.drill ? motor.oppdaterOvelse(ovelse.session.id, ovelse.drill.id, o, () => { ferdig(); setOvelse(null); }) : motor.leggTilOvelse(ovelse.session.id, o, () => { ferdig(); setOvelse(null); }))} />}
    {publiser && <PubliserArk motor={motor} spillerNavn={spillerNavn} idag={idag} onLukk={() => setPubliser(false)} />}
    {velger && <VelgerArk modus={velger} liste={velger === "spiller" ? roster : grupper} valgtId={velger === "spiller" ? playerId : null}
      hrefFor={(id) => (velger === "spiller" ? workbenchUrl(id, "uke", {}, "agency", planKontekst) : `/admin/grupper/${id}/workbench`)} onLukk={() => setVelger(null)} />}
    {periodeArk && <PeriodeArk periode={periodeArk.periode} year={aar} hvem="spiller" onLukk={() => setPeriodeArk(null)} onLagret={() => { setPeriodeArk(null); router.refresh(); }} onLagre={lagrePeriode} onSlett={slettPeriode} />}
    {dupliserVelg && <div className="ark-lag" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setDupliserVelg(false); }}>
      <div className="ark" role="dialog" aria-modal="true" aria-label="Velg økta du vil duplisere">
        <div className="ark-topp"><h2>Dupliser økt</h2><button type="button" className="lukk" aria-label="Lukk" onClick={() => setDupliserVelg(false)}>×</button></div>
        <p className="forklar">Velg økta. Kopien legges inn som utkast samme dag.</p>
        <div className="liste">{alleOkter.map((s) => <button key={s.id} type="button" disabled={venter} onClick={() => dupliserOkt(s.id)}><i className={`akse-prikk a-${ak(s.pyramid)}`} aria-hidden /><span><b>{s.title}</b><span className="kilde">{DAGNAVN[week.days.findIndex((d) => d.date === s.date)] ?? ""} {klokke(s.startMinute)} · {formatMinutes(s.durationMinutes)}</span></span><Pil className="ikon" aria-hidden /></button>)}</div>
      </div>
    </div>}
  </div>;
}
