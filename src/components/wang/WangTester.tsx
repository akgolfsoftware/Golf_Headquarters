"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  WangFaner,
  WangHelt,
  WangSmaaTall,
  WangTilbake,
  WangTopp,
  dagerMellom,
  initialer,
  kortDato,
  langDato,
  wangHref,
} from "./wang-felles";
import { visDato, type WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";
import {
  TOM_TESTERDATA,
  WANG_TESTBATTERI,
  hoererTil,
  sistePerElev,
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
  if (aktivFane === "foring") return <ForTest data={data} />;
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
        { id: "batteri", tittel: "Testbatteriet" },
        { id: "ko", tittel: `Til kontroll (${antall})` },
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

function Batteri({ data, tester }: { data: WangTrenerData; tester: WangTesterData }) {
  const ko = tilKontroll(tester);
  const nesteTest = data.testdager.find((t) => !t.passert);
  const aar = data.idagIso.slice(0, 4);
  const ikkeTestet = WANG_TESTBATTERI.filter(
    (t) => !tester.resultater.some((r) => hoererTil(r, t.navn) && r.datoIso.startsWith(aar)),
  ).length;

  return (
    <>
      <WangTopp
        dato={`${data.gruppeNavn} · ${nesteTest ? `neste testdag ${visDato(nesteTest.startIso)}` : "testbatteriet"}`}
        tittel="Tester"
      >
        <Faner aktiv="batteri" antall={ko.length} />
      </WangTopp>

      <WangHelt
        etikett="Til kontroll"
        merke="Egenført av elevene"
        tall={String(ko.length)}
        tekst={ko.length === 1 ? "resultat venter på kontroll" : "resultater venter på kontroll"}
        forklar="De teller i IUP og deles med Team Norway først når du har kontrollert dem."
        knapp={{ tekst: "Kontroller", href: wangHref("tester", "ko") }}
        bilde="/images/playerhq/tek-video.jpg"
      />

      <WangSmaaTall
        tall={[
          { verdi: nesteTest ? String(dagerMellom(data.idagIso, nesteTest.startIso)) : "—", tekst: "Dager til testdag" },
          { verdi: String(WANG_TESTBATTERI.length), tekst: "Tester i batteriet" },
          { verdi: `${tester.delerIder.length} av ${data.elever.length}`, tekst: "Elever deler testene" },
        ]}
      />

      <section className="wg-kort wg-fyll wg-testuke">
        <div className="wg-sek-topp">
          <b className="wg-undertittel">
            {nesteTest ? `${nesteTest.tittel} · ${langDato(nesteTest.startIso)}` : "Ingen testdag i kalenderen"}
          </b>
        </div>
        <p className="wg-forklar">
          {nesteTest
            ? `${nesteTest.sted ? `${nesteTest.sted}. ` : ""}${data.elever.length} elever i gruppa. ${ikkeTestet} av ${WANG_TESTBATTERI.length} tester er ikke tatt i år.`
            : "Legg testdagen inn i gruppas kalender, så står den her. Fysisk test hver sjette uke i grunnperioden."}
        </p>
        <div className="wg-knapper">
          <Link href={wangHref("tester", "foring")} className="wg-btn wg-btn-primary">Start testdag</Link>
        </div>
      </section>

      <div className="wg-to-kol">
        <Testliste tittel="Golf" kilde="NGFs 6-årsløp" fysisk={false} tester={tester} />
        <Testliste tittel="Fysisk" kilde="Hver 6. uke i grunnperioden" fysisk tester={tester} />
      </div>
      <p className="wg-kilde">
        Bare elever som har samtykket til å dele testene med WANG, vises (forelder under 16). Delte resultater deles også
        med Team Norway.
      </p>
      <Link className="wg-lenke" href="/team-wang/coach/tester">Alle testresultater</Link>
    </>
  );
}

function Testliste({ tittel, kilde, fysisk, tester }: { tittel: string; kilde: string; fysisk: boolean; tester: WangTesterData }) {
  return (
    <section className="wg-seksjon" aria-label={tittel}>
      <div className="wg-sek-topp">
        <h2>{tittel}</h2>
        <span className="wg-kilde">{kilde}</span>
      </div>
      <div className="wg-kort wg-rader">
        {WANG_TESTBATTERI.filter((t) => t.fysisk === fysisk).map((t) => {
          const treff = tester.resultater.filter((r) => hoererTil(r, t.navn));
          const elever = sistePerElev(treff).length;
          return (
            <Link key={t.navn} href={wangHref("tester", "test", t.navn)} className="wg-rad wg-rad-lenke">
              <span style={{ display: "grid", gap: 2 }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`wg-akse wg-akse-${t.akse.toLowerCase()}`}>{t.akse}</span>
                  <b>{t.navn}</b>
                </span>
                <span className="wg-kilde">{t.beskrivelse}</span>
              </span>
              <span style={{ display: "grid", justifyItems: "end", gap: 2 }}>
                <span className="wg-tall">{elever > 0 ? `${elever} ${elever === 1 ? "elev" : "elever"}` : "—"}</span>
                <span className="wg-kilde">{treff[0] ? `sist ${kortDato(treff[0].datoIso)}` : "ikke testet"}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
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

const SLAG_8BALL = ["10 m", "15 m", "20 m", "10 m · bunker", "15 m · bunker", "20 m · rough", "25 m", "30 m"];
const POENG = [
  { p: 5, tekst: "I hull" },
  { p: 3, tekst: "Innen 1 m" },
  { p: 2, tekst: "Innen 2 m" },
  { p: 1, tekst: "Innen 3 m" },
  { p: 0, tekst: "Lenger" },
];

function ForTest({ data }: { data: WangTrenerData }) {
  const [slag, setSlag] = useState<(number | null)[]>(() => SLAG_8BALL.map(() => null));
  const fort = slag.filter((s) => s !== null).length;
  const sum = slag.reduce<number>((s, p) => s + (p ?? 0), 0);
  const testdag = data.testdager.find((t) => t.startIso === data.idagIso);

  return (
    <>
      <WangTilbake href={wangHref("tester")} tekst="Tester" />
      <WangTopp
        dato={`Testdag · ${langDato(testdag?.startIso ?? data.idagIso).toLowerCase()}${testdag?.sted ? ` · ${testdag.sted}` : ""}`}
        tittel="8-ball"
      />

      {data.elever.length === 0 ? (
        <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Legg til elever i gruppa før testdagen." />
      ) : (
        <div className="wg-to-kol">
          <div className="wg-kort wg-fyll">
            <label className="wg-lbl">
              Elev
              <select className="wg-field" defaultValue="">
                <option value="" disabled>Velg elev</option>
                {data.elever.map((e) => (
                  <option key={e.id} value={e.id}>{e.navn}</option>
                ))}
              </select>
            </label>
            <p className="wg-hjelp">5 i hull · 3 innen 1 m · 2 innen 2 m · 1 innen 3 m · 0 lenger.</p>
            {SLAG_8BALL.map((navn, i) => (
              <div key={navn} className="wg-lbl" role="group" aria-label={`Slag ${i + 1}, ${navn}`}>
                Slag {i + 1} · {navn}
                <div className="wg-valg wg-valg-fem">
                  {POENG.map((v) => (
                    <button
                      key={v.p}
                      type="button"
                      aria-pressed={slag[i] === v.p}
                      aria-label={`${v.tekst}, ${v.p} poeng`}
                      onClick={() => setSlag((s) => s.map((x, j) => (j === i ? v.p : x)))}
                    >
                      {v.p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="wg-kort wg-fyll">
            <div className="wg-sek-topp">
              <b className="wg-undertittel">Poeng</b>
              <span className={`wg-pille ${fort === SLAG_8BALL.length ? "wg-pille-ok" : "wg-pille-vent"}`}>
                <i />
                {fort} av {SLAG_8BALL.length} slag
              </span>
            </div>
            <p className="wg-hoved">
              <strong>{sum}</strong>
              <span>poeng</span>
            </p>
            <p className="wg-forklar">
              Testen teller bare når alle åtte slag er ført. Avsluttes den før, blir det ikke noe resultat.
            </p>
            <div className="wg-knapper">
              <button type="button" className="wg-btn wg-btn-primary" disabled>Lagre og neste elev</button>
              <button type="button" className="wg-btn wg-btn-secondary" onClick={() => setSlag(SLAG_8BALL.map(() => null))}>
                Nullstill
              </button>
            </div>
            <p className="wg-kilde">
              Føring fra trenerflaten lagres ikke ennå. Ingenting er lagret, og eleven ser ikke noe i PlayerHQ.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Én test
// ---------------------------------------------------------------------------

function EnTest({ data, tester, testNavn }: { data: WangTrenerData; tester: WangTesterData; testNavn?: string }) {
  const test = WANG_TESTBATTERI.find((t) => t.navn === testNavn);
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
      {WANG_TESTBATTERI.filter((t) => t.fysisk === fysisk).map((t) => {
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
