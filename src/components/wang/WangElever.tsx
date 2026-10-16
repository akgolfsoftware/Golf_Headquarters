'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WangTomTilstand } from './WangIkkeKoblet';
import type { WangTrenerData } from '@/app/team-wang/_data/wang-trener-data';

interface WangEleverProps {
  data: WangTrenerData;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: 'WANG-07', navn: 'Elever' },
  { id: 'WANG-44', navn: 'IUP' },
  { id: 'WANG-45', navn: 'Fireukerssjekk' },
  { id: 'WANG-46', navn: 'Forslag' },
  { id: 'WANG-05', navn: 'Skole og fravær' },
  { id: 'WG-04', navn: 'Prøveplan' },
  { id: 'WG-05', navn: 'Trenerflate' },
  { id: 'WANG-47', navn: 'Skjema og kilder' },
  { id: 'WANG-20', navn: 'Inviter elev' },
] as const;

const TOM: Record<string, { tittel: string; tekst: string }> = {
  'WANG-44': { tittel: 'Velg eleven', tekst: 'IUP-en åpnes fra «IUP per elev» over. Du ser bare det eleven har delt med deg.' },
  'WANG-45': { tittel: 'Ikke koblet ennå', tekst: 'Fireukerssjekken vises her når elevene har svart i PlayerHQ og delt med deg.' },
  'WANG-46': { tittel: 'Ikke koblet ennå', tekst: 'Forslag til elevens plan sendes fra trenerflaten når forslagene er koblet.' },
  'WANG-05': { tittel: 'Ikke koblet ennå', tekst: 'Skolefravær og godkjent idrettsfravær er ikke koblet til WANG-gruppa.' },
  'WG-04': { tittel: 'Ikke koblet ennå', tekst: 'Prøveplanen fra skolen er ikke koblet til WANG-gruppa.' },
  'WG-05': { tittel: 'Ikke koblet ennå', tekst: 'Hvilke elever hver trener har ansvar for, er ikke lagret i basen ennå.' },
  'WANG-47': { tittel: 'Ikke koblet ennå', tekst: 'Versjon av IUP-skjema, testbatteri og Data Golf-kobling vises her når de er koblet.' },
  'WANG-20': { tittel: 'Ikke koblet ennå', tekst: 'Invitasjon til PlayerHQ fra WANG venter til delingen virker.' },
};

/**
 * WANG-07/44/45 Elever for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/elever.html (pakke 7, utkast 1, 14.10.2026).
 * Avvik:
 *   - Elevlista kommer fra gruppa. IUP og turneringer åpnes per elev, med tilgangssjekk på hver målside. Resten er ikke koblet ennå.
 */
export function WangElever({ data, aktivFane = 'WANG-07', onFaneEndret }: WangEleverProps) {
  const [fane, setFane] = useState(aktivFane);
  const [sokeord, setSokeord] = useState('');

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    onFaneEndret?.(nyFane);
  };

  const filtrerte = data.elever.filter((e) => !sokeord || e.navn.toLowerCase().includes(sokeord.toLowerCase()));

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">{data.gruppeNavn} · elevene</p>
          <h1 className="wg-tittel">Elever</h1>
          <p className="wg-ingress">IUP, fireukerssjekk og skole for hver elev. Du ser bare det eleven har delt med deg.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Elever</span>
            <strong>{data.elever.length}</strong>
            <span className="wg-kilde">I gruppa</span>
          </div>
          <div>
            <span>Har delt</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div>
            <span>Under 85 %</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div>
            <span>Neste prøve</span>
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

      {fane === 'WANG-07' ? (
        <section className="wg-seksjon" aria-labelledby="wg-elever-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-elever-tittel">Alle elever</h2>
            <span className="wg-kilde">{filtrerte.length} av {data.elever.length}</span>
          </div>
          <label className="wg-lbl">
            <span>Søk</span>
            <input type="search" value={sokeord} onChange={(e) => setSokeord(e.target.value)} placeholder="Elevens navn" className="wg-field" />
          </label>
          <div className="wg-kort wg-rader">
            {filtrerte.length === 0 ? (
              <p className="wg-kilde" style={{ padding: '14px 0' }}>
                {data.elever.length === 0 ? 'Ingen elever i gruppa.' : 'Ingen elever passer søket.'}
              </p>
            ) : (
              filtrerte.map((e) => (
                <div key={e.id} className="wg-rad">
                  <div style={{ minWidth: 0 }}>
                    <b>{e.navn}</b>
                  </div>
                  <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link href={`/team-wang/coach/iup/${e.id}`} className="wg-btn wg-btn-secondary">IUP</Link>
                    <Link href={`/team-wang/coach/turneringer/${e.id}`} className="wg-btn wg-btn-ghost">Turneringer</Link>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        <WangTomTilstand {...(TOM[fane] ?? TOM['WANG-45'])} />
      )}
    </>
  );
}
