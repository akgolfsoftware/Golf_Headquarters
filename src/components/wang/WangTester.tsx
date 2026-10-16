"use client";

import React, { useState } from "react";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { visDato, type WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";

interface WangTesterProps {
  data: WangTrenerData;
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "fysisk", tittel: "Testbatteri" },
  { id: "ko", tittel: "Til kontroll" },
  { id: "scorekort", tittel: "Før test" },
  { id: "rangering", tittel: "Rangering" },
] as const;

/** Fysisk del av testbatteriet (Anders 28.09.2026). */
const BATTERI = ["Benkpress", "Markløft trapbar", "Lengdehopp", "Rotasjonskast", "Club Speed"] as const;

/**
 * WANG-48 Tester for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/tester.html (pakke 4, utkast 1, 14.10.2026).
 * Avvik:
 *   - Ekte testresultater ligger på /team-wang/coach/tester (lenken over). Kontroll, føring og rangering fra trenerflaten er ikke koblet ennå.
 */
export function WangTester({ data, valgtFane = "fysisk", aktivFane, onFaneEndret }: WangTesterProps) {
  const [fane, setFane] = useState(
    aktivFane === "fokus" || aktivFane === "oversikt" ? "fysisk" : aktivFane || valgtFane,
  );
  const nesteTestdag = data.testdager.find((t) => !t.passert);

  const velgFane = (id: string) => {
    setFane(id);
    onFaneEndret?.(id);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.gruppeNavn} · testbatteriet</p>
          <h1 className="wg-tittel">Tester</h1>
          <p className="wg-ingress">
            Elevene fører selv, du kontrollerer. Fysisk test hver sjette uke i grunnperioden.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Til kontroll</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div>
            <span>Elever</span>
            <strong>{data.elever.length}</strong>
            <span className="wg-kilde">I gruppa</span>
          </div>
          <div>
            <span>Fysiske tester</span>
            <strong>{BATTERI.length}</strong>
            <span className="wg-kilde">I batteriet</span>
          </div>
          <div>
            <span>Neste testdag</span>
            <strong>{nesteTestdag ? visDato(nesteTestdag.startIso).slice(0, 5) : "—"}</strong>
            <span className="wg-kilde">{nesteTestdag ? nesteTestdag.tittel : "Ingen i kalenderen"}</span>
          </div>
        </div>
      </section>

      <nav aria-label="Visning" className="wgf-rad">
        {FANER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={fane === f.id}
            onClick={() => velgFane(f.id)}
            className={`wgf ${fane === f.id ? "wgf-pa" : ""}`}
          >
            {f.tittel}
          </button>
        ))}
      </nav>

      {fane === "fysisk" && (
        <>
          <section className="wg-seksjon" aria-labelledby="wg-batteri-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-batteri-tittel">Fysiske tester</h2>
              <span className="wg-kilde">Nivå A–K: referanse ikke satt</span>
            </div>
            <div className="wg-rutenett">
              {BATTERI.map((navn) => (
                <div key={navn} className="wg-kort">
                  <h3>{navn}</h3>
                </div>
              ))}
            </div>
          </section>
          <section className="wg-seksjon" aria-labelledby="wg-testdag-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-testdag-tittel">Testdager</h2>
              <span className="wg-kilde">Fra gruppas kalender</span>
            </div>
            <div className="wg-kort wg-rader">
              {data.testdager.length === 0 ? (
                <p className="wg-kilde" style={{ padding: "14px 0" }}>Ingen testdager i kalenderen.</p>
              ) : (
                data.testdager.map((t) => (
                  <div key={t.id} className="wg-rad">
                    <div>
                      <b>{t.tittel}</b>
                      <p className="wg-kilde">{visDato(t.startIso)}{t.sted ? ` · ${t.sted}` : ""}</p>
                    </div>
                    <span className={`wg-pille ${t.passert ? "wg-pille-ok" : "wg-pille-vent"}`}>
                      <i />
                      {t.passert ? "Passert" : "Kommende"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {fane === "ko" && (
        <WangTomTilstand
          tittel="Ikke koblet ennå"
          tekst="Egenførte resultater til kontroll vises her når kontrollen er koblet. Alle lagrede resultater ligger under «Åpne testresultater» over."
        />
      )}

      {fane === "scorekort" && (
        <WangTomTilstand
          tittel="Ikke koblet ennå"
          tekst="Føring av testresultat fra trenerflaten er ikke koblet. Elevene fører testene i PlayerHQ."
        />
      )}

      {fane === "rangering" && (
        <WangTomTilstand
          tittel="Ikke koblet ennå"
          tekst="Rangering av egne elever per test vises her når testresultatene er koblet til trenerflaten."
        />
      )}
    </>
  );
}
