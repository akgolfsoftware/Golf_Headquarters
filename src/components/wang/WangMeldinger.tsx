"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { WangFaner, WangTilbake, WangTopp, initialer, langDato, wangHref } from "./wang-felles";
import type { WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";

interface WangMeldingerProps {
  data: WangTrenerData;
  /** Underside: innboks · elev · gruppe · mote · dokumenter. */
  aktivFane?: string;
  /** Eleven samtalen gjelder. */
  id?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "innboks", tittel: "Alle" },
  { id: "gruppe", tittel: "Gruppa" },
  { id: "mote", tittel: "Foresatte" },
  { id: "dokumenter", tittel: "Dokumenter" },
];

/**
 * Pakke 6 Meldinger for trener og sportssjef: Innboks, Én elev (foresatte leser under 18, WANG-14),
 * Gruppepost med lesekvittering (WANG-13), Foreldremøte (WANG-15) og Dokumenter med rekkevidde (WANG-21).
 * Fasit: docs/design-system/utkast-wang/meldinger.html (utkast 2, godkjent av Anders 16.10.2026). Lett hånd: ro er riktig her.
 * Avvik:
 *   - Trenerflaten har ingen meldinger, gruppeposter, foreldremøter eller dokumenter i basen ennå. Alle lister er tomme.
 *   - Send, Publiser, Inviter og Last opp er sperret: ingenting sendes til elever eller foresatte herfra.
 */
export function WangMeldinger({ data, aktivFane, id }: WangMeldingerProps) {
  if (aktivFane === "elev") return <EnElev data={data} elevId={id} />;
  if (aktivFane === "gruppe") return <Gruppepost data={data} />;
  if (aktivFane === "mote") return <Foreldremote data={data} />;
  if (aktivFane === "dokumenter") return <Dokumenter data={data} />;
  return <Innboks data={data} />;
}

function Innboks({ data }: { data: WangTrenerData }) {
  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · 0 uleste`} tittel="Meldinger">
        <WangFaner omraade="meldinger" aktiv="innboks" faner={FANER} etikett="Meldinger" />
        <div className="wg-knapper">
          <Link href={wangHref("meldinger", "gruppe")} className="wg-btn wg-btn-primary">Ny gruppepost</Link>
        </div>
      </WangTopp>
      <div className="wg-to-kol">
        <WangTomTilstand
          tittel="Ingen meldinger ennå"
          tekst="Samtaler med elevene, gruppa og foresatte samles her, uleste øverst. Meldinger kan ikke slettes."
        />
        <section className="wg-seksjon" aria-labelledby="wg-skriv-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-skriv-tittel">Skriv til elev</h2>
          </div>
          {data.elever.length === 0 ? (
            <p className="wg-baand-tom">Ingen elever i gruppa.</p>
          ) : (
            <div className="wg-kort wg-rader">
              {data.elever.map((e) => (
                <Link key={e.id} href={wangHref("meldinger", "elev", e.id)} className="wg-rad wg-rad-lenke">
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="wg-avatar" aria-hidden>{initialer(e.navn)}</span>
                    <b>{e.navn}</b>
                  </span>
                  <span className="wg-kilde">Ingen samtale</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function EnElev({ data, elevId }: { data: WangTrenerData; elevId?: string }) {
  const elev = data.elever.find((e) => e.id === elevId);
  const [tekst, setTekst] = useState("");
  if (!elev) {
    return (
      <>
        <WangTilbake href={wangHref("meldinger")} tekst="Meldinger" />
        <WangTomTilstand tittel="Fant ikke eleven" tekst="Eleven er ikke med i gruppa." />
      </>
    );
  }
  return (
    <>
      <WangTilbake href={wangHref("meldinger")} tekst="Meldinger" />
      <section className="wg-topp" style={{ gridTemplateColumns: "auto minmax(0,1fr)", alignItems: "center", gap: 12 }}>
        <span className="wg-avatar" aria-hidden style={{ width: 48, height: 48 }}>{initialer(elev.navn)}</span>
        <div>
          <p className="wg-dato">{data.gruppeNavn}</p>
          <h1 className="wg-tittel" style={{ fontSize: 24 }}>{elev.navn}</h1>
        </div>
      </section>
      <WangTomTilstand tittel="Ingen meldinger" tekst="Dere har ikke skrevet til hverandre ennå." />
      <p className="wg-merknad">
        <span>Foresatte skal lese samtalen når eleven er under 18. Meldinger kan ikke slettes.</span>
      </p>
      <form className="wg-skriv" onSubmit={(e) => e.preventDefault()}>
        <textarea className="wg-field" aria-label="Skriv melding" rows={2} value={tekst} onChange={(e) => setTekst(e.target.value)} />
        <button type="submit" className="wg-btn wg-btn-primary" disabled>Send</button>
      </form>
      <p className="wg-kilde">Meldinger fra trenerflaten er ikke koblet ennå. Ingenting sendes.</p>
    </>
  );
}

function Gruppepost({ data }: { data: WangTrenerData }) {
  const [til, setTil] = useState<"alle" | "valgte">("alle");
  return (
    <>
      <WangTilbake href={wangHref("meldinger")} tekst="Meldinger" />
      <WangTopp dato={`${data.gruppeNavn} · ${data.elever.length} elever`} tittel="Gruppeposter" />
      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-ny-tittel">
          <div className="wg-sek-topp"><h2 id="wg-ny-tittel">Ny post</h2></div>
          <form className="wg-kort wg-fyll" onSubmit={(e) => e.preventDefault()}>
            <label className="wg-lbl">
              Tittel
              <input className="wg-field" />
            </label>
            <label className="wg-lbl">
              Tekst
              <textarea className="wg-field" rows={5} />
            </label>
            <div className="wg-lbl" role="group" aria-label="Mottakere">
              Til
              <div className="wg-valg wg-valg-to">
                <button type="button" aria-pressed={til === "alle"} onClick={() => setTil("alle")}>Hele gruppa</button>
                <button type="button" aria-pressed={til === "valgte"} onClick={() => setTil("valgte")}>Velg elever</button>
              </div>
            </div>
            <div className="wg-knapper">
              <button type="submit" className="wg-btn wg-btn-primary" disabled>Publiser</button>
            </div>
            <p className="wg-kilde">
              Gruppeposter kan ikke publiseres herfra ennå. Foresatte til elever under 18 skal se posten også.
            </p>
          </form>
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-publ-tittel">
          <div className="wg-sek-topp"><h2 id="wg-publ-tittel">Publisert</h2></div>
          <WangTomTilstand
            tittel="Ingen gruppeposter"
            tekst="Publiserte poster står her med hvor mange som har lest. Elevene ser aldri hvem som ikke har lest."
          />
        </section>
      </div>
    </>
  );
}

function Foreldremote({ data }: { data: WangTrenerData }) {
  return (
    <>
      <WangTilbake href={wangHref("meldinger")} tekst="Meldinger" />
      <WangTopp dato={langDato(data.idagIso)} tittel="Foreldremøte">
        <WangFaner omraade="meldinger" aktiv="mote" faner={FANER} etikett="Meldinger" />
      </WangTopp>
      <div className="wg-to-kol">
        <div className="wg-kort wg-fyll">
          <WangTomTilstand
            tittel="Ingen foreldremøter"
            tekst="Invitasjon, svar per hjem og referat samles her. Hvert hjem ser bare sitt eget svar."
          />
          <div className="wg-knapper">
            <button type="button" className="wg-btn wg-btn-primary" disabled>Inviter til foreldremøte</button>
          </div>
          <p className="wg-kilde">Invitasjoner kan ikke sendes herfra ennå. Ingenting er sendt.</p>
        </div>
        <div className="wg-kort wg-fyll">
          <b className="wg-undertittel">Svar per hjem</b>
          <p className="wg-kilde">{data.elever.length} hjem i gruppa. Ingen svar.</p>
        </div>
      </div>
    </>
  );
}

function Dokumenter({ data }: { data: WangTrenerData }) {
  return (
    <>
      <WangTopp dato={data.gruppeNavn} tittel="Dokumenter">
        <WangFaner omraade="meldinger" aktiv="dokumenter" faner={FANER} etikett="Meldinger" />
        <div className="wg-knapper">
          <button type="button" className="wg-btn wg-btn-primary" disabled>Last opp</button>
        </div>
      </WangTopp>
      <WangTomTilstand
        tittel="Ingen dokumenter"
        tekst="Last opp årsplanen eller retningslinjer, og velg hvem som skal se dem: elever, foresatte eller begge."
      />
      <p className="wg-kilde">
        Opplasting er ikke koblet ennå. Rekkevidden skal bestemme hvem som ser dokumentet i PlayerHQ.
      </p>
    </>
  );
}
