"use client";

/**
 * AG-01 Cockpit i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-cockpit.jsx, runde 25 — vinner over AG-01.jsx
 * fordi screen.html laster den sist). Startskjerm i AgencyOS med dagens
 * kalender 05–22 (beslutninger.md §SKJERMENE … RUNDE 8).
 *
 * Erstatter TrainLockCockpit. Bevart derfra: køen fra lastGodkjenninger
 * (samme tall som /admin/ko), dagens økter fra loadDailyBrief, «Skriv ut» og
 * «Eksporter rapport» (EksportModal kind="brief") og frakoblet-tilstanden.
 * Nytt fra eksisterende data: nøkkeltall, oppgaver fra Notion-cachen,
 * «Følger ikke planen» (to siste uker) og turneringer denne uka.
 *
 * Bevisst utelatt (verken i tegningen eller i den forrige TrainLockCockpit):
 * fokusspillere og Økonomi/MRR — se page.tsx-hodet.
 *
 * Ikke bygget fordi grunnlaget mangler i koden (se PR «Parkert»): kort svar
 * direkte fra Cockpit, huke av Notion-oppgaver, «Start live» fra kalenderen
 * og turneringsresultat.
 */
import { useSyncExternalStore } from "react";
import { ArrowRight, CalendarX, WifiOff } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille, LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { Seksjon, Dempet, Rad, RadLenke, Etikett, Teller, Tellere, Dagsstripe } from "@/components/precision/pa-cockpit";
import { PrintButton } from "@/components/shared/print-button";
import { EksportTrigger } from "@/components/shared/eksport-trigger";
import { kalPst, KAL_START_MIN, KAL_SLUTT_MIN, type AG01Data, type CockpitKalenderRad } from "@/lib/agencyos/cockpit-precision";
import "@/styles/precision-a6.css";

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

const STATUS_TEKST: Record<CockpitKalenderRad["status"], string> = { ferdig: "Ferdig", pagar: "Pågår", neste: "Neste", planlagt: "" };

function Kalender({ rader, naaMin }: { rader: CockpitKalenderRad[]; naaMin: number }) {
  const naaPst = naaMin >= KAL_START_MIN && naaMin <= KAL_SLUTT_MIN ? kalPst(naaMin) : null;
  return <Seksjon kicker="Dagens kalender · 05:00–22:00" meta={rader.length ? `${rader.length} ${rader.length === 1 ? "ØKT" : "ØKTER"}` : "INGEN ØKTER"} label="Dagens kalender">
    <Dagsstripe okter={rader.map((r) => ({ id: r.id, fra: kalPst(r.startMin), til: kalPst(r.sluttMin), ferdig: r.status === "ferdig" }))} naaPst={naaPst} />
    {rader.length === 0 ? <Dempet>Ingen coaching- eller gruppeøkter i dag.</Dempet> : <div role="list">
      {rader.map((r, i) => {
        const innhold = <>
          <span className="pa-a6-tid"><span className="pa-a6-tid__start" data-ferdig={r.status === "ferdig" || undefined}>{r.start}</span><Meta>{r.slutt}</Meta></span>
          <Etikett a={`${r.tittel} · ${r.hvem}`} sub={r.sted ? r.sted.toUpperCase() : "—"} />
          {r.status === "planlagt" ? <span /> : <StatusPille tone={r.status === "ferdig" ? "ok" : r.status === "pagar" ? "live" : "neutral"}>{STATUS_TEKST[r.status]}</StatusPille>}
        </>;
        return r.href
          ? <RadLenke key={r.id} href={r.href} forste={i === 0} mal="56px minmax(0,1fr) auto" min={64} label={`${r.start} ${r.tittel} med ${r.hvem}`}>{innhold}</RadLenke>
          : <Rad key={r.id} forste={i === 0} mal="56px minmax(0,1fr) auto" min={64}>{innhold}</Rad>;
      })}
    </div>}
  </Seksjon>;
}

function Venter({ venter }: { venter: AG01Data["venter"] }) {
  const { totalt, rader } = venter;
  return <Seksjon kicker="Venter på deg" meta={totalt ? `${totalt} · NYESTE FØRST` : "INGEN"} label="Venter på deg">
    {rader.length === 0 ? <Dempet>Ingenting venter på deg. Godkjenninger, forespørsler og utkast dukker opp her.</Dempet> : <div role="list">
      {rader.map((r, i) => <div role="listitem" key={r.id} className="pa-a6-venter" data-forste={i === 0 || undefined}>
        <div className="pa-a6-venter__topp"><span className="pa-a6-venter__hvem">{r.hvem}</span>{r.haster && <StatusPille tone="warn">Haster</StatusPille>}<Meta>{r.nar.toUpperCase()}</Meta></div>
        <span className="pa-a6-venter__tekst">{r.tittel}{r.detalj ? ` · ${r.detalj}` : ""}</span>
      </div>)}
    </div>}
    <div><KnappLenke href="/admin/ko" variant="ghost" size="sm" iconRight={ArrowRight}>Åpne køen</KnappLenke></div>
  </Seksjon>;
}

function Oppgaver({ oppgaver }: { oppgaver: AG01Data["oppgaver"] }) {
  const apne = oppgaver.filter((o) => !o.ferdig);
  const meta = oppgaver.length ? `${apne.filter((o) => o.fristIDag).length} FRIST I DAG · ${apne.length} ÅPNE` : "—";
  return <Seksjon kicker="Oppgaver fra Notion" meta={meta} label="Oppgaver fra Notion">
    {oppgaver.length === 0 ? <Dempet>Ingen oppgaver fra Notion.</Dempet> : <div role="list">
      {oppgaver.map((o, i) => <Rad key={o.id} forste={i === 0} min={52}>
        <span className="pa-a6-etikett"><span className="pa-a6-oppgave__tittel" data-ferdig={o.ferdig || undefined}>{o.tittel}</span>{o.ferdig && <Meta>FERDIG</Meta>}</span>
        <Meta style={o.fristIDag && !o.ferdig ? { color: "var(--text-primary)" } : undefined}>{o.fristIDag && !o.ferdig ? "FRIST I DAG" : o.tag}</Meta>
      </Rad>)}
    </div>}
    <Meta>NOTION · TASKS OG PROSJEKTER</Meta>
  </Seksjon>;
}

function Turneringer({ rader }: { rader: AG01Data["turneringer"] }) {
  return <Seksjon kicker="Turneringer denne uka" meta={rader.length ? "EGNE SPILLERE" : "INGEN"} label="Turneringer denne uka">
    {rader.length === 0 ? <Dempet>Ingen av spillerne dine er påmeldt en turnering denne uka.</Dempet> : <div role="list">
      {rader.map((t, i) => <Rad key={t.id} forste={i === 0}>
        <Etikett a={`${t.hvem} · ${t.navn}`} sub={t.sted ? t.sted.toUpperCase() : "—"} />
        <span className="pa-a6-tall pa-a6-tall--s">{t.dagerTil === 0 ? "I dag" : t.dagerTil < 0 ? "Startet" : `Om ${t.dagerTil} ${t.dagerTil === 1 ? "dag" : "dager"}`}</span>
      </Rad>)}
    </div>}
  </Seksjon>;
}

function UtenforPlan({ rader, uker }: { rader: AG01Data["utenforPlan"]; uker: string }) {
  return <Seksjon kicker="Følger ikke planen" meta={rader.length ? "LAVESTE FØRST" : "INGEN"} label="Følger ikke planen">
    {rader.length === 0 ? <Dempet>Alle ligger på 70 % eller mer av planen.</Dempet> : <div role="list">
      {rader.map((p, i) => <RadLenke key={p.id} href={p.href} forste={i === 0} label={`${p.navn}, ${p.siste} % forrige uke. Åpne hele planen`}>
        <Etikett a={p.navn} sub="TO UKER PÅ RAD" />
        <span className="pa-a6-pst"><span className="pa-a6-tall">{p.siste} %</span><Meta>UKA FØR {p.forrige} %</Meta></span>
      </RadLenke>)}
    </div>}
    <Meta>{uker} · GJENNOMFØRT TID MOT PLAN · UNDER 70 % TO UKER PÅ RAD · TRYKK FOR HELE PLANEN</Meta>
  </Seksjon>;
}

function Nokkeltall({ tittel, meta, rader, tom }: { tittel: string; meta: string; rader: AG01Data["nokkeltall"]; tom: boolean }) {
  return <Seksjon kicker={tittel} meta={meta} label={tittel}>
    <div role="list">{rader.map((k, i) => <Rad key={k.label} forste={i === 0}>
      <Etikett a={k.label} sub={tom ? "—" : k.kilde} /><span className="pa-a6-tall">{tom ? "—" : k.verdi}</span>
    </Rad>)}</div>
  </Seksjon>;
}

export function AG01Cockpit({ tilstand, data }: { tilstand: AG01Tilstand; data: AG01Data }) {
  const paaNett = usePaaNett();
  const tom = tilstand === "tom";
  const handlinger = <div className="pa-a6-handlinger">
    <PrintButton label="Skriv ut" className="pa-btn pa-btn--secondary pa-btn--sm pa-btn--icon-l" />
    <EksportTrigger kind="brief" className="pa-btn pa-btn--secondary pa-btn--sm pa-btn--icon-l" />
  </div>;
  const hode = <SideHode kicker={`${data.kicker} · ${data.klokke}`} title="Cockpit" actions={tilstand === "data" ? handlinger : undefined} />;

  if (tilstand === "laster") return <div className="pa-a6-side">{hode}<LasterTilstand text="Henter dagen …" /></div>;
  if (tilstand === "feil" || !paaNett) {
    return <div className="pa-a6-side">{hode}<FeilTilstand
      icon={paaNett ? CalendarX : WifiOff}
      title={paaNett ? "Cockpit kunne ikke lastes" : "Ingen forbindelse"}
      text={paaNett ? "Kalender, køen og oppgaver hentes på nytt når du prøver igjen. Ingenting er endret." : `Nettet er nede. Sist hentet ${data.klokke}.`}
      code={paaNett ? "COCKPIT · FEIL" : "FRAKOBLET"}
      retry={<Knapp variant="secondary" onClick={() => window.location.reload()}>Prøv igjen</Knapp>}
    /></div>;
  }

  const d = tom ? { ...data, kalender: [], venter: { totalt: 0, rader: [] }, oppgaver: [], turneringer: [], utenforPlan: [] } : data;
  const tellere = <Tellere>
    <Teller href="/admin/ko" tall={d.venter.totalt} label="Venter på deg" />
    <Teller href="/admin/spillere" tall={d.utenforPlan.length} label="Følger ikke planen" />
    <Teller href="/admin/tournaments" tall={d.turneringer.length} label="Turneringer denne uka" />
    <Teller href="/admin/kalender" tall={d.kalender.length} label="Økter i dag" />
  </Tellere>;
  const venstre = <div className="pa-a6-stabel">
    <Kalender rader={d.kalender} naaMin={d.naaMin} />
    <Venter venter={d.venter} />
    <Oppgaver oppgaver={d.oppgaver} />
  </div>;
  const hoyre = <div className="pa-a6-stabel">
    <Turneringer rader={d.turneringer} />
    <UtenforPlan rader={d.utenforPlan} uker={d.utenforPlanUker} />
    <Nokkeltall tittel="Nøkkeltall" meta="INGEN ØKONOMI HER" rader={d.nokkeltall} tom={tom} />
  </div>;
  return <div className="pa-a6-side">
    {hode}
    {tellere}
    <div className="pa-a6-kolonner">{venstre}{hoyre}</div>
  </div>;
}

