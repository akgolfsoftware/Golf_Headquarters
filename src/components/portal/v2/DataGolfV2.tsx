"use client";
/**
 * DataGolf · spilleren utforsker proffer og sammenligner egne målinger.
 * Proffvalg, like SG-skalaer, sammenligning, innspill og lagret utfordringshistorikk.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Trophy } from "lucide-react";
import { Knapp, TomTilstand } from "@/components/precision/pa";
import type { UtfordringResultat } from "@/lib/datagolf/challenge";
import type { DataGolfKildestatus, SpillerverktoyData } from "@/lib/datagolf/player-tool-data";
import {
  bandEtikett,
  fellesRunder,
  rundeOppsummering,
  SG_FELT,
  skillDifferanse,
  turneringer,
  visTall,
  type HistoriskRunde,
  type Proff,
} from "@/lib/datagolf/player-tool";
import { STASJON_SLAG } from "@/lib/datagolf/stasjon";
import type { Turneringshistorikk } from "@/lib/domain/turneringshistorikk";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";

const dato = (s: string | Date | null | undefined) =>
  s ? new Date(s).toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" }) : "Dato mangler";
const motPar = (n: number | null) => (n == null ? "—" : n > 0 ? `+${n}` : String(n));

function Seksjon({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pa-card ph-kort">
      <p>{title}</p>
      {children}
    </section>
  );
}
function Merknad({ children }: { children: ReactNode }) {
  return <div><small>{children}</small></div>;
}

function Ferdighet({ pro, mot }: { pro: Proff; mot: Proff | null }) {
  return (
    <Seksjon title="Beregnet ferdighetsnivå">
      <div>Strokes Gained (SG) er slag vunnet eller tapt mot en referanse. Her viser DataGolf forventet prestasjon på en gjennomsnittlig PGA Tour-bane.</div>
      <Merknad>{pro.name}: {dato(pro.asOf)}{mot ? ` · ${mot.name}: ${dato(mot.asOf)}` : ""}</Merknad>
      <ul className="ph-rader">
        {SG_FELT.map((f) => (
          <li key={f.key}>
            <span>
              <strong>{f.label}</strong>
              {[pro, ...(mot ? [mot] : [])].map((p) => (
                <small key={p.dgId}>{p.name}: {visTall(p[f.key], 2, true)}</small>
              ))}
              {mot && skillDifferanse(pro, mot, f.key) !== null && (
                <small>Forskjell, {pro.name}: {visTall(skillDifferanse(pro, mot, f.key), 2, true)} slag per runde.</small>
              )}
            </span>
          </li>
        ))}
      </ul>
      <Merknad>Samme skala på begge sider av null. Dette er en modellberegning, ikke et sesongsnitt eller en garantert rundescore. Forskjell vises bare for samme kildeuttak.</Merknad>
    </Seksjon>
  );
}

function Resultater({ rounds, name, status }: { rounds: HistoriskRunde[]; name: string; status: DataGolfKildestatus | null }) {
  return (
    <Seksjon title={`Turneringer · ${name}`}>
      {rounds.length === 0 ? (
        <div>
          {status === "ikke-konfigurert"
            ? "Rundehistorikken fra DataGolf er ikke tilgjengelig i denne versjonen ennå."
            : status === "feil"
              ? "Rundehistorikken kunne ikke lastes. Prøv igjen."
              : "Ingen runder er registrert i dette utvalget."}
        </div>
      ) : (
        <>
          <div>Siste {rounds.length} importerte runder. Datoen tilhører turneringen; eksakt spilledag kan mangle. En turnering kan være delvis med i utvalget.</div>
          {turneringer(rounds).map((e) => (
            <details key={e.id}>
              <summary>
                <strong>{e.name}</strong>
                <small>
                  {dato(e.date)} · {e.tour.toUpperCase()} · {e.position != null ? `Plass ${e.position}` : e.madeCut === false ? "Misset cut" : "Sluttplassering mangler"}
                </small>
              </summary>
              <ul className="ph-rader">
                {e.rounds.map((r) => (
                  <li key={r.round}>
                    <span>
                      <strong>Runde {r.round}: {visTall(r.score, 0)} slag</strong>
                      <small>{visTall(r.toPar, 0, true)} mot par</small>
                      <small>
                        SG mot rundens felt: {visTall(r.total, 2, true)}
                        {r.app != null ? ` · innspill ${visTall(r.app, 2, true)}` : " · kategorier mangler"}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <Merknad>Data sist importert {dato(rounds.reduce((a, b) => a.importedAt > b.importedAt ? a : b).importedAt)}. Rå SG er relativt til rundens felt og bane, ikke True SG.</Merknad>
        </>
      )}
    </Seksjon>
  );
}

function Historikk({ h }: { h: Turneringshistorikk }) {
  const [sesong, setSesong] = useState("alle");
  const [sok, setSok] = useState("");
  const [antall, setAntall] = useState(20);
  if (!h.harHistorikk) {
    return (
      <section className="pa-card ph-kort">
        <TomTilstand icon={Trophy} title="Ingen turneringer å vise" text={h.tomGrunn || undefined} />
      </section>
    );
  }
  const rader = h.aar
    .filter((a) => sesong === "alle" || String(a.aar) === sesong)
    .flatMap((a) => a.turneringer)
    .filter((t) => t.navn.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb")));
  return (
    <section className="pa-card ph-kort" aria-label="Din turneringshistorikk">
      <p>Din turneringshistorikk</p>
      <div className="ph-kpi">
        <p className="pa-card"><span>Turneringsstarter</span><strong>{h.antall}</strong></p>
        <p className="pa-card"><span>Beste plassering</span><strong>{h.bestePlassering != null ? `${h.bestePlassering}.` : "—"}</strong></p>
      </div>
      <Merknad>Beste plassering gjelder egen klasse og bygger på {h.medPlassering} fullførte resultater med plassering.</Merknad>
      <form className="ph-skjema" onSubmit={(e) => e.preventDefault()}>
        <label>
          Sesong
          <select value={sesong} onChange={(e) => { setSesong(e.target.value); setAntall(20); }}>
            <option value="alle">Alle sesonger</option>
            {h.aar.map((a) => <option key={a.aar} value={a.aar}>{a.aar}</option>)}
          </select>
        </label>
        <label>
          Søk i turneringer
          <input type="search" value={sok} onChange={(e) => { setSok(e.target.value); setAntall(20); }} />
        </label>
      </form>
      {!rader.length && <p role="status">Ingen turneringer matcher utvalget.</p>}
      {rader.slice(0, antall).map((t) => (
        <details key={t.turneringId}>
          <summary>
            <strong>{t.navn}</strong>
            <small>{dato(t.startDato)} · {resultatStatus(t.status)} · {resultatKilde(t.kilde)}</small>
            <small>
              {t.brutto != null ? `${t.brutto} slag brutto` : "Totalscore mangler"}
              {t.plassering != null && t.status === "FINISHED" ? ` · Plass ${t.plasseringTekst ?? t.plassering} i klassen` : ""}
            </small>
          </summary>
          {t.klasse && <Merknad>Klasse: {t.klasse}</Merknad>}
          {t.motPar != null && <Merknad>Score mot par fra kilden: {motPar(t.motPar)}.</Merknad>}
          {(t.runder?.length ?? 0) > 0 ? (
            <ul className="ph-rader">
              {t.runder?.map((r) => (
                <li key={r.nummer}>
                  <span>
                    <strong>Runde {r.nummer}</strong>
                    {r.hull ? <small>{r.hull} hull</small> : null}
                    {r.fullfort !== true && <small>{r.fullfort === false ? "Ikke fullført" : "Fullstendighet ukjent"}</small>}
                  </span>
                  <b>Brutto {r.brutto ?? "—"} · Mot par {motPar(r.motPar)}</b>
                </li>
              ))}
            </ul>
          ) : (
            <Merknad>Rundedetaljer er ikke tilgjengelige ennå.</Merknad>
          )}
          {t.kildeDelvis && <p role="status">Kilden er delvis hentet. Flere klasser kan mangle.</p>}
          <Merknad>{t.kildeDato ? `Resultatene ble hentet ${dato(t.kildeDato)}.` : "Hentedato for resultatene er ikke dokumentert."} Turneringsdatoen er ikke nødvendigvis datoen for hver runde.</Merknad>
          {t.kildeUrl && /^https?:\/\//i.test(t.kildeUrl) && (
            <a href={t.kildeUrl} target="_blank" rel="noopener noreferrer">Se hos arrangøren</a>
          )}
        </details>
      ))}
      {rader.length > antall && (
        <Knapp type="button" variant="secondary" onClick={() => setAntall((n) => n + 20)}>Vis flere turneringer</Knapp>
      )}
    </section>
  );
}

function Utfordringer({ historikk }: Pick<DataGolfProps, "historikk">) {
  return (
    <Seksjon title="Dine siste utfordringer">
      {!historikk.length ? <div>Prøv en innspillutfordring for å lagre ditt første resultat.</div> : (
        <ul className="ph-rader">
          {historikk.map((r) => (
            <li key={r.id}>
              <span>
                <strong>{r.inne}/10 innenfor målet</strong>
                <small>
                  {STASJON_SLAG.find((s) => s.id === r.slag)?.etikett ?? r.slag}
                  {" · "}
                  {dato(r.completedAt)} · {r.source === "datagolf" ? r.name : "Egen treningsregel"}
                  {r.carry != null ? ` · ${visTall(r.carry)} m` : ""} · {r.lie} · mål {visTall(r.target)} {r.unit ?? ""}
                </small>
                <Link href={`/portal/analysere/datagolf/stasjon?tak=${r.tak}&slag=${r.slag}&lie=${r.lie}${r.carry != null ? `&carry=${r.carry}` : ""}`}>
                  Prøv igjen
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Merknad>Sammenlign egne forsøk med samme avstand, leie og treningsmål. Referansen kan endres når DataGolf oppdateres.</Merknad>
    </Seksjon>
  );
}

export type DataGolfProps = { data: SpillerverktoyData; spillerNavn?: string; historikk: (UtfordringResultat & { id: string })[] };

export function DataGolfV2({ data, historikk }: DataGolfProps) {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [fane, setFane] = useState("oversikt");
  const [sok, setSok] = useState("");

  function velg(key: string, value: string) {
    const params = new URLSearchParams(search.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key === "pro" && value === params.get("mot")) params.delete("mot");
    startTransition(() => router.replace(`/portal/analysere/datagolf?${params.toString()}`, { scroll: false }));
  }

  const pro = data.proff;
  const manglerReferanse = Object.values(data.kildestatus).includes("ikke-konfigurert");
  const proffStatus = data.kildestatus.profiler;
  const provIgjen = (
    <Knapp
      type="button"
      variant="secondary"
      loading={pending}
      loadingText="Henter …"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >Prøv igjen</Knapp>
  );

  if (!pro) {
    return (
      <div className="ph-flate" aria-busy={pending || undefined}>
        <header>
          <h1>DataGolf</h1>
        </header>
        <p role={data.kildefeil ? "alert" : "status"}>
          {proffStatus === "ikke-konfigurert"
            ? "Proffsammenligning er ikke tilgjengelig i denne versjonen ennå. Egne resultater vises nedenfor."
            : proffStatus === "feil"
              ? "Proffreferansene kunne ikke lastes. Prøv igjen. Egne resultater vises nedenfor."
              : "Ingen proffreferanser er lagt inn ennå. Egne resultater vises nedenfor."}
        </p>
        {data.kildefeil && provIgjen}
        <Seksjon title="Dine registrerte runder">
          {data.egne.count ? (
            <div>{visTall(data.egne.score.value)} slag i brutto rundesnitt · {data.egne.count} runder · {data.egneKilde}.</div>
          ) : (
            <div>Ingen fullstendige 18-hullsrunder er tilgjengelige ennå.</div>
          )}
          <Link href="/portal/mal/runder/ny" className="pa-btn pa-btn--primary">Registrer runde</Link>
        </Seksjon>
        <Historikk h={data.turneringshistorikk} />
        <Utfordringer historikk={historikk} />
      </div>
    );
  }

  const mot = data.mot;
  const scorer = data.proffRunder.flatMap((r) => r.score == null ? [] : [r.score]);
  const proffTall = rundeOppsummering(data.proffRunder);
  const motTall = mot ? rundeOppsummering(data.motRunder) : data.egne.count ? data.egne : rundeOppsummering(data.egneDgRunder);
  const motNavn = mot?.name ?? "Deg";
  const otherSkill = mot ?? data.egenSkill;
  const styrke = SG_FELT.filter((f) => f.key !== "total" && pro[f.key] !== null).toSorted((x, y) => (pro[y.key] ?? 0) - (pro[x.key] ?? 0))[0];
  const felles = fellesRunder(data.proffRunder, mot ? data.motRunder : data.egneDgRunder);
  const profiler = data.proffer.filter((p) => p.dgId === pro.dgId || p.name.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb")));
  const faner = [
    { id: "oversikt", name: "Proffen" },
    { id: "sammenlign", name: "Sammenlign" },
    { id: "innspill", name: "Innspill" },
    { id: "resultater", name: "Resultater" },
  ];
  const malinger = [
    { key: "score", name: "Brutto rundesnitt", unit: "slag" },
    { key: "accuracy", name: "Fairwaytreff", unit: "%" },
    { key: "gir", name: "Green på regulært antall slag", unit: "%" },
  ] as const;

  return (
    <div className="ph-flate" aria-busy={pending || undefined}>
      <header>
        <h1>Hvor god er proffen?</h1>
        <p>Utforsk tallene, sammenlign med deg selv og prøv en utfordring. Du trenger ingen egen DataGolf-profil.</p>
      </header>
      {data.kildefeil && (
        <div role="alert">
          <p>Deler av DataGolf-tallene kunne ikke lastes. Manglende tall vises som —.</p>
          {provIgjen}
        </div>
      )}
      {manglerReferanse && (
        <p role="status">Deler av proffreferansene er ikke tilgjengelige i denne versjonen ennå. Egne resultater og tilgjengelige innspillreferanser kan fortsatt brukes.</p>
      )}
      {data.brukerTakReserve && (
        <p>Proffutvalget kommer fra lagrede innspillreferanser. Beregnet ferdighetsnivå er ikke tilgjengelig.</p>
      )}
      <form className="ph-skjema" onSubmit={(e) => e.preventDefault()}>
        <label>
          Søk etter proff
          <input type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Navn" />
        </label>
        <label>
          Velg proff · {data.proffer.length} i utvalget
          <select value={pro.dgId} onChange={(e) => velg("pro", e.target.value)}>
            {profiler.map((p) => <option key={p.dgId} value={p.dgId}>{p.name}</option>)}
          </select>
        </label>
      </form>
      {sok && !data.proffer.some((p) => p.name.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb"))) && (
        <p role="status">Ingen proffer matcher søket. Den valgte profilen er beholdt.</p>
      )}
      <nav aria-label="DataGolf-visning">
        <div className="ph-valg">
          {faner.map((f) => (
            <button key={f.id} type="button" aria-pressed={fane === f.id} onClick={() => setFane(f.id)}>{f.name}</button>
          ))}
        </div>
      </nav>
      <p role="status">{pending ? "Henter sammenligningen …" : `${pro.name}${mot ? ` mot ${mot.name}` : ""}`}</p>

      {fane === "oversikt" && (
        <>
          <Seksjon title={pro.name}>
            <div className="ph-kpi">
              <p className="pa-card">
                <span>Forventet SG per runde · {dato(pro.asOf)}</span>
                <strong>{visTall(pro.total, 2, true)}</strong>
              </p>
              <p className="pa-card">
                <span>Største styrke i profilen</span>
                <strong>{styrke?.label ?? "Data mangler"}</strong>
              </p>
            </div>
            {styrke ? <Merknad>{visTall(pro[styrke.key], 2, true)} SG per runde</Merknad> : null}
            <Merknad>Driver-lengde: {visTall(pro.distance, 1, true)} yards relativt til referansen. Presisjon: {visTall(pro.accuracy, 1, true)} prosentpoeng. Tallene er justert for forholdene og er ikke absolutt lengde eller fairway-prosent.</Merknad>
          </Seksjon>
          {scorer.length > 0 && (
            <Seksjon title="Hva scorer proffen?">
              <div><strong>{visTall(proffTall.score.value)} slag i brutto rundesnitt</strong> over {proffTall.score.count} importerte runder.</div>
              <Merknad>Laveste rundescore: {Math.min(...scorer)}. Høyeste: {Math.max(...scorer)}. Rundene er spilt under ulike forhold. Åpne Resultater for å se hver turnering og runde.</Merknad>
            </Seksjon>
          )}
          <Ferdighet pro={pro} mot={null} />
        </>
      )}

      {fane === "sammenlign" && (
        <>
          <form className="ph-skjema" onSubmit={(e) => e.preventDefault()}>
            <label>
              Sammenlign med
              <select value={mot?.dgId ?? ""} onChange={(e) => velg("mot", e.target.value)}>
                <option value="">Meg</option>
                {data.proffer.filter((p) => p.dgId !== pro.dgId).map((p) => <option key={p.dgId} value={p.dgId}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Rundeutvalg
              <select value={data.valg.runder} onChange={(e) => velg("runder", e.target.value)}>
                {[12, 24, 50].map((n) => <option key={n} value={n}>Siste {n} registrerte runder</option>)}
              </select>
            </label>
          </form>
          <Seksjon title={`${pro.name} og ${motNavn}`}>
            <dl>
              {malinger.map((f) => (
                <div key={f.key}>
                  <dt>{f.name}</dt>
                  <dd>
                    {pro.name}: {visTall(proffTall[f.key].value)} {f.unit} ({proffTall[f.key].count} runder). {motNavn}: {visTall(motTall[f.key].value)} {f.unit} ({motTall[f.key].count} runder).
                  </dd>
                </div>
              ))}
            </dl>
            <Merknad>Antall runder vises under hver verdi. Baner, teesteder, vær og tidsrom kan være forskjellige; tallene beskriver prestasjoner og gir ikke et justert nivågap.</Merknad>
            <Merknad>
              {pro.name}: {dato(data.proffRunder.at(-1)?.date ?? null)}–{dato(data.proffRunder[0]?.date ?? null)}.
              {mot
                ? ` ${mot.name}: ${dato(data.motRunder.at(-1)?.date ?? null)}–${dato(data.motRunder[0]?.date ?? null)}.`
                : data.egne.count
                  ? ` ${data.egneKilde}, dokumenterte 18-hullsrunder: ${dato(data.egne.from)}–${dato(data.egne.to)}.`
                  : ` Dine DataGolf-runder: ${dato(data.egneDgRunder.at(-1)?.date ?? null)}–${dato(data.egneDgRunder[0]?.date ?? null)}.`}
            </Merknad>
            {!mot && motTall.count === 0 && (
              <Merknad>Registrer en hel runde med hullscore for å sammenligne. Fairwaytreff og greentreff krever fullstendig registrering. <Link href="/portal/mal/runder/ny">Registrer runde</Link></Merknad>
            )}
            {felles.count > 0 && (
              <Merknad>I {felles.count} felles runder på samme bane var forskjellen {visTall(felles.value, 2, true)} SG per runde i favør av {pro.name}. Positiv verdi betyr at proffen presterte bedre.</Merknad>
            )}
          </Seksjon>
          {otherSkill ? <Ferdighet pro={pro} mot={otherSkill} /> : (
            <Merknad>Dine registrerte SG-tall har et annet eller ukjent sammenligningsgrunnlag. De trekkes derfor ikke fra proffens beregnede nivå.</Merknad>
          )}
        </>
      )}

      {fane === "innspill" && (
        <Seksjon title={`Innspill · ${pro.name}`}>
          <div>Siste 24 måneder i kildeuttaket{data.approach ? ` · oppdatert ${dato(data.approach.asOf)}` : ""}. Nærhet er justert for slagets vanskelighetsgrad og viser gjennomsnittlig avstand til hullet. Det er ikke en sirkel som en bestemt andel av slagene treffer.</div>
          {!data.approach?.bands.length && (
            <Merknad>Detaljerte innspilltall er ikke hentet for denne proffen ennå. Du kan fortsatt utforske ferdighetsprofilen og resultatene.</Merknad>
          )}
          {data.approach?.bands.map((band) => {
            const other = data.motApproach?.bands.find((b) => b.band === band.band && b.lie === band.lie);
            return (
              <div key={`${band.band}-${band.lie}`}>
                <strong>{bandEtikett(band)}</strong>
                <div className="ph-kpi">
                  <p className="pa-card">
                    <span>Justert nærhet · {band.shotCount ?? "ukjent antall"} slag</span>
                    <strong>{visTall(band.proximityMeters)} m</strong>
                  </p>
                  <p className="pa-card">
                    <span>SG per slag</span>
                    <strong>{visTall(band.sgPerShot, 3, true)}</strong>
                  </p>
                </div>
                <Merknad>Greentreff: {visTall(band.girRate == null ? null : band.girRate * 100)} %. Gode slag: {visTall(band.goodShotRate == null ? null : band.goodShotRate * 100)} %.</Merknad>
                {other && <Merknad>{mot?.name}: {visTall(other.proximityMeters)} m · {other.shotCount ?? "ukjent antall"} slag · {dato(data.motApproach?.asOf ?? null)}.</Merknad>}
                {band.proximityMeters != null && (
                  <Link
                    href={`/portal/analysere/datagolf/stasjon?tak=${pro.dgId}&slag=${band.band}&lie=${band.lie}`}
                    className="pa-btn pa-btn--secondary"
                  >
                    Prøv selv fra dette intervallet
                  </Link>
                )}
              </div>
            );
          })}
          <Merknad>Gode slag følger DataGolfs definisjon innenfor intervallet. Putting per fot og bunkerprofiler for enkeltproffer inngår ikke i denne datakilden.</Merknad>
        </Seksjon>
      )}

      {fane === "resultater" && (
        <>
          <Resultater rounds={data.proffRunder} name={pro.name} status={data.kildestatus.proffRunder} />
          {mot && <Resultater rounds={data.motRunder} name={mot.name} status={data.kildestatus.motRunder} />}
          <Historikk h={data.turneringshistorikk} />
          <Link href="/portal/tren/turneringer" className="pa-btn pa-btn--secondary">Se turneringskalenderen</Link>
        </>
      )}

      <Utfordringer historikk={historikk} />
      <footer>
        <small>
          Data powered by <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer">DataGolf</a>.{" "}
          <a href="https://datagolf.com/frequently-asked-questions" target="_blank" rel="noopener noreferrer">Slik beregnes tallene</a>.
          {" "}Manglende verdier vises som —.
        </small>
      </footer>
    </div>
  );
}
