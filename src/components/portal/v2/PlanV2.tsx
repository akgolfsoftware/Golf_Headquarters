"use client";

/**
 * Valgt kilde: Train-lock ZIP (4), PH-07 Plan v3.dc.html.
 * Fasit: designsystem/train-lock/PH-07 Plan.dc.html
 * Fasit: designsystem/train-lock/PH-08 Plan tom uke.dc.html
 * Rigg: PH-07 Plan
 * Avvik:
 *   - Samme kalendergrunnlag i agenda og rutenett. Skole uten klokke vises
 *     som heldag; ingen tall eller coachnavn hentes fra eksempeldata.
 *   - Fem faktiske pyramidenivåer beholdes. Ny/rediger bruker eksisterende
 *     Workbench; bare WorkbenchSession flyttes direkte i dette arket.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, LockKeyhole, Plus, Target, X } from "lucide-react";
import { TrainLockStatus, TrainLockChip } from "@/components/train-lock/v3-elementer";
import { TimeGrid } from "@/components/v2/time-grid";
import { TrainLockCaddieKnapp } from "@/components/train-lock/player-chrome";
import type { TodaySession, WeekDay } from "@/app/portal/actions";
import type { KalenderHendelse } from "@/lib/domain/kalender-lag";
import type { UkePeriode } from "@/lib/portal-plan/uke-periode";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { formatKlokkePunkt } from "@/lib/portal/idag-visning";
import { byggPlanUke, nyPlanOktHref, plasserPlanBlokker, planSessionFraSvar, planTidsrom, PLAN_MIN_BLOCK_PX, PLAN_TIME_PX, type PlanBlokk, type PlanForslag } from "@/lib/portal/plan-visning";
import { moveSession, resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import styles from "./plan-v2.module.css";

const dagformat = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" });
const datoformat = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long" });
const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
const AKSENAVN = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering" };
function datoTekst(dato: string) { return dagformat.format(new Date(`${dato}T12:00:00Z`)); }
function statusTekst(b: PlanBlokk) {
  if (b.forslag) return "Forslag";
  if (b.lag === "SKOLE") return "Låst";
  const s = b.session?.status;
  return s === "COMPLETED" ? "Fullført" : s === "CANCELLED" ? "Avlyst" : s === "SKIPPED" ? "Hoppet over" : s === "IN_PROGRESS" ? "Pågår" : null;
}
function Status({ blokk }: { blokk: PlanBlokk }) {
  const tekst = statusTekst(blokk);
  if (!tekst) return null;
  return <TrainLockStatus compact variant={blokk.session?.status === "COMPLETED" ? "ok" : "mute"}>{blokk.lag === "SKOLE" ? <LockKeyhole size={11} aria-hidden /> : blokk.session?.status === "COMPLETED" ? <Check size={12} aria-hidden /> : null}{tekst}</TrainLockStatus>;
}

export type PlanV2Props = {
  data: { weekNumber: number; week: WeekDay[] };
  kalender?: KalenderHendelse[];
  forslag?: PlanForslag[];
  ukeOffset?: number;
  depthMode?: "simple" | "deep";
  periode?: UkePeriode | null;
};

export function PlanV2({ data, kalender = [], forslag = [], ukeOffset = 0, depthMode = "simple", periode = null }: PlanV2Props) {
  const router = useRouter();
  const [endringer, setEndringer] = useState<Record<string, TodaySession | null>>({});
  const [besvart, setBesvart] = useState<string[]>([]);
  const [valgtDag, setValgtDag] = useState(data.week.find((d) => d.isToday) ? OSLO_YMD_FMT.format(data.week.find((d) => d.isToday)!.date) : data.week[0] ? OSLO_YMD_FMT.format(data.week[0].date) : "");
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const laas = useRef(false);
  const ark = useRef<HTMLDialogElement>(null);
  const [flytting, setFlytting] = useState(false);
  const [flytteDato, setFlytteDato] = useState("");
  const [flytteTid, setFlytteTid] = useState("");
  const [forrigeUke, setForrigeUke] = useState(data.week);
  if (forrigeUke !== data.week) {
    setForrigeUke(data.week);
    setEndringer({});
    setBesvart([]);
  }

  // Bare serverbekreftede endringer tas inn. Oppfrisking kan gjenbruke samme
  // klientinstans; økt-ID fjernes før den bekreftede raden legges tilbake.
  const week = data.week.map((d) => ({ ...d, sessions: [
    ...d.sessions.filter((s) => !(s.id in endringer)),
    ...Object.values(endringer).filter((s): s is TodaySession => s !== null && OSLO_YMD_FMT.format(s.startTime) === OSLO_YMD_FMT.format(d.date)),
  ] }));
  const ventende = forslag.filter((f) => !besvart.includes(f.session.id));
  const plan = byggPlanUke(week, kalender, ventende);
  const dag = plan.dager.find((d) => d.dato === valgtDag) ?? plan.dager[0];
  const alleBlokker = plan.dager.flatMap((d) => d.blokker);
  const valgt = alleBlokker.find((b) => b.id === valgtId) ?? dag?.blokker.find((b) => b.session?.status === "IN_PROGRESS" && !b.forslag) ?? dag?.blokker.find((b) => b.session?.status === "PLANNED" && !b.forslag) ?? dag?.blokker[0];
  const tidsrom = planTidsrom(plan.dager);
  const prosent = plan.fremdrift.andel === null ? null : Math.round(plan.fremdrift.andel * 100);
  const nyHref = nyPlanOktHref(dag?.dato ?? "", ukeOffset);
  const ukeTekst = data.week.length ? datoformat.formatRange(data.week[0].date, data.week[data.week.length - 1].date) : "";
  const harOkter = week.some((d) => d.sessions.length > 0);

  function velg(b: PlanBlokk, medArk = false) {
    setValgtId(b.id); setValgtDag(b.dato); setFlytting(false); setFeil(null);
    if (medArk) ark.current?.showModal();
  }
  function lagreSvar(f: PlanForslag, decision: "ACCEPTED" | "REJECTED") {
    if (laas.current) return;
    laas.current = true; setFeil(null); setMelding(null);
    startTransition(async () => {
      try {
        const result = await resolvePlayerApproval({ sessionId: f.session.id, decision });
        if (!result.ok) { setFeil(result.error); return; }
        setBesvart((v) => [...v, f.session.id]);
        setEndringer((v) => ({ ...v, [f.session.id]: decision === "ACCEPTED" ? planSessionFraSvar(result.data) : null }));
        setMelding(decision === "ACCEPTED" ? "Økten er lagt i planen." : "Forslaget er avslått.");
        if (decision === "REJECTED") ark.current?.close();
        router.refresh();
      } catch { setFeil("Svaret ble ikke bekreftet. Planen er beholdt. Prøv igjen."); }
      finally { laas.current = false; }
    });
  }
  function startFlytting(b: PlanBlokk) {
    setFlytteDato(b.dato); setFlytteTid(formatKlokkePunkt(b.startMin ?? 0).replace(".", ":")); setFlytting(true); setFeil(null);
  }
  function flytt(e: FormEvent) {
    e.preventDefault();
    if (!valgt?.session || laas.current) return;
    const sessionId = valgt.session.id;
    const [h, m] = flytteTid.split(":").map(Number);
    laas.current = true; setFeil(null); setMelding(null);
    startTransition(async () => {
      try {
        const result = await moveSession({ sessionId, newDate: flytteDato, newStartMinute: h * 60 + m });
        if (!result.ok) { setFeil(result.error); return; }
        setEndringer((v) => ({ ...v, [sessionId]: planSessionFraSvar(result.data) }));
        setValgtDag(result.data.date); setFlytting(false); setMelding("Økten er flyttet."); router.refresh();
      } catch { setFeil("Flyttingen ble ikke bekreftet. Datoen du valgte er beholdt. Prøv igjen."); }
      finally { laas.current = false; }
    });
  }
  function svarKnapper(f: PlanForslag) {
    return <div className={styles.svar}><button type="button" disabled={pending} onClick={() => lagreSvar(f, "ACCEPTED")}>Legg i planen</button><button type="button" disabled={pending} onClick={() => lagreSvar(f, "REJECTED")}>Ikke denne uka</button></div>;
  }
  function fremdrift() {
    return <div className={styles.fremdrift} aria-label="Ukens økter"><div><span>{plan.fremdrift.gjennomfort} av {plan.fremdrift.planlagt} økter</span>{prosent !== null && <span>{prosent} %</span>}</div><div className={styles.spor} role={prosent === null ? undefined : "progressbar"} aria-label="Fullførte økter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prosent ?? undefined}><span style={{ width: `${prosent ?? 0}%` }} /></div></div>;
  }
  function detaljer(b?: PlanBlokk) {
    if (!b) return <div className={styles.tomInspektor}><Target size={48} strokeWidth={1} aria-hidden /><h2>Velg en økt</h2><p>Trykk på en avtale i uken for å se detaljene.</p></div>;
    const s = b.session;
    const hvile = s?.title.trim().toLocaleLowerCase("nb-NO") === "hvile";
    const avsluttet = s?.status === "COMPLETED" || s?.status === "CANCELLED" || s?.status === "SKIPPED";
    return <>
      <div className={styles.caps}>{b.forslag ? (b.forslag.coachName ? `Forslag fra ${b.forslag.coachName}` : "Forslag fra coach") : "Valgt avtale"}</div>
      <h2>{b.tittel}</h2><p className={styles.meta}>{datoTekst(b.dato)}{b.startMin !== null ? ` · ${formatKlokkePunkt(b.startMin)}` : " · Hele dagen"}{s ? ` · ${s.durationMin} min` : ""}{s?.sted ? <><br />{s.sted}</> : null}</p>
      <div className={styles.chips}>{s && <TrainLockChip>{AKSENAVN[s.pyramidArea]}</TrainLockChip>}<Status blokk={b} /></div>
      {s?.maalsetning && <div className={styles.maal}><div className={styles.caps}>Mål for økten</div><p>{s.maalsetning}</p></div>}
      {s && <div className={styles.balanse}><div className={styles.caps}>Ukens balanse</div><div className={styles.balanseSpor} aria-hidden>{AKSER.map((a) => <span key={a} style={{ height: `${plan.minutter.plannedByAxis[a] / Math.max(1, ...Object.values(plan.minutter.plannedByAxis)) * 60}px`, background: a === s.pyramidArea ? "var(--tl-fill)" : "var(--tl-hair)" }} />)}</div><dl>{AKSER.map((a) => <div key={a}><dt title={AKSENAVN[a]}>{a}</dt><dd>{plan.minutter.plannedByAxis[a]} min</dd></div>)}</dl><p>Planlagt varighet denne uken</p></div>}
      {s && <section className={styles.oppskrift}><div className={styles.caps}>Oppskrift</div>{s.drills.length ? s.drills.map((d, i) => <div key={d.id}><span>{i + 1}. {d.name}</span><small>{d.durationMinutes} min</small></div>) : <p>Ingen øvelser lagt til ennå.</p>}</section>}
      {b.lag === "SKOLE" && <p className={styles.meta}>Skoleavtalen vises fra timeplanen.</p>}
      {b.forslag ? svarKnapper(b.forslag) : s && !hvile ? <div className={styles.handlinger}>
        {s.status !== "CANCELLED" && s.status !== "SKIPPED" && <Link className={styles.primaer} href={s.href}>{s.status === "COMPLETED" ? "Se oppsummering" : s.status === "IN_PROGRESS" ? "Fortsett økt" : "Start økt"}</Link>}
        {!avsluttet && s.model === "wb" && !flytting && <button type="button" onClick={() => startFlytting(b)}>Flytt økt</button>}
        {!avsluttet && s.planSessionId && <Link href={`/portal/planlegge/workbench?${new URLSearchParams({ uke: String(ukeOffset), okt: s.planSessionId })}`}>Rediger økt</Link>}
      </div> : b.href ? <Link className={styles.primaer} href={b.href}>Åpne avtale</Link> : null}
      {flytting && s?.model === "wb" && <form onSubmit={flytt} className={styles.flyttForm}><label>Dato<input type="date" required value={flytteDato} onChange={(e) => setFlytteDato(e.target.value)} /></label><label>Klokkeslett<input type="time" required value={flytteTid} onChange={(e) => setFlytteTid(e.target.value)} /></label><button disabled={pending} type="submit">{pending ? "Lagrer …" : "Lagre tidspunkt"}</button><button type="button" disabled={pending} onClick={() => setFlytting(false)}>Avbryt</button></form>}
    </>;
  }

  return <div className={styles.plan} data-od-id="plan-root" aria-busy={pending}>
    <main className={styles.hoved}>
      <header className={styles.hode}><div><div className={styles.caps}>Uke {data.weekNumber} · {ukeTekst}</div><h1>Plan</h1></div><div className={styles.hodeHandlinger}><div className={styles.desktopProgresjon}>{fremdrift()}</div><Link href={nyHref} className={styles.ny} aria-label="Ny økt"><Plus size={19} aria-hidden /><span>Ny økt</span></Link><div className={styles.mic}><TrainLockCaddieKnapp /></div></div></header>
      <nav className={styles.ukeNav} aria-label="Velg uke"><Link aria-label="Forrige uke" href={`/portal/planlegge?uke=${Math.max(-52, ukeOffset - 1)}`}><ChevronLeft size={16} aria-hidden /></Link><Link href="/portal/planlegge">Denne uken</Link><Link aria-label="Neste uke" href={`/portal/planlegge?uke=${Math.min(52, ukeOffset + 1)}`}><ChevronRight size={16} aria-hidden /></Link></nav>
      <div className={styles.meldinger} aria-live="polite">{melding && <p role="status">{melding}</p>}{feil && <p role="alert">{feil}</p>}</div>
      <div className={styles.kompakt}>
        <div className={styles.ukepiller} aria-label="Dager i uken">{plan.dager.map((d) => <button type="button" key={d.dato} aria-label={datoTekst(d.dato)} aria-pressed={d.dato === dag?.dato} onClick={() => { setValgtDag(d.dato); setValgtId(null); }}><span>{d.navn.slice(0, 1)}</span><strong>{d.datoTall}</strong><i data-prikk={d.blokker.some((b) => b.session && !b.forslag && b.session.status !== "CANCELLED" && b.session.status !== "SKIPPED")} /></button>)}</div>
        {fremdrift()}
        <div className={styles.dagOgForslag}><section><h2 className={styles.dagTittel}>{dag ? datoTekst(dag.dato) : "Denne uken"}</h2><div className={styles.agenda}>{dag?.blokker.filter((b) => !b.forslag).map((b) => <button type="button" key={b.id} className={styles.rad} onClick={() => velg(b, true)} aria-haspopup="dialog"><span className={styles.radTid}>{b.startMin === null ? "Heldag" : formatKlokkePunkt(b.startMin)}<span className={styles.radStatus}><Status blokk={b} /></span></span><span className={styles.radSkille} /><span className={styles.radTekst}><strong>{b.tittel}</strong><span>{b.undertekst ?? (b.lag === "SKOLE" ? "Timeplan" : b.lag === "TURNERING" ? "Turnering" : "")}</span></span><span className={styles.radSlutt}><Status blokk={b} />{!statusTekst(b) && <ChevronRight size={17} aria-hidden />}</span></button>)}</div>
          {!dag?.blokker.some((b) => !b.forslag) && <div className={styles.tom}><Target size={harOkter ? 44 : 90} strokeWidth={1} aria-hidden /><h3>{harOkter ? "Ingen avtaler denne dagen" : "Plass til en god uke"}</h3><p>{harOkter ? "Du kan legge inn en økt når det passer." : "Legg inn din første økt, eller åpne planleggeren sammen med coachen din."}</p><Link href={nyHref}>Legg inn en økt <Plus size={16} aria-hidden /></Link></div>}
        </section><section className={styles.forslagListe} aria-label="Forslag fra coach">{ventende.length > 0 && <h2 className={styles.forslagHode}>Venter på svar</h2>}{ventende.map((f) => <article className={styles.forslagKort} key={f.session.id}><div className={styles.caps}>{f.coachName ? `Forslag fra ${f.coachName}` : "Forslag fra coach"}</div><button type="button" className={styles.forslagTittel} aria-haspopup="dialog" onClick={() => velg(alleBlokker.find((b) => b.forslag?.session.id === f.session.id)!, true)}>{f.session.title}</button><p>{datoformat.format(f.session.startTime)} · {f.session.durationMin} min{f.session.sted ? ` · ${f.session.sted}` : ""}</p>{svarKnapper(f)}</article>)}</section></div>
      </div>
      <div className={styles.desktopGrid}>
        <div className={styles.gridKort}>
          <TimeGrid days={plan.dager.map((d) => ({ id: d.dato, dow: d.navn, date: String(d.datoTall), today: d.idag }))} {...tidsrom} stackedHeader hourPx={PLAN_TIME_PX} bordered={false} showNowLine={false} style={{ overflow: "visible", paddingBottom: PLAN_MIN_BLOCK_PX }} renderDay={(i) => plasserPlanBlokker(plan.dager[i].blokker).map(({ blokk: b, fra, til, spor, antallSpor }) => {
            const hoyde = (til - fra) / 60 * PLAN_TIME_PX;
            return <button type="button" key={b.id} aria-label={`${b.tittel}, ${datoTekst(b.dato)}, ${formatKlokkePunkt(fra)}${statusTekst(b) ? `, ${statusTekst(b)}` : ""}`} aria-pressed={valgt?.id === b.id} onClick={() => velg(b)} className={styles.gridBlokk} data-forslag={!!b.forslag} data-kort={hoyde < 48} style={{ top: (fra - tidsrom.startHour * 60) / 60 * PLAN_TIME_PX, height: hoyde, left: `calc(${spor / antallSpor * 100}% + 3px)`, width: `calc(${100 / antallSpor}% - 6px)` } as CSSProperties}>{hoyde >= 62 && <small>{b.session ? AKSENAVN[b.session.pyramidArea] : b.lag === "BOOKING" ? "Coaching" : "Avtale"}</small>}<strong>{b.tittel}</strong></button>;
          })} />
          {plan.dager.some((d) => d.blokker.some((b) => b.heldag)) && <div className={styles.heldager}><span className={styles.caps}>Heldag</span><div>{plan.dager.map((d) => <div key={d.dato}>{d.blokker.filter((b) => b.heldag).map((b) => <button type="button" key={b.id} onClick={() => velg(b)} aria-pressed={valgt?.id === b.id}>{b.lag === "SKOLE" && <LockKeyhole size={11} aria-hidden />}{b.tittel}</button>)}</div>)}</div></div>}
        </div>
      </div>
      {depthMode === "deep" && periode && <div className={styles.periode}><span className={styles.caps}>{periode.navn}</span>{periode.fokus && <p>{periode.fokus}</p>}</div>}
      <Link className={styles.planlegger} href={`/portal/planlegge/workbench?uke=${ukeOffset}`}>Åpne planleggeren <ChevronRight size={16} aria-hidden /></Link>
    </main>
    <aside className={styles.inspektor} aria-label="Detaljer om valgt avtale">{detaljer(valgt)}</aside>
    <dialog ref={ark} className={styles.ark} aria-label="Detaljer om avtalen" onClose={() => setFlytting(false)} onKeyDown={(e) => {
      if (e.key !== "Tab") return;
      const felt = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]')).filter((el) => el.getClientRects().length > 0);
      if (!felt.length) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === felt[0]) { e.preventDefault(); felt.at(-1)?.focus(); }
      else if (!e.shiftKey && document.activeElement === felt.at(-1)) { e.preventDefault(); felt[0].focus(); }
    }} onClick={(e) => { if (e.target === ark.current) { const r = ark.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) ark.current.close(); } }}><div className={styles.arkHode}><span className={styles.caps}>Plan</span><button type="button" aria-label="Lukk øktdetaljer" onClick={() => ark.current?.close()}><X size={20} aria-hidden /></button></div><div className={styles.arkKropp}>{detaljer(valgt)}{feil && <p role="alert">{feil}</p>}{melding && <p role="status">{melding}</p>}</div></dialog>
  </div>;
}
