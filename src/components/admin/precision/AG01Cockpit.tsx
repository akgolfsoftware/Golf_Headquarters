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
 */
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { PrintButton } from "@/components/shared/print-button";
import { EksportTrigger } from "@/components/shared/eksport-trigger";
import { KAL_START_MIN, KAL_SLUTT_MIN, hhmm, type AG01Data, type CockpitKalenderRad } from "@/lib/agencyos/cockpit-precision";
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

export function AG01Cockpit({ tilstand, data }: { tilstand: AG01Tilstand; data: AG01Data }) {
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
  const d = tom ? { ...data, kalender: [], venter: { totalt: 0, rader: [] }, oppgaver: [], turneringer: [], utenforPlan: [] } : data;
  const haster = d.venter.rader.filter((r) => r.haster).length;
  const apneOppgaver = d.oppgaver.filter((o) => !o.ferdig);
  const oppgaver = [...d.oppgaver].sort((a, b) => Number(a.ferdig) - Number(b.ferdig) || Number(b.fristIDag) - Number(a.fristIDag));

  return <div className="agn-s">
    {topp}
    <div className="teller-rad">
      <Link href="/admin/innboks" className={`teller${haster ? " signal" : ""}`}>
        <span className="e">Venter på deg</span><b className="t">{d.venter.totalt}</b>
        <span className="s">{haster ? `${haster} haster` : "i innboksen"}</span>
      </Link>
      <a href="#folger-ikke" className="teller"><span className="e">Følger ikke planen</span><b className="t">{d.utenforPlan.length}</b><span className="s">under 70 % to uker</span></a>
      <a href="#turneringer" className="teller"><span className="e">Turneringer</span><b className="t">{d.turneringer.length}</b><span className="s">denne uka</span></a>
      <Link href="/admin/kalender" className="teller"><span className="e">Økter i dag</span><b className="t">{d.kalender.length}</b><span className="s">05–22</span></Link>
    </div>
    <div className="cockpit-grid">
      <div>
        <Seksjon tittel="I dag" kilde={d.kalender.length ? `${d.kalender.length} ${d.kalender.length === 1 ? "økt" : "økter"} · 05–22` : "Ingen økter"}>
          {d.kalender.length ? <>
            <Dag rader={d.kalender} naaMin={d.naaMin} />
            <div className="lg-rad" aria-hidden><span className="lg"><i className="a-fys" />FYS</span><span className="lg"><i className="a-tek" />TEK</span><span className="lg"><i className="a-slag" />SLAG</span><span className="lg"><i className="a-spill" />SPILL</span><span className="lg"><i className="a-turn" />TURN</span><span className="lg"><i className="a-noy" />Akse ikke satt</span></div>
          </> : <Tom>Ingen coaching- eller gruppeøkter i dag.</Tom>}
        </Seksjon>
        <Seksjon tittel="Venter på svar" lenke={{ href: "/admin/innboks", tekst: "Hele innboksen" }}>
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
              <span className="etl-prosent">{p.siste} %</span>
            </Link>)}
          </div>}
          <p className="kilde">Gjennomført tid mot planlagt. Under 70 % to uker på rad. Trykk for hele planen.</p>
        </Seksjon>
        <Seksjon tittel="Oppgaver" kilde="Fra Notion · Tasks">
          {oppgaver.length === 0 ? <Tom>Ingen oppgaver fra Notion.</Tom> : <div className="kort tett">
            {oppgaver.map((o) => <div key={o.id} className={`oppgave${o.ferdig ? " gjort" : ""}`}>
              <span className="hake" aria-hidden data-ferdig={o.ferdig || undefined} />
              <span><b>{o.tittel}</b><span className={`kilde${o.fristIDag && !o.ferdig ? " frist" : ""}`}>{o.ferdig ? "Ferdig" : o.fristIDag ? "Frist i dag" : o.tag}</span></span>
            </div>)}
          </div>}
          {oppgaver.length > 0 && <p className="kilde">{apneOppgaver.length} åpne · huk av i Notion</p>}
        </Seksjon>
        <Seksjon tittel="Turneringer denne uka" id="turneringer">
          {d.turneringer.length === 0 ? <Tom>Ingen av spillerne dine er påmeldt en turnering denne uka.</Tom> : d.turneringer.map((t) => <div key={t.id} className="turn-kort">
            <b>{t.navn}</b>
            <span>{t.dagerTil === 0 ? "I dag" : t.dagerTil < 0 ? "Startet" : `Om ${t.dagerTil} ${t.dagerTil === 1 ? "dag" : "dager"}`}{t.sted ? ` · ${t.sted}` : ""}</span>
            <span>{t.hvem}</span>
          </div>)}
        </Seksjon>
        <Seksjon tittel="Stallen" kilde="Nøkkeltall · ingen økonomi her">
          <div className="nokkel">{d.nokkeltall.map((k) => <div key={k.label}><b>{tom ? "—" : k.verdi}</b><span>{k.label}</span></div>)}</div>
        </Seksjon>
      </div>
    </div>
  </div>;
}
