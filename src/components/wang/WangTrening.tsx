"use client";

import React, { useState } from "react";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { visDato, type WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";

interface WangTreningProps {
  data: WangTrenerData;
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "oversikt", tittel: "Oversikt" },
  { id: "oppmote", tittel: "Per elev" },
  { id: "periode", tittel: "Årsplan" },
  { id: "morgen", tittel: "Faste økter" },
] as const;

const STATUS_TEKST = { avsluttet: "Avsluttet", naa: "Aktiv periode", kommende: "Kommende" } as const;

/**
 * WANG-42 Trening for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/trening.html (pakke 3, utkast 1, 14.10.2026).
 * Avvik:
 *   - Årsplan og faste økter kommer fra gruppa. Tid mot plan, oppmøte og fravær per elev er ikke koblet ennå og viser «—».
 */
export function WangTrening({ data, valgtFane = "oversikt", aktivFane, onFaneEndret }: WangTreningProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const aktivPeriode = data.perioder.find((p) => p.status === "naa");

  const velgFane = (id: string) => {
    setFane(id);
    onFaneEndret?.(id);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.gruppeNavn} · siste fire uker</p>
          <h1 className="wg-tittel">Trening</h1>
          <p className="wg-ingress">Gjennomført tid mot planlagt tid, oppmøte og gruppas årsplan.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Etterlevelse</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div>
            <span>Aktiv periode</span>
            <strong>{aktivPeriode ? aktivPeriode.navn : "—"}</strong>
            <span className="wg-kilde">{aktivPeriode ? `Til ${visDato(aktivPeriode.endIso)}` : "Ingen periode i dag"}</span>
          </div>
          <div>
            <span>Faste økter</span>
            <strong>{data.fasteOkter.length}</strong>
            <span className="wg-kilde">Per uke</span>
          </div>
          <div>
            <span>Elever</span>
            <strong>{data.elever.length}</strong>
            <span className="wg-kilde">I gruppa</span>
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

      {(fane === "oversikt" || fane === "oppmote") && (
        <section className="wg-seksjon" aria-labelledby="wg-elev-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-elev-tittel">Per elev</h2>
            <span className="wg-kilde">Tid mot plan er ikke koblet ennå</span>
          </div>
          <div className="wg-kort wg-rader">
            {data.elever.length === 0 ? (
              <p className="wg-kilde" style={{ padding: "14px 0" }}>Ingen elever i gruppa.</p>
            ) : (
              data.elever.map((elev) => (
                <div key={elev.id} className="wg-rad">
                  <div>
                    <b>{elev.navn}</b>
                    <p className="wg-kilde">Gjennomført — · oppmøte — · fravær —</p>
                  </div>
                  <span className="wg-tall">—</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {(fane === "oversikt" || fane === "periode") && (
        <section className="wg-seksjon" aria-labelledby="wg-periode-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-periode-tittel">Årsplan</h2>
            <span className="wg-kilde">Gruppas plan. Elevene arver den.</span>
          </div>
          {data.perioder.length === 0 ? (
            <WangTomTilstand tittel="Ingen perioder" tekst="Gruppa har ingen årsplan med perioder ennå." />
          ) : (
            <div className="wg-rutenett">
              {data.perioder.map((p, i) => (
                <div key={p.id} className={`wg-kort ${p.status === "naa" ? "wg-naa" : ""}`}>
                  <span className="wg-dato">Periode {i + 1} · {p.navn}</span>
                  <h3>{p.fokus || p.navn}</h3>
                  <p className="wg-kilde">{visDato(p.startIso)}–{visDato(p.endIso)}</p>
                  <span
                    className={`wg-pille ${p.status === "naa" ? "wg-pille-vent" : p.status === "avsluttet" ? "wg-pille-ok" : ""}`}
                    style={{ justifySelf: "start" }}
                  >
                    <i />
                    {STATUS_TEKST[p.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(fane === "oversikt" || fane === "morgen") && (
        <section className="wg-seksjon" aria-labelledby="wg-morgen-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-morgen-tittel">Faste økter</h2>
            <span className="wg-kilde">Fra gruppas kalender</span>
          </div>
          {data.fasteOkter.length === 0 ? (
            <WangTomTilstand tittel="Ingen faste økter" tekst="Gruppa har ingen ukentlige økter i kalenderen ennå." />
          ) : (
            <div className="wg-rutenett">
              {data.fasteOkter.map((o) => (
                <div key={`${o.dag}-${o.tid}-${o.tittel}`} className="wg-kort">
                  <span className="wg-dato">{o.dag} {o.tid}</span>
                  <h3>{o.tittel}</h3>
                  {o.sted ? <p className="wg-kilde">{o.sted}</p> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
