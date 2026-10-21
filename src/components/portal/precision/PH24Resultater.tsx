"use client";

/**
 * PH-24 Turneringsresultater (/portal/meg/resultater) — nytt design, pakke 14 (16.10.2026).
 * Utkastet (meg-resten.html) foreslo å sende siden til Profil › Turneringsresultater. Profil viser
 * bare de siste turneringene og kan ikke koble kontoen, så siden beholdes for koblingen («Er dette
 * deg?») og sesongtallene (avgjort natt 17.10). Listemønsteret er fra meg.html.
 *
 * Handlingene er uendret: sokKandidater, bekreftKandidat, bekreftVentende, avvisVentende, angreKobling.
 * Kilde er GolfBox (brutto, 18 hull). Tallene heter ikke SG: GolfBox har bare score per hull.
 *
 * Avvik:
 *   - «Plass i kullet» (persentil mot andre spillere) vises ikke: spilleren får ingen sammenligning med
 *     andre (beslutninger.md §SKJERMENE … RUNDE 8). «Mot startfeltet» er feltets snitt i turneringen.
 *   - Rundetabellen er kortrader, ikke tabell, så ingenting ruller sidelengs i 390 px.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { Kandidat, ProfilResultater, ProfilRunde } from "@/lib/profil-kobling/typer";
import { angreKobling, avvisVentende, bekreftKandidat, bekreftVentende, sokKandidater } from "@/app/portal/meg/resultater/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-meg-resten.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH24ResultaterData =
  | { koblet: true; resultater: ProfilResultater }
  | { koblet: false; ventende: { linkId: number; kandidat: Kandidat } | null };

const f1 = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
const fort = (v: number | null | undefined) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`);
const pst = (v: number | null | undefined) => (v == null ? "—" : `${(v * 100).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} %`);

function KandidatKort({ k, children }: { k: Kandidat; children: React.ReactNode }) {
  return <div className="phn-kort">
    <div><b className="phn-undertittel">{k.name}</b>
      <p className="phn-kilde">{[k.birth_year ? `Født ${k.birth_year}` : null, k.club, k.tournaments > 0 ? `${k.tournaments} turneringer` : null].filter(Boolean).join(" · ") || "—"}</p></div>
    {k.evidence.length > 0 && <ul className="mr-data-liste">{k.evidence.map((e, i) => <li key={i}><span className="k">{e.tournament}{e.class ? ` · ${e.class}` : ""}</span><b>{e.date ?? "—"}</b></li>)}</ul>}
    <div className="phn-knapper">{children}</div>
  </div>;
}

function Koble({ ventende }: { ventende: { linkId: number; kandidat: Kandidat } | null }) {
  const router = useRouter();
  const [golfId, setGolfId] = useState("");
  const [kandidater, setKandidater] = useState<Kandidat[] | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const kjor = (fn: () => Promise<{ ok: true } | { ok: false; feil: string }>) => start(async () => {
    setFeil(null);
    const svar = await fn();
    if (!svar.ok) { setFeil(svar.feil); return; }
    router.refresh();
  });

  if (ventende) return <section className="phn-seksjon" aria-labelledby="res-ventende">
    <div className="phn-sek-topp"><h2 id="res-ventende">Er dette deg?</h2></div>
    <KandidatKort k={ventende.kandidat}>
      <button type="button" className="phn-knapp pri" disabled={venter} onClick={() => kjor(() => bekreftVentende({ linkId: ventende.linkId }))}>Ja, dette er meg</button>
      <button type="button" className="phn-knapp sek" disabled={venter} onClick={() => kjor(() => avvisVentende({ linkId: ventende.linkId }))}>Nei, ikke meg</button>
    </KandidatKort>
    {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
  </section>;

  return <div className="to-del">
    <div>
      <div className="phn-kort">
        <b className="phn-undertittel">Koble resultatene dine</b>
        <p className="phn-forklar">Vi henter turneringsresultatene dine fra GolfBox. Vi bruker navnet og fødselsåret i profilen din. Har du golf-ID, gir den et sikrere treff.</p>
        <label className="phn-felt" style={{ maxWidth: 320 }}>Golf-ID (valgfri)
          <input value={golfId} onChange={(e) => setGolfId(e.target.value)} placeholder="303-579" autoComplete="off" />
        </label>
        <div className="phn-knapper"><button type="button" className="phn-knapp pri" disabled={venter} onClick={() => start(async () => {
          setFeil(null);
          const svar = await sokKandidater({ golfId: golfId || undefined });
          if (!svar.ok) { setFeil(svar.feil); return; }
          setKandidater(svar.kandidater);
        })}>{venter ? "Søker …" : "Finn resultatene mine"}</button></div>
        {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
      </div>
    </div>
    <div>
      {kandidater && kandidater.length === 0 && <div className="phn-kort dempet"><b className="phn-undertittel">Fant ingen treff</b><p className="phn-forklar">Sjekk at navnet og fødselsdatoen i profilen stemmer, eller skriv golf-ID. Kommer du ikke videre, ta det opp med coachen din.</p></div>}
      {kandidater && kandidater.length > 0 && <section className="phn-seksjon" aria-labelledby="res-kand">
        <div className="phn-sek-topp"><h2 id="res-kand">{kandidater.length === 1 ? "Er dette deg?" : "Hvilken av disse er deg?"}</h2></div>
        {kandidater.map((k) => <KandidatKort key={k.person_id} k={k}>
          <button type="button" className="phn-knapp pri" disabled={venter} onClick={() => kjor(() => bekreftKandidat({ personId: k.person_id, golfId: golfId || undefined }))}>Ja, dette er meg</button>
        </KandidatKort>)}
      </section>}
    </div>
  </div>;
}

function Runde({ r }: { r: ProfilRunde }) {
  return <div>
    <span><b>{r.turnering}</b><span className="phn-kilde">{[r.dato, r.klasse, `runde ${r.runde}`].filter(Boolean).join(" · ")}</span></span>
    <span className="hoyre" style={{ display: "grid", justifyItems: "end", gap: 2 }}><b style={{ fontFamily: "var(--phn-mono)" }}>{r.score}</b><span className="phn-kilde">{r.til_par == null ? "—" : fort(r.til_par)} til par · {fort(r.mot_felt)} mot feltet</span></span>
  </div>;
}

function Resultater({ data }: { data: ProfilResultater }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const sesong = data.sesonger[0];
  const monster = data.monster.find((m) => sesong && m.year === sesong.year) ?? data.monster[0];

  return <div className="to-del">
    <div>
      <section className="phn-kort" aria-label={sesong ? `Sesongen ${sesong.year}` : "Sesongen"}>
        {sesong
          ? <>
            <div className="phn-hoved"><strong>{fort(sesong.snitt_til_par)}</strong><span className="phn-forklar">til par i snitt, sesongen {sesong.year}</span></div>
            <div className="mr-beholder">
              <div><b>{sesong.runder}</b><span>runder · {sesong.turneringer} turneringer</span></div>
              <div><b>{f1(sesong.snitt_score)}</b><span>snittscore</span></div>
              <div><b>{fort(sesong.snitt_mot_felt)}</b><span>mot startfeltet</span></div>
              <div><b>{f1(sesong.justert_snitt)}</b><span>justert for bane og dag</span></div>
            </div>
          </>
          : <><b className="phn-undertittel">Ingen runder ennå</b><p className="phn-forklar">Koblingen er på plass. Resultatene kommer her når de er hentet fra GolfBox.</p></>}
        <p className="phn-kilde">Kilde: GolfBox · {data.person.name} · bare brutto score</p>
      </section>
      {monster && <section className="phn-kort" aria-label="Scoringsmønster">
        <b className="phn-undertittel">Scoringsmønster {monster.year} · {monster.hull} hull</b>
        <ul className="mr-data-liste">
          <li><span className="k">Birdie eller bedre</span><b>{pst(monster.birdierate)}</b></li>
          <li><span className="k">Bogey eller verre</span><b>{pst(monster.bogeyrate)}</b></li>
          <li><span className="k">Dobbeltbogey eller verre</span><b>{pst(monster.dobbeltrate)}</b></li>
          <li><span className="k">Snitt par 3 · 4 · 5, til par</span><b>{fort(monster.snitt_par3)} · {fort(monster.snitt_par4)} · {fort(monster.snitt_par5)}</b></li>
        </ul>
      </section>}
    </div>
    <div>
      {data.runder.length > 0 && <section className="phn-seksjon" aria-labelledby="res-runder">
        <div className="phn-sek-topp"><h2 id="res-runder">Runder</h2><Link className="lenke" href="/portal/analysere/resultater">Se i Stats</Link></div>
        <div className="liste statisk">{data.runder.map((r) => <Runde key={`${r.turnering_id}-${r.runde}`} r={r} />)}</div>
      </section>}
      <div className="phn-kort dempet">
        <b className="phn-undertittel">Feil person?</b>
        <p className="phn-forklar">Er dette ikke deg, kan du fjerne koblingen og søke på nytt.</p>
        <div className="phn-knapper"><button type="button" className="phn-knapp sek" disabled={venter} onClick={() => start(async () => {
          setFeil(null);
          const svar = await angreKobling();
          if (!svar.ok) { setFeil(svar.feil); return; }
          router.refresh();
        })}>{venter ? "Fjerner …" : "Fjern koblingen"}</button></div>
        {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
      </div>
    </div>
  </div>;
}

export function PH24Resultater({ data }: { data: PH24ResultaterData }) {
  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · profil</>}
      tittel={<>Turneringsresultater</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/profil"><ChevronLeft size={18} aria-hidden />Profil</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    {data.koblet ? <Resultater data={data.resultater} /> : <Koble ventende={data.ventende} />}
  </div></SkraFlyt></div>;
}
