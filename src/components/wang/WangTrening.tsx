"use client";

import React, { useState } from "react";
import { WANG_ELEVER, WangElev } from "./wang-data";

interface WangTreningProps {
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

const FANER = [
  { id: "oversikt", tittel: "Oversikt" },
  { id: "oppmote", tittel: "Per elev" },
  { id: "periode", tittel: "Årsplan" },
  { id: "morgen", tittel: "Morgenøkter" },
] as const;

const TRINN = ["alle", "VG1", "VG2", "VG3"] as const;

/** Periodene i gruppas plan. Navnene følger periodelista fra 28.09.2026. */
const PERIODER = [
  { nr: 1, type: "Grunnperiode", tittel: "Grunntrening og sving", uker: "Uke 33–35", status: "Avsluttet" },
  { nr: 2, type: "Spesialperiode", tittel: "Spesialperiode og spissing", uker: "Uke 36–43 · 4 uker igjen", status: "Nå" },
  { nr: 3, type: "Turneringsperiode", tittel: "Turneringsavslutning", uker: "Uke 44–46", status: "Kommende" },
  { nr: 4, type: "Grunnperiode", tittel: "Vinteroppkjøring", uker: "Uke 47–02", status: "Kommende" },
] as const;

const MORGENOKTER = [
  { dag: "Tirsdag 08:00–10:00", tittel: "Teknikk, TrackMan og langslag", sted: "Gamle Fredrikstad GK, simulator og range" },
  { dag: "Torsdag 08:00–10:00", tittel: "Nærspill, putting og scoring", sted: "Onsøy GK, treningsgreen" },
] as const;

const prosent = (del: number, av: number) => (av > 0 ? Math.round((del / av) * 100) : null);

/**
 * WANG-42 Trening for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/trening.html (pakke 3, utkast 1, 14.10.2026).
 * Avvik:
 *   - Per akse, uke for uke, periodeskjemaet, Uka og Ny økt er ikke med. Kilden har
 *     ikke tid per akse eller økter per uke for WANG-gruppa ennå.
 *   - Etterlevelse er summen av gjennomførte minutter delt på planlagte minutter.
 *   - Fanen Morgenøkter (WANG-04) er beholdt fra dagens skjerm.
 */
export function WangTrening({
  valgtFane = "oversikt",
  aktivFane,
  onFaneEndret,
  campus: _campus = "Fredrikstad",
}: WangTreningProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const [elever] = useState<WangElev[]>(WANG_ELEVER);
  const [valgtTrinn, setValgtTrinn] = useState<string>("alle");

  const filtrerteElever = elever
    .filter((e) => (valgtTrinn === "alle" ? true : e.trinn === valgtTrinn))
    .sort((a, b) => a.etterlevelseProsent - b.etterlevelseProsent);

  const planlagt = filtrerteElever.reduce((s, e) => s + e.planlagtMinutter, 0);
  const gjennomfort = filtrerteElever.reduce((s, e) => s + e.gjennomfortMinutter, 0);
  const etterlevelse = prosent(gjennomfort, planlagt);
  const snittFravaer = filtrerteElever.length
    ? Math.round((filtrerteElever.reduce((s, e) => s + e.fravaerProsent, 0) / filtrerteElever.length) * 10) / 10
    : null;
  const oppfolging = filtrerteElever.filter((e) => e.trengerOppfolging).length;

  const velgFane = (id: string) => {
    setFane(id);
    onFaneEndret?.(id);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">WANG Golf · siste fire uker</p>
          <h1 className="wg-tittel">Trening</h1>
          <p className="wg-ingress">Gjennomført tid mot planlagt tid, oppmøte og gruppas årsplan.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Etterlevelse</span>
            <strong>{etterlevelse === null ? "—" : `${etterlevelse} %`}</strong>
            <span className="wg-kilde">Tid mot plan</span>
          </div>
          <div>
            <span>Gjennomført</span>
            <strong>{planlagt > 0 ? `${Math.round(gjennomfort / 60)} t` : "—"}</strong>
            <span className="wg-kilde">av {Math.round(planlagt / 60)} t planlagt</span>
          </div>
          <div>
            <span>Fravær</span>
            <strong>{snittFravaer === null ? "—" : `${String(snittFravaer).replace(".", ",")} %`}</strong>
            <span className="wg-kilde">Snitt per elev</span>
          </div>
          <div className={oppfolging > 0 ? "wg-signal" : undefined}>
            <span>Følger opp</span>
            <strong>{oppfolging}</strong>
            <span className="wg-kilde">av {filtrerteElever.length} elever</span>
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
            <span className="wg-kilde">Lavest først</span>
          </div>
          <div className="wg-filter" role="group" aria-label="Trinn">
            {TRINN.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={valgtTrinn === t}
                onClick={() => setValgtTrinn(t)}
                className={`wg-chip ${valgtTrinn === t ? "wg-chip-pa" : ""}`}
              >
                {t === "alle" ? `Alle (${elever.length})` : `${t} (${elever.filter((e) => e.trinn === t).length})`}
              </button>
            ))}
          </div>
          <div className="wg-kort wg-rader">
            {filtrerteElever.length === 0 ? (
              <p className="wg-kilde" style={{ padding: "14px 0" }}>Ingen elever på dette trinnet.</p>
            ) : (
              filtrerteElever.map((elev) => {
                const erLav = elev.etterlevelseProsent < 80;
                return (
                  <div key={elev.id} className="wg-rad">
                    <div>
                      <b>{elev.navn}</b>
                      <p className="wg-kilde">
                        {elev.trinn} · HCP {elev.hcp} · {Math.round(elev.gjennomfortMinutter / 60)} av {Math.round(elev.planlagtMinutter / 60)} t ·{" "}
                        {elev.oppmoteAntall} oppmøter · {String(elev.fravaerProsent).replace(".", ",")} % fravær
                      </p>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {elev.trengerOppfolging ? (
                        <span className="wg-pille wg-pille-haster"><i />Følg opp</span>
                      ) : (
                        <span className="wg-pille wg-pille-ok"><i />I rute</span>
                      )}
                      <span className="wg-tall">{elev.etterlevelseProsent} %</span>
                    </span>
                    <div className="wg-stolpe" role="img" aria-label={`Etterlevelse ${elev.etterlevelseProsent} prosent`}>
                      <span className={erLav ? "wg-lav" : undefined} style={{ width: `${Math.min(elev.etterlevelseProsent, 100)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
            <p className="wg-kilde" style={{ padding: "12px 0 14px", borderTop: "1px solid var(--wg-n100)" }}>
              Gjennomført tid delt på planlagt tid. Bare økter med passert sluttid teller.
            </p>
          </div>
        </section>
      )}

      {(fane === "oversikt" || fane === "periode") && (
        <section className="wg-seksjon" aria-labelledby="wg-periode-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-periode-tittel">Årsplan</h2>
            <span className="wg-kilde">Gruppas plan. Elevene arver den.</span>
          </div>
          <div className="wg-rutenett">
            {PERIODER.map((p) => (
              <div key={p.nr} className={`wg-kort ${p.status === "Nå" ? "wg-naa" : ""}`}>
                <span className="wg-dato">Periode {p.nr} · {p.type}</span>
                <h3>{p.tittel}</h3>
                <p className="wg-kilde">{p.uker}</p>
                <span className={`wg-pille ${p.status === "Nå" ? "wg-pille-vent" : p.status === "Avsluttet" ? "wg-pille-ok" : ""}`} style={{ justifySelf: "start" }}>
                  <i />
                  {p.status === "Nå" ? "Aktiv periode" : p.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(fane === "oversikt" || fane === "morgen") && (
        <section className="wg-seksjon" aria-labelledby="wg-morgen-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-morgen-tittel">Morgenøkter</h2>
            <span className="wg-kilde">Faste, tirsdag og torsdag 08:00</span>
          </div>
          <div className="wg-rutenett">
            {MORGENOKTER.map((m) => (
              <div key={m.dag} className="wg-kort">
                <span className="wg-dato">{m.dag}</span>
                <h3>{m.tittel}</h3>
                <p className="wg-kilde">{m.sted}. Hovedtrener: Anders Kristiansen.</p>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="wg-pille">12 plasser</span>
                  <span className="wg-pille">Obligatorisk</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
