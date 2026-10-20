"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { WangElevrad, wangHref } from "./wang-felles";
import { TOM_PLANDATA, trengerDeg, visPct, type WangPlanData } from "@/app/team-wang/_data/wang-plan-visning";
import {
  visDato,
  type WangTrenerData,
  type WangTrenerUkeOkt,
} from "@/app/team-wang/_data/wang-trener-data";

interface WangIdagProps {
  data: WangTrenerData;
  /** Undersiden: oppmote · okt · fravaer. Alt annet gir I dag. */
  aktivFane?: string;
  /** Økta som Oppmøte, Økta og Meld fravær gjelder (id fra data.ukeOkter). */
  oktId?: string;
  /** Elevenes delte plan (W1): grunnlaget for «Elever som trenger oppfølging». */
  plan?: WangPlanData;
}

const BASE = "/team-wang/coach?omraade=idag";
const tilOkt = (id: string) => `${BASE}&fane=okt&okt=${encodeURIComponent(id)}`;
const tilOppmote = (id: string) => `${BASE}&fane=oppmote&okt=${encodeURIComponent(id)}`;
const tilFravaer = (id: string) => `${BASE}&fane=fravaer&okt=${encodeURIComponent(id)}`;

/**
 * Pakke 2 I dag for trener og sportssjef: I dag, Oppmøte morgentrening, Økta (med avlys) og Meld fravær.
 * Fasit: docs/design-system/utkast-wang/idag.html (utkast 2, retning B, godkjent av Anders 16.10.2026)
 * og felles/wang.css §Nærmere wang.no.
 * Bare ekte gruppedata (byggWangTrenerData). Avvikene skyldes at dataene ikke finnes i basen ennå.
 * Avvik:
 *   - Helteflaten viser dagens økter, ikke «saker krever deg»: Krever handling er ikke koblet.
 *   - Dagens fokus er periodens fokus fra årsplanen, uten akse og uten TrackMan-måltall («—»).
 *   - Øktene har ingen akse i kalenderen, så de vises nøytrale, ikke fylt i aksefargen.
 *   - Oppmøte, fravær og avlysning lagres ikke: basen har ingen tabell for dem. Knappene er sperret med forklaring.
 *   - Skoletimene og gruppevelgeren for sportssjef er ikke med: trenerflaten har én gruppe og ingen timeplan.
 */
export function WangIdag({ data, aktivFane, oktId, plan = TOM_PLANDATA }: WangIdagProps) {
  const okt = oktId ? data.ukeOkter.find((o) => o.id === oktId) : undefined;
  const dagensOkter = data.ukeOkter.filter((o) => o.datoIso === data.idagIso);

  if (aktivFane === "oppmote") {
    return <Oppmote data={data} okt={okt ?? dagensOkter[0]} />;
  }
  if (aktivFane === "fravaer") {
    return <MeldFravaer data={data} okt={okt ?? dagensOkter[0]} />;
  }
  if (aktivFane === "okt") {
    return <Okta data={data} okt={okt} />;
  }
  return <IdagHoved data={data} dagensOkter={dagensOkter} plan={plan} />;
}

// ---------------------------------------------------------------------------
// I dag
// ---------------------------------------------------------------------------

function IdagHoved({
  data,
  dagensOkter,
  plan,
}: {
  data: WangTrenerData;
  dagensOkter: WangTrenerUkeOkt[];
  plan: WangPlanData;
}) {
  const trenger = data.elever
    .filter((e) => plan.perElev[e.id] && trengerDeg(plan.perElev[e.id]))
    .sort((a, b) => (plan.perElev[a.id].etterlevelse.pct ?? 101) - (plan.perElev[b.id].etterlevelse.pct ?? 101));
  const naa = data.naaTid;
  const neste = dagensOkter.find((o) => !naa || (o.sluttTid ?? o.startTid) > naa);
  const aktivPeriode = data.perioder.find((p) => p.status === "naa");
  const antall = dagensOkter.length;

  const morgenPct = plan.morgen.pct;
  const uke = ukeStripe(data);

  return (
    <>
      <section className="wg-helt2" aria-label="I dag">
        <div className="wg-helt2-tekst">
          <p className="wg-helt2-dato">
            {langDato(data.idagIso)} · {data.ukeTekst.split(" · ")[0].toLowerCase()}
            {naa ? ` · kl. ${naa}` : ""}
          </p>
          <h1 className="wg-helt2-tittel">I dag</h1>
          <div className="wg-helt2-tall">
            <div>
              <strong>{antall}</strong>
              <span>{antall === 1 ? "økt i dag" : "økter i dag"}</span>
              <small>
                {neste
                  ? `Neste: ${neste.tittel} kl. ${neste.startTid}`
                  : antall > 0
                    ? "Dagens økter er ferdige"
                    : "Ingen økter i kalenderen"}
              </small>
            </div>
            <div>
              <strong>
                {morgenPct === null ? "—" : morgenPct}
                {morgenPct === null ? null : <span className="wg-helt2-enhet"> %</span>}
              </strong>
              <span>morgentrening gjennomført</span>
              <small>
                {plan.delerIder.length > 0
                  ? `Siste fire uker, ${plan.delerIder.length} av ${data.elever.length} har delt planen`
                  : "Ingen har delt planen ennå"}
              </small>
            </div>
            <a className="wg-helt2-lenke" href="#oppfolging">
              <strong>{plan.delerIder.length > 0 ? trenger.length : "—"}</strong>
              <span>{trenger.length === 1 ? "elev trenger oppfølging →" : "elever trenger oppfølging →"}</span>
              <small>{trenger.length > 0 ? trenger.slice(0, 2).map((e) => `${e.navn} under plan`).join(" · ") : "Under 80 % av planen"}</small>
            </a>
          </div>
          <p className="wg-helt2-kilde">Kilde: gruppas kalender og elevenes plan i PlayerHQ, når den er delt med WANG.</p>
        </div>
        <Image
          className="wg-helt2-bilde"
          src="/team-wang/hero/trening-golf.jpg"
          alt=""
          width={480}
          height={300}
          sizes="(min-width: 1100px) 360px, 100vw"
        />
      </section>

      <section className="wg-seksjon" aria-labelledby="wg-ukestripe-tittel">
        <div className="wg-sek-topp">
          <h2 id="wg-ukestripe-tittel">{data.ukeTekst.split(" · ")[0]}</h2>
          <Link className="wg-lenke" href="/team-wang/coach?omraade=trening">
            Hele uka
          </Link>
        </div>
        <div className="wg-ukestripe">
          {uke.map((d) => (
            <Link
              key={d.iso}
              href={d.forsteOkt ? tilOkt(d.forsteOkt) : "/team-wang/coach?omraade=trening"}
              className={`wg-ukedag ${d.iDag ? "wg-ukedag-idag" : ""}`}
              aria-current={d.iDag ? "date" : undefined}
              aria-label={`${d.navn}: ${d.antall === 0 ? "ingen økter" : d.antall === 1 ? "1 økt" : `${d.antall} økter`}`}
            >
              <span className="wg-ukedag-navn">{d.iDag ? `I dag ${d.dato}` : `${d.navn} ${d.dato}`}</span>
              <span className="wg-ukedag-prikker" aria-hidden>
                {Array.from({ length: d.antall }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
              <span className="wg-ukedag-tall">{d.antall === 0 ? "—" : d.antall === 1 ? "1 økt" : `${d.antall} økter`}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="wg-idag-kol">
        <div>
          <section className="wg-seksjon wg-r3" aria-labelledby="wg-fokus-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-fokus-tittel">Dagens fokus</h2>
              <Link className="wg-lenke" href="/team-wang/coach?visArsplan=1">
                Endre fokus
              </Link>
            </div>
            {aktivPeriode ? (
              <div className="wg-kort wg-fyll wg-idag-fokus">
                <span className="wg-pille">
                  <i />
                  {aktivPeriode.navn}
                </span>
                <h3>{aktivPeriode.fokus || "Ingen fokus skrevet for perioden"}</h3>
                <div className="wg-maltall">
                  <div><strong>—</strong><span>Club Speed</span></div>
                  <div><strong>—</strong><span>Smash Factor</span></div>
                  <div><strong>—</strong><span>Attack Angle</span></div>
                </div>
                <p className="wg-kilde">
                  Fra gruppas årsplan, {visDato(aktivPeriode.startIso)}–{visDato(aktivPeriode.endIso)}. Måltall fra
                  TrackMan er ikke koblet ennå.
                </p>
              </div>
            ) : (
              <WangTomTilstand tittel="Ingen aktiv periode" tekst="Gruppas årsplan har ingen periode som gjelder i dag." />
            )}
          </section>

          <section className="wg-seksjon wg-r2" aria-labelledby="wg-dagen-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-dagen-tittel">Dagen</h2>
              <span className="wg-kilde">Fra gruppas kalender</span>
            </div>
            {antall === 0 ? (
              <WangTomTilstand tittel="Ingen økter i dag" tekst="Gruppa har ingen økter i kalenderen i dag." />
            ) : (
              <Tidslinje okter={dagensOkter} naaTid={naa} />
            )}
          </section>

        </div>

        <div>
          <section className="wg-seksjon wg-r1" aria-labelledby="wg-handling-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-handling-tittel">Krever handling</h2>
            </div>
            {trenger.length > 0 || neste ? (
              <div className="wg-kort wg-krever">
                {neste ? (
                  <>
                    <span className="wg-krever-frist wg-krever-haster">Før {neste.startTid}</span>
                    <div className="wg-krever-sak">
                      <span>
                        <b>Oppmøte {neste.tittel.toLowerCase()}</b>
                        <small>{neste.tid}{neste.sted ? ` · ${neste.sted}` : ""}</small>
                      </span>
                      <Link href={tilOppmote(neste.id)} className="wg-btn wg-btn-primary">
                        Før oppmøte
                      </Link>
                    </div>
                  </>
                ) : null}
                {trenger.length > 0 ? (
                  <>
                    <span className="wg-krever-frist">Denne uka</span>
                    {trenger.map((e) => (
                      <div key={e.id} className="wg-krever-sak">
                        <span>
                          <b>{e.navn} under planen</b>
                          <small>
                            {visPct(plan.perElev[e.id].etterlevelse)} av planen siste fire uker · morgentrening {visPct(plan.perElev[e.id].morgen)}
                          </small>
                        </span>
                        <Link href={wangHref("elever", "elev", e.id)} className="wg-btn wg-btn-secondary">
                          Se eleven
                        </Link>
                      </div>
                    ))}
                  </>
                ) : null}
                <p className="wg-kilde">Fravær flere dager på rad, tester til kontroll og svar på forslag kommer hit når de er koblet.</p>
              </div>
            ) : (
              <WangTomTilstand
                tittel="Ingenting venter på deg"
                tekst="Her samles oppmøte før neste økt og elever under 80 % av planen. Tester til kontroll og svar på forslag kommer hit når de er koblet."
              />
            )}
          </section>

          <section className="wg-seksjon wg-r4" id="oppfolging" aria-labelledby="wg-oppfolging-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-oppfolging-tittel">Elever som trenger oppfølging</h2>
            </div>
            {trenger.length > 0 ? (
              <div className="wg-baand-liste">
                {trenger.map((e) => (
                  <WangElevrad
                    key={e.id}
                    type="trenger"
                    navn={e.navn}
                    linje={`Morgentrening ${visPct(plan.perElev[e.id].morgen)}`}
                    verdi={visPct(plan.perElev[e.id].etterlevelse)}
                    prosent={plan.perElev[e.id].etterlevelse.pct}
                    href={wangHref("elever", "elev", e.id)}
                  />
                ))}
              </div>
            ) : (
              <WangTomTilstand
                tittel={plan.delerIder.length > 0 ? "Ingen under 80 %" : "Ingen har delt planen"}
                tekst={
                  plan.delerIder.length > 0
                    ? "Elevene som har delt planen med deg, ligger på 80 % eller mer siste fire uker."
                    : "Lista bygges av gjennomført tid mot plan siste fire uker, for elever som har delt planen med deg."
                }
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
}

const UKEDAGER = ["Man", "Tir", "Ons", "Tor", "Fre"];

/** Mandag til fredag i uka som vises, med antall økter fra gruppas kalender. */
function ukeStripe(data: WangTrenerData) {
  const [y, m, d] = data.idagIso.split("-").map(Number);
  const idag = new Date(Date.UTC(y, m - 1, d));
  const mandag = new Date(idag);
  mandag.setUTCDate(idag.getUTCDate() - ((idag.getUTCDay() + 6) % 7));
  return UKEDAGER.map((navn, i) => {
    const dag = new Date(mandag);
    dag.setUTCDate(mandag.getUTCDate() + i);
    const iso = dag.toISOString().slice(0, 10);
    const okter = data.ukeOkter.filter((o) => o.datoIso === iso);
    return { navn, iso, dato: dag.getUTCDate(), iDag: iso === data.idagIso, antall: okter.length, forsteOkt: okter[0]?.id ?? null };
  });
}

const TIME_H = 52;

function Tidslinje({ okter, naaTid }: { okter: WangTrenerUkeOkt[]; naaTid: string | null }) {
  const start = okter.map((o) => minutter(o.startTid));
  const slutt = okter.map((o, i) => (o.sluttTid ? minutter(o.sluttTid) : start[i] + 60));
  const fra = Math.min(7, Math.floor(Math.min(...start) / 60));
  const til = Math.max(16, Math.ceil(Math.max(...slutt) / 60));
  const timer = Array.from({ length: til - fra }, (_, i) => fra + i);
  const naa = naaTid ? minutter(naaTid) : null;

  return (
    <div className="wg-dagen" style={{ height: timer.length * TIME_H }}>
      {timer.map((t) => (
        <React.Fragment key={t}>
          <span className="wg-dagen-t">{String(t).padStart(2, "0")}</span>
          <span className="wg-dagen-s" />
        </React.Fragment>
      ))}
      {okter.map((o, i) => (
        <Link
          key={o.id}
          href={tilOkt(o.id)}
          className="wg-blokk"
          style={{
            top: ((start[i] - fra * 60) / 60) * TIME_H + 3,
            height: Math.max(((slutt[i] - start[i]) / 60) * TIME_H - 6, 40),
          }}
        >
          <b>{o.tittel}</b>
          <span>
            {o.tid}
            {o.sted ? ` · ${o.sted}` : ""}
          </span>
        </Link>
      ))}
      {naa !== null && naa >= fra * 60 && naa <= til * 60 ? (
        <span className="wg-naa" style={{ top: ((naa - fra * 60) / 60) * TIME_H }} aria-label={`Nå ${naaTid}`}>
          <b aria-hidden>{naaTid}</b>
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Undersidene
// ---------------------------------------------------------------------------

function Tilbake() {
  return (
    <Link href={BASE} className="wg-tilbake">
      <ArrowLeft size={18} aria-hidden />I dag
    </Link>
  );
}

type Oppmotevalg = "til" | "fravaer" | "borte";

const OPPMOTEVALG: { id: Oppmotevalg; tittel: string }[] = [
  { id: "til", tittel: "Til stede" },
  { id: "fravaer", tittel: "Fravær" },
  { id: "borte", tittel: "Ikke møtt" },
];

function Oppmote({ data, okt }: { data: WangTrenerData; okt?: WangTrenerUkeOkt }) {
  const [valg, setValg] = useState<Record<string, Oppmotevalg>>({});
  const antall = data.elever.length;
  const fort = Object.keys(valg).length;
  const tilStede = Object.values(valg).filter((v) => v === "til").length;

  return (
    <>
      <Tilbake />
      <section className="wg-seksjon">
        <div>
          <p className="wg-dato">
            {okt ? `${langDato(okt.datoIso)} · ${okt.tid}${okt.sted ? ` · ${okt.sted}` : ""}` : langDato(data.idagIso)}
          </p>
          <h1 className="wg-tittel">Oppmøte</h1>
          {okt ? <p className="wg-ingress">{okt.tittel}</p> : null}
        </div>
        {okt && antall > 0 ? (
          <div className="wg-oppmote-topp">
            <svg className="wg-ring" viewBox="0 0 72 72" role="img" aria-label={`${tilStede} av ${antall} til stede`}>
              <circle cx="36" cy="36" r="30" stroke="var(--wg-n100)" />
              <circle
                cx="36"
                cy="36"
                r="30"
                stroke="var(--wg-mint)"
                pathLength={100}
                strokeDasharray={`${Math.round((100 * tilStede) / antall)} 100`}
                transform="rotate(-90 36 36)"
              />
            </svg>
            <div>
              <p className="wg-hoved">
                <strong>{tilStede}</strong>
                <span>av {antall} til stede</span>
              </p>
              <p className="wg-kilde">
                {fort} av {antall} ført.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {!okt ? (
        <WangTomTilstand tittel="Ingen økter i dag" tekst="Gruppa har ingen økter i kalenderen i dag, så det er ikke noe oppmøte å føre." />
      ) : antall === 0 ? (
        <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Legg til elever i gruppa før du fører oppmøte." />
      ) : (
        <>
          <div className="wg-kort wg-elever-kol">
            {data.elever.map((e) => (
              <div key={e.id} className="wg-elev">
                <span className="wg-avatar" aria-hidden>{initialer(e.navn)}</span>
                <b className="wg-elev-navn">{e.navn}</b>
                <div className="wg-valg" role="group" aria-label={`Oppmøte ${e.navn}`}>
                  {OPPMOTEVALG.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      data-v={v.id}
                      aria-pressed={valg[e.id] === v.id}
                      onClick={() => setValg((f) => ({ ...f, [e.id]: v.id }))}
                    >
                      {v.tittel}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="wg-feste">
            <div className="wg-knapper">
              <button type="button" className="wg-btn wg-btn-primary" disabled>
                Lagre oppmøte
              </button>
              <Link href={tilFravaer(okt.id)} className="wg-btn wg-btn-secondary">
                Meld fravær
              </Link>
            </div>
            <p className="wg-kilde">
              Oppmøtet kan ikke lagres ennå: basen har ingen tabell for oppmøte. Valgene du gjør her, forsvinner når du
              forlater siden.
            </p>
          </div>
        </>
      )}
    </>
  );
}

function Okta({ data, okt }: { data: WangTrenerData; okt?: WangTrenerUkeOkt }) {
  const [visAvlys, setVisAvlys] = useState(false);

  if (!okt) {
    return (
      <>
        <Tilbake />
        <WangTomTilstand tittel="Fant ikke økta" tekst="Økta finnes ikke i gruppas kalender denne uka. Velg en økt fra I dag." />
      </>
    );
  }

  const varighet = okt.sluttTid ? minutter(okt.sluttTid) - minutter(okt.startTid) : null;

  return (
    <>
      <Tilbake />
      <section className="wg-kort wg-fyll wg-okt-hode">
        <div className="wg-okt-rad">
          <span className="wg-okt-tid">
            {okt.startTid}
            {varighet ? <small>{varighet} min</small> : null}
          </span>
          <span className="wg-pille">
            <i />
            {okt.passert ? "Passert" : okt.datoIso === data.idagIso ? "I dag" : "Planlagt"}
          </span>
        </div>
        <h1 className="wg-okt-navn">{okt.tittel}</h1>
        <p className="wg-okt-info">
          <span>{langDato(okt.datoIso)}</span>
          {okt.sted ? <span>{okt.sted}</span> : null}
          <span>{data.elever.length} elever</span>
        </p>
      </section>

      <div className="wg-idag-kol">
        <div>
          <section className="wg-seksjon" aria-labelledby="wg-hvorfor-tittel">
            <div className="wg-sek-topp"><h2 id="wg-hvorfor-tittel">Hvorfor</h2></div>
            <p className="wg-forklar">{okt.beskrivelse?.trim() || "Ingen beskrivelse i kalenderen."}</p>
          </section>
          <section className="wg-seksjon" aria-labelledby="wg-ovelser-tittel">
            <div className="wg-sek-topp"><h2 id="wg-ovelser-tittel">Øvelser</h2></div>
            <WangTomTilstand
              tittel="Ingen øvelser lagt inn"
              tekst="Gruppas kalender har bare tid og sted for økta. Øvelsene kommer når økta planlegges i Workbench."
            />
          </section>
        </div>
        <div>
          <section className="wg-seksjon" aria-labelledby="wg-deltakere-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-deltakere-tittel">Deltakere</h2>
              <Link className="wg-lenke" href={tilOppmote(okt.id)}>Før oppmøte</Link>
            </div>
            <div className="wg-kort wg-fyll">
              <p className="wg-rad-info">
                <span><b>{data.elever.length}</b> i gruppa</span>
                <span><b>—</b> fravær meldt</span>
                <span><b>—</b> ført</span>
              </p>
              <p className="wg-kilde">Oppmøte og fravær lagres ikke ennå.</p>
            </div>
          </section>
          <section className="wg-seksjon" aria-labelledby="wg-utstyr-tittel">
            <div className="wg-sek-topp"><h2 id="wg-utstyr-tittel">Utstyr</h2></div>
            <div className="wg-kort wg-fyll"><p className="wg-forklar">—</p></div>
          </section>
          <section className="wg-seksjon">
            <div className="wg-knapper">
              <Link href={tilFravaer(okt.id)} className="wg-btn wg-btn-secondary">Meld fravær</Link>
              {!okt.passert ? (
                <button type="button" className="wg-btn wg-btn-fare" aria-expanded={visAvlys} onClick={() => setVisAvlys(true)}>
                  Avlys økt
                </button>
              ) : null}
            </div>
            {visAvlys ? (
              <div className="wg-kort wg-fyll" role="region" aria-label="Avlys økt">
                <b className="wg-undertittel">Avlyse «{okt.tittel}»?</b>
                <p className="wg-forklar">Elevene skal få beskjed i PlayerHQ med en gang, og økta skal forsvinne fra planen deres.</p>
                <p className="wg-kilde">
                  Avlysning fra trenerflaten er ikke koblet ennå: kalenderen kan ikke ta bort én dag av en fast økt, og
                  ingenting sendes til elevene herfra.
                </p>
                <div className="wg-knapper">
                  <button type="button" className="wg-btn wg-btn-fare" disabled>Avlys og varsle elevene</button>
                  <button type="button" className="wg-btn wg-btn-secondary" onClick={() => setVisAvlys(false)}>
                    Behold økta
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

const GRUNNER = [
  "Ikke meldt, ukjent grunn",
  "Skole: prøve eller undervisning",
  "Reise eller turnering",
  "Meldt av foresatt",
  "Annet",
];

function MeldFravaer({ data, okt }: { data: WangTrenerData; okt?: WangTrenerUkeOkt }) {
  const [omfang, setOmfang] = useState<"okt" | "dag">("okt");

  return (
    <>
      <Tilbake />
      <section>
        <p className="wg-dato">
          {okt ? `${okt.tittel} · ${langDato(okt.datoIso)} · ${okt.startTid}` : langDato(data.idagIso)}
        </p>
        <h1 className="wg-tittel">Meld fravær</h1>
        <p className="wg-ingress">For en elev som ikke kommer. Eleven og foresatte under 18 skal se fraværet i PlayerHQ.</p>
      </section>

      {!okt ? (
        <WangTomTilstand tittel="Ingen økter å melde fravær fra" tekst="Gruppa har ingen økter i kalenderen i dag." />
      ) : data.elever.length === 0 ? (
        <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Legg til elever i gruppa før du melder fravær." />
      ) : (
        <form className="wg-kort wg-fyll wg-skjema" onSubmit={(e) => e.preventDefault()}>
          <label className="wg-lbl">
            Elev
            <select className="wg-field" defaultValue="">
              <option value="" disabled>Velg elev</option>
              {data.elever.map((e) => (
                <option key={e.id} value={e.id}>{e.navn}</option>
              ))}
            </select>
          </label>
          <div className="wg-lbl" role="group" aria-label="Økter">
            Økter
            <div className="wg-valg wg-valg-to">
              <button type="button" aria-pressed={omfang === "okt"} onClick={() => setOmfang("okt")}>Bare denne økta</button>
              <button type="button" aria-pressed={omfang === "dag"} onClick={() => setOmfang("dag")}>Hele dagen</button>
            </div>
          </div>
          <label className="wg-lbl">
            Grunn
            <select className="wg-field" defaultValue={GRUNNER[0]}>
              {GRUNNER.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <span className="wg-hjelp">Skriv aldri helseopplysninger her. De hører hjemme hos helsepersonell.</span>
          </label>
          <label className="wg-lbl">
            Notat til eleven
            <textarea className="wg-field" rows={3} placeholder="Valgfritt" />
            <span className="wg-hjelp">Skal sendes som melding i PlayerHQ når fraværet lagres.</span>
          </label>
          <div className="wg-knapper">
            <button type="submit" className="wg-btn wg-btn-primary" disabled>Bekreft fravær</button>
            <Link href={BASE} className="wg-btn wg-btn-secondary">Avbryt</Link>
          </div>
          <p className="wg-kilde">
            Fravær kan ikke lagres ennå: basen har ingen tabell for fravær fra økter. Ingenting er lagret eller sendt.
          </p>
        </form>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function minutter(hhmm: string): number {
  const [t, m] = hhmm.split(":").map(Number);
  return t * 60 + (m || 0);
}

/** «2026-10-14» → «Onsdag 14. oktober». Dagstrengen tolkes som UTC-dato, så tidssonen ikke flytter dagen. */
function langDato(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const tekst = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

function initialer(navn: string): string {
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((del) => del[0]?.toUpperCase() ?? "")
    .join("");
}
