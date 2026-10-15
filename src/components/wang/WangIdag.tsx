"use client";

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
import React, { useState } from "react";
import {
  WANG_ELEVER,
  WANG_OKTER,
  WangElev,
  WangOkt,
} from "./wang-data";

interface WangIdagProps {
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

const FANER = [
  { id: "fokus", tittel: "Dagen" },
  { id: "trenger-deg", tittel: "Trenger deg" },
  { id: "uke", tittel: "Uka" },
] as const;

function initialer(navn: string) {
  return navn
    .split(" ")
    .filter(Boolean)
    .map((d) => d[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * WG-01 I dag for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/idag.html (pakke 2, utkast 1, 14.10.2026).
 * Avvik:
 *   - Krever handling, Dagen som tidslinje og oppmøteføringen er ikke med. Oppmøte,
 *     egenførte tester og delte fireukerssjekker er ikke koblet til WANG-flaten ennå,
 *     så tellerne som hører til dem viser «—».
 *   - Økter står uten akse og bilde, fordi øktene ikke har akse i kilden.
 *   - Fanene Dagen, Trenger deg og Uka er beholdt fra dagens skjerm.
 */
export function WangIdag({
  valgtFane = "fokus",
  aktivFane,
  onFaneEndret,
  campus: _campus = "Fredrikstad",
}: WangIdagProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const [okter] = useState<WangOkt[]>(WANG_OKTER);
  const [oppfolgingElever] = useState<WangElev[]>(
    WANG_ELEVER.filter((e) => e.trengerOppfolging)
  );
  const gjennomfort = okter.filter((o) => o.status === "Gjennomført").length;

  const velgFane = (id: string) => {
    setFane(id);
    onFaneEndret?.(id);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">Uke 40 · 28.09–02.10.2026</p>
          <h1 className="wg-tittel">I dag</h1>
          <p className="wg-ingress">
            Dagens fokus, elevene som trenger deg og morgentreningene i uka.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div className={oppfolgingElever.length > 0 ? "wg-signal" : undefined}>
            <span>Følger opp</span>
            <strong>{oppfolgingElever.length}</strong>
            <span className="wg-kilde">av {WANG_ELEVER.length} elever</span>
          </div>
          <div>
            <span>Økter i uka</span>
            <strong>{okter.length}</strong>
            <span className="wg-kilde">{gjennomfort} gjennomført</span>
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
            {f.id === "trenger-deg" ? `${f.tittel} (${oppfolgingElever.length})` : f.tittel}
          </button>
        ))}
      </nav>

      <div className="wg-to-kol">
        <div>
          {/* Dagens fokus (WG-01) */}
          {fane === "fokus" && (
            <section className="wg-seksjon" aria-labelledby="wg-fokus-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-fokus-tittel">Dagens fokus</h2>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <button type="button" disabled className="wg-btn wg-btn-ghost" style={IKKE_KOBLET_KNAPP_STIL}>
                    Endre fokus
                  </button>
                  <WangIkkeKoblet />
                </span>
              </div>
              <div className="wg-kort wg-fyll wg-fokus">
                <span className="wg-akse wg-akse-slag">SLAG</span>
                <h3>Driver: svinghastighet og balltreff før høstturneringen</h3>
                <div className="wg-maltall">
                  <div><strong>112 mph</strong><span>Club Speed, snitt i gruppa</span></div>
                  <div><strong>1,48</strong><span>Smash Factor</span></div>
                  <div><strong>+2,5°</strong><span>Attack Angle</span></div>
                </div>
                <p className="wg-kilde">
                  Satt av Anders Kristiansen, tirsdag 29.09. Morgentrening 08:00, TrackMan stasjon 1.
                </p>
              </div>
            </section>
          )}

          {/* Morgentreninger og fellessamlinger (WANG-30) */}
          {(fane === "fokus" || fane === "uke") && (
            <section className="wg-seksjon" aria-labelledby="wg-uka-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-uka-tittel">Uka</h2>
                <span className="wg-kilde">Morgentreninger tirsdag og torsdag 08:00–10:00</span>
              </div>
              <div className="wg-kort wg-fyll" style={{ gap: 4 }}>
                {okter.length === 0 ? (
                  <p className="wg-kilde">Ingen økter er lagt inn denne uka.</p>
                ) : (
                  okter.map((okt) => (
                    <div key={okt.id} className="wg-ukerad">
                      <span className="wg-dg">{okt.dag.slice(0, 3)}</span>
                      <div className="wg-okt">
                        <div className="wg-okt-rad">
                          <span className="wg-navn">{okt.tittel}</span>
                          <span className={`wg-pille ${okt.status === "Gjennomført" ? "wg-pille-ok" : ""}`}>
                            <i />
                            {okt.status}
                          </span>
                        </div>
                        <div className="wg-okt-info">
                          <span>{okt.tid}</span>
                          <span>{okt.sted}</span>
                          <span>{okt.trener}</span>
                          <span>{okt.antallPameldt} av {okt.totaltElever} elever</span>
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
          {/* Elever som trenger oppfølging (WANG-43) */}
          {(fane === "fokus" || fane === "trenger-deg") && (
            <section className="wg-seksjon" aria-labelledby="wg-oppfolging-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-oppfolging-tittel">Elever som trenger oppfølging</h2>
                <span className="wg-kilde">
                  {oppfolgingElever.length} av {WANG_ELEVER.length}
                </span>
              </div>
              <div className="wg-kort wg-saker">
                {oppfolgingElever.length === 0 ? (
                  <p className="wg-kilde" style={{ padding: "14px 0" }}>
                    Ingen elever trenger oppfølging nå.
                  </p>
                ) : (
                  oppfolgingElever.map((elev) => (
                    <div key={elev.id} className="wg-sak">
                      <span className="wg-avatar" aria-hidden="true">{initialer(elev.navn)}</span>
                      <b>{elev.navn} · {elev.trinn} · HCP {elev.hcp}</b>
                      <p>{elev.oppfolgingAarsak ?? "—"}</p>
                      <div className="wg-knapper">
                        <button type="button" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                          Ta oppfølging
                        </button>
                        <button type="button" disabled className="wg-btn wg-btn-secondary" style={IKKE_KOBLET_KNAPP_STIL}>
                          Løst
                        </button>
                        <WangIkkeKoblet />
                      </div>
                    </div>
                  ))
                )}
                <p className="wg-kilde">
                  Kilde: oppmøte, gjennomført tid og turneringsresultater. Elevene ser ikke denne lista.
                </p>
              </div>
            </section>
          )}

          {/* Ukessammendrag (WANG-12) */}
          {fane !== "trenger-deg" && (
            <section className="wg-seksjon" aria-labelledby="wg-sammendrag-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-sammendrag-tittel">Gruppa denne uka</h2>
                <span className="wg-kilde">Ikke koblet ennå</span>
              </div>
              <div className="wg-helt-tall" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div><span>Oppmøte</span><strong>—</strong></div>
                <div><span>Treningsvolum</span><strong>—</strong></div>
                <div><span>Etterlevelse</span><strong>—</strong></div>
                <div><span>Neste turnering</span><strong>—</strong></div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
