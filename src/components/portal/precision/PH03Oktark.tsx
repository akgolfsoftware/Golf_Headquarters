/**
 * PH-03 Øktark — Precision Athletics (7d7c2994).
 * Tegningen ui_kits/playerhq/screens/PH-03.jsx ligger ikke i git.
 *
 * Start, oppsummering, flytting, invitasjon og AK-formel beholdes.
 * data-od-id er den eksisterende klikk-kontrakten.
 */
import Link from "next/link";
import { Check } from "lucide-react";
import { AkseMerke, Ikon, Meta, Sidehode, StatusPille, Tall, type Akse } from "@/components/precision/pa";
import { InviteFriendTrigger } from "@/components/portal/workbench/invite-friend-trigger";
import { formaterVarighet } from "@/lib/format-tall";
import type { OktDetaljData, OktDrill } from "@/lib/portal-okt/okt-detalj-data";

const AKSE: Record<string, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

export function PH03Oktark({
  data,
  userId,
  nesteTekst,
  nesteHref,
  harNeste,
}: {
  data: OktDetaljData;
  userId: string;
  nesteTekst: string | null;
  nesteHref: string;
  harNeste: boolean;
}) {
  if (!data.found) {
    return <div className="pa-side" data-od-id="playerhq-okt-detalj-tom">
      <Sidehode kicker="Økt" title="Fant ikke økta" sub={`Den kan være slettet fra planen, eller lenken er gammel.${nesteTekst ? ` ${nesteTekst}` : ""}`} />
      <Link href="/portal/planlegge" data-od-id="okt-tom-plan" className="pa-btn pa-btn--primary pa-btn--lg pa-btn--full">Åpne planen</Link>
    </div>;
  }

  const erGjort = data.status === "done";
  const akse = AKSE[data.pyramide];
  const rader: [string, string][] = [
    ["Når", `${data.dagTekst} ${data.tidTekst}`],
    ["Sted", data.sted],
    ["Varighet", formaterVarighet(data.varighetMin)],
    ["Pyramide", data.pyramide],
  ];
  if (data.publisertAv) rader.push(["Publisert av", data.publisertAv]);
  if (erGjort && data.resultat?.fullfortKl) rader.push(["Fullført", `${data.dagTekst} ${data.resultat.fullfortKl}`]);

  return <div className="pa-side ph03" data-od-id="playerhq-okt-detalj">
    <Link href="/portal/planlegge" className="pa-btn pa-btn--ghost">Tilbake til plan</Link>
    <Sidehode kicker={`${data.dagTekst} · uke ${data.ukeNr}`} title={data.emTittel} sub={data.tittel} />
    <div className="ph02-merker">
      {akse && <AkseMerke axis={akse} />}
      {data.status === "cancelled" && <StatusPille tone="warn">{data.statusLabel}</StatusPille>}
      {data.status === "skipped" && <StatusPille tone="neutral">{data.statusLabel}</StatusPille>}
    </div>
    {erGjort ? <>
      {data.resultat && <section className="pa-card ph03-kort" aria-label="Resultat">
        <Meta>Resultat</Meta>
        <p className="ph03-resultat"><Tall>{data.resultat.drillsFullfort}</Tall> av {data.resultat.antallDrills}</p>
        {data.resultat.antallDrills > 0 && data.resultat.drillsFullfort === data.resultat.antallDrills && <StatusPille tone="ok">Mål nådd</StatusPille>}
      </section>}
      {data.maal && <Maal maal={data.maal} hvorfor={data.hvorfor} />}
      {data.notat && <section className="pa-card ph03-kort"><Meta>Din observasjon</Meta><p>{data.notat}</p></section>}
      <MetaRader tittel={data.tittel} rader={rader} />
      <Drills drills={data.drills} medHaker />
      <div className="ph03-handlinger">
        <Link href={nesteHref} data-od-id="okt-gjort-neste" className="pa-btn pa-btn--primary pa-btn--lg">{harNeste ? "Åpne neste økt" : "Åpne planen"}</Link>
        <Link href={`/portal/live/${data.id}/summary`} data-od-id="okt-gjort-summary" className="pa-btn pa-btn--secondary pa-btn--lg">Se oppsummering</Link>
      </div>
    </> : <>
      {data.kanStarte && <section className="pa-card ph03-kort" aria-label="Én ting nå">
        <Meta>Én ting nå</Meta>
        <h2>{data.status === "now" ? "Økta pågår" : <>Økta starter kl. <Tall>{data.tidTekst.split("–")[0]}</Tall></>}</h2>
        <p className="ph02-meta">{data.status === "now"
          ? `${data.sted} · ${data.tidTekst}. Loggen ligger i live-flyten.`
          : `${data.sted} · ${data.tidTekst}. Du kan starte når du er klar.`}</p>
        <div className="ph03-handlinger">
          <Link href={data.startHref} data-od-id="okt-start" className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full">{data.startLabel}</Link>
          <Link href="/portal/planlegge/workbench" data-od-id="okt-flytt" className="pa-btn pa-btn--secondary">Flytt økta</Link>
        </div>
      </section>}
      <MetaRader tittel={data.tittel} rader={rader} />
      {data.maal && <Maal maal={data.maal} hvorfor={data.hvorfor} />}
      {!data.maal && data.hvorfor && <section className="pa-card ph03-kort"><Meta>Fra coach</Meta><p>{data.hvorfor}</p></section>}
      <Drills drills={data.drills} medHaker={false} />
      {(data.invite || data.deltakere.length > 0) && <section className="pa-card ph03-kort" aria-label="Tren sammen">
        <Meta>Tren sammen</Meta>
        {data.deltakere.map((p) => <div key={p.id} className="ph03-rad"><span>{p.navn}</span><Meta>{p.statusLabel}</Meta></div>)}
        {data.invite && <InviteFriendTrigger sessionId={data.id} hostId={userId} maxParticipants={data.invite.maxParticipants} currentParticipants={data.invite.currentParticipants} spillere={data.invite.spillere} label="Inviter en kompis" variant="ghost" />}
      </section>}
      <p className="ph02-meta">Økta er din. Du kan endre målet, hoppe over øvelser eller droppe økta. Treneren får beskjed.</p>
    </>}
  </div>;
}

function MetaRader({ tittel, rader }: { tittel: string; rader: [string, string][] }) {
  return <section className="pa-card ph03-kort" aria-label={tittel}>
    <Meta>{tittel}</Meta>
    <dl className="ph03-meta">{rader.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
  </section>;
}

function Maal({ maal, hvorfor }: { maal: string; hvorfor: string | null }) {
  return <section className="pa-card ph03-kort">
    <Meta>Målsetning</Meta>
    <p>{maal}</p>
    {hvorfor && <details data-od-id="okt-why-maal"><summary>Hvorfor dette tallet</summary><p className="ph02-meta">{hvorfor}</p></details>}
  </section>;
}

function Drills({ drills, medHaker }: { drills: OktDrill[]; medHaker: boolean }) {
  const total = drills.reduce((s, d) => s + (d.tidMin ?? 0), 0);
  return <section className="pa-card ph03-kort" aria-label="Øvelser">
    <Meta>Øvelser · {drills.length}{total > 0 ? ` · ${formaterVarighet(total)}` : ""}</Meta>
    {drills.length === 0 ? <p className="ph02-meta">Økta har ingen øvelser. Innholdet avtales på stedet.</p> : drills.map((d) => <div key={d.id} className="ph03-ovelse">
      {medHaker && <span className={d.gjort ? "ph03-hake ph03-hake--pa" : "ph03-hake"} aria-label={d.gjort ? "Fullført" : "Ikke logget"}>{d.gjort ? <Ikon icon={Check} size={14} /> : null}</span>}
      <div>
        <strong>{d.navn}</strong>
        {(d.volum || d.tidMin != null) && <Meta>{[d.volum, d.tidMin != null ? `${d.tidMin} min` : null].filter(Boolean).join(" · ")}</Meta>}
        {d.formel && <span className="ph03-formel">{d.formel}</span>}
      </div>
    </div>)}
  </section>;
}
