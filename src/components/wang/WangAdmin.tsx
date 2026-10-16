'use client';

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
import React, { useState } from 'react';
import {
  WANG_KANDIDATER,
  type WangKandidat,
} from './wang-data';

interface WangAdminProps {
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

const FANER = [
  { id: 'WANG-19', navn: 'Trenere og roller' },
  { id: 'WANG-34', navn: 'Samtykke' },
  { id: 'WANG-26', navn: 'Timeplan' },
  { id: 'WANG-31', navn: 'Rekruttering' },
  { id: 'WANG-32', navn: 'Plasser' },
  { id: 'WANG-33', navn: 'Skolene' },
] as const;

const TRENERE = [
  { navn: 'Anders Kristiansen', campus: 'Fredrikstad / Nasjonalt', rolle: 'Sportssjef' },
  { navn: 'Kjersti Jørgensen', campus: 'Oslo', rolle: 'Sportssjef' },
  { navn: 'Niklas Diethelm', campus: 'Romerike / Tønsberg', rolle: 'Trener' },
  { navn: 'Jørn Hovland', campus: 'Oslo / Stavanger', rolle: 'Trener' },
  { navn: 'Mia Sandtorv', campus: 'Fredrikstad', rolle: 'Trener' },
] as const;

const BLOKKER = [
  { tid: 'Tirsdag 08:00–10:00', navn: 'Morgentrening golfteknikk', merknad: 'Obligatorisk for VG1, VG2 og VG3' },
  { tid: 'Onsdag 08:00–10:00', navn: 'Fysisk trening og kapasitet', merknad: 'Styrkerom og basistrening' },
  { tid: 'Fredag 08:00–10:00', navn: 'Morgentrening nærspill og test', merknad: 'Forberedelse til turnering' },
] as const;

const PLASSER = [
  { skole: 'WANG Fredrikstad', brukt: 18, totalt: 20 },
  { skole: 'WANG Oslo', brukt: 24, totalt: 24 },
  { skole: 'WANG Stavanger', brukt: 14, totalt: 16 },
] as const;

const KONTAKTLOGG = [
  { dato: '01.10.2026', parter: 'Fredrikstad og Oslo', status: 'Avtalt program' },
  { dato: '28.09.2026', parter: 'Fredrikstad og Stavanger', status: 'Ferdig' },
  { dato: '20.09.2026', parter: 'Nasjonalt sportssjefmøte', status: 'Ført' },
] as const;

const KANDIDATSTATUS: Record<WangKandidat['status'], string> = {
  sokt: 'Søkt',
  vurdert: 'Vurdert',
  provespill: 'Prøvespill',
  intervju: 'Intervju',
  tilbudt: 'Tilbudt plass',
  takket_ja: 'Takket ja',
};

/**
 * WANG-19/34/26/31/32/33 Administrasjon, bare for sportssjef.
 * Fasit: docs/design-system/utkast-wang/administrasjon.html (pakke 8, utkast 1, 14.10.2026).
 * Avvik:
 *   - Samtykkeoversikten viser ingen status før den er koblet til delingssamtykke.
 *   - Kontaktloggen mellom skolene viser hvem og når, ikke tema eller innhold
 *     (Anders 26.09.2026). Stjernemerking per skole er ikke med.
 */
export function WangAdmin({
  aktivFane = 'WANG-19',
  onFaneEndret,
  campus = 'Fredrikstad',
}: WangAdminProps) {
  const [fane, setFane] = useState(aktivFane);
  const kandidater: WangKandidat[] = WANG_KANDIDATER;

  // Ny kandidat tilstand
  const [nyttNavn, setNyttNavn] = useState('');
  const [nyKlubb, setNyKlubb] = useState('');
  const [nyttHcp, setNyttHcp] = useState('');

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const ledige = PLASSER.reduce((s, p) => s + (p.totalt - p.brukt), 0);

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">WANG Golf · bare sportssjef</p>
          <h1 className="wg-tittel">Administrasjon</h1>
          <p className="wg-ingress">Trenere og roller, samtykke, timeplan, rekruttering og samarbeidet mellom skolene.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Trenere</span>
            <strong>{TRENERE.length}</strong>
            <span className="wg-kilde">{TRENERE.filter((t) => t.rolle === 'Sportssjef').length} sportssjefer</span>
          </div>
          <div>
            <span>Kandidater</span>
            <strong>{kandidater.length}</strong>
            <span className="wg-kilde">Inntak 2027/28</span>
          </div>
          <div>
            <span>Ledige plasser</span>
            <strong>{ledige}</strong>
            <span className="wg-kilde">Alle skolene</span>
          </div>
          <div>
            <span>Samtykke</span>
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
            onClick={() => byttFane(f.id)}
            className={`wgf ${fane === f.id ? 'wgf-pa' : ''}`}
          >
            {f.navn}
          </button>
        ))}
      </nav>

      {fane === 'WANG-19' && (
        <section className="wg-seksjon" aria-labelledby="wg-trenere-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-trenere-tittel">Trenere og roller</h2>
            <span className="wg-kilde">To roller: Sportssjef og Trener</span>
          </div>
          <div className="wg-kort wg-rader">
            {TRENERE.map((t) => (
              <div key={t.navn} className="wg-rad">
                <div>
                  <b>{t.navn}</b>
                  <p className="wg-kilde">{t.campus}</p>
                </div>
                <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span className="wg-pille">{t.rolle}</span>
                  <span className="wg-pille wg-pille-ok"><i />Aktiv</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {fane === 'WANG-34' && (
        <section className="wg-seksjon" aria-labelledby="wg-samtykke-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-samtykke-tittel">Samtykke</h2>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-kilde">
              Samtykke per elev vises her når skjermen er koblet til delingssamtykke i basen. Ingen status vises før det, fordi en feil status her er verre enn ingen.
            </p>
            <span><WangIkkeKoblet /></span>
          </div>
        </section>
      )}

      {fane === 'WANG-26' && (
        <section className="wg-seksjon" aria-labelledby="wg-timeplan-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-timeplan-tittel">Faste treningsblokker</h2>
            <span className="wg-kilde">WANG {campus}</span>
          </div>
          <div className="wg-rutenett">
            {BLOKKER.map((b) => (
              <div key={b.tid} className="wg-kort">
                <span className="wg-dato">{b.tid}</span>
                <h3>{b.navn}</h3>
                <p className="wg-kilde">{b.merknad}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {fane === 'WANG-31' && (
        <>
          <section className="wg-seksjon" aria-labelledby="wg-kandidat-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-kandidat-tittel">Kandidater 2027/28</h2>
              <span className="wg-kilde">{kandidater.length} kandidater</span>
            </div>
            <div className="wg-kort wg-saker">
              {kandidater.length === 0 ? (
                <p className="wg-kilde" style={{ padding: '14px 0' }}>Ingen kandidater ennå.</p>
              ) : (
                kandidater.map((k) => (
                  <div key={k.id} className="wg-sak">
                    <span className={`wg-pille ${k.status === 'tilbudt' || k.status === 'takket_ja' ? 'wg-pille-ok' : k.status === 'provespill' || k.status === 'intervju' ? 'wg-pille-vent' : ''}`}>
                      <i />
                      {KANDIDATSTATUS[k.status]}
                    </span>
                    <b>{k.navn} · {k.klubb} · HCP {String(k.handicap).replace('.', ',')}</b>
                    <p>Ønsker {k.onsketCampus}.{k.notat ? ` ${k.notat}` : ''}</p>
                    <div className="wg-knapper">
                      <button type="button" disabled className="wg-btn wg-btn-secondary" style={IKKE_KOBLET_KNAPP_STIL}>Prøvespill</button>
                      <button type="button" disabled className="wg-btn wg-btn-secondary" style={IKKE_KOBLET_KNAPP_STIL}>Intervju</button>
                      <button type="button" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>Tilby plass</button>
                      <WangIkkeKoblet />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="wg-seksjon" aria-labelledby="wg-nykandidat-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-nykandidat-tittel">Legg til kandidat</h2>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="wg-kort wg-fyll">
              <div className="wg-rutenett" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
                <label className="wg-lbl">
                  <span>Navn</span>
                  <input type="text" value={nyttNavn} onChange={(e) => setNyttNavn(e.target.value)} placeholder="Kandidatens navn" className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>Hjemmeklubb</span>
                  <input type="text" value={nyKlubb} onChange={(e) => setNyKlubb(e.target.value)} placeholder="For eksempel Losby GK" className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>HCP</span>
                  <input type="number" step="0.1" inputMode="decimal" value={nyttHcp} onChange={(e) => setNyttHcp(e.target.value)} placeholder="3,2" className="wg-field" />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>Legg til</button>
                <WangIkkeKoblet />
              </div>
            </form>
          </section>
        </>
      )}

      {fane === 'WANG-32' && (
        <section className="wg-seksjon" aria-labelledby="wg-plasser-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-plasser-tittel">Plasser 2026/27</h2>
          </div>
          <div className="wg-kort wg-rader">
            {PLASSER.map((p) => {
              const fullt = p.brukt >= p.totalt;
              return (
                <div key={p.skole} className="wg-rad">
                  <div>
                    <b>{p.skole}</b>
                    <p className="wg-kilde">{fullt ? 'Fullt, venteliste' : `${p.totalt - p.brukt} ledige plasser`}</p>
                  </div>
                  <span className="wg-tall">{p.brukt} / {p.totalt}</span>
                  <div className="wg-stolpe" role="img" aria-label={`${p.brukt} av ${p.totalt} plasser brukt`}>
                    <span style={{ width: `${Math.round((p.brukt / p.totalt) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {fane === 'WANG-33' && (
        <section className="wg-seksjon" aria-labelledby="wg-skolene-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-skolene-tittel">Samarbeid mellom skolene</h2>
          </div>
          <div className="wg-kort wg-saker">
            <p className="wg-kilde" style={{ padding: '14px 0' }}>
              Skolene deler hvem som har snakket med hvem, og når. Innholdet, vurderinger og notater blir hos skolen som eier dem.
            </p>
            {KONTAKTLOGG.map((l) => (
              <div key={l.dato} className="wg-sak">
                <span className="wg-pille"><i />{l.dato}</span>
                <b>{l.parter}</b>
                <p>{l.status}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
