"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, Send } from "lucide-react";
import { AkseMerke, Knapp, type Akse } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { CoachnotatArk, NyOktArk, OktArk, OvelseArk, PubliserArk, UkeplanArk, UKETYPE_NAVN, dagOgDato, klokke, type NyOktUtkast } from "@/components/admin/precision/AG11Ark";
import { TreningsvolumVisning } from "@/components/admin/precision/TreningsvolumVisning";
import { useUkeMotor } from "./useUkeMotor";
import { STATUS_LABEL } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { Drill, SourceItem, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import { flyttPlanUke, osloPlanDato } from "@/lib/workbench/plan-kontekst";
import { klassiskWorkbenchUrl, samletWorkbenchUrl } from "@/lib/workbench/samlet-url";
import { WorkbenchTreukerssyklus } from "./WorkbenchTreukerssyklus";
import { UKEPLAN_TYPER } from "@/lib/workbench/ukeplan-schema";

const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
const KILDER: Record<SourceItem["kind"], string> = { DRILL: "Øvelser", TEMPLATE: "Øktmaler", PROGRAM: "Program", PREVIOUS_WEEK: "Tidligere uker", TEK: "Teknisk plan" };

export function WorkbenchUkeverksted({ data }: { data: WorkbenchSamletData }) {
  const motor = useUkeMotor({ playerId: data.player.id, uke: data.uke });
  const { week, travel } = motor;
  const router = useRouter();
  const forrigeUke = useRef(week);
  useEffect(() => { if (forrigeUke.current !== week) { forrigeUke.current = week; router.refresh(); } }, [week, router]);
  const propValgtId = data.valgtOkt?.id ?? data.planKontekst.referanse.okt ?? null;
  const [valg, setValg] = useState({ propId: propValgtId, id: propValgtId });
  // Et nytt servervalg (og Tilbake/Frem) skifter økt, uten å nullstille åpne ark.
  const valgtId = valg.propId === propValgtId ? valg.id : propValgtId;
  if (valg.propId !== propValgtId) setValg({ propId: propValgtId, id: propValgtId });
  const [dag, setDag] = useState(week.days.find(d => d.date === osloPlanDato())?.date ?? week.weekStart);
  const [q, setQ] = useState("");
  const [akse, setAkse] = useState<string>("ALLE");
  const [kilde, setKilde] = useState<SourceItem | null>(null);
  const [ny, setNy] = useState<NyOktUtkast | null>(null);
  const [rediger, setRediger] = useState(false);
  const [ovelse, setOvelse] = useState<{ session: WorkbenchSession; drill?: Drill } | null>(null);
  const [publiser, setPubliser] = useState(false);
  const [ukeplan, setUkeplan] = useState(false);
  const [syklus, setSyklus] = useState(false);
  const [notat, setNotat] = useState(false);
  const [mobilPanel, setMobilPanel] = useState<"bibliotek" | "detaljer" | null>(null);
  const [plassertid, setPlassertid] = useState("16:00");
  const valgt = motor.alleOkter.find(s => s.id === valgtId) ?? null;
  const synlige = motor.alleOkter.filter(s => s.status !== "CANCELLED");
  const treff = data.kilder.filter(k => (!q || `${k.title} ${k.subtitle ?? ""}`.toLocaleLowerCase("nb-NO").includes(q.toLocaleLowerCase("nb-NO"))) && (akse === "ALLE" || k.pyramid === akse));
  const referanse = { ...data.planKontekst.referanse, uke: week.weekStart };
  const alleStart = [...synlige.map(s => s.startMinute), ...week.days.flatMap(d => d.lockedBlocks.map(b => b.startMinute))];
  const forste = Math.max(0, Math.min(7, ...alleStart.map(m => Math.floor(m / 60))));
  const siste = Math.min(23, Math.max(21, ...alleStart.map(m => Math.floor(m / 60))));
  const typeNavn = UKEPLAN_TYPER.find(t => t.id === week.weekPlan?.planningDetails?.weekType)?.navn ?? (week.weekPlan ? UKETYPE_NAVN[week.weekPlan.weekType] : "Ingen uketype valgt");
  const sluttTime = Math.max(siste + 1, ...synlige.map(s => Math.ceil((s.startMinute + s.durationMinutes) / 60)), ...week.days.flatMap(d => d.lockedBlocks.map(b => Math.ceil((b.startMinute + b.durationMinutes) / 60))));
  const timer = Array.from({ length: sluttTime - forste }, (_, i) => forste + i);
  const dagBredder = week.days.map(d => {
    const intervals = [...d.sessions.filter(s => s.status !== "CANCELLED"), ...d.lockedBlocks];
    const grenser = intervals.flatMap(s => [{ time: s.startMinute, delta: 1 }, { time: s.startMinute + s.durationMinutes, delta: -1 }]).sort((a, b) => a.time - b.time || a.delta - b.delta);
    let aktive = 0, maks = 0; for (const g of grenser) { aktive += g.delta; maks = Math.max(maks, aktive); }
    return Math.max(100, maks * 50);
  });
  const velgOkt = (id: string | null) => {
    setValg({ propId: propValgtId, id });
    if (id) router.replace(samletWorkbenchUrl(data.player.id, "uke", { ...referanse, okt: id }, data.routeSurface, {}, { niva: data.planKontekst.visning }), { scroll: false });
  };
  const plasser = (dato: string, startMinute: number) => {
    if (kilde) {
      motor.fraKilde(dato, startMinute, kilde.id, id => { velgOkt(id); setKilde(null); });
    } else setNy({ dato, startMinutt: startMinute, pyramide: akse === "ALLE" ? null : AKSER.find(a => a === akse) ?? null });
  };
  const kort = (s: WorkbenchSession, mobil = false) => <button type="button" key={s.id} className="ws-session" data-status={s.status} aria-pressed={s.id === valgtId}
    style={{ "--ws-axis": `var(--axis-${s.pyramid.toLowerCase()})`, "--ws-axis-soft": `var(--axis-${s.pyramid.toLowerCase()}-bg)` } as CSSProperties}
    draggable={!travel} onDragStart={e => e.dataTransfer.setData("application/x-workbench-session", s.id)}
    onClick={() => { velgOkt(s.id); setDag(s.date); if (mobil) setMobilPanel("detaljer"); }}>
    <small className="ws-num">{mobil ? `${klokke(s.startMinute)}–${klokke(s.startMinute + s.durationMinutes)} · ${STATUS_LABEL[s.status]}` : `${klokke(s.startMinute)} · ${s.durationMinutes} min · ${s.pyramid}`}</small><strong>{s.title}</strong>
    {!mobil && <><small>{STATUS_LABEL[s.status]}{s.needsPlayerApproval ? " · Venter på svar" : ""}{s.seriesId ? " · Serie" : ""}</small>
    <small>Registrert {s.actualMinutes == null ? "—" : `${s.actualMinutes} min`}</small></>}
  </button>;
  const bibliotek = <>
        <section className="ws-section"><h2 className="ws-library-title">Bibliotek</h2><label className="ws-field">Søk i biblioteket<input type="search" value={q} onChange={e => setQ(e.target.value)} /></label>
          <label className="ws-field">Pyramide<select value={akse} onChange={e => setAkse(e.target.value)}><option value="ALLE">Alle områder</option>{AKSER.map(a => <option key={a}>{a}</option>)}</select></label>
          {kilde && <InlineVarsel tone="info">Velg en dag og et klokkeslett for «{kilde.title}». <button type="button" className="pa-btn pa-btn--ghost" onClick={() => setKilde(null)}>Avbryt plassering</button></InlineVarsel>}
          {!treff.length && <p className="ws-muted">Ingen kilder med dette filteret.</p>}
          <ul className="ws-library-list">{treff.map(k => <li key={k.id} className="ws-library-item" data-selected={kilde?.id === k.id} style={k.pyramid ? { "--ws-axis": `var(--axis-${k.pyramid.toLowerCase()})` } as CSSProperties : undefined}>
            <span className="ws-muted">{KILDER[k.kind]}{k.pyramid ? ` · ${k.pyramid}` : ""}</span><strong>{k.title}</strong>{k.subtitle && <span className="ws-muted">{k.subtitle}</span>}
            {k.durationMinutes != null && <span className="ws-num ws-muted">{k.durationMinutes} min</span>}
            <Knapp variant="secondary" size="sm" disabled={travel} onClick={() => { setKilde(k); setMobilPanel(null); }}>Plasser i uka</Knapp>
            {valgt && (k.kind === "DRILL" || k.kind === "TEK") && <Knapp variant="ghost" size="sm" disabled={travel} onClick={() => motor.drillFraKilde(valgt.id, k.id)}>Legg til valgt økt</Knapp>}
          </li>)}</ul>
        </section>
        <section className="ws-section"><h3>Innganger</h3>{[["fys", "Fysisk program"], ["turn", "Turneringer"], ["maler", "Øktmaler"], ["tp", "Teknisk plan"], ["mal", "Målsetninger"]].map(([side, navn]) => <Link key={side} href={`${klassiskWorkbenchUrl(data.player.id, side === "mal" ? "mal" : "uke", referanse, data.routeSurface)}&${side === "fys" || side === "turn" ? "pille" : "side"}=${side}`}>{navn}</Link>)}
          <Knapp variant="ghost" onClick={() => { setMobilPanel(null); setNotat(true); }}>Notat til uka</Knapp>
        </section>
      </>;
  const inspektor = <>
        {!valgt ? <div className="ws-empty"><h2>Ingen økt valgt</h2><p>Velg en økt i kalenderen for å se øvelser, registrering og handlinger.</p></div> : <>
          <section className="ws-section"><div className="ws-row"><AkseMerke axis={valgt.pyramid.toLowerCase() as Akse} /><span className="ws-muted">{STATUS_LABEL[valgt.status]}</span></div><h2>{valgt.title}</h2><p className="ws-num ws-muted">{dagOgDato(valgt.date)} kl. {klokke(valgt.startMinute)} · {valgt.durationMinutes} min</p>
            <dl className="ws-kv"><div><dt>Planlagt</dt><dd className="ws-num">{valgt.durationMinutes} min</dd></div><div><dt>Registrert</dt><dd className="ws-num">{valgt.actualMinutes == null ? "—" : `${valgt.actualMinutes} min`}</dd></div><div><dt>Serie</dt><dd>{valgt.seriesId ? "Gjentatt økt" : "Enkeltøkt"}</dd></div></dl>
            <Knapp variant="secondary" onClick={() => { setMobilPanel(null); setRediger(true); }}>Tid, serie og detaljer</Knapp>
            {valgt.status === "DRAFT" ? <Knapp disabled={travel} onClick={() => { setMobilPanel(null); setPubliser(true); }}>Forhåndsvis og publiser</Knapp> : <Link href={klassiskWorkbenchUrl(data.player.id, "live", { ...referanse, okt: valgt.id }, data.routeSurface)}>Gjennomfør økta</Link>}
          </section>
          <section className="ws-section"><h3>Øvelser i rekkefølge</h3><ol className="ws-inspector-list">{valgt.drills.map((d, i) => <li key={d.id}><strong>{d.title}</strong><p className="ws-muted">{d.durationMinutes} min</p>{d.akFormel.detaljer?.mal?.malsetning && <p>Målsetning: {d.akFormel.detaljer.mal.malsetning}</p>}{d.techniqueFocus && <p className="ws-muted">Historisk fokus / kildeposisjon: {d.techniqueFocus}</p>}<div className="ws-row">
            <Knapp size="sm" variant="ghost" disabled={travel} onClick={() => { setMobilPanel(null); setOvelse({ session: valgt, drill: d }); }}>Rediger</Knapp>
            <Knapp size="sm" variant="ghost" aria-label={`Flytt ${d.title} opp`} disabled={travel || i === 0} icon={ArrowUp} onClick={() => motor.flyttDrill(valgt, d.id, -1)}>Opp</Knapp>
            <Knapp size="sm" variant="ghost" aria-label={`Flytt ${d.title} ned`} disabled={travel || i === valgt.drills.length - 1} icon={ArrowDown} onClick={() => motor.flyttDrill(valgt, d.id, 1)}>Ned</Knapp>
            <Knapp size="sm" variant="ghost" disabled={travel} onClick={() => motor.fjernDrill(valgt.id, d.id)}>Fjern</Knapp>
          </div></li>)}</ol>{!valgt.drills.length && <p className="ws-muted">Ingen øvelser ennå.</p>}<Knapp variant="secondary" icon={Plus} disabled={travel} onClick={() => { setMobilPanel(null); setOvelse({ session: valgt }); }}>Legg til øvelse</Knapp></section>
          <section className="ws-section"><h3>Økta</h3><dl className="ws-kv"><div><dt>Formål</dt><dd>{valgt.rationale ?? "—"}</dd></div><div><dt>Sted</dt><dd>{valgt.location ?? "—"}</dd></div><div><dt>Målsetning</dt><dd>{valgt.maalsetning ?? "—"}</dd></div></dl>{valgt.notes && <p className="ws-muted">{valgt.notes}</p>}</section>
        </>}
      </>;
  const dagvalg = <div className="ws-day-tabs" role="group" aria-label="Velg dag">{week.days.map(d => <button type="button" key={d.date} aria-pressed={dag === d.date} onClick={() => setDag(d.date)}><small>{new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" }).format(new Date(`${d.date}T12:00:00Z`))}</small><strong className="ws-num">{Number(d.date.slice(8))}</strong><span className="ws-day-dots" aria-hidden>{d.sessions.filter(s => s.status !== "CANCELLED").slice(0, 5).map(s => <i key={s.id} style={{ background: `var(--axis-${s.pyramid.toLowerCase()})` }} />)}</span></button>)}</div>;
  const ukeVolum = <section className="ws-section"><h3>Ukens mengde</h3><p className="ws-muted">{data.volumKilde}</p><TreningsvolumVisning volum={data.volum} /></section>;
  return <>
    <div className="ws-mobile-day-selector">{dagvalg}</div>
    <div className="ws-toolbar ws-week-toolbar">
      <Link className="pa-iconbtn" aria-label="Forrige uke" href={samletWorkbenchUrl(data.player.id, "uke", { ...referanse, uke: flyttPlanUke(week.weekStart, -1) }, data.routeSurface)}><ChevronLeft size={18} /></Link>
      <h2><span className="ws-week-desktop">Uke {isoWeekNumber(week.weekStart)} <span className="ws-muted">{dagOgDato(week.weekStart)} · {typeNavn}</span></span><span className="ws-week-mobile">{new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${dag}T12:00:00Z`))}<small>Uke {isoWeekNumber(week.weekStart)} · {typeNavn}</small></span></h2>
      <Link className="pa-iconbtn" aria-label="Neste uke" href={samletWorkbenchUrl(data.player.id, "uke", { ...referanse, uke: flyttPlanUke(week.weekStart, 1) }, data.routeSurface)}><ChevronRight size={18} /></Link>
      <div className="ws-week-actions"><Knapp variant="secondary" disabled={travel} onClick={() => setSyklus(true)}>Treukerssyklus</Knapp><Knapp variant="secondary" onClick={() => setUkeplan(true)}>Ukeplan</Knapp>
      <Knapp icon={Plus} disabled={travel} onClick={() => setNy({ dato: dag, startMinutt: 16 * 60, pyramide: null })}>Ny økt</Knapp>
      <Knapp variant="secondary" icon={Send} disabled={travel || motor.utkast.length === 0} onClick={() => setPubliser(true)}>Publiser · {motor.utkast.length}</Knapp></div>
    </div>
    {week.legacyWeekPlanCandidate && <div className="ws-pad"><InlineVarsel tone="warn" tittel="Eldre ukeplan må gjennomgås">En eldre plan finnes med originalåret {week.legacyWeekPlanCandidate.isoYear} og uke {week.legacyWeekPlanCandidate.weekNumber}. {week.legacyWeekPlanCandidate.warning}</InlineVarsel></div>}
    {motor.feil && <div className="ws-pad"><InlineVarsel tone="warn" tittel="Endringen kunne ikke fullføres">{motor.feil}</InlineVarsel><Knapp variant="ghost" onClick={() => void motor.lastPaaNytt()}>Prøv igjen</Knapp></div>}
    <div className="ws-week" aria-busy={travel}>
      <aside className="ws-library" aria-label="Bibliotek">{bibliotek}</aside>
      <main className="ws-panel" aria-label="Ukekalender">
        <div className="ws-calendar-scroll"><div className="ws-calendar ws-continuous-calendar" style={{ minWidth: `${50 + dagBredder.reduce((sum, w) => sum + w, 0)}px`, gridTemplateColumns: `50px ${dagBredder.map(w => `minmax(${w}px,1fr)`).join(" ")}` }}>
          <div className="ws-calendar-head">Kl.</div>{week.days.map(d => <div className="ws-calendar-head" data-selected={d.date === dag} key={d.date}>{dagOgDato(d.date)}</div>)}
          <div className="ws-week-hours" style={{ height: `${timer.length * 48}px` }}>{timer.map((h, i) => <span className="ws-num" key={h} style={{ top: `${i * 48}px` }}>{klokke(h * 60)}</span>)}</div>
          {week.days.map(d => <MobilDagKalender key={d.date} desktop dag={d.date} fraTime={forste} tilTime={sluttTime - 1} week={week} kort={s => kort(s)} travel={travel} plasser={minute => plasser(d.date, minute)} onDrop={(id, minute) => {
            const s = motor.alleOkter.find(s => s.id === id); if (s) motor.flytt(s.id, { newDate: d.date, newStartMinute: minute + s.startMinute % 60, newDurationMinutes: s.durationMinutes }, { newDate: s.date, newStartMinute: s.startMinute, newDurationMinutes: s.durationMinutes });
          }} />)}
        </div></div>
        <div className="ws-agenda">
          <div className="ws-mobile-panels" role="group" aria-label="Ukeverktøy"><Knapp variant="secondary" aria-expanded={mobilPanel === "bibliotek"} onClick={() => setMobilPanel("bibliotek")}>Bibliotek</Knapp><Knapp variant="secondary" aria-expanded={mobilPanel === "detaljer"} onClick={() => setMobilPanel("detaljer")}>Økt og ukesum</Knapp></div>
          {kilde && <InlineVarsel tone="info">Plasserer «{kilde.title}». Velg klokkeslett nedenfor.<Knapp variant="ghost" onClick={() => setKilde(null)}>Avbryt</Knapp></InlineVarsel>}
          <MobilDagKalender dag={dag} fraTime={forste} tilTime={siste} week={week} kort={s => kort(s, true)} />
          {!synlige.some(s => s.date === dag) && <p className="ws-muted">Ingen økter denne dagen.</p>}
          <div className="ws-mobile-placement"><label className="ws-field">Plasser kl.<input type="time" value={plassertid} onChange={e => setPlassertid(e.target.value)} /></label><Knapp disabled={travel || !plassertid} onClick={() => { const [h, m] = plassertid.split(":").map(Number); plasser(dag, h * 60 + m); }}>{kilde ? "Plasser valgt kilde" : "Legg til økt"}</Knapp></div>
        </div>
        <div className="ws-week-volume">{ukeVolum}</div>
      </main>
      <aside className="ws-inspector" aria-label="Valgt økt">{inspektor}</aside>
    </div>
    {mobilPanel && <Ark open title={mobilPanel === "bibliotek" ? "Bibliotek" : "Økt og ukesum"} onClose={() => setMobilPanel(null)} footer={<Knapp variant="ghost" onClick={() => setMobilPanel(null)}>Til kalenderen</Knapp>}><div className="ws-panel-ark">{mobilPanel === "bibliotek" ? bibliotek : <>{inspektor}{ukeVolum}</>}</div></Ark>}
    {ny && <NyOktArk utkast={ny} travel={travel} onLukk={() => setNy(null)} onOpprett={v => motor.opprett(v, id => { setNy(null); velgOkt(id); }, true)} />}
    {rediger && valgt && <OktArk key={valgt.id} session={valgt} spillerNavn={data.player.navn} motor={motor} onLukk={() => setRediger(false)} onApneOkt={id => { velgOkt(id); setRediger(false); }} onNyOvelse={session => { setRediger(false); setOvelse({ session }); }} onRedigerOvelse={(session, drill) => { setRediger(false); setOvelse({ session, drill }); }} />}
    {ovelse && <OvelseArk key={ovelse.drill?.id ?? ovelse.session.id} session={ovelse.session} drill={ovelse.drill} pyramide={ovelse.drill?.akFormel.pyramid ?? ovelse.session.pyramid} travel={travel} onLukk={() => setOvelse(null)} onSubmit={(o, ferdig) => {
      const klar = () => { ferdig(); setOvelse(null); };
      if (ovelse.drill) motor.oppdaterOvelse(ovelse.session.id, ovelse.drill.id, o, klar); else motor.leggTilOvelse(ovelse.session.id, o, klar);
    }} />}
    {publiser && <PubliserArk motor={motor} spillerNavn={data.player.navn} idag={osloPlanDato()} onLukk={() => setPubliser(false)} />}
    {syklus && <WorkbenchTreukerssyklus playerId={data.player.id} anchorWeek={week.weekStart} onLukk={() => setSyklus(false)} onLagret={() => { void motor.lastPaaNytt(); }} />}
    {ukeplan && <UkeplanArk weekPlan={week.weekPlan} ukeNr={isoWeekNumber(week.weekStart)} travel={travel} onLukk={() => setUkeplan(false)} onLagre={v => motor.lagreUkeplan(v, () => setUkeplan(false))} />}
    {notat && <CoachnotatArk notat={week.weekPlan?.customNotes ?? ""} ukeNr={isoWeekNumber(week.weekStart)} spillerNavn={data.player.navn} travel={travel} onLukk={() => setNotat(false)} onLagre={v => motor.lagreUkeplan({ customNotes: v }, () => setNotat(false))} />}
  </>;
}

/** Dagkalenderen bruker samme dato/tid som ukekalenderen. Overlapp får egne spor. */
function MobilDagKalender({ dag, fraTime, tilTime, week, kort, desktop = false, travel = false, plasser, onDrop }: {
  dag: string; fraTime: number; tilTime: number; week: WorkbenchSamletData["uke"]; kort: (s: WorkbenchSession) => React.ReactNode;
  desktop?: boolean; travel?: boolean; plasser?: (minute: number) => void; onDrop?: (id: string, minute: number) => void;
}) {
  const day = week.days.find(d => d.date === dag);
  const events = [
    ...(day?.sessions.filter(s => s.status !== "CANCELLED").map(s => ({ id: s.id, start: s.startMinute, end: s.startMinute + s.durationMinutes, session: s, block: null })) ?? []),
    ...(day?.lockedBlocks.map(b => ({ id: b.id, start: b.startMinute, end: b.startMinute + b.durationMinutes, session: null, block: b })) ?? []),
  ].sort((a, b) => a.start - b.start || a.end - b.end);
  const slots = new Map<string, { index: number; total: number }>();
  let group: typeof events = []; let slutt = -1;
  const finish = () => { if (!group.length) return; const spor: number[] = []; const indexes = group.map(e => { let i = spor.findIndex(end => end <= e.start); if (i < 0) i = spor.length; spor[i] = e.end; return i; }); group.forEach((e, i) => slots.set(e.id, { index: indexes[i], total: spor.length })); };
  for (const e of events) { if (e.start >= slutt) { finish(); group = []; slutt = -1; } group.push(e); slutt = Math.max(slutt, e.end); } finish();
  const endHour = Math.max(tilTime + 1, ...events.map(e => Math.ceil(e.end / 60)));
  const hours = Array.from({ length: endHour - fraTime }, (_, i) => fraTime + i);
  return <div className={`ws-day-calendar${desktop ? " ws-desktop-day" : ""}`} aria-label={desktop ? `Kalender ${dagOgDato(dag)}` : "Dagens kalender"} style={{ height: `${hours.length * 48}px` }} onDragOver={e => { if (onDrop && !travel) e.preventDefault(); }} onDrop={e => {
    if (!onDrop || travel) return; e.preventDefault(); const id = e.dataTransfer.getData("application/x-workbench-session");
    const minute = Math.max(fraTime * 60, Math.min((endHour - 1) * 60, fraTime * 60 + Math.floor((e.clientY - e.currentTarget.getBoundingClientRect().top) / 48) * 60));
    if (id) onDrop(id, minute);
  }}>
    {hours.map((h, i) => <div key={h} className="ws-day-hour" style={{ top: `${i * 48}px` }}><span className="ws-num">{klokke(h * 60).slice(0, 2)}</span></div>)}
    {plasser && hours.map((h, i) => <button key={h} className="ws-time-place" type="button" disabled={travel} style={{ top: `${i * 48}px` }} aria-label={`Legg til eller plasser økt ${dagOgDato(dag)} kl. ${klokke(h * 60)}`} onClick={() => plasser(h * 60)}>+</button>)}
    <div className="ws-day-events">{events.map(e => { const slot = slots.get(e.id)!; return <div key={e.id} className="ws-day-block" style={{ top: `${(e.start - fraTime * 60) / 60 * 48}px`, height: `${Math.max(44, (e.end - e.start) / 60 * 48 - 3)}px`, left: `calc(${slot.index / slot.total * 100}% + 3px)`, width: `calc(${100 / slot.total}% - 6px)` }}>{e.session ? kort(e.session) : <div className="ws-locked"><strong>{e.block!.title}</strong><small className="ws-num">{klokke(e.start)}–{klokke(e.end)} · Opptatt</small></div>}</div>; })}</div>
  </div>;
}
