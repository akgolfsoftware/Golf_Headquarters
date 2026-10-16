'use client';

import React, { useState } from 'react';
import { WangTomTilstand } from './WangIkkeKoblet';
import type { WangTrenerData } from '@/app/team-wang/_data/wang-trener-data';

interface WangMeldingerProps {
  data: WangTrenerData;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: 'WANG-13', navn: 'Gruppeposter' },
  { id: 'WANG-14', navn: 'Til elev' },
  { id: 'WANG-15', navn: 'Foresatte' },
  { id: 'WANG-21', navn: 'Dokumenter' },
] as const;

const TOM_TEKST: Record<string, string> = {
  'WANG-13': 'Gruppeposter til WANG-gruppa er ikke koblet ennå.',
  'WANG-14': 'Meldinger til enkeltelever er ikke koblet ennå. Foresatte til elever under 18 skal lese samtalen.',
  'WANG-15': 'Meldinger til foresatte er ikke koblet ennå.',
  'WANG-21': 'Dokumentarkivet for gruppa er ikke koblet ennå.',
};

/**
 * WANG-13/14/15/21 Meldinger for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/meldinger.html (pakke 6, utkast 1, 14.10.2026).
 * Avvik:
 *   - Basen har ingen meldinger eller dokumenter for WANG-gruppa ennå, så alle fanene viser tom tilstand.
 */
export function WangMeldinger({ data, aktivFane = 'WANG-13', onFaneEndret }: WangMeldingerProps) {
  const [fane, setFane] = useState(aktivFane);

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    onFaneEndret?.(nyFane);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.gruppeNavn} · post</p>
          <h1 className="wg-tittel">Meldinger</h1>
          <p className="wg-ingress">
            Gruppeposter, meldinger til elever og foresatte, og dokumentene gruppa bruker.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div><span>Gruppeposter</span><strong>—</strong><span className="wg-kilde">Ikke koblet ennå</span></div>
          <div><span>Til elever</span><strong>—</strong><span className="wg-kilde">Ikke koblet ennå</span></div>
          <div><span>Til foresatte</span><strong>—</strong><span className="wg-kilde">Ikke koblet ennå</span></div>
          <div><span>Uleste svar</span><strong>—</strong><span className="wg-kilde">Ikke koblet ennå</span></div>
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

      <WangTomTilstand tittel="Ingen meldinger ennå" tekst={TOM_TEKST[fane] ?? TOM_TEKST['WANG-13']} />
    </>
  );
}
