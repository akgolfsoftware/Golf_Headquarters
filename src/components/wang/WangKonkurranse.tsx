'use client';

import React, { useState } from 'react';
import { WangTomTilstand } from './WangIkkeKoblet';
import { visDato, type WangTrenerData, type WangTrenerHendelse } from '@/app/team-wang/_data/wang-trener-data';

interface WangKonkurranseProps {
  data: WangTrenerData;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: 'WANG-10', navn: 'Kalender' },
  { id: 'WANG-11', navn: 'Turnering' },
  { id: 'WANG-09', navn: 'Sesongen' },
  { id: 'WANG-27', navn: 'Samlinger' },
  { id: 'WANG-50', navn: 'Data Golf' },
] as const;

const datoSpenn = (h: WangTrenerHendelse) =>
  h.sluttIso && h.sluttIso !== h.startIso ? `${visDato(h.startIso)}–${visDato(h.sluttIso)}` : visDato(h.startIso);

/**
 * WANG-10/11/09/27/50 Konkurranse for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/konkurranse.html (pakke 5, utkast 1, 14.10.2026).
 * Avvik:
 *   - Turneringer og samlinger kommer fra gruppas kalender. Resultater per elev ligger under «Turneringer per elev». Sesongtall og Data Golf for gruppa er ikke koblet ennå.
 */
export function WangKonkurranse({ data, aktivFane = 'WANG-10', onFaneEndret }: WangKonkurranseProps) {
  const [fane, setFane] = useState(aktivFane);
  const [kalenderFilter, setKalenderFilter] = useState<'kommende' | 'gjennomfort'>('kommende');

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    onFaneEndret?.(nyFane);
  };

  const kommende = data.turneringer.filter((t) => !t.passert);
  const spilt = data.turneringer.filter((t) => t.passert);
  const liste = kalenderFilter === 'kommende' ? kommende : [...spilt].reverse();
  const neste = kommende[0];

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.gruppeNavn}</p>
          <h1 className="wg-tittel">Konkurranse</h1>
          <p className="wg-ingress">
            Turneringer og samlinger. Påmelding skjer hos arrangøren, ikke i appen.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Kommende</span>
            <strong>{kommende.length}</strong>
            <span className="wg-kilde">{neste ? visDato(neste.startIso) : 'Ingen lagt inn'}</span>
          </div>
          <div>
            <span>Spilt</span>
            <strong>{spilt.length}</strong>
            <span className="wg-kilde">I kalenderen</span>
          </div>
          <div>
            <span>Snitt brutto</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div>
            <span>Samlinger</span>
            <strong>{data.samlinger.length}</strong>
            <span className="wg-kilde">I kalenderen</span>
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

      {fane === 'WANG-10' && (
        <section className="wg-seksjon" aria-labelledby="wg-kalender-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-kalender-tittel">Turneringskalender</h2>
          </div>
          <div className="wg-filter" role="group" aria-label="Filter">
            <button type="button" aria-pressed={kalenderFilter === 'kommende'} onClick={() => setKalenderFilter('kommende')} className={`wg-chip ${kalenderFilter === 'kommende' ? 'wg-chip-pa' : ''}`}>
              Kommende ({kommende.length})
            </button>
            <button type="button" aria-pressed={kalenderFilter === 'gjennomfort'} onClick={() => setKalenderFilter('gjennomfort')} className={`wg-chip ${kalenderFilter === 'gjennomfort' ? 'wg-chip-pa' : ''}`}>
              Spilt ({spilt.length})
            </button>
          </div>
          <div className="wg-kort wg-saker">
            {liste.length === 0 ? (
              <p className="wg-kilde" style={{ padding: '14px 0' }}>Ingen turneringer her ennå.</p>
            ) : (
              liste.map((t) => (
                <div key={t.id} className="wg-sak">
                  <span className={`wg-pille ${t.passert ? 'wg-pille-ok' : 'wg-pille-vent'}`}>
                    <i />
                    {t.passert ? 'Spilt' : 'Kommende'}
                  </span>
                  <b>{t.tittel}</b>
                  <p>{datoSpenn(t)}{t.sted ? ` · ${t.sted}` : ''}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {fane === 'WANG-11' && (
        <section className="wg-seksjon" aria-labelledby="wg-turnering-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-turnering-tittel">Resultater</h2>
          </div>
          <WangTomTilstand
            tittel="Resultater per elev"
            tekst="Brutto resultater fra turneringene ligger under «Turneringer per elev» over. Runderapport fra treneren er ikke koblet ennå."
          />
        </section>
      )}

      {fane === 'WANG-09' && (
        <section className="wg-seksjon" aria-labelledby="wg-sesong-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-sesong-tittel">Sesongen</h2>
          </div>
          <WangTomTilstand
            tittel="Ikke koblet ennå"
            tekst="Snitt brutto, GIR, fairway og putter for gruppa vises når rundene er koblet til WANG-gruppa."
          />
        </section>
      )}

      {fane === 'WANG-27' && (
        <section className="wg-seksjon" aria-labelledby="wg-samling-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-samling-tittel">Samlinger og leir</h2>
            <span className="wg-kilde">Fra gruppas kalender</span>
          </div>
          {data.samlinger.length === 0 ? (
            <WangTomTilstand tittel="Ingen samlinger" tekst="Gruppa har ingen samlinger i kalenderen ennå." />
          ) : (
            <div className="wg-rutenett">
              {data.samlinger.map((s) => (
                <div key={s.id} className="wg-kort">
                  <span className="wg-dato">{datoSpenn(s)}</span>
                  <h3>{s.tittel}</h3>
                  {s.sted ? <p className="wg-kilde">{s.sted}</p> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {fane === 'WANG-50' && (
        <section className="wg-seksjon" aria-labelledby="wg-dg-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-dg-tittel">Data Golf</h2>
            <span className="wg-kilde">Bare for trenere</span>
          </div>
          <WangTomTilstand
            tittel="Ikke koblet ennå"
            tekst="Strokes Gained for gruppa vises her når Data Golf-skjermene for WANG er bygget."
          />
        </section>
      )}
    </>
  );
}
