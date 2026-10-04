"use client";

/**
 * PH-10 Plan: uke — Precision Athletics (7d7c2994, overlevering/codex.md).
 * Tegningen ui_kits/playerhq/screens/PH-10.jsx ligger ikke i git.
 *
 * Samme data og handlinger som den tidligere ukevisningen: forslag,
 * flytting av Workbench-økt, ny økt og redigering i Workbench.
 *
 * Bevisste avvik:
 *   - År, måned og eget dagsrutenett fra designrunden 28.09 er ikke denne flaten.
 *     Mobil viser valgt dag. År og måned åpnes i Workbench.
 *   - /portal/kalender og /portal/kalender/opptatt er fortsatt egne flater.
 *   - Caddie-knappen er ikke med. Caddie er en egen skjerm.
 *   - Konflikt er tidsatt overlapp mot skole, booking, turnering eller test.
 *     Heldag merkes ikke som konflikt på hver økt. Rust brukes ikke her.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, CircleAlert, LockKeyhole, Plus, Target } from "lucide-react";
import { AkseMerke, FeilTilstand, Ikon, Knapp, KnappLenke, Meta, Sidehode, StatusPille, Tall, TomTilstand, type Akse } from "@/components/precision/pa";
import type { TodaySession, WeekDay } from "@/app/portal/actions";
import type { KalenderHendelse, KalenderLag } from "@/lib/domain/kalender-lag";
import type { UkePeriode } from "@/lib/portal-plan/uke-periode";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { formatKlokkePunkt } from "@/lib/portal/idag-visning";
import {
  byggPlanUke, nyPlanOktHref, oktOverlapperOpptattTid, plasserPlanBlokker, planSessionFraSvar, planTidsrom,
  PLAN_TIME_PX, type PlanBlokk, type PlanForslag,
} from "@/lib/portal/plan-visning";
import { moveSession, resolvePlayerApproval } from "@/lib/workbench/wb-actions";

const dagformat = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" });
const datoformat = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long" });
const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
const AKSENAVN = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering" };
const AKSE: Record<string, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const datoTekst = (dato: string) => dagformat.format(new Date(`${dato}T12:00:00Z`));
const tid = (min: number) => formatKlokkePunkt(min);

function statusTekst(b: PlanBlokk) {
  if (b.forslag) return "Forslag";
  if (b.lag === "SKOLE") return "Låst";
  const s = b.session?.status;
  return s === "COMPLETED" ? "Fullført" : s === "CANCELLED" ? "Avlyst" : s === "SKIPPED" ? "Hoppet over" : s === "IN_PROGRESS" ? "Pågår" : null;
}

function Status({ blokk, konflikt }: { blokk: PlanBlokk; konflikt: boolean }) {
  const tekst = konflikt ? "Konflikt" : statusTekst(blokk);
  if (!tekst) return null;
  const tone = tekst === "Fullført" ? "ok" : tekst === "Pågår" ? "live" : tekst === "Konflikt" ? "warn" : "neutral";
  return <StatusPille tone={tone}>{blokk.lag === "SKOLE" ? <Ikon icon={LockKeyhole} size={12} /> : null}{tekst}</StatusPille>;
}

export type PH10Props = {
  data: { weekNumber: number; week: WeekDay[] };
  kalender?: KalenderHendelse[];
  forslag?: PlanForslag[];
  ukeOffset?: number;
  depthMode?: "simple" | "deep";
  periode?: UkePeriode | null;
  harTekniskPlan?: boolean;
  tilstand?: "data" | "feil";
};

export function PH10Plan({ data, kalender = [], forslag = [], ukeOffset = 0, depthMode = "simple", periode = null, harTekniskPlan = false, tilstand = "data" }: PH10Props) {
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

  const week = data.week.map((d) => ({ ...d, sessions: [
    ...d.sessions.filter((s) => !(s.id in endringer)),
    ...Object.values(endringer).filter((s): s is TodaySession => s !== null && OSLO_YMD_FMT.format(s.startTime) === OSLO_YMD_FMT.format(d.date)),
  ] }));
  const ventende = forslag.filter((f) => !besvart.includes(f.session.id));
  const plan = byggPlanUke(week, kalender, ventende);
  const dag = plan.dager.find((d) => d.dato === valgtDag) ?? plan.dager[0];
  const alleBlokker = plan.dager.flatMap((d) => d.blokker);
  const konflikt = (b: PlanBlokk) => oktOverlapperOpptattTid(b, plan.dager.find((d) => d.dato === b.dato)?.blokker ?? []);
  const valgt = alleBlokker.find((b) => b.id === valgtId) ?? dag?.blokker.find((b) => b.session?.status === "IN_PROGRESS" && !b.forslag) ?? dag?.blokker.find((b) => b.session?.status === "PLANNED" && !b.forslag) ?? dag?.blokker[0];
  const tidsrom = planTidsrom(plan.dager);
  const prosent = plan.fremdrift.andel === null ? null : Math.round(plan.fremdrift.andel * 100);
  const nyHref = nyPlanOktHref(dag?.dato ?? "", ukeOffset);
  const ukeTekst = data.week.length ? datoformat.formatRange(data.week[0].date, data.week[data.week.length - 1].date) : "";
  const harOkter = week.some((d) => d.sessions.length > 0);
  const timer = Array.from({ length: Math.max(0, tidsrom.endHour - tidsrom.startHour) }, (_, i) => tidsrom.startHour + i);
  const hoyde = (tidsrom.endHour - tidsrom.startHour) * PLAN_TIME_PX;

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
    setFlytteDato(b.dato); setFlytteTid(tid(b.startMin ?? 0).replace(".", ":")); setFlytting(true); setFeil(null);
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
    return <div className="ph10-handlinger">
      <Knapp variant="primary" disabled={pending} loading={pending} loadingText="Lagrer …" onClick={() => lagreSvar(f, "ACCEPTED")}>Legg i planen</Knapp>
      <Knapp variant="secondary" disabled={pending} onClick={() => lagreSvar(f, "REJECTED")}>Ikke denne uka</Knapp>
    </div>;
  }

  function detaljer(b?: PlanBlokk) {
    if (!b) return <TomTilstand icon={Target} title="Velg en økt" text="Trykk på en avtale i uken for å se detaljene." />;
    const s = b.session;
    const hvile = s?.title.trim().toLocaleLowerCase("nb-NO") === "hvile";
    const avsluttet = s?.status === "COMPLETED" || s?.status === "CANCELLED" || s?.status === "SKIPPED";
    const akse = s ? AKSE[s.pyramidArea] : undefined;
    const maks = Math.max(1, ...AKSER.map((a) => plan.minutter.plannedByAxis[a] ?? 0));
    return <div className="ph10-detalj">
      <Meta>{b.forslag ? (b.forslag.coachName ? `Forslag fra ${b.forslag.coachName}` : "Forslag fra coach") : "Valgt avtale"}</Meta>
      <h2>{b.tittel}</h2>
      <p className="ph10-meta">{datoTekst(b.dato)}{b.startMin !== null ? ` · ${tid(b.startMin)}` : " · Hele dagen"}{s ? ` · ${s.durationMin} min` : ""}{s?.sted ? ` · ${s.sted}` : ""}</p>
      <div className="ph10-merker">{akse && <AkseMerke axis={akse} />}<Status blokk={b} konflikt={konflikt(b)} /></div>
      {s?.maalsetning && <div><Meta>Mål for økten</Meta><p>{s.maalsetning}</p></div>}
      {s && <div>
        <Meta>Ukens balanse</Meta>
        <div className="ph10-balanse" aria-hidden>{AKSER.map((a) => <span key={a} style={{ height: `${(plan.minutter.plannedByAxis[a] ?? 0) / maks * 48}px`, background: a === s.pyramidArea ? `var(--axis-${AKSE[a]})` : "var(--border-hairline)" }} />)}</div>
        <dl className="ph10-minutter">{AKSER.map((a) => <div key={a}><dt>{a}</dt><dd><Tall>{plan.minutter.plannedByAxis[a] ?? 0}</Tall> min</dd></div>)}</dl>
        <Meta>Planlagt varighet denne uken</Meta>
      </div>}
      {s && <section aria-label="Oppskrift"><Meta>Oppskrift</Meta>{s.drills.length ? s.drills.map((d, i) => <div className="ph10-ovelse" key={d.id}><span>{i + 1}. {d.name}</span><Meta>{d.durationMinutes} min</Meta></div>) : <p className="ph10-meta">Ingen øvelser lagt til ennå.</p>}</section>}
      {b.lag === "SKOLE" && <p className="ph10-meta">Skoleavtalen vises fra timeplanen.</p>}
      {b.forslag ? svarKnapper(b.forslag) : s && !hvile ? <div className="ph10-handlinger">
        {s.status !== "CANCELLED" && s.status !== "SKIPPED" && <KnappLenke href={s.href}>{s.status === "COMPLETED" ? "Se oppsummering" : s.status === "IN_PROGRESS" ? "Fortsett økt" : "Start økt"}</KnappLenke>}
        {!avsluttet && s.model === "wb" && !flytting && <Knapp variant="secondary" onClick={() => startFlytting(b)}>Flytt økt</Knapp>}
        {!avsluttet && s.planSessionId && <KnappLenke variant="ghost" href={`/portal/planlegge/workbench?${new URLSearchParams({ uke: String(ukeOffset), okt: s.planSessionId })}`}>Rediger økt</KnappLenke>}
      </div> : b.href ? <KnappLenke href={b.href}>Åpne avtale</KnappLenke> : null}
      {flytting && s?.model === "wb" && <form onSubmit={flytt} className="ph10-flytt">
        <label>Dato<input type="date" required value={flytteDato} onChange={(e) => setFlytteDato(e.target.value)} /></label>
        <label>Klokkeslett<input type="time" required value={flytteTid} onChange={(e) => setFlytteTid(e.target.value)} /></label>
        <Knapp disabled={pending} loading={pending} type="submit">Lagre tidspunkt</Knapp>
        <Knapp variant="ghost" disabled={pending} onClick={() => setFlytting(false)}>Avbryt</Knapp>
      </form>}
    </div>;
  }

  const kicker = `Uke ${data.weekNumber}${ukeTekst ? ` · ${ukeTekst}` : ""}`;
  return <div className="pa-side ph10" data-od-id="plan-root" aria-busy={pending}>
    <div className="ph10-hode">
      <Sidehode kicker={kicker} title="Plan" sub={harOkter ? `${plan.fremdrift.gjennomfort} av ${plan.fremdrift.planlagt} økter denne uken` : "Ingen økter denne uken."} />
      <div className="ph10-hode-handlinger">
        <KnappLenke href={nyHref} icon={Plus} iconName="plus">Ny økt</KnappLenke>
      </div>
    </div>
    {tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Kunne ikke hente uken" text="Tilkoblingen ble brutt. Ingenting er endret i planen." code="FEIL · PLAN" retry={<Knapp variant="secondary" onClick={() => router.refresh()}>Prøv igjen</Knapp>} /> : <>
      <nav className="ph10-ukenav" aria-label="Velg uke">
        <Link className="pa-btn pa-btn--secondary pa-btn--sm" aria-label="Forrige uke" href={`/portal/planlegge?uke=${Math.max(-52, ukeOffset - 1)}`}><Ikon icon={ChevronLeft} size={16} /></Link>
        <Link className="pa-btn pa-btn--ghost pa-btn--sm" href="/portal/planlegge">Denne uken</Link>
        <Link className="pa-btn pa-btn--secondary pa-btn--sm" aria-label="Neste uke" href={`/portal/planlegge?uke=${Math.min(52, ukeOffset + 1)}`}><Ikon icon={ChevronRight} size={16} /></Link>
      </nav>
      <Fremdrift gjennomfort={plan.fremdrift.gjennomfort} planlagt={plan.fremdrift.planlagt} prosent={prosent} />
      <div className="ph10-meldinger" aria-live="polite">{melding && <p role="status">{melding}</p>}{feil && <p role="alert">{feil}</p>}</div>
      <div className="ph10-kompakt">
        <div className="ph10-piller" aria-label="Dager i uken">{plan.dager.map((d) => <button type="button" key={d.dato} aria-label={datoTekst(d.dato)} aria-pressed={d.dato === dag?.dato} onClick={() => { setValgtDag(d.dato); setValgtId(null); }}><span>{d.navn.slice(0, 1)}</span><strong>{d.datoTall}</strong></button>)}</div>
        <section aria-label={dag ? datoTekst(dag.dato) : "Denne uken"}>
          <h2 className="ph10-dagtittel">{dag ? datoTekst(dag.dato) : "Denne uken"}</h2>
          <div className="ph10-agenda">{dag?.blokker.filter((b) => !b.forslag).map((b) => <button type="button" key={b.id} className="ph10-rad" onClick={() => velg(b, true)} aria-haspopup="dialog">
            <span className="ph10-rad-tid">{b.startMin === null ? "Heldag" : tid(b.startMin)}</span>
            <span><strong>{b.tittel}</strong><Meta>{b.undertekst ?? (b.lag === "SKOLE" ? "Timeplan" : b.lag === "TURNERING" ? "Turnering" : LAG[b.lag] ?? "")}</Meta></span>
            <Status blokk={b} konflikt={konflikt(b)} />
          </button>)}</div>
          {!dag?.blokker.some((b) => !b.forslag) && <TomTilstand icon={harOkter ? CalendarRange : Target} title={harOkter ? "Ingen avtaler denne dagen" : "Plass til en god uke"} text={harOkter ? "Du kan legge inn en økt når det passer." : "Legg inn din første økt, eller åpne planleggeren sammen med coachen din."} actions={<KnappLenke href={nyHref} icon={Plus} iconName="plus">Legg inn en økt</KnappLenke>} />}
        </section>
        {ventende.length > 0 && <section aria-label="Forslag fra coach" className="ph10-forslag">
          <h2>Venter på svar</h2>
          {ventende.map((f) => <article key={f.session.id} className="pa-card ph10-forslagkort">
            <Meta>{f.coachName ? `Forslag fra ${f.coachName}` : "Forslag fra coach"}</Meta>
            <button type="button" className="ph10-forslagtittel" aria-haspopup="dialog" onClick={() => velg(alleBlokker.find((b) => b.forslag?.session.id === f.session.id)!, true)}>{f.session.title}</button>
            <p className="ph10-meta">{datoformat.format(f.session.startTime)} · {f.session.durationMin} min{f.session.sted ? ` · ${f.session.sted}` : ""}</p>
            {svarKnapper(f)}
          </article>)}
        </section>}
      </div>
      <div className="ph10-layout">
        <div className="ph10-desktop pa-card" aria-label="Ukerutenett">
          <div className="ph10-grid" style={{ gridTemplateColumns: `48px repeat(${plan.dager.length || 1}, minmax(0,1fr))` }}>
            <div />
            {plan.dager.map((d) => <div key={d.dato} className={d.idag ? "ph10-daghode ph10-daghode--idag" : "ph10-daghode"}><span>{d.navn}</span><strong>{d.datoTall}</strong></div>)}
            <div className="ph10-timer" style={{ height: hoyde }}>{timer.map((h) => <span key={h} style={{ top: (h - tidsrom.startHour) * PLAN_TIME_PX }}>{tid(h * 60)}</span>)}</div>
            {plan.dager.map((d) => <div key={d.dato} className="ph10-kolonne" style={{ height: hoyde }}>{plasserPlanBlokker(d.blokker).map(({ blokk: b, fra, til, spor, antallSpor }) => {
              const px = (til - fra) / 60 * PLAN_TIME_PX;
              const stil: CSSProperties = { top: (fra - tidsrom.startHour * 60) / 60 * PLAN_TIME_PX, height: px, left: `calc(${spor / antallSpor * 100}% + 3px)`, width: `calc(${100 / antallSpor}% - 6px)`, boxShadow: b.session ? `inset 3px 0 0 var(--axis-${AKSE[b.session.pyramidArea] ?? "tek"})` : undefined };
              return <button type="button" key={b.id} className="ph10-blokk" data-forslag={b.forslag ? "true" : undefined} aria-label={`${b.tittel}, ${datoTekst(b.dato)}, ${tid(fra)}${statusTekst(b) ? `, ${statusTekst(b)}` : ""}${konflikt(b) ? ", Konflikt" : ""}`} aria-pressed={valgt?.id === b.id} onClick={() => velg(b)} style={stil}>{px >= 48 && <small>{b.session ? AKSENAVN[b.session.pyramidArea] : b.lag === "BOOKING" ? "Coaching" : "Avtale"}</small>}<strong>{b.tittel}</strong></button>;
            })}</div>)}
          </div>
          {plan.dager.some((d) => d.blokker.some((b) => b.heldag)) && <div className="ph10-heldag"><Meta>Heldag</Meta><div>{plan.dager.map((d) => <div key={d.dato}>{d.blokker.filter((b) => b.heldag).map((b) => <button type="button" key={b.id} aria-pressed={valgt?.id === b.id} onClick={() => velg(b)}>{b.lag === "SKOLE" && <Ikon icon={LockKeyhole} size={12} />}{b.tittel}</button>)}</div>)}</div></div>}
        </div>
        <aside className="ph10-inspektor pa-card" aria-label="Detaljer om valgt avtale">{detaljer(valgt)}</aside>
      </div>
      {depthMode === "deep" && periode && <p className="ph10-meta"><Meta>{periode.navn}</Meta>{periode.fokus ? ` ${periode.fokus}` : ""}</p>}
      <div className="ph10-innganger">
        <KnappLenke variant="secondary" href={`/portal/planlegge/workbench?uke=${ukeOffset}`} iconRight={ChevronRight}>Åpne planleggeren</KnappLenke>
        <KnappLenke variant="ghost" href="/portal/kalender">Kalender</KnappLenke>
        <KnappLenke variant="ghost" href="/portal/kalender/opptatt">Opptatt tid</KnappLenke>
        {harTekniskPlan && <KnappLenke variant="ghost" href="/portal/tren/teknisk-plan">Teknisk plan</KnappLenke>}
      </div>
    </>}
    <dialog ref={ark} className="ph10-ark" aria-label="Detaljer om avtalen" onClose={() => setFlytting(false)} onKeyDown={(e) => {
      if (e.key !== "Tab") return;
      const felt = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]')).filter((el) => el.getClientRects().length > 0);
      if (!felt.length) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === felt[0]) { e.preventDefault(); felt.at(-1)?.focus(); }
      else if (!e.shiftKey && document.activeElement === felt.at(-1)) { e.preventDefault(); felt[0].focus(); }
    }} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="ph10-ark-hode"><Meta>Plan</Meta><button type="button" className="pa-iconbtn" aria-label="Lukk øktdetaljer" onClick={() => ark.current?.close()}>×</button></div>
      <div className="ph10-ark-kropp">{detaljer(valgt)}{feil && <p role="alert">{feil}</p>}{melding && <p role="status">{melding}</p>}</div>
    </dialog>
  </div>;
}

const LAG: Partial<Record<KalenderLag, string>> = { SKOLE: "Timeplan", TURNERING: "Turnering", TESTER: "Test", BOOKING: "Booking", OEKTER: "Økt" };

function Fremdrift({ gjennomfort, planlagt, prosent }: { gjennomfort: number; planlagt: number; prosent: number | null }) {
  return <div className="ph10-fremdrift" aria-label="Ukens økter">
    <div><span>{gjennomfort} av {planlagt} økter</span>{prosent !== null && <Tall>{prosent} %</Tall>}</div>
    <div className="ph10-spor" role={prosent === null ? undefined : "progressbar"} aria-label="Fullførte økter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prosent ?? undefined}><span style={{ width: `${prosent ?? 0}%` }} /></div>
  </div>;
}
