"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  WangBaand,
  WangElevrad,
  WangHelt,
  WangSmaaTall,
  WangTilbake,
  WangTopp,
  initialer,
  wangHref,
} from "./wang-felles";
import type { WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";
import { TOM_TESTERDATA, type WangTesterData } from "@/app/team-wang/_data/wang-tester-visning";

interface WangEleverProps {
  data: WangTrenerData;
  /** Testdelingen: hvem som deler testene med WANG, og egenførte resultater. */
  tester?: WangTesterData;
  /** Underside: liste · elev · sjekk · ikke-delt. */
  aktivFane?: string;
  /** Eleven undersiden gjelder. */
  id?: string;
  onFaneEndret?: (fane: string) => void;
}

const iupHref = (id: string) => `/team-wang/coach/iup/${id}`;

/**
 * Pakke 7 Elever for trener og sportssjef: Elevlista (WANG-07), Én elev (WANG-44), IUP, Fireukerssjekk (WANG-45),
 * Foreslå endring og Ikke delt.
 * Fasit: docs/design-system/utkast-wang/elever.html (utkast 2, retning B, godkjent av Anders 16.10.2026).
 * Bare ekte gruppedata og testdelingen (hentWangTesterData).
 * Avvik:
 *   - Elevenes plan deles ikke med WANG ennå, så etterlevelse og morgentrening viser «—» og elevene står i «Ikke delt».
 *     «Har delt med deg» teller elever som deler testene, fordi det er den eneste delingen som finnes.
 *   - IUP og Foreslå endring åpner den eksisterende IUP-siden (/team-wang/coach/iup/[elevId]), der forslagene lagres.
 *   - Fireukerssjekken finnes ikke i basen ennå. Siden viser tom tilstand.
 *   - Klasse (VG1–VG3), kategori og HCP finnes ikke på gruppemedlemmet. Klassefilteret er derfor ikke med; søk er med.
 */
export function WangElever({ data, tester = TOM_TESTERDATA, aktivFane, id }: WangEleverProps) {
  const elev = id ? data.elever.find((e) => e.id === id) : undefined;
  if (aktivFane === "elev" || aktivFane === "sjekk") {
    if (!elev) {
      return (
        <>
          <WangTilbake href={wangHref("elever")} tekst="Elever" />
          <WangTomTilstand tittel="Fant ikke eleven" tekst="Eleven er ikke med i gruppa." />
        </>
      );
    }
    return aktivFane === "sjekk" ? (
      <Fireukerssjekk data={data} elev={elev} />
    ) : (
      <EnElev data={data} elev={elev} deler={tester.delerIder.includes(elev.id)} tester={tester} />
    );
  }
  return <Elevlista data={data} tester={tester} />;
}

function Elevlista({ data, tester }: { data: WangTrenerData; tester: WangTesterData }) {
  const [sok, setSok] = useState("");
  const treff = data.elever.filter((e) => e.navn.toLowerCase().includes(sok.trim().toLowerCase()));
  const tilKontroll = tester.resultater.filter((r) => !r.kontrollert && !r.avvist).length;

  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · ${data.ukeTekst.split(" · ")[0].toLowerCase()}`} tittel="Elever" />

      <WangHelt
        etikett="Elever som trenger deg"
        merke="Siste fire uker"
        tall="—"
        tekst="elever trenger deg"
        forklar="Oppfølging bygges av oppmøte og gjennomført tid mot plan. Ingen av delene deles med WANG ennå."
        bilde="/images/playerhq/turn-tee.jpg"
      />

      <WangSmaaTall
        tall={[
          { verdi: String(data.elever.length), tekst: "Elever i gruppa" },
          { verdi: `${tester.delerIder.length} av ${data.elever.length}`, tekst: "Deler testene" },
          { verdi: String(tilKontroll), tekst: "Test til kontroll" },
        ]}
      />

      {data.elever.length === 0 ? (
        <WangTomTilstand tittel="Ingen elever i gruppa." tekst="Elevene vises her når de er lagt inn i gruppa." />
      ) : (
        <>
          <label className="wg-lbl">
            <span className="wg-skjult">Søk etter elev</span>
            <input
              className="wg-field"
              type="search"
              placeholder="Søk etter elev"
              value={sok}
              onChange={(e) => setSok(e.target.value)}
            />
          </label>
          <div className="wg-baand wg-baand-kol">
            <WangBaand type="trenger" tittel="Trenger deg" tekst="Under 80 % av planen, eller borte fra morgentreningen." antall={0} tomTekst="Ingen elever å vise før planen er delt." />
            <WangBaand type="folger" tittel="Følger planen" tekst="80 % eller mer. Lavest først." antall={0} tomTekst="Ingen elever å vise før planen er delt." />
            <WangBaand
              type="ikke"
              tittel="Ikke delt"
              tekst="Planen deles ikke med WANG ennå. Testene vises når eleven har samtykket."
              antall={treff.length}
              tomTekst="Ingen elever passer søket."
            >
              {treff.map((e) => (
                <WangElevrad
                  key={e.id}
                  type="ikke"
                  navn={e.navn}
                  linje={tester.delerIder.includes(e.id) ? "Deler testene" : "Deler ikke testene"}
                  verdi="—"
                  prosent={null}
                  href={wangHref("elever", "elev", e.id)}
                />
              ))}
            </WangBaand>
          </div>
        </>
      )}
      <p className="wg-kilde">Elever ved andre WANG-skoler vises aldri.</p>
    </>
  );
}

function EnElev({
  data,
  elev,
  deler,
  tester,
}: {
  data: WangTrenerData;
  elev: { id: string; navn: string };
  deler: boolean;
  tester: WangTesterData;
}) {
  const sisteTest = tester.resultater.find((r) => r.elevId === elev.id);
  return (
    <>
      <WangTilbake href={wangHref("elever")} tekst="Elever" />
      <section className="wg-topp" style={{ gap: 14 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <span className="wg-avatar" aria-hidden style={{ width: 56, height: 56, fontSize: 18, flex: "none" }}>{initialer(elev.navn)}</span>
          <div style={{ minWidth: 0 }}>
            <p className="wg-dato">{data.gruppeNavn}</p>
            <h1 className="wg-tittel">{elev.navn}</h1>
          </div>
        </div>
        <div className="wg-knapper">
          <span className={`wg-pille ${deler ? "wg-pille-ok" : ""}`}>
            <i />
            {deler ? "Deler testene med WANG" : "Deler ikke testene"}
          </span>
          <span className="wg-pille"><i />Plan ikke delt</span>
        </div>
        <nav aria-label="Elev" className="wgf-rad">
          <Link href={wangHref("elever", "elev", elev.id)} className="wgf wgf-pa" aria-current="page">Oversikt</Link>
          <Link href={iupHref(elev.id)} className="wgf">IUP</Link>
          <Link href={wangHref("elever", "sjekk", elev.id)} className="wgf">Fireukerssjekk</Link>
          <Link href={wangHref("tester", "elev", elev.id)} className="wgf">Tester</Link>
        </nav>
      </section>

      <WangSmaaTall
        fire
        tall={[
          { verdi: "—", tekst: "Etterlevelse" },
          { verdi: "—", tekst: "Morgentrening" },
          { verdi: sisteTest ? sisteTest.verdi : "—", tekst: sisteTest ? `Siste test: ${sisteTest.testNavn}` : "Siste test" },
          { verdi: "—", tekst: "Neste samtale" },
        ]}
      />

      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-fokus-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-fokus-tittel">Fokus nå</h2>
            <Link className="wg-lenke" href={iupHref(elev.id)}>Hele IUP</Link>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-forklar">Fokusområdene står i IUP-en, avtalt i IUP-samtalen.</p>
          </div>
          <div className="wg-sek-topp">
            <h2>Siste turneringer</h2>
            <Link className="wg-lenke" href={`/team-wang/coach/turneringer/${elev.id}`}>Turneringene</Link>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-kilde">Brutto. Kilde: GolfBox. Eleven må ha delt med deg.</p>
          </div>
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-forslag-tittel">
          <div className="wg-sek-topp"><h2 id="wg-forslag-tittel">Forslag fra deg</h2></div>
          <div className="wg-kort wg-fyll">
            <p className="wg-forklar">Forslagene står i IUP-en. Forslaget endrer ikke planen før eleven godtar det.</p>
            <div className="wg-knapper">
              <Link href={iupHref(elev.id)} className="wg-btn wg-btn-primary">Foreslå endring</Link>
              <Link href={wangHref("meldinger", "elev", elev.id)} className="wg-btn wg-btn-secondary">Skriv melding</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Fireukerssjekk({ data, elev }: { data: WangTrenerData; elev: { id: string; navn: string } }) {
  return (
    <>
      <WangTilbake href={wangHref("elever", "elev", elev.id)} tekst={elev.navn} />
      <WangTopp dato={`${elev.navn} · ${data.gruppeNavn}`} tittel="Fireukerssjekk" />
      <WangTomTilstand
        tittel="Ingen fireukerssjekk delt"
        tekst="Prosessmål, målsetninger og utviklingssjekkens spørsmål står her når eleven har svart og delt. Elevens svar og din vurdering står side om side."
      />
      <div className="wg-knapper">
        <button type="button" className="wg-btn wg-btn-primary" disabled>Lagre vurderingen</button>
      </div>
      <p className="wg-kilde">Fireukerssjekken finnes ikke i basen ennå. Ingenting er lagret.</p>
    </>
  );
}
