"use client";

/**
 * PH-10 Plan: uka — nytt design (pakke 3, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, mal «plan». Stil: src/styles/playerhq-ny.css.
 *
 * Samme data og handlinger som før: forslag fra coach, flytting av Workbench-økt,
 * ny økt og redigering i Workbench.
 *
 * Skrå-drakt 20.10.2026 (alternativ C, valgt av Anders): lav topp med bilde, uka til venstre og «Nå» til høyre.
 * Avvik fra skissen: «dager til turnering» er ikke med, fordi Plan ikke henter dem i dag (Målsetninger er med, som i I dag);
 * «lagt inn mot fordelt» er «planlagt», siden perioden ikke har timer per akse ennå (beslutninger.md §PLANNIVÅENE).
 *
 * Avvik:
 *   - Øktkortene har ikke bilde ennå. Bildene i utkastet er ikke avklart (designbrevet, punkt 2).
 *   - Laget «Google-kalender» og radene «Google-kalender er koblet» og «Be coach endre planen»
 *     er ikke med: appen har ingen Google-kobling eller slik forespørsel i dag.
 *   - År og Måned åpner Workbench, som i utkastet; Dag viser én dag av uka.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-10.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, LockKeyhole, Pencil, Plus, X } from "lucide-react";
import type { TodaySession, WeekDay } from "@/app/portal/actions";
import type { KalenderHendelse } from "@/lib/domain/kalender-lag";
import type { UkePeriode } from "@/lib/portal-plan/uke-periode";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { formatKlokkePunkt } from "@/lib/portal/idag-visning";
import { formaterVarighet } from "@/lib/format-tall";
import {
  byggPlanUke, nyPlanOktHref, oktOverlapperOpptattTid, planSessionFraSvar,
  type PlanBlokk, type PlanForslag, type PlanOpptatt,
} from "@/lib/portal/plan-visning";
import { moveSession, resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import { Maalsetninger, type PH01Maal } from "@/components/portal/precision/PH01IDag";
import { SkraFlyt, SkraHelt, SkraKort, SkraTom, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-plan-skra.css";

const dagformat = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" });
const kortDag = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", weekday: "long", day: "numeric", month: "short" });
const datoformat = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long" });
const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
const AKSE_KLASSE: Record<string, string> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const datoTekst = (dato: string) => dagformat.format(new Date(`${dato}T12:00:00Z`));
const dagTittel = (dato: string) => { const t = kortDag.format(new Date(`${dato}T00:00:00Z`)); return t.charAt(0).toUpperCase() + t.slice(1); };
const tid = (min: number) => formatKlokkePunkt(min);
const tidsrom = (fra: number | null, til: number | null) => fra === null ? "Hele dagen" : til === null ? tid(fra) : `${tid(fra)}–${tid(til)}`;

type Lag = "golf" | "fys" | "samling" | "opptatt";
const LAG_VALG: { id: Lag; navn: string; farge: string }[] = [
  { id: "golf", navn: "Golf", farge: "var(--phn-slag)" },
  { id: "fys", navn: "Fysisk", farge: "var(--phn-fys)" },
  { id: "samling", navn: "Samlinger og turneringer", farge: "var(--phn-g900)" },
  { id: "opptatt", navn: "Opptatt tid", farge: "var(--phn-sand-300)" },
];
function lagFor(b: PlanBlokk): Lag {
  if (b.session) return b.session.pyramidArea === "FYS" ? "fys" : "golf";
  if (b.lag === "SKOLE") return "opptatt";
  if (b.lag === "TURNERING" || b.lag === "TESTER") return "samling";
  return "golf";
}

function statusTekst(b: PlanBlokk) {
  if (b.forslag) return "Forslag";
  if (b.lag === "SKOLE") return "Låst";
  const s = b.session?.status;
  return s === "COMPLETED" ? "Fullført" : s === "CANCELLED" ? "Avlyst" : s === "SKIPPED" ? "Hoppet over" : s === "IN_PROGRESS" ? "Pågår" : null;
}

/** Plass i rekkefølgen: mobil er én kolonne sortert etter tallet; PC fordeler kortene på to kolonner (som PH01IDag). */
function Plass({ n, children }: { n: number; children: React.ReactNode }) {
  return <div className="skra-plass" style={{ order: n }}>{children}</div>;
}

export type PH10Props = {
  data: { weekNumber: number; week: WeekDay[] };
  kalender?: KalenderHendelse[];
  forslag?: PlanForslag[];
  opptatt?: PlanOpptatt[];
  ukeOffset?: number;
  depthMode?: "simple" | "deep";
  periode?: UkePeriode | null;
  harTekniskPlan?: boolean;
  maal?: PH01Maal[];
  tilstand?: "data" | "feil";
};

export function PH10Plan({ data, kalender = [], forslag = [], opptatt = [], ukeOffset = 0, depthMode = "simple", periode = null, harTekniskPlan = false, maal = [], tilstand = "data" }: PH10Props) {
  const router = useRouter();
  const [endringer, setEndringer] = useState<Record<string, TodaySession | null>>({});
  const [besvart, setBesvart] = useState<string[]>([]);
  const idag = data.week.find((d) => d.isToday);
  const [kunDag, setKunDag] = useState(false);
  const [skjulteLag, setSkjulteLag] = useState<Lag[]>([]);
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
  const alleBlokker = plan.dager.flatMap((d) => d.blokker);
  const valgt = alleBlokker.find((b) => b.id === valgtId);
  const konflikt = (b: PlanBlokk) => oktOverlapperOpptattTid(b, plan.dager.find((d) => d.dato === b.dato)?.blokker ?? []);
  const dagDato = idag ? OSLO_YMD_FMT.format(idag.date) : plan.dager[0]?.dato;
  const nyHref = nyPlanOktHref(dagDato ?? "", ukeOffset);
  const ukeTekst = data.week.length ? datoformat.formatRange(data.week[0].date, data.week[data.week.length - 1].date) : "";
  const okter = week.flatMap((d) => d.sessions);
  const iDag = idag ? week.find((d) => d.isToday)?.sessions.length ?? 0 : 0;
  const perAkse = AKSER.map((a) => ({ akse: a, min: plan.minutter.plannedByAxis[a] ?? 0 })).filter((x) => x.min > 0);
  const totalt = perAkse.reduce((s, x) => s + x.min, 0);
  const visDager = kunDag ? plan.dager.filter((d) => d.dato === dagDato) : plan.dager;

  function velg(b: PlanBlokk) {
    setValgtId(b.id); setFlytting(false); setFeil(null);
    ark.current?.showModal();
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
        setValgtId(`okt-${sessionId}`); setFlytting(false); setMelding("Økten er flyttet."); router.refresh();
      } catch { setFeil("Flyttingen ble ikke bekreftet. Datoen du valgte er beholdt. Prøv igjen."); }
      finally { laas.current = false; }
    });
  }

  function svarKnapper(f: PlanForslag) {
    return <div className="phn-knapper">
      <button type="button" className="phn-knapp pri" disabled={pending} onClick={() => lagreSvar(f, "ACCEPTED")}>{pending ? "Lagrer …" : "Legg i planen"}</button>
      <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => lagreSvar(f, "REJECTED")}>Ikke denne uka</button>
    </div>;
  }

  function detaljer(b: PlanBlokk) {
    const s = b.session;
    const hvile = s?.title.trim().toLocaleLowerCase("nb-NO") === "hvile";
    const avsluttet = s?.status === "COMPLETED" || s?.status === "CANCELLED" || s?.status === "SKIPPED";
    const status = konflikt(b) ? "Konflikt" : statusTekst(b);
    return <div className="phn-detalj">
      <p className="phn-forklar">{datoTekst(b.dato)} · {tidsrom(b.startMin, b.heldag ? null : b.sluttMin)}{s?.sted ? ` · ${s.sted}` : ""}</p>
      {(s || status) && <div className="phn-knapper">
        {s && <span className={`phn-pille noy`}><i className={`akse-${AKSE_KLASSE[s.pyramidArea]}`} style={{ width: 8, height: 8, borderRadius: 4 }} />{s.pyramidArea}</span>}
        {status && <span className={`phn-pille ${status === "Fullført" ? "ok" : status === "Konflikt" || status === "Forslag" ? "vent" : "noy"}`}>{b.lag === "SKOLE" && <LockKeyhole size={12} aria-hidden />}{status}</span>}
      </div>}
      {b.forslag && <p className="phn-kilde">{b.forslag.coachName ? `Forslag fra ${b.forslag.coachName}` : "Forslag fra coach"}</p>}
      {s?.maalsetning && <p className="phn-forklar">{s.maalsetning}</p>}
      {s && (s.drills.length
        ? <section aria-label="Øvelser"><h3 className="phn-kilde">Øvelser</h3><ol>{s.drills.map((d) => <li key={d.id}>{d.name} <span className="phn-kilde">{d.durationMinutes} min</span></li>)}</ol></section>
        : <p className="phn-kilde">Ingen øvelser lagt til ennå.</p>)}
      {b.lag === "SKOLE" && <p className="phn-kilde">Skoleavtalen vises fra timeplanen.</p>}
      {b.forslag ? svarKnapper(b.forslag) : s && !hvile ? <div className="phn-knapper">
        {s.status !== "CANCELLED" && s.status !== "SKIPPED" && <Link className="phn-knapp pri" href={s.href}>{s.status === "COMPLETED" ? "Se oppsummering" : s.status === "IN_PROGRESS" ? "Fortsett økt" : "Start økt"}</Link>}
        {!avsluttet && s.model === "wb" && !flytting && <button type="button" className="phn-knapp sek" onClick={() => startFlytting(b)}>Flytt økt</button>}
        {!avsluttet && s.planSessionId && <Link className="phn-knapp sek" href={`/portal/planlegge/workbench?${new URLSearchParams({ uke: String(ukeOffset), okt: s.planSessionId })}`}>Rediger økt</Link>}
      </div> : b.href ? <Link className="phn-knapp pri" href={b.href}>Åpne avtale</Link> : null}
      {flytting && s?.model === "wb" && <form onSubmit={flytt} className="phn-flytt">
        <label className="phn-felt">Dato<input type="date" required value={flytteDato} onChange={(e) => setFlytteDato(e.target.value)} /></label>
        <label className="phn-felt">Klokkeslett<input type="time" required value={flytteTid} onChange={(e) => setFlytteTid(e.target.value)} /></label>
        <div className="phn-knapper">
          <button type="submit" className="phn-knapp pri" disabled={pending}>{pending ? "Lagrer …" : "Lagre tidspunkt"}</button>
          <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => setFlytting(false)}>Avbryt</button>
        </div>
      </form>}
    </div>;
  }

  function blokkKort(b: PlanBlokk) {
    const lag = lagFor(b);
    const skjult = skjulteLag.includes(lag);
    if (b.session) {
      const status = konflikt(b) ? "Konflikt" : statusTekst(b);
      return <button type="button" key={b.id} hidden={skjult} className={`phn-okt ${AKSE_KLASSE[b.session.pyramidArea] ?? ""}`} data-forslag={b.forslag ? "true" : undefined} aria-haspopup="dialog" onClick={() => velg(b)} aria-label={`${b.tittel}, ${tidsrom(b.startMin, b.sluttMin)}${status ? `, ${status}` : ""}`}>
        <span className="phn-okt-tekst">
          <span className="phn-okt-s">{tidsrom(b.startMin, b.sluttMin)}</span>
          <span className="phn-navn">{b.tittel}{status && <span className="phn-lys-merke">{status}</span>}</span>
          {b.session.sted && <span className="phn-okt-sted">{b.session.sted}</span>}
        </span>
      </button>;
    }
    if (b.heldag || lag === "samling") {
      return <button type="button" key={b.id} hidden={skjult} className="phn-heldag" aria-haspopup="dialog" onClick={() => velg(b)}>
        {b.lag === "SKOLE" && <LockKeyhole size={14} aria-hidden />}<span>{b.tittel}{!b.heldag && <> · {tidsrom(b.startMin, b.sluttMin)}</>}</span>
      </button>;
    }
    return <button type="button" key={b.id} hidden={skjult} className="phn-opptatt" aria-haspopup="dialog" onClick={() => velg(b)}>
      <span>{b.tittel}</span><small>{tidsrom(b.startMin, b.sluttMin)}</small>
    </button>;
  }

  const kicker = `Uke ${data.weekNumber}${ukeTekst ? ` · ${ukeTekst}` : ""}`;
  const gjennomfort = plan.minutter.completedMin;
  const verktoy = <div className="plan-verktoy">
    <div className="phn-valg" role="group" aria-label="Visning">
      <Link href="/portal/planlegge/workbench?niva=ar">År</Link>
      <Link href="/portal/planlegge/workbench?niva=maned">Måned</Link>
      <button type="button" aria-pressed={!kunDag} onClick={() => setKunDag(false)}>Uke</button>
      <button type="button" aria-pressed={kunDag} onClick={() => setKunDag(true)}>Dag</button>
    </div>
    <div className="phn-knapper">
      <span className="phn-pil">
        <Link aria-label="Forrige uke" href={`/portal/planlegge?uke=${Math.max(-52, ukeOffset - 1)}`}><ChevronLeft className="phn-ikon" aria-hidden /></Link>
        <Link aria-label="Neste uke" href={`/portal/planlegge?uke=${Math.min(52, ukeOffset + 1)}`}><ChevronRight className="phn-ikon" aria-hidden /></Link>
      </span>
      {ukeOffset !== 0 && <Link className="phn-knapp sek" href="/portal/planlegge">Denne uka</Link>}
      <Link className="phn-knapp sek" href={nyHref}><Plus className="phn-ikon" aria-hidden />Ny økt</Link>
      <Link className="phn-knapp pri" href={`/portal/planlegge/workbench?uke=${ukeOffset}`}><Pencil className="phn-ikon" aria-hidden />Rediger</Link>
    </div>
  </div>;
  return <div className="phn phn-skra phn-plan-skra" data-od-id="plan-root" aria-busy={pending}>
    <SkraTopp
      lav
      etikett="Plan"
      bilde="/images/playerhq/slag-putting.jpg" bildePosisjon="50% 45%"
      overlinje={kicker}
      tittel="Plan"
      ingress={periode ? `${periode.navn} · uke ${periode.uke} av ${periode.antallUker}` : undefined}
      handling={verktoy}
    />

    {tilstand === "feil" ? <SkraFlyt lav><div role="alert"><SkraKort tittel="Kunne ikke hente uka">
      <SkraTom handling={<button type="button" className="phn-knapp sek" onClick={() => router.refresh()}>Prøv igjen</button>}>
        Tilkoblingen ble brutt. Ingenting er endret i planen.
      </SkraTom>
    </SkraKort></div></SkraFlyt> : <SkraFlyt lav className="skra-idag skra-plan">
      <div className="skra-kol skra-v">
        <Plass n={3}><SkraKort tittel={`Uke ${data.weekNumber}`} meta="dag for dag" etikett="Uka">
          <div className="phn-lag" role="group" aria-label="Vis lag">
            {LAG_VALG.map((l) => <button key={l.id} type="button" aria-pressed={!skjulteLag.includes(l.id)} onClick={() => setSkjulteLag((v) => v.includes(l.id) ? v.filter((x) => x !== l.id) : [...v, l.id])}><i style={{ background: l.farge }} />{l.navn}</button>)}
          </div>
          <div className={kunDag ? "phn-dager kun-dag" : "phn-dager"}>
            {visDager.map((d) => {
              const sum = week.find((w) => OSLO_YMD_FMT.format(w.date) === d.dato)?.sessions.reduce((s, o) => s + o.durationMin, 0) ?? 0;
              const egne = opptatt.filter((o) => o.dato === d.dato);
              const rader = [
                ...d.blokker.map((b) => ({ t: b.heldag ? -1 : b.startMin ?? 0, id: b.id, el: blokkKort(b) })),
                ...egne.map((o) => ({ t: o.startMin, id: o.id, el: <div key={o.id} className="phn-opptatt" hidden={skjulteLag.includes("opptatt")}><span>{o.tittel}</span><small>{tidsrom(o.startMin, o.sluttMin)}</small></div> })),
              ].sort((a, b) => a.t - b.t || a.id.localeCompare(b.id));
              return <div key={d.dato} className="phn-dag">
                <div className="phn-dag-topp"><b>{dagTittel(d.dato)}{d.idag && <span className="phn-idag-merke">I dag</span>}</b><span>{sum ? formaterVarighet(sum) : "Hvile"}</span></div>
                {rader.length ? rader.map((r) => r.el) : <p className="phn-tom-dag">Ingenting planlagt</p>}
              </div>;
            })}
          </div>
        </SkraKort></Plass>
      </div>
      <div className="skra-kol skra-h">
        <Plass n={1}><SkraHelt
          etikett="Uka nå"
          overlinje={`Uka nå${periode ? ` · ${periode.navn}` : ""}`}
          tid={totalt === 0 ? "0" : formaterVarighet(totalt)} tidEtter="planlagt"
          tittel={okter.length === 0 ? "Ingen økter denne uka" : `${plan.fremdrift.gjennomfort} av ${okter.length} ${okter.length === 1 ? "økt" : "økter"} gjennomført`}
          meta={totalt > 0 ? `${formaterVarighet(gjennomfort)} gjennomført${idag ? ` · ${iDag === 0 ? "ingen" : iDag} i dag` : ""}` : undefined}
          handlinger={[
            { tekst: okter.length === 0 ? "Legg inn en økt" : "Ny økt", href: nyHref, ikon: <Plus className="phn-ikon" aria-hidden /> },
            { tekst: "Rediger", href: `/portal/planlegge/workbench?uke=${ukeOffset}`, sekundaer: true, ikon: <Pencil className="phn-ikon" aria-hidden /> },
          ]}
        /></Plass>
        <div className="phn-meldinger" aria-live="polite">{melding && <p className="phn-melding" role="status">{melding}</p>}{feil && <p className="phn-melding" role="alert">{feil}</p>}</div>
        {ventende.length > 0 && <Plass n={2}><SkraKort tittel="Venter på svar" meta={String(ventende.length)} etikett="Forslag fra coach">
          <div className="plan-forslag">{ventende.map((f) => <article key={f.session.id} className="plan-forslag-rad">
            <p className="phn-kilde">{f.coachName ? `Forslag fra ${f.coachName}` : "Forslag fra coach"}</p>
            <div><b>{f.session.title}</b><p className="phn-forklar">{datoformat.format(f.session.startTime)} · {f.session.durationMin} min{f.session.sted ? ` · ${f.session.sted}` : ""}</p></div>
            {svarKnapper(f)}
          </article>)}</div>
        </SkraKort></Plass>}
        {perAkse.length > 0 && <Plass n={4}><SkraKort tittel="Fordeling per akse" meta={formaterVarighet(totalt)}>
          <div className="phn-fordeling" role="img" aria-label={perAkse.map((x) => `${x.akse} ${formaterVarighet(x.min)}`).join(", ")}>
            {perAkse.map((x) => <i key={x.akse} className={`akse-${AKSE_KLASSE[x.akse]}`} style={{ flex: x.min }} />)}
          </div>
          <div className="phn-lg-rad">{perAkse.map((x) => <span key={x.akse} className="phn-lg"><i className={`akse-${AKSE_KLASSE[x.akse]}`} />{x.akse} {formaterVarighet(x.min)}</span>)}</div>
          {depthMode === "deep" && periode?.fokus && <p className="phn-kilde">Fokus i perioden: {periode.fokus}</p>}
        </SkraKort></Plass>}
        <Plass n={5}><Maalsetninger maal={maal} /></Plass>
        <Plass n={6}><SkraKort tittel="Mer i Plan"><nav className="phn-plan-fot" aria-label="Mer i Plan">
          {harTekniskPlan && <Link className="phn-rad-lenke" href="/portal/tren/teknisk-plan"><span><b>Teknisk plan</b><span className="phn-kilde">Oppgavene fra coachen din</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>}
          <Link className="phn-rad-lenke" href="/portal/kalender"><span><b>Kalender</b><span className="phn-kilde">Alle avtaler, dag for dag</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>
          <Link className="phn-rad-lenke" href="/portal/tren/turneringer"><span><b>Turneringer</b><span className="phn-kilde">Dine turneringer og kalenderen fra GolfBox</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>
          <Link className="phn-rad-lenke" href="/portal/planlegge/fysisk"><span><b>Fysisk program</b><span className="phn-kilde">Øktene og siste fysiske test</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>
          <Link className="phn-rad-lenke" href="/portal/planlegge/opptatt"><span><b>Opptatt tid</b><span className="phn-kilde">Legg inn tider du ikke kan trene</span></span><ChevronRight className="phn-ikon" aria-hidden /></Link>
        </nav></SkraKort></Plass>
      </div>
    </SkraFlyt>}

    <dialog ref={ark} className="phn-ark" aria-label="Detaljer om avtalen" onClose={() => setFlytting(false)} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      {valgt && <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <h2>{valgt.tittel}</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        {detaljer(valgt)}
        {feil && <p className="phn-melding" role="alert">{feil}</p>}
        {melding && <p className="phn-melding" role="status">{melding}</p>}
      </div>}
    </dialog>
  </div>;
}
