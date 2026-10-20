"use client";

import React, { useState } from "react";
import { hentProtokoll } from "@/lib/domain/pei/protokoll-definisjoner";
import { formaterTall } from "@/lib/format-tall";
import Image from "next/image";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  WangFaner,
  WangTilbake,
  WangTopp,
  initialer,
  kortDato,
  langDato,
  wangHref,
} from "./wang-felles";
import { visDato, type WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";
import {
  TOM_TESTERDATA,
  TESTBATTERI,
  TEST_DEL_NAVN,
  hoererTil,
  sistePerElev,
  skoleaarStart,
  type WangBatteriTest,
  type WangTestDel,
  type WangTestResultat,
  type WangTesterData,
} from "@/app/team-wang/_data/wang-tester-visning";

interface WangTesterProps {
  data: WangTrenerData;
  /** Ekte testresultater for elevene som deler testene med WANG. */
  tester?: WangTesterData;
  /** Underside: batteri · ko · foring · test · elev. */
  aktivFane?: string;
  /** Testnavnet (Én test) eller elev-id (Én elev). */
  id?: string;
  onFaneEndret?: (fane: string) => void;
}

/**
 * Pakke 4 Tester for trener og sportssjef: Testbatteriet, Til kontroll (WANG-37), Før test (8-ball slag for slag,
 * WANG-48B), Én test og Én elev (testprofil).
 * Fasit: docs/design-system/utkast-wang/tester.html (utkast 2, retning B, godkjent av Anders 16.10.2026).
 * Bare ekte resultater, og bare for elever som har gitt testsamtykke til WANG (hentWangTesterData).
 * Avvik:
 *   - Kontroller og avvis er sperret: trenerflaten kan ikke attestere et egenført resultat ennå.
 *   - Før test: 8-ball føres slag for slag med poengene fra vedtaket 14.10, men lagring er sperret.
 *   - Én test viser hver elevs siste resultat, nyeste først, ikke «best først» med endring: retningen per test
 *     og snitt i gruppa er ikke regnet ut. Nivå (A–K) og landslagsnivå står som «—» til tallene er vedtatt.
 *   - Testbatteriet viser antall elever testet og siste dato, ikke snitt.
 */
export function WangTester({ data, tester = TOM_TESTERDATA, aktivFane, id }: WangTesterProps) {
  if (aktivFane === "ko") return <TilKontroll data={data} tester={tester} />;
  if (aktivFane === "foring") return <ForTest data={data} tester={tester} />;
  if (aktivFane === "test") return <EnTest data={data} tester={tester} testNavn={id} />;
  if (aktivFane === "elev") return <EnElev data={data} tester={tester} elevId={id} />;
  return <Batteri data={data} tester={tester} />;
}

function tilKontroll(tester: WangTesterData): WangTestResultat[] {
  return tester.resultater.filter((r) => !r.kontrollert && !r.avvist);
}

function Faner({ aktiv, antall }: { aktiv: string; antall: number }) {
  return (
    <WangFaner
      omraade="tester"
      aktiv={aktiv}
      etikett="Tester"
      faner={[
        { id: "batteri", tittel: "Oversikt" },
        { id: "ko", tittel: `Til kontroll (${antall})` },
        { id: "foring", tittel: "Registrer" },
      ]}
    />
  );
}

function elevNavn(data: WangTrenerData, id: string): string {
  return data.elever.find((e) => e.id === id)?.navn ?? "Elev";
}

// ---------------------------------------------------------------------------
// Testbatteriet
// ---------------------------------------------------------------------------

type Filter = "alle" | WangTestDel;

const FILTRE: { id: Filter; navn: string }[] = [
  { id: "alle", navn: `Alle ${TESTBATTERI.length}` },
  { id: "golfslag", navn: "Golfslag" },
  { id: "teknikk", navn: "Teknikk" },
  { id: "fysisk", navn: "Fysisk" },
];

const PRIORITERTE = TESTBATTERI.filter((t) => t.prioritertMin !== null);

/** Elevens resultater for én test i skoleåret, nyeste først. */
function iAar(tester: WangTesterData, elevId: string, test: WangBatteriTest, fra: string) {
  return tester.resultater.filter((r) => r.elevId === elevId && r.datoIso >= fra && hoererTil(r, test.navn));
}

function Batteri({ data, tester }: { data: WangTrenerData; tester: WangTesterData }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const ko = tilKontroll(tester);
  const fra = skoleaarStart(data.idagIso);
  const nesteTest = data.testdager.find((t) => !t.passert);
  const deler = new Set(tester.delerIder);
  const delere = data.elever.filter((e) => deler.has(e.id));
  const synlige = TESTBATTERI.filter((t) => filter === "alle" || t.del === filter);

  const rader = data.elever.map((e) => {
    const delt = deler.has(e.id);
    const celler = synlige.map((t) => {
      const res = delt ? iAar(tester, e.id, t, fra) : [];
      const for_ = t.prioritertMin !== null && res.length < t.prioritertMin;
      return { test: t, siste: res[0] ?? null, antall: res.length, forFaa: delt && for_ };
    });
    const tatt = delt ? TESTBATTERI.filter((t) => iAar(tester, e.id, t, fra).length > 0).length : 0;
    const klar = delt && PRIORITERTE.every((t) => iAar(tester, e.id, t, fra).length >= (t.prioritertMin ?? 0));
    return { elev: e, delt, celler, tatt, klar };
  });
  const tattTotalt = rader.reduce((s, r) => s + r.tatt, 0);
  const mulige = delere.length * TESTBATTERI.length;
  const dekning = mulige > 0 ? Math.round((tattTotalt / mulige) * 100) : null;
  const klare = rader.filter((r) => r.klar).length;
  const mangler = rader
    .filter((r) => r.delt && !r.klar)
    .map((r) => ({
      ...r,
      mangel: PRIORITERTE.filter((t) => iAar(tester, r.elev.id, t, fra).length < (t.prioritertMin ?? 0)).map(
        (t) => `${t.navn} ${iAar(tester, r.elev.id, t, fra).length} av ${t.prioritertMin}`,
      ),
    }));

  return (
    <>
      <section className="wg-helt2" aria-label="Tester">
        <div className="wg-helt2-tekst">
          <p className="wg-helt2-dato">
            {data.gruppeNavn} · {nesteTest ? `neste testdag ${visDato(nesteTest.startIso)}` : "skoleåret"}
          </p>
          <h1 className="wg-helt2-tittel">Tester</h1>
          <p className="wg-helt2-ingress">
            19 tester: 8 golfslag og 6 teknikk fra Team Norway, og 5 fysiske. Fem er prioritert.
          </p>
          <div className="wg-helt2-tall">
            <div>
              <strong>
                {dekning === null ? "—" : dekning}
                {dekning === null ? null : <span className="wg-helt2-enhet"> %</span>}
              </strong>
              <span>testdekning dette skoleåret</span>
              <small>{mulige > 0 ? `${tattTotalt} av ${mulige} tester tatt` : "Ingen elever deler testene"}</small>
            </div>
            <Link className="wg-helt2-lenke" href={wangHref("tester", "ko")}>
              <strong>{ko.length}</strong>
              <span>venter på kontroll →</span>
              <small>Egenført av elevene</small>
            </Link>
            <a className="wg-helt2-lenke" href="#mangler">
              <strong>
                {delere.length > 0 ? klare : "—"}
                {delere.length > 0 ? <span className="wg-helt2-enhet"> av {delere.length}</span> : null}
              </strong>
              <span>har alle prioriterte →</span>
              <small>Klare til Team Norway-testing</small>
            </a>
          </div>
          <p className="wg-helt2-kilde">Kontrollerte resultater deles med Team Norway. Bare elever som deler testene med WANG, vises.</p>
        </div>
        <Image className="wg-helt2-bilde" src="/team-wang/hero/golf-putt.jpg" alt="" width={480} height={300} sizes="(min-width: 1100px) 320px, 100vw" />
      </section>

      <div className="wg-verktoy">
        <Faner aktiv="batteri" antall={ko.length} />
        <div role="group" aria-label="Vis tester" className="wg-segment">
          {FILTRE.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.navn}
            </button>
          ))}
        </div>
      </div>

      <section className="wg-seksjon" aria-labelledby="wg-matrise-tittel">
        <div className="wg-sek-topp">
          <h2 id="wg-matrise-tittel">Elever og tester</h2>
          <span className="wg-kilde">Siste resultat dette skoleåret</span>
        </div>
        {data.elever.length === 0 ? (
          <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Elevene i WANG-gruppa står her med siste resultat per test." />
        ) : (
          <>
            <div
              className="wg-matrise"
              role="table"
              aria-label="Siste resultat per elev og test"
              style={{ gridTemplateColumns: `minmax(140px, 1.4fr) repeat(${synlige.length}, minmax(0, 1fr)) 76px` }}
            >
              <div role="row" className="wg-matrise-rad wg-matrise-hode">
                <span role="columnheader">Elev</span>
                {synlige.map((t) => (
                  <span key={t.navn} role="columnheader" title={t.navn}>
                    <i className={`wg-del-merke wg-del-${t.del}`} aria-hidden />
                    <b>{t.kort}</b>
                    {t.prioritertMin !== null ? <small>Min. {t.prioritertMin}</small> : <small>{t.enhet}</small>}
                  </span>
                ))}
                <span role="columnheader">Dekning</span>
              </div>
              {rader.map((r) => (
                <Link key={r.elev.id} role="row" href={wangHref("tester", "elev", r.elev.id)} className="wg-matrise-rad">
                  <span role="rowheader" className="wg-matrise-elev">
                    <span className="wg-avatar wg-avatar-dempet" aria-hidden>{initialer(r.elev.navn)}</span>
                    <b>{r.elev.navn}</b>
                  </span>
                  {r.celler.map((c) =>
                    !r.delt ? (
                      <span key={c.test.navn} role="cell" className="wg-celle wg-celle-tom" aria-label={`${c.test.navn}: deler ikke`}>—</span>
                    ) : (
                      <span
                        key={c.test.navn}
                        role="cell"
                        className={`wg-celle ${!c.siste ? "wg-celle-tom" : c.siste.kontrollert ? "" : "wg-celle-egen"} ${c.forFaa ? "wg-celle-for-faa" : ""}`}
                        aria-label={`${c.test.navn}: ${c.siste ? `${c.siste.verdi}, ${c.siste.kontrollert ? "kontrollert" : "egenført"}` : "ikke tatt"}${c.test.prioritertMin !== null ? `, ${c.antall} av ${c.test.prioritertMin}` : ""}`}
                      >
                        {c.siste ? c.siste.verdi : "—"}
                        {c.test.prioritertMin !== null ? <small>{c.antall} av {c.test.prioritertMin}</small> : null}
                      </span>
                    ),
                  )}
                  <span role="cell" className="wg-celle wg-celle-dekning">
                    {r.delt ? `${r.tatt}/${TESTBATTERI.length}` : "Deler ikke"}
                  </span>
                </Link>
              ))}
            </div>
            <ul className="wg-matrise-mobil" aria-label="Elever og tester">
              {rader.map((r) => (
                <li key={r.elev.id}>
                  <Link href={wangHref("tester", "elev", r.elev.id)}>
                    <span className="wg-avatar wg-avatar-dempet" aria-hidden>{initialer(r.elev.navn)}</span>
                    <span className="wg-matrise-mobil-tekst">
                      <b>{r.elev.navn}</b>
                      <small>
                        {!r.delt
                          ? "Deler ikke testene"
                          : `${r.celler.filter((c) => c.siste).length} av ${synlige.length} tatt${r.klar ? " · alle prioriterte" : ""}`}
                      </small>
                    </span>
                    <span className="wg-dekningstrek" aria-hidden>
                      <i style={{ width: `${r.delt ? Math.round((r.celler.filter((c) => c.siste).length / Math.max(1, synlige.length)) * 100) : 0}%` }} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="wg-tegnforklaring">
              <span><i className="wg-celle-egen-merke" aria-hidden /> Egenført, venter på deg</span>
              <span><i className="wg-celle-for-faa-merke" aria-hidden /> For få av en prioritert test</span>
              <span>— ikke tatt</span>
            </p>
          </>
        )}
      </section>

      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-ko-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-ko-tittel">Til kontroll</h2>
            <Link className="wg-lenke" href={wangHref("tester", "ko")}>Alle</Link>
          </div>
          {ko.length === 0 ? (
            <WangTomTilstand tittel="Ingenting venter" tekst="Resultater elevene fører selv i PlayerHQ, står her til du har kontrollert dem." />
          ) : (
            <div className="wg-kort wg-krever">
              {ko.slice(0, 4).map((r) => (
                <div key={r.id} className="wg-krever-sak">
                  <span>
                    <b>{elevNavn(data, r.elevId)} · {r.testNavn}</b>
                    <small>{r.verdi} · {kortDato(r.datoIso)} · egenført</small>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="wg-seksjon" id="mangler" aria-labelledby="wg-mangler-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-mangler-tittel">Mangler prioriterte tester</h2>
          </div>
          {mangler.length === 0 ? (
            <WangTomTilstand
              tittel={delere.length > 0 ? "Alle har de prioriterte" : "Ingen deler testene"}
              tekst="De fem prioriterte er Driver Basic (minst 1), Inspill Basic, Wedge Variation og 8-balls variation (minst 2) og Putt 1–3 m (minst 4)."
            />
          ) : (
            <div className="wg-kort wg-krever">
              {mangler.map((r) => (
                <div key={r.elev.id} className="wg-krever-sak">
                  <span>
                    <b>{r.elev.navn}</b>
                    <small>{r.mangel.join(" · ")}</small>
                  </span>
                  <Link href={wangHref("tester", "elev", r.elev.id)} className="wg-btn wg-btn-secondary">Se eleven</Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <p className="wg-kilde">
        Bare elever som har samtykket til å dele testene med WANG, vises (forelder under 16). Formatene følger Team Norway
        Golf – Tester 2026.
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Til kontroll
// ---------------------------------------------------------------------------

function TilKontroll({ data, tester }: { data: WangTrenerData; tester: WangTesterData }) {
  const ko = tilKontroll(tester);
  return (
    <>
      <WangTopp
        dato={`${data.gruppeNavn} · egenførte resultater`}
        tittel="Til kontroll"
        ingress="Elevene fører tester selv. Du kontrollerer dem før de teller i IUP og deles med Team Norway."
      >
        <Faner aktiv="ko" antall={ko.length} />
      </WangTopp>

      {ko.length === 0 ? (
        <WangTomTilstand
          tittel="Ingenting venter på kontroll"
          tekst="Egenførte resultater fra elever som deler testene med WANG, står her."
        />
      ) : (
        <div className="wg-kort wg-saker">
          {ko.map((r) => {
            const navn = elevNavn(data, r.elevId);
            return (
              <div key={r.id} className="wg-sak">
                <span className="wg-avatar" aria-hidden>{initialer(navn)}</span>
                <b>
                  {navn} · {r.testNavn} · {r.verdi}
                </b>
                <p>Ført av eleven {langDato(r.datoIso).toLowerCase()}. Egenført, uten vitne.</p>
                <div className="wg-knapper">
                  <button type="button" className="wg-btn wg-btn-primary" disabled>Kontroller</button>
                  <button type="button" className="wg-btn wg-btn-secondary" disabled>Avvis</button>
                  <Link className="wg-lenke" href={wangHref("tester", "elev", r.elevId)}>Testprofilen</Link>
                </div>
              </div>
            );
          })}
          <p className="wg-kilde">
            Kontroll fra trenerflaten er ikke koblet ennå. Resultatene står som egenført til de er kontrollert.
          </p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Før test: 8-ball slag for slag
// ---------------------------------------------------------------------------

const ATTE_BALL = (hentProtokoll("8-ball-variation")?.rows ?? []).map((r) => ({
  navn: String(r.slag ?? "").replace(/(\d+)$/, " $1 m"),
  lengde: Number(r.lengde ?? 0),
}));
const TRENER_TESTER = TESTBATTERI.filter((t) => t.trenerForer);
const tallTekst = (v: number) => formaterTall(v, 1, true);

function ForTest({ data, tester }: { data: WangTrenerData; tester: WangTesterData }) {
  const [elevId, setElevId] = useState(data.elever[0]?.id ?? "");
  const [testNavn, setTestNavn] = useState("8-balls variation");
  const [meter, setMeter] = useState<(number | null)[]>(() => ATTE_BALL.map(() => null));
  const [inn, setInn] = useState("");
  const testdag = data.testdager.find((t) => t.startIso === data.idagIso);
  const ko = tilKontroll(tester);
  const nr = meter.findIndex((m) => m === null);
  const ferdig = nr === -1;
  const naa = ATTE_BALL[ferdig ? ATTE_BALL.length - 1 : nr];
  const fort = meter.filter((m) => m !== null) as number[];
  const pei = (m: number, l: number) => (l > 0 ? (m / l) * 100 : 0);
  const snitt = fort.length
    ? meter.reduce<number>((s, m, i) => s + (m === null ? 0 : pei(m, ATTE_BALL[i].lengde)), 0) / fort.length
    : null;
  const lest = inn.trim() === "" ? null : Number(inn.replace(",", "."));
  const gyldig = lest !== null && Number.isFinite(lest) && lest >= 0 && lest < 100;
  const lagre = (m: number) => {
    if (ferdig) return;
    setMeter((x) => x.map((v, i) => (i === nr ? m : v)));
    setInn("");
  };
  const angre = () => {
    const sist = ferdig ? ATTE_BALL.length - 1 : nr - 1;
    if (sist < 0) return;
    setMeter((x) => x.map((v, i) => (i === sist ? null : v)));
  };
  const test = TESTBATTERI.find((t) => t.navn === testNavn);

  return (
    <>
      <WangTilbake href={wangHref("tester")} tekst="Tester" />
      <WangTopp
        dato={`${test ? `${TEST_DEL_NAVN[test.del]} · ${test.enhet}` : "Test"} · ${langDato(testdag?.startIso ?? data.idagIso).toLowerCase()}${testdag?.sted ? ` · ${testdag.sted}` : ""}`}
        tittel={testNavn}
      >
        <span className="wg-pille wg-pille-ok"><i />Kontrollert · du fører</span>
      </WangTopp>

      {data.elever.length === 0 ? (
        <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Legg til elever i gruppa før testdagen." />
      ) : (
        <div className="wg-reg">
          <div className="wg-reg-valg">
            <label className="wg-lbl">
              Test
              <select className="wg-field" value={testNavn} onChange={(e) => setTestNavn(e.target.value)}>
                {TRENER_TESTER.map((t) => (
                  <option key={t.navn} value={t.navn}>{t.navn} · {TEST_DEL_NAVN[t.del]}</option>
                ))}
              </select>
            </label>
            <label className="wg-lbl">
              Elev
              <select className="wg-field" value={elevId} onChange={(e) => setElevId(e.target.value)}>
                {data.elever.map((e) => (
                  <option key={e.id} value={e.id}>{e.navn}</option>
                ))}
              </select>
            </label>
            <p className="wg-hjelp">
              Du fører PEI- og teknikktestene, og de blir kontrollert med en gang. Putt 1–3 m, 9 hull lengde og de fysiske
              testene fører eleven selv i PlayerHQ.
            </p>
          </div>

          {testNavn !== "8-balls variation" ? (
            <div className="wg-reg-hoved">
              <WangTomTilstand
                tittel={`Føring av ${testNavn} kommer`}
                tekst="8-balls variation kan føres slag for slag nå. De andre testene får samme føring i neste steg."
              />
            </div>
          ) : (
            <>
              <section className="wg-reg-hoved" aria-label="Før slaget">
                {!ferdig ? (
                  <>
                    <div className="wg-reg-slag">
                      <span>
                        <small>Slag {nr + 1} av {ATTE_BALL.length} · runde {Math.floor(nr / 8) + 1} av 3</small>
                        <b>{naa?.navn}</b>
                      </span>
                      <span className="wg-reg-slag-tekst">Ballen droppes, unntatt i bunker</span>
                    </div>
                    <div className="wg-reg-inn">
                      <label className="wg-lbl">
                        Meter til hullet
                        <input
                          className="wg-field wg-reg-felt"
                          inputMode="decimal"
                          value={inn}
                          onChange={(e) => setInn(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && gyldig && lest !== null) lagre(lest);
                          }}
                          placeholder="—"
                          aria-describedby="wg-reg-pei"
                        />
                      </label>
                      <span id="wg-reg-pei" className="wg-reg-pei">
                        <small>PEI</small>
                        <b>{gyldig && lest !== null && naa ? `${tallTekst(pei(lest, naa.lengde))} %` : "—"}</b>
                      </span>
                    </div>
                    <div className="wg-knapper">
                      <button type="button" className="wg-btn wg-btn-secondary" onClick={() => lagre(0)}>I hull</button>
                      <button type="button" className="wg-btn wg-btn-primary" disabled={!gyldig} onClick={() => lest !== null && lagre(lest)}>
                        Neste slag →
                      </button>
                      <button type="button" className="wg-btn wg-btn-ghost" onClick={angre} disabled={fort.length === 0}>Angre forrige</button>
                    </div>
                    <p className="wg-kilde">Testen teller når alle {ATTE_BALL.length} slag er ført. {ATTE_BALL.length - fort.length} igjen. Komma og punktum virker begge.</p>
                  </>
                ) : (
                  <div className="wg-kort wg-fyll">
                    <span className="wg-pille wg-pille-ok"><i />Alle {ATTE_BALL.length} slag er ført</span>
                    <p className="wg-hoved"><strong>{snitt === null ? "—" : `${tallTekst(snitt)} %`}</strong><span>snitt PEI</span></p>
                    <div className="wg-knapper">
                      <button type="button" className="wg-btn wg-btn-primary" disabled>Lagre testen</button>
                      <button type="button" className="wg-btn wg-btn-ghost" onClick={angre}>Angre forrige</button>
                    </div>
                    <p className="wg-kilde">Lagring fra trenerflaten er ikke koblet ennå. Ingenting er lagret, og eleven ser ikke noe i PlayerHQ.</p>
                  </div>
                )}
              </section>

              <section className="wg-kort wg-reg-kort" aria-label="Scorekort">
                <div className="wg-sek-topp">
                  <b className="wg-undertittel">Scorekort · {elevNavn(data, elevId)}</b>
                  <span className="wg-kilde">Snitt PEI {snitt === null ? "—" : `${tallTekst(snitt)} %`}</span>
                </div>
                <span className="wg-reg-stripe" role="img" aria-label={`${fort.length} av ${ATTE_BALL.length} slag ført`}>
                  {ATTE_BALL.map((_, i) => (
                    <i key={i} className={meter[i] !== null ? "wg-reg-fort" : i === nr ? "wg-reg-naa" : ""} />
                  ))}
                </span>
                <ol className="wg-reg-liste">
                  {meter.map((m, i) =>
                    m === null ? null : (
                      <li key={i}>
                        <b>{i + 1}</b>
                        <span>{ATTE_BALL[i].navn}</span>
                        <span>{m === 0 ? "I hull" : `${tallTekst(m)} m`}</span>
                        <b>{tallTekst(pei(m, ATTE_BALL[i].lengde))} %</b>
                      </li>
                    ),
                  )}
                </ol>
                {fort.length === 0 ? <p className="wg-kilde">Ingen slag ført ennå.</p> : null}
                <p className="wg-kilde">PEI = meter til hullet delt på slaglengden. Lavere er bedre. Team Norway Golf – Tester 2026.</p>
              </section>
            </>
          )}

          <aside className="wg-kort wg-krever wg-reg-kontroll" aria-label="Til kontroll">
            <div className="wg-sek-topp" style={{ paddingTop: 12 }}>
              <b className="wg-undertittel">Til kontroll <span className="wg-kilde">{ko.length}</span></b>
              <Link className="wg-lenke" href={wangHref("tester", "ko")}>Alle</Link>
            </div>
            {ko.length === 0 ? (
              <p className="wg-kilde" style={{ paddingBottom: 12 }}>Ingen egenførte resultater venter.</p>
            ) : (
              ko.slice(0, 4).map((r) => (
                <div key={r.id} className="wg-krever-sak">
                  <span>
                    <b>{elevNavn(data, r.elevId)} · {r.testNavn}</b>
                    <small>{r.verdi} · {kortDato(r.datoIso)} · egenført i PlayerHQ</small>
                  </span>
                </div>
              ))
            )}
            <p className="wg-kilde">Kontrollen er ikke koblet fra trenerflaten ennå. Eleven ser merket når den er det.</p>
          </aside>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Én test
// ---------------------------------------------------------------------------

function EnTest({ data, tester, testNavn }: { data: WangTrenerData; tester: WangTesterData; testNavn?: string }) {
  const test = TESTBATTERI.find((t) => t.navn === testNavn);
  if (!test) {
    return (
      <>
        <WangTilbake href={wangHref("tester")} tekst="Testbatteriet" />
        <WangTomTilstand tittel="Fant ikke testen" tekst="Velg en test fra testbatteriet." />
      </>
    );
  }
  const siste = sistePerElev(tester.resultater.filter((r) => hoererTil(r, test.navn)));

  return (
    <>
      <WangTilbake href={wangHref("tester")} tekst="Testbatteriet" />
      <WangTopp
        dato={`${test.fysisk ? "Fysisk" : "Golf"} · ${siste[0] ? `siste test ${visDato(siste[0].datoIso)}` : "ikke testet"}`}
        tittel={test.navn}
        ingress={`${test.beskrivelse}. ${siste.length} av ${tester.delerIder.length} elever som deler testene, er testet.`}
      />
      <div className="wg-to-kol">
        <div className="wg-kort wg-rader">
          {siste.length === 0 ? (
            <p className="wg-kilde" style={{ padding: "14px 0" }}>Ingen resultater for denne testen ennå.</p>
          ) : (
            siste.map((r) => {
              const navn = elevNavn(data, r.elevId);
              return (
                <Link key={r.id} href={wangHref("tester", "elev", r.elevId)} className="wg-rad wg-rad-lenke">
                  <span style={{ display: "grid", gap: 2 }}>
                    <b>{navn}</b>
                    <span className="wg-kilde">
                      {visDato(r.datoIso)} · {r.kontrollert ? "Kontrollert" : "Egenført"}
                    </span>
                  </span>
                  <span className="wg-tall">{r.verdi}</span>
                </Link>
              );
            })
          )}
        </div>
        <div className="wg-kort wg-fyll">
          <b className="wg-undertittel">Nivå</b>
          <p className="wg-rad-info" style={{ justifyContent: "space-between" }}>
            <span>Referanse for kategori A–K</span>
            <b>—</b>
          </p>
          <p className="wg-rad-info" style={{ justifyContent: "space-between" }}>
            <span>Landslagsnivå, junior</span>
            <b>—</b>
          </p>
          <span className="wg-pille wg-pille-vent" style={{ justifySelf: "start" }}>
            <i />
            Referanse ikke satt
          </span>
          <p className="wg-kilde">Nivåtallene for A–K er ikke vedtatt. Landslagsnivå kommer fra Team Norway.</p>
          <b className="wg-undertittel">Merking</b>
          <p className="wg-forklar">
            {siste.filter((r) => r.kontrollert).length} kontrollert · {siste.filter((r) => !r.kontrollert).length} egenført
          </p>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Én elev (testprofil)
// ---------------------------------------------------------------------------

function EnElev({ data, tester, elevId }: { data: WangTrenerData; tester: WangTesterData; elevId?: string }) {
  const elev = data.elever.find((e) => e.id === elevId);
  if (!elev) {
    return (
      <>
        <WangTilbake href={wangHref("tester")} tekst="Tester" />
        <WangTomTilstand tittel="Fant ikke eleven" tekst="Eleven er ikke med i gruppa." />
      </>
    );
  }
  const deler = tester.delerIder.includes(elev.id);
  const egne = tester.resultater.filter((r) => r.elevId === elev.id);

  const liste = (fysisk: boolean) => (
    <div className="wg-kort wg-rader">
      {TESTBATTERI.filter((t) => t.fysisk === fysisk).map((t) => {
        const treff = egne.filter((r) => hoererTil(r, t.navn));
        return (
          <div key={t.navn} className="wg-rad">
            <span style={{ display: "grid", gap: 2 }}>
              <b>{t.navn}</b>
              <span className="wg-kilde">
                {treff[0] ? `${visDato(treff[0].datoIso)} · ${treff.length} ${treff.length === 1 ? "test" : "tester"}` : "Ikke testet"}
              </span>
            </span>
            <span className="wg-tall">{treff[0]?.verdi ?? "—"}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <WangTilbake href={wangHref("tester")} tekst="Tester" />
      <section className="wg-topp" style={{ gridTemplateColumns: "auto minmax(0,1fr)", alignItems: "center", gap: 14 }}>
        <span className="wg-avatar" aria-hidden style={{ width: 56, height: 56, fontSize: 18 }}>{initialer(elev.navn)}</span>
        <div>
          <p className="wg-dato">{data.gruppeNavn}</p>
          <h1 className="wg-tittel">{elev.navn}</h1>
        </div>
      </section>
      {!deler ? (
        <WangTomTilstand
          tittel="Ikke delt"
          tekst="Eleven har ikke samtykket til å dele testene med WANG (forelder under 16). Du ser ingen resultater."
        />
      ) : (
        <>
          <div className="wg-to-kol">
            <section className="wg-seksjon" aria-label="Golf">
              <div className="wg-sek-topp"><h2>Golf</h2></div>
              {liste(false)}
            </section>
            <section className="wg-seksjon" aria-label="Fysisk">
              <div className="wg-sek-topp"><h2>Fysisk</h2></div>
              {liste(true)}
            </section>
          </div>
          <p className="wg-kilde">Siste resultat per test. Kilde: testresultater i PlayerHQ. Delt med Team Norway.</p>
        </>
      )}
    </>
  );
}
