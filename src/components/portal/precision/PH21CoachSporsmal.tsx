"use client";

/**
 * PH-21 Spørsmål for coach i nytt design: tellerne øverst (åpne, besvart, totalt), filter og lista
 * over spillerspørsmål med status. Spilleren ser PH21Innboks; denne er for coach og admin på samme adresse.
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html (utkast 1, innboks og spørsmål).
 * Stil: src/styles/playerhq-ny.css og playerhq-ny-meg.css (liste, ruter, avatar).
 *
 * Samme data som før (CoachQAV2): spørsmålene hentes på serveren, filteret er bare visning.
 *
 * Avvik:
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-21-COACH.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { initialer } from "@/lib/portal/initialer";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH21CoachSporsmalRad = {
  id: string;
  /** Navnet på spilleren som spurte. */
  navn: string;
  tittel: string;
  besvart: boolean;
  /** Forhåndsformatert «dd.mm hh:mm» (Europe/Oslo). */
  tid: string;
};

type Filter = "alle" | "apne" | "besvart";
const FILTER: { id: Filter; l: string }[] = [{ id: "alle", l: "Alle" }, { id: "apne", l: "Åpne" }, { id: "besvart", l: "Besvart" }];

export function PH21CoachSporsmal({ sporsmal }: { sporsmal: PH21CoachSporsmalRad[] }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const apne = sporsmal.filter((s) => !s.besvart).length;
  const vist = sporsmal.filter((s) => filter === "apne" ? !s.besvart : filter === "besvart" ? s.besvart : true);

  return <div className="phn phn-meg"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/coach"><ChevronLeft size={18} aria-hidden />Coach</Link>
      <div><div className="phn-dato">Coach · spørsmål</div><h1 className="phn-tittel">Spørsmål</h1></div>
    </div>

    <div className="ruter" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
      <div className="rute"><span className="e">Åpne</span><b className="t">{apne}</b></div>
      <div className="rute"><span className="e">Besvart</span><b className="t">{sporsmal.length - apne}</b></div>
      <div className="rute"><span className="e">Totalt</span><b className="t">{sporsmal.length}</b></div>
    </div>

    <section className="phn-seksjon" aria-labelledby="cs-liste">
      <div className="phn-sek-topp">
        <h2 id="cs-liste">Innkomne spørsmål</h2>
        {sporsmal.length > 0 && <div className="phn-valg" role="group" aria-label="Filter">
          {FILTER.map((f) => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.l}</button>)}
        </div>}
      </div>

      {sporsmal.length === 0
        ? <div className="phn-kort dempet">
          <b className="phn-undertittel">Ingen spørsmål ennå</b>
          <p className="phn-forklar">Når en spiller stiller et spørsmål, dukker det opp her.</p>
          <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/coach/sporsmal/ny">Still et spørsmål</Link></div>
        </div>
        : vist.length === 0
          ? <div className="phn-kort dempet"><p className="phn-forklar">Ingen spørsmål i denne visningen. Bytt filter for å se de andre.</p></div>
          : <div className="liste">
            {vist.map((s) => <Link key={s.id} href={`/portal/coach/sporsmal/${s.id}`}>
              <span className="avatar lys" aria-hidden>{initialer(s.navn)}</span>
              <span><b>{s.tittel}</b><span className="phn-kilde">{s.navn} · {s.tid}</span></span>
              <span className="hoyre"><span className={`phn-pille ${s.besvart ? "ok" : "vent"}`}><i />{s.besvart ? "Besvart" : "Åpent"}</span><ChevronRight size={20} aria-hidden /></span>
            </Link>)}
          </div>}
    </section>
  </div></div>;
}
