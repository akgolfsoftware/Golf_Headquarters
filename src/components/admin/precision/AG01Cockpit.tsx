"use client";

/**
 * AG-01 Cockpit i nytt design (designbrevet 13.10.2026).
 * Fasit: docs/design-system/utkast-agencyos/cockpit.html, skjerm «AG-01 Cockpit».
 * Startskjerm i AgencyOS med dagens kalender 05–22 (beslutninger.md §SKJERMENE … RUNDE 8).
 *
 * Data som før (byggAG01Data): køen fra lastGodkjenninger, dagens økter fra
 * loadDailyBrief, oppgaver fra Notion-cachen, «Følger ikke planen» (to siste
 * uker) og turneringer denne uka. «Skriv ut» og «Eksporter rapport» er beholdt.
 *
 * Avvik:
 *   - Fjerde teller er «Økter i dag», ikke «Forslag venter»: forslag telles
 *    sammen med resten av køen og finnes ikke som eget tall.
 *   - Kort svar fra Cockpit og avhuking av Notion-oppgaver finnes ikke i koden.
 *   - Øktblokkene får aksefarge bare når tittelen sier aksen; ellers nøytral grå.
 *   - AI-dispatch («Én ting nå» og hvilken AI-flate som eier køen) er ikke i
 *     utkastet, men beholdes fra forrige cockpit (skill agenticos-cockpit).
 */
import Link from "next/link";
import { Suspense, use, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import type { AiDispatchData } from "@/lib/agencyos/ai-dispatch-build";
import { PrintButton } from "@/components/shared/print-button";
import { EksportTrigger } from "@/components/shared/eksport-trigger";
import { KAL_START_MIN, KAL_SLUTT_MIN, hhmm, type AG01Data, type CockpitKalenderRad } from "@/lib/agencyos/cockpit-precision";
import type { StallRorledning } from "@/lib/agencyos/cockpit-tillegg-regler";
import "@/styles/agencyos-ny-cockpit.css";

export type AG01Tilstand = "data" | "tom" | "laster" | "feil";

function abonnerNett(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}
/** Server og første klientrender antar «på nett» — ekte verdi etter hydrering. */
function usePaaNett(): boolean {
  return useSyncExternalStore(abonnerNett, () => navigator.onLine, () => true);
}

const AKSE_NAVN = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" } as const;

export function initialer(navn: string) {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]!.toUpperCase()).join("") || "—";
}

/** Fordeler overlappende økter i spor, så ingen blokk dekker en annen. */
function spor(rader: CockpitKalenderRad[]) {
  const slutt: number[] = [];
  const ut = rader.map((r) => {
    let i = slutt.findIndex((s) => s <= r.startMin);
    if (i < 0) { i = slutt.length; slutt.push(r.sluttMin); } else slutt[i] = r.sluttMin;
    return { r, i };
  });
  return { ut, antall: Math.max(1, slutt.length) };
}

function Dag({ rader, naaMin }: { rader: CockpitKalenderRad[]; naaMin: number }) {
  const timer = Array.from({ length: (KAL_SLUTT_MIN - KAL_START_MIN) / 60 }, (_, i) => hhmm(KAL_START_MIN + i * 60));
  const synlige = rader.filter((r) => r.sluttMin > KAL_START_MIN && r.startMin < KAL_SLUTT_MIN);
  const { ut, antall } = spor(synlige);
  const naa = naaMin >= KAL_START_MIN && naaMin <= KAL_SLUTT_MIN ? naaMin : null;
  const y = (min: number) => `calc(var(--time) * ${(Math.max(KAL_START_MIN, Math.min(KAL_SLUTT_MIN, min)) - KAL_START_MIN) / 60})`;
  return <div className="dag" role="list" aria-label="Dagens økter 05–22">
    <div className="timer" aria-hidden>{timer.map((t) => <span key={t}>{t.slice(0, 2)}</span>)}</div>
    <div className="bane">
      {naa != null && <div className="na-linje" style={{ top: y(naa) }} data-klokke={hhmm(naa)} aria-hidden />}
      {ut.map(({ r, i }) => {
        const stil = {
          top: y(r.startMin),
          height: `calc(${y(r.sluttMin)} - ${y(r.startMin)} - 2px)`,
          left: `calc(6px + (100% - 12px) * ${i / antall})`,
          width: `calc((100% - 12px) / ${antall} - ${antall > 1 ? 4 : 0}px)`,
        };
        const kl = `blokk-okt ${r.akse ?? "noy"}${r.status === "ferdig" ? " ferdig" : ""}`;
        const innhold = <>
          <b>{r.hvem}</b>
          <span className="t">{r.start}–{r.slutt}</span>
          <span className="i">{r.tittel}{r.sted ? ` · ${r.sted}` : ""}</span>
          {r.status === "pagar" && r.href && <span className="live"><i />Åpne live</span>}
        </>;
        const etikett = `${r.start}–${r.slutt} ${r.tittel} med ${r.hvem}${r.akse ? `, ${AKSE_NAVN[r.akse]}` : ""}${r.status === "pagar" ? ", pågår" : r.status === "ferdig" ? ", ferdig" : ""}`;
        return r.href
          ? <Link key={r.id} role="listitem" href={r.href} className={kl} style={stil} aria-label={etikett}>{innhold}</Link>
          : <div key={r.id} role="listitem" className={kl} style={stil} aria-label={etikett}>{innhold}</div>;
      })}
    </div>
  </div>;
}

function Seksjon({ tittel, kilde, lenke, id, children }: { tittel: string; kilde?: string; lenke?: { href: string; tekst: string }; id?: string; children: React.ReactNode }) {
  return <section className="seksjon" id={id} aria-label={tittel}>
    <div className="sek-topp"><h2>{tittel}</h2>{lenke ? <Link className="lenke" href={lenke.href}>{lenke.tekst}</Link> : kilde ? <span className="kilde">{kilde}</span> : null}</div>
    {children}
  </section>;
}

function Tom({ children }: { children: React.ReactNode }) {
  return <div className="kort dempet"><p className="forklar">{children}</p></div>;
}

function Dispatch({ d }: { d: AiDispatchData }) {
  return <Seksjon tittel="Jarvis: én ting nå" kilde="Hvem eier køen">
    {d.enTingNa && <Link href={d.enTingNa.href} className="dispatch-na">
      <span><span className="e">Én ting nå</span><b>{d.enTingNa.tekst}</b></span>
      <ArrowRight className="ikon" aria-hidden />
    </Link>}
    {d.rader.length > 0 && <div className="kort tett">
      {d.rader.map((r) => <Link key={r.id} href={r.href} className={`dispatch-rad${r.prioritet === "hoy" ? " hoy" : ""}`}>
        <span><b>{r.oppgave}</b><span className="kilde">Ferdig når: {r.ferdigNar}</span></span>
        <span className="type">{r.tilLabel}</span>
      </Link>)}
    </div>}
  </Seksjon>;
}

const AKSER = ["fys", "tek", "slag", "spill", "turn"] as const;

function Nokkeltall({ d }: { d: AG01Data }) {
  const perAkse = AKSER.map((a) => ({ a, n: d.kalender.filter((r) => r.akse === a).length }));
  const uten = d.kalender.filter((r) => !r.akse).length;
  const ferdig = d.kalender.filter((r) => r.status === "ferdig").length;
  const n = d.kalender.length;
  const et = d.etterlevelse;
  const med = et.filter((u) => u.pct != null);
  const siste = med.at(-1) ?? null;
  const forrige = med.at(-2) ?? null;
  const endring = siste && forrige ? siste.pct! - forrige.pct! : null;
  const su = d.stallensUke;
  const suPst = su.planlagt ? Math.round((su.gjennomfort / su.planlagt) * 100) : null;
  return <section className="kpi-rad" aria-label="Nøkkeltall">
    <Link href="/admin/kalender" className="kpi">
      <span className="e">Økter i dag</span>
      <b className="t">{n}</b>
      {n > 0 ? <span className="akse-stripe" role="img" aria-label={perAkse.filter((x) => x.n).map((x) => `${AKSE_NAVN[x.a]} ${x.n}`).concat(uten ? [`akse ikke satt ${uten}`] : []).join(", ")}>
        {perAkse.filter((x) => x.n).map((x) => <i key={x.a} className={`a-${x.a}`} style={{ flexGrow: x.n }} />)}
        {uten > 0 && <i className="a-noy" style={{ flexGrow: uten }} />}
      </span> : <span className="akse-stripe tom" aria-hidden />}
      <span className="s">{n ? `${ferdig} gjennomført · ${n - ferdig} igjen` : "Ingen økter"}</span>
      <span className="kilde">Kalender · {d.klokke}</span>
    </Link>
    <Link href="/admin/spillere" className="kpi">
      <span className="e">Etterlevelse, 4 uker</span>
      <b className="t">{siste ? <>{siste.pct}<small> %</small></> : "—"}</b>
      <span className="soyler" role="img" aria-label={et.map((u) => `Uke ${u.uke}: ${u.pct == null ? "ingen forfalte økter" : `${u.pct} %`}`).join(", ")}>
        {et.map((u, i) => <span key={u.uke} className="soyle"><i className={i === et.length - 1 ? "na" : ""} style={{ height: `${u.pct ?? 0}%` }} /><em>{u.uke}</em></span>)}
      </span>
      <span className="s">{endring == null ? "—" : endring === 0 ? "→ som uka før" : `${endring > 0 ? "↑" : "↓"} ${Math.abs(endring)} pp fra uke ${forrige!.uke}`}</span>
      <span className="kilde">Workbench · tid mot plan</span>
    </Link>
    <Link href="/admin/spillere" className="kpi">
      <span className="e">Stallens uke</span>
      <b className="t">{su.planlagt ? su.gjennomfort : "—"}</b>
      <span className="fremdrift" role="img" aria-label={su.planlagt ? `${su.gjennomfort} av ${su.planlagt} økter gjennomført i uke ${su.uke}` : "Ingen økter planlagt denne uka"}><i style={{ width: `${suPst ?? 0}%` }} /></span>
      <span className="s">{su.planlagt ? `av ${su.planlagt} økter gjennomført` : "Ingen økter planlagt"}</span>
      <span className="kilde">Uke {su.uke} · planøkter</span>
    </Link>
    <Link href="/admin/spillere" className="kpi">
      <span className="e">Aktive spillere</span>
      <b className="t">{d.aktiveSpillere}</b>
      <span className="s">innlogget siste 30 dager</span>
      <span className="kilde">Egen stall</span>
    </Link>
  </section>;
}

function StallRor({ stall }: { stall: Promise<StallRorledning | null> }) {
  const r = use(stall);
  if (!r) return <Tom>Stallen kunne ikke hentes nå. Tallene står i Stall.</Tom>;
  if (r.total === 0) return <Tom>Ingen spillere i stallen ennå.</Tom>;
  const grunn = (g: { label: string; antall: number }[]) => g.map((x) => `${x.antall} ${x.label.toLocaleLowerCase("nb-NO")}`).join(" · ");
  return <div className="ror" role="list">
    <Link role="listitem" href="/admin/spillere" className="ror-steg">
      <span className="e">Trenger deg</span><b>{r.trenger.antall}</b><span className="s">{r.trenger.antall ? grunn(r.trenger.grunner) : "Ingen"}</span>
    </Link>
    <Link role="listitem" href="/admin/spillere" className="ror-steg">
      <span className="e">Følger planen</span><b>{r.folger.antall}</b><span className="s">{r.folger.ingenPlan ? `${r.folger.ingenPlan} uten plandata` : "Alle med plan"}</span>
    </Link>
    <Link role="listitem" href="/admin/spillere" className="ror-steg">
      <span className="e">Hviler</span><b>{r.hviler.antall}</b><span className="s">{r.hviler.antall ? grunn(r.hviler.grunner) : "Ingen"}</span>
    </Link>
  </div>;
}

export function AG01Cockpit({ tilstand, data, dispatch = null, stall = null }: { tilstand: AG01Tilstand; data: AG01Data; dispatch?: AiDispatchData | null; stall?: Promise<StallRorledning | null> | null }) {
  const paaNett = usePaaNett();
  const topp = <div className="topp">
    <div className="topp-rad">
      <div><div className="dato">{data.kicker} · {data.klokke}</div><h1 className="tittel">{data.hilsen}</h1></div>
      {tilstand === "data" && paaNett && <div className="knapper">
        <PrintButton label="Skriv ut" className="knapp sek" />
        <EksportTrigger kind="brief" className="knapp sek" />
      </div>}
    </div>
  </div>;

  if (tilstand === "laster") return <div className="agn-s">{topp}<div className="tilstand-blokk" aria-busy="true">
    <p className="forklar">Henter dagen …</p>
    <i className="skjelett" style={{ height: 96 }} /><i className="skjelett" style={{ height: 320 }} /><i className="skjelett" style={{ height: 120 }} />
  </div></div>;
  if (tilstand === "feil" || !paaNett) return <div className="agn-s">{topp}<div className="kort dempet" role="alert">
    <b className="undertittel">{paaNett ? "Cockpit kunne ikke lastes" : "Ingen forbindelse"}</b>
    <p className="forklar">{paaNett ? "Ingenting er endret. Kalender, innboks og oppgaver hentes på nytt når du prøver igjen." : `Nettet er nede. Sist hentet ${data.klokke}.`}</p>
    <div className="knapper"><button type="button" className="knapp pri" onClick={() => window.location.reload()}>Prøv igjen</button></div>
  </div></div>;

  const tom = tilstand === "tom";
  const d = tom ? { ...data, kalender: [], venter: { totalt: 0, rader: [] }, oppgaver: [], turneringer: [], utenforPlan: [], etterlevelse: [], stallensUke: { ...data.stallensUke, gjennomfort: 0, planlagt: 0 }, aktiveSpillere: 0 } : data;
  const haster = d.venter.rader.filter((r) => r.haster).length;
  const apneOppgaver = d.oppgaver.filter((o) => !o.ferdig);
  const oppgaver = [...d.oppgaver].sort((a, b) => Number(a.ferdig) - Number(b.ferdig) || Number(b.fristIDag) - Number(a.fristIDag));

  return <div className="agn-s">
    {topp}
    <Nokkeltall d={d} />
    <div className="cockpit-grid">
      <div>
        <Seksjon tittel="I dag" kilde={d.kalender.length ? `${d.kalender.length} ${d.kalender.length === 1 ? "økt" : "økter"} · 05–22` : "Ingen økter"}>
          {d.kalender.length ? <>
            <Dag rader={d.kalender} naaMin={d.naaMin} />
            <div className="lg-rad" aria-hidden><span className="lg"><i className="a-fys" />FYS</span><span className="lg"><i className="a-tek" />TEK</span><span className="lg"><i className="a-slag" />SLAG</span><span className="lg"><i className="a-spill" />SPILL</span><span className="lg"><i className="a-turn" />TURN</span><span className="lg"><i className="a-noy" />Akse ikke satt</span></div>
          </> : <Tom>Ingen coaching- eller gruppeøkter i dag.</Tom>}
        </Seksjon>
        {dispatch && !tom && <Dispatch d={dispatch} />}
        <Seksjon tittel={d.venter.totalt ? `Venter på svar · ${d.venter.totalt}${haster ? `, ${haster} haster` : ""}` : "Venter på svar"} lenke={{ href: "/admin/innboks", tekst: "Hele innboksen" }}>
          {d.venter.rader.length === 0 ? <Tom>Ingenting venter på deg. Godkjenninger, forespørsler og utkast dukker opp her.</Tom> : <div className="kort tett">
            {d.venter.rader.map((r) => <div key={r.id} className="svar-rad">
              <span className="avatar liten" aria-hidden>{initialer(r.hvem)}</span>
              <span><b>{r.hvem}</b><span className="sitat">{r.tittel}{r.detalj ? ` · ${r.detalj}` : ""}</span></span>
              <span className="svar-hoyre">{r.haster && <span className="haster-pille">Haster</span>}<time>{r.nar}</time></span>
            </div>)}
          </div>}
        </Seksjon>
      </div>
      <div>
        <Seksjon tittel="Følger ikke planen" kilde={d.utenforPlanUker ? `Siste to uker · ${d.utenforPlanUker.toLowerCase()}` : "Siste to uker"} id="folger-ikke">
          {d.utenforPlan.length === 0 ? <Tom>Alle ligger på 70 % eller mer av planen.</Tom> : <div className="kort tett">
            {d.utenforPlan.map((p) => <Link key={p.id} href={p.href} className="etl-rad" aria-label={`${p.navn}: ${p.forrige} % og ${p.siste} %. Åpne hele planen`}>
              <span className="avatar liten lys" aria-hidden>{initialer(p.navn)}</span>
              <span><b>{p.navn}</b><span className="etl-uker"><span>Uka før {p.forrige} %</span><span>Forrige {p.siste} %</span></span></span>
              <span className="etl-soyler" aria-hidden><i style={{ height: `${p.forrige}%` }} /><i className="siste" style={{ height: `${p.siste}%` }} /></span>
              <span className="etl-prosent">{p.siste} %</span>
            </Link>)}
          </div>}
          <p className="kilde">Gjennomført tid mot planlagt. Under 70 % to uker på rad. Trykk for hele planen.</p>
        </Seksjon>
        <Seksjon tittel="Å gjøre" kilde="Fra Notion · Tasks">
          {oppgaver.length === 0 ? <Tom>Ingen oppgaver fra Notion.</Tom> : <div className="kort tett">
            {oppgaver.map((o) => <div key={o.id} className={`oppgave${o.ferdig ? " gjort" : ""}`}>
              <span className="hake" aria-hidden data-ferdig={o.ferdig || undefined} />
              <span><b>{o.tittel}</b><span className={`kilde${o.fristIDag && !o.ferdig ? " frist" : ""}`}>{o.ferdig ? "Ferdig" : o.fristIDag ? "Frist i dag" : o.tag}</span></span>
            </div>)}
          </div>}
          {oppgaver.length > 0 && <p className="kilde">{apneOppgaver.length} åpne · huk av i Notion</p>}
        </Seksjon>
        <Seksjon tittel="Turneringer denne uka" id="turneringer">
          {d.turneringer.length === 0 ? <Tom>Ingen av spillerne dine er påmeldt en turnering denne uka.</Tom> : d.turneringer.map((t) => <div key={t.id} className="turn-kort med-nedtelling">
            <span className="nedtelling" aria-hidden><b>{t.dagerTil <= 0 ? "—" : t.dagerTil}</b><small>{t.dagerTil === 0 ? "I DAG" : t.dagerTil < 0 ? "PÅGÅR" : t.dagerTil === 1 ? "DAG" : "DAGER"}</small></span>
            <span className="turn-tekst"><b>{t.navn}</b>
            <span>{t.dagerTil === 0 ? "I dag" : t.dagerTil < 0 ? "Startet" : `Om ${t.dagerTil} ${t.dagerTil === 1 ? "dag" : "dager"}`}{t.sted ? ` · ${t.sted}` : ""}</span>
            <span>{t.hvem}</span></span>
          </div>)}
        </Seksjon>
        <Seksjon tittel="Stallen" lenke={{ href: "/admin/spillere", tekst: "Åpne Stall" }}>
          {stall && !tom ? <Suspense fallback={<i className="skjelett" style={{ height: 96 }} aria-label="Henter stallen" />}><StallRor stall={stall} /></Suspense> : null}
          <div className="nokkel">{d.nokkeltall.filter((k) => k.label !== "Aktive spillere" && k.label !== "Økter i dag").map((k) => <div key={k.label}><b>{tom ? "—" : k.verdi}</b><span>{k.label}</span></div>)}</div>
        </Seksjon>
      </div>
    </div>
  </div>;
}
