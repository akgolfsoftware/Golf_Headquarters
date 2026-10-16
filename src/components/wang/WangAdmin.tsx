'use client';

import React, { useState } from 'react';
import { WangTomTilstand } from './WangIkkeKoblet';
import type { WangTrenerData } from '@/app/team-wang/_data/wang-trener-data';

interface WangAdminProps {
  data: WangTrenerData;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: 'WANG-19', navn: 'Trenere og roller' },
  { id: 'WANG-34', navn: 'Samtykke' },
  { id: 'WANG-26', navn: 'Timeplan' },
  { id: 'WANG-31', navn: 'Rekruttering' },
  { id: 'WANG-32', navn: 'Plasser' },
  { id: 'WANG-33', navn: 'Skolene' },
] as const;

const TOM: Record<string, { tittel: string; tekst: string }> = {
  'WANG-34': { tittel: 'Ikke koblet ennå', tekst: 'Samtykkeoversikten kobles til elevenes delingssamtykke.' },
  'WANG-31': { tittel: 'Ingen kandidater', tekst: 'Rekrutteringen har ingen kandidater lagret i basen ennå.' },
  'WANG-32': { tittel: 'Ikke koblet ennå', tekst: 'Plasser per skole er ikke lagret i basen ennå.' },
  'WANG-33': { tittel: 'Ikke koblet ennå', tekst: 'Felles side for skolene krever stjernemerking og kontaktlogg, som ikke finnes i basen ennå.' },
};

/**
 * WANG-19/34/26/31/32/33 Administrasjon, bare for sportssjef.
 * Fasit: docs/design-system/utkast-wang/administrasjon.html (pakke 8, utkast 1, 14.10.2026).
 * Avvik:
 *   - Trenere og timeplan kommer fra gruppa. Resten er ikke koblet ennå.
 */
export function WangAdmin({ data, aktivFane = 'WANG-19', onFaneEndret }: WangAdminProps) {
  const [fane, setFane] = useState(aktivFane);

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    onFaneEndret?.(nyFane);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.gruppeNavn} · bare sportssjef</p>
          <h1 className="wg-tittel">Administrasjon</h1>
          <p className="wg-ingress">Trenere og roller, samtykke, timeplan, rekruttering og samarbeidet mellom skolene.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Trenere</span>
            <strong>{data.trenere.length}</strong>
            <span className="wg-kilde">I gruppa</span>
          </div>
          <div>
            <span>Faste økter</span>
            <strong>{data.fasteOkter.length}</strong>
            <span className="wg-kilde">Per uke</span>
          </div>
          <div>
            <span>Ledige plasser</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
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
            <span className="wg-kilde">Fra gruppa</span>
          </div>
          <div className="wg-kort wg-rader">
            {data.trenere.length === 0 ? (
              <p className="wg-kilde" style={{ padding: '14px 0' }}>Ingen trenere er lagt inn i gruppa.</p>
            ) : (
              data.trenere.map((t) => (
                <div key={t.id} className="wg-rad">
                  <div><b>{t.navn}</b></div>
                  <span className="wg-pille">{t.rolle}</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {fane === 'WANG-26' && (
        <section className="wg-seksjon" aria-labelledby="wg-timeplan-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-timeplan-tittel">Faste treningsblokker</h2>
            <span className="wg-kilde">Fra gruppas kalender</span>
          </div>
          <div className="wg-kort wg-rader">
            {data.fasteOkter.length === 0 ? (
              <p className="wg-kilde" style={{ padding: '14px 0' }}>Gruppa har ingen ukentlige økter i kalenderen ennå.</p>
            ) : (
              data.fasteOkter.map((o) => (
                <div key={`${o.dag}-${o.tid}-${o.tittel}`} className="wg-rad">
                  <div>
                    <b>{o.tittel}</b>
                    <p className="wg-kilde">{o.dag} {o.tid}{o.sted ? ` · ${o.sted}` : ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {TOM[fane] ? <WangTomTilstand {...TOM[fane]} /> : null}
    </>
  );
}
