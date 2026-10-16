/**
 * PH-03 Øktark i nytt design (pakke 2 Treningsøkten).
 * Fasit: docs/design-system/utkast-playerhq/treningsokt.html, skjerm «okt». Stil: src/styles/playerhq-ny-okt.css.
 *
 * Start, oppsummering, flytting, invitasjon og AK-formel beholdes.
 * data-od-id er den eksisterende klikk-kontrakten.
 *
 * Avvik:
 *   - «Hopp over økten» med årsak er ikke med: økta har ikke noe felt for årsak i alle tre øktmodellene.
 *     «Flytt økta» åpner Workbench som før.
 *   - Utstyr og «Hvorfor den ligger i uka» med prosessmål vises bare når coach har skrevet en begrunnelse;
 *     koblingen til prosessmål finnes ikke i datamodellen.
 *   - Valget Golføkt/Fysisk økt i tegningen er en demovelger og er ikke med.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-03.
 */
import Link from "next/link";
import { Check, ChevronLeft, Play } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import { InviteFriendTrigger } from "@/components/portal/workbench/invite-friend-trigger";
import { formaterVarighet } from "@/lib/format-tall";
import { oktBilde } from "@/lib/portal/okt-bilde";
import { formelLedd } from "@/lib/portal-okt/formel-ord";
import type { OktDetaljData, OktDrill } from "@/lib/portal-okt/okt-detalj-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-okt.css";

const AKSE: Record<string, string> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

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
    return <div className="phn phn-okt" data-od-id="playerhq-okt-detalj-tom"><div className="smal">
      <div className="hode-okt"><span className="phn-dato">Økt</span><h1>Fant ikke økta</h1></div>
      <p className="phn-forklar">Den kan være slettet fra planen, eller lenken er gammel.{nesteTekst ? ` ${nesteTekst}` : ""}</p>
      <div><Link href="/portal/planlegge" data-od-id="okt-tom-plan" className="phn-knapp pri stor">Åpne planen</Link></div>
    </div></div>;
  }

  const erGjort = data.status === "done";
  const akse = AKSE[data.pyramide] ?? "tek";
  const [fra, til] = data.tidTekst.split("–");
  const bilde = oktBilde(data.pyramide, `${data.emTittel} ${data.sted}`);
  const rader: [string, string][] = [["Når", `${data.dagTekst} ${data.tidTekst}`], ["Sted", data.sted], ["Varighet", formaterVarighet(data.varighetMin)]];
  if (data.publisertAv) rader.push(["Publisert av", data.publisertAv]);
  if (erGjort && data.resultat?.fullfortKl) rader.push(["Gjennomført", `${data.dagTekst} ${data.resultat.fullfortKl}`]);

  return <div className="phn phn-okt" data-od-id="playerhq-okt-detalj"><div className="smal">
    <Link href="/portal/planlegge" className="phn-knapp sek" style={{ justifySelf: "start" }}><Ikon icon={ChevronLeft} size={20} name="chevron-left" />Plan</Link>
    <div className="hode-okt"><span className="phn-dato">{data.dagTekst} · uke {data.ukeNr} · {data.sted}</span></div>

    <div className={`okt-hero fylt-${akse}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
      <img src={bilde.src} alt="" width={1400} height={933} style={{ objectPosition: bilde.posisjon }} />
      <div className="tekst">
        <div className="okt-rad"><span className="okt-tid">{fra}{til && <small>–{til}</small>}</span><span className="akse-merke"><i />{data.pyramide}</span></div>
        <span className="navn">{data.emTittel}</span>
        <div className="okt-info"><span>{formaterVarighet(data.varighetMin)}</span><span>{data.drills.length} {data.drills.length === 1 ? "øvelse" : "øvelser"}</span><span>{data.sted}</span></div>
        {data.status === "cancelled" || data.status === "skipped" ? <span className="phn-pille noy" style={{ justifySelf: "start" }}>{data.statusLabel}</span> : null}
      </div>
    </div>

    {erGjort ? <>
      {data.resultat && <section className="phn-kort" aria-label="Resultat">
        <span className="phn-dato">Resultat</span>
        <div className="phn-hoved"><strong>{data.resultat.drillsFullfort}<small>av {data.resultat.antallDrills}</small></strong>
          {data.resultat.antallDrills > 0 && data.resultat.drillsFullfort === data.resultat.antallDrills && <span className="phn-pille ok">Mål nådd</span>}</div>
        <span className="sub">Øvelser gjennomført</span>
      </section>}
      <div className="to-kol">
        <div className="phn-seksjon">
          {data.maal && <Maal maal={data.maal} hvorfor={data.hvorfor} />}
          {data.notat && <section className="phn-kort"><span className="phn-dato">Din observasjon</span><p className="phn-forklar">{data.notat}</p></section>}
          <MetaRader rader={rader} />
        </div>
        <Drills drills={data.drills} medHaker />
      </div>
      <div className="phn-knapper">
        <Link href={nesteHref} data-od-id="okt-gjort-neste" className="phn-knapp pri stor">{harNeste ? "Åpne neste økt" : "Åpne planen"}</Link>
        <Link href={`/portal/live/${data.id}/summary`} data-od-id="okt-gjort-summary" className="phn-knapp sek stor">Se oppsummering</Link>
      </div>
    </> : <>
      <div className="to-kol">
        <div className="phn-seksjon">
          {data.maal ? <Maal maal={data.maal} hvorfor={data.hvorfor} />
            : data.hvorfor ? <section className="phn-kort dempet" aria-label="Fra coach"><span className="phn-dato">Fra coach</span><p className="phn-forklar">{data.hvorfor}</p></section>
            : <section className="phn-kort dempet" aria-label="Mål for økten"><span className="phn-dato">Mål for økten</span><p className="phn-forklar">—</p></section>}
          <MetaRader rader={rader} />
          {(data.invite || data.deltakere.length > 0) && <section className="phn-kort" aria-label="Tren sammen">
            <span className="phn-dato">Tren sammen</span>
            <div className="rad-liste">{data.deltakere.map((p) => <div key={p.id}><span>{p.navn}</span><span className="sub">{p.statusLabel}</span></div>)}</div>
            {data.invite && <InviteFriendTrigger sessionId={data.id} hostId={userId} maxParticipants={data.invite.maxParticipants} currentParticipants={data.invite.currentParticipants} spillere={data.invite.spillere} label="Inviter en kompis" variant="ghost" />}
          </section>}
        </div>
        <Drills drills={data.drills} medHaker={false} />
      </div>
      {data.kanStarte && <div className="phn-knapper" aria-label="Start">
        <Link href={data.startHref} data-od-id="okt-start" className="phn-knapp pri stor"><Ikon icon={Play} size={20} name="play" />{data.startLabel}</Link>
        <Link href="/portal/planlegge/workbench" data-od-id="okt-flytt" className="phn-knapp sek stor">Flytt økta</Link>
      </div>}
      <p className="sub">Økta er din. Du kan endre målet, hoppe over øvelser eller droppe økta. Treneren får beskjed.</p>
    </>}
  </div></div>;
}

function MetaRader({ rader }: { rader: [string, string][] }) {
  return <section className="phn-kort" aria-label="Om økta">
    <dl className="meta-liste">{rader.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
  </section>;
}

function Maal({ maal, hvorfor }: { maal: string; hvorfor: string | null }) {
  return <section className="phn-kort" aria-label="Mål for økten">
    <span className="phn-dato">Mål for økten</span>
    <b className="undertittel" style={{ fontSize: 18 }}>{maal}</b>
    {hvorfor && <details data-od-id="okt-why-maal"><summary>Hvorfor dette målet</summary><p className="phn-forklar">{hvorfor}</p></details>}
  </section>;
}

function Drills({ drills, medHaker }: { drills: OktDrill[]; medHaker: boolean }) {
  const total = drills.reduce((s, d) => s + (d.tidMin ?? 0), 0);
  return <section className="phn-seksjon" aria-label="Øvelser">
    <div className="phn-sek-topp"><h2>Øvelser</h2><span className="phn-kilde">{drills.length} {drills.length === 1 ? "øvelse" : "øvelser"}{total > 0 ? ` · ${formaterVarighet(total)}` : ""}</span></div>
    {drills.length === 0 ? <p className="phn-forklar">Økta har ingen øvelser. Innholdet avtales på stedet.</p>
      : <ol className="ovelser">{drills.map((d, i) => <li key={d.id} className={`ovelse${medHaker && d.gjort ? " gjort" : ""}`}>
        <span className="nr" aria-label={medHaker ? (d.gjort ? "Gjennomført" : "Ikke registrert") : undefined}>{medHaker && d.gjort ? <Ikon icon={Check} size={16} name="check" /> : i + 1}</span>
        <div>
          <b>{d.volum ? `${d.volum} · ${d.navn}` : d.navn}</b>
          {d.formel && <div className="formel" aria-label={`AK-formel ${d.formel}`}>{formelLedd(d.formel).map((l, j) => <span key={`${l}-${j}`}>{l}</span>)}</div>}
        </div>
        <span className="min">{d.tidMin != null ? `${d.tidMin} min` : "—"}</span>
      </li>)}</ol>}
  </section>;
}
