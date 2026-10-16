"use client";

import React, { useState } from "react";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { visDato, type WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";

interface WangIdagProps {
  data: WangTrenerData;
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "fokus", tittel: "Dagen" },
  { id: "trenger-deg", tittel: "Trenger deg" },
  { id: "uke", tittel: "Uka" },
] as const;

/**
 * WG-01 I dag for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/idag.html (pakke 2, utkast 1, 14.10.2026).
 * Avvik:
 *   - Bare ekte gruppedata (byggWangTrenerData). Oppmøte, etterlevelse og oppfølgingslista er ikke koblet ennå og viser «—» eller tom tilstand.
 */
export function WangIdag({ data, valgtFane = "fokus", aktivFane, onFaneEndret }: WangIdagProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const okter = data.ukeOkter;
  const passert = okter.filter((o) => o.passert).length;
  const aktivPeriode = data.perioder.find((p) => p.status === "naa");
  const nesteTurnering = data.turneringer.find((t) => !t.passert);

  const velgFane = (id: string) => {
    setFane(id);
    onFaneEndret?.(id);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.ukeTekst}</p>
          <h1 className="wg-tittel">I dag</h1>
          <p className="wg-ingress">Gruppas fokus og øktene i uka.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Elever</span>
            <strong>{data.elever.length}</strong>
            <span className="wg-kilde">I {data.gruppeNavn}</span>
          </div>
          <div>
            <span>Økter i uka</span>
            <strong>{okter.length}</strong>
            <span className="wg-kilde">{passert} passert</span>
          </div>
          <div>
            <span>Krever handling</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div>
            <span>Snitt etterlevelse</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
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

      <div className="wg-to-kol">
        <div>
          {fane === "fokus" && (
            <section className="wg-seksjon" aria-labelledby="wg-fokus-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-fokus-tittel">Periodens fokus</h2>
              </div>
              {aktivPeriode ? (
                <div className="wg-kort wg-fyll wg-fokus">
                  <span className="wg-dato">{aktivPeriode.navn}</span>
                  <h3>{aktivPeriode.fokus || "Ingen fokus skrevet for perioden"}</h3>
                  <p className="wg-kilde">
                    {visDato(aktivPeriode.startIso)}–{visDato(aktivPeriode.endIso)}. Fra gruppas årsplan.
                  </p>
                </div>
              ) : (
                <WangTomTilstand tittel="Ingen aktiv periode" tekst="Gruppas årsplan har ingen periode som gjelder i dag." />
              )}
            </section>
          )}

          {(fane === "fokus" || fane === "uke") && (
            <section className="wg-seksjon" aria-labelledby="wg-uka-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-uka-tittel">Uka</h2>
                <span className="wg-kilde">Fra gruppas kalender</span>
              </div>
              <div className="wg-kort wg-fyll" style={{ gap: 4 }}>
                {okter.length === 0 ? (
                  <p className="wg-kilde">Ingen økter er lagt inn denne uka.</p>
                ) : (
                  okter.map((okt) => (
                    <div key={okt.id} className="wg-ukerad">
                      <span className="wg-dg">{okt.dag}</span>
                      <div className="wg-okt">
                        <div className="wg-okt-rad">
                          <span className="wg-navn">{okt.tittel}</span>
                          <span className={`wg-pille ${okt.passert ? "wg-pille-ok" : ""}`}>
                            <i />
                            {okt.passert ? "Passert" : "Planlagt"}
                          </span>
                        </div>
                        <div className="wg-okt-info">
                          <span>{okt.tid}</span>
                          {okt.sted ? <span>{okt.sted}</span> : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        <div>
          {(fane === "fokus" || fane === "trenger-deg") && (
            <section className="wg-seksjon" aria-labelledby="wg-oppfolging-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-oppfolging-tittel">Elever som trenger oppfølging</h2>
              </div>
              <WangTomTilstand
                tittel="Ikke koblet ennå"
                tekst="Lista bygges av oppmøte, gjennomført tid og turneringsresultater når de er koblet til WANG-gruppa."
              />
            </section>
          )}

          {fane !== "trenger-deg" && (
            <section className="wg-seksjon" aria-labelledby="wg-sammendrag-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-sammendrag-tittel">Gruppa denne uka</h2>
              </div>
              <div className="wg-helt-tall" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div><span>Oppmøte</span><strong>—</strong></div>
                <div><span>Treningsvolum</span><strong>—</strong></div>
                <div><span>Etterlevelse</span><strong>—</strong></div>
                <div>
                  <span>Neste turnering</span>
                  <strong>{nesteTurnering ? visDato(nesteTurnering.startIso).slice(0, 5) : "—"}</strong>
                  {nesteTurnering ? <span className="wg-kilde">{nesteTurnering.tittel}</span> : null}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
