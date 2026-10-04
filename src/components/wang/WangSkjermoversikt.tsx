'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WANG_SKJERMER_KATALOG } from './wang-data';

interface WangSkjermoversiktProps {
  onNaviger?: (omraade: string, fane?: string) => void;
  _aktivRolle?: 'Trener' | 'Sportssjef';
}

export function WangSkjermoversikt({
  onNaviger,
  _aktivRolle = 'Sportssjef',
}: WangSkjermoversiktProps) {
  const [sokeord, setSokeord] = useState('');
  const [valgtOmraade, setValgtOmraade] = useState('alle');
  const [rolleFilter, setRolleFilter] = useState<'alle' | 'Trener' | 'Sportssjef'>('alle');

  const omraadeListe = [
    { id: 'alle', navn: 'Alle områder' },
    { id: 'idag', navn: 'I dag' },
    { id: 'trening', navn: 'Trening' },
    { id: 'tester', navn: 'Tester' },
    { id: 'konkurranse', navn: 'Konkurranse' },
    { id: 'meldinger', navn: 'Meldinger' },
    { id: 'elever', navn: 'Elever' },
    { id: 'admin', navn: 'Administrasjon' },
    { id: 'system', navn: 'System & Fellesside' },
  ];

  const filtrerteSkjermer = WANG_SKJERMER_KATALOG.filter((s) => {
    if (valgtOmraade !== 'alle' && s.omraade !== valgtOmraade) return false;
    if (rolleFilter !== 'alle' && !s.roller.includes(rolleFilter)) return false;
    if (
      sokeord &&
      !s.id.toLowerCase().includes(sokeord.toLowerCase()) &&
      !s.navn.toLowerCase().includes(sokeord.toLowerCase()) &&
      !(s.beskrivelse || '').toLowerCase().includes(sokeord.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
          WANG-00 · Komplett skjermregister for WANG Toppidrett Golf
        </p>
        <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
          Skjermoversikt ({WANG_SKJERMER_KATALOG.length} skjermer)
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#5B7793' }}>
          Offisiell implementert oversikt over alle skjermer og funksjoner i WANG-modulen under AK Golf HQ.
        </p>
      </div>

      {/* Søk og filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          value={sokeord}
          onChange={(e) => setSokeord(e.target.value)}
          placeholder="Søk på skjerm-ID eller navn (f.eks. WANG-44, IUP, tester)..."
          style={{
            minHeight: '44px',
            flex: '1 1 260px',
            padding: '0 14px',
            border: '1px solid #D2D2D2',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif',
          }}
        />
        <select
          value={valgtOmraade}
          onChange={(e) => setValgtOmraade(e.target.value)}
          style={{
            minHeight: '44px',
            padding: '0 14px',
            border: '1px solid #D2D2D2',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {omraadeListe.map((o) => (
            <option key={o.id} value={o.id}>{o.navn}</option>
          ))}
        </select>
        <select
          value={rolleFilter}
          onChange={(e) => setRolleFilter(e.target.value as 'alle' | 'Trener' | 'Sportssjef')}
          style={{
            minHeight: '44px',
            padding: '0 14px',
            border: '1px solid #D2D2D2',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <option value="alle">Alle roller</option>
          <option value="Trener">Kun Trener</option>
          <option value="Sportssjef">Kun Sportssjef</option>
        </select>
      </div>

      {/* Skjermliste */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1.5fr 1fr 140px 120px',
            padding: '12px 16px',
            background: '#F2F5F8',
            fontWeight: 600,
            fontSize: '12px',
            color: '#5B7793',
          }}
        >
          <span>ID</span>
          <span>Navn & Funksjon</span>
          <span>Område</span>
          <span>Roller</span>
          <span>Handling</span>
        </div>

        {filtrerteSkjermer.map((s, idx) => (
          <div
            key={s.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1.5fr 1fr 140px 120px',
              padding: '16px',
              borderTop: idx > 0 ? '1px solid #E6E8EA' : 'none',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#17446F',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {s.id}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#17446F' }}>{s.navn}</div>
              <div style={{ fontSize: '12px', color: '#5B7793' }}>{s.beskrivelse}</div>
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#E6E8EA',
                  color: '#17446F',
                  fontSize: '12px',
                  textTransform: 'capitalize',
                }}
              >
                {s.omraade}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#5B7793' }}>
              {s.roller.join(', ')}
            </div>
            <div>
              {onNaviger ? (
                <button
                  onClick={() => onNaviger(s.omraade, s.fane)}
                  style={{
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #17446F',
                    background: '#FFFFFF',
                    color: '#17446F',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Åpne skjerm
                </button>
              ) : (
                <Link
                  href={`/team-wang/coach?omraade=${s.omraade}&fane=${s.fane}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #17446F',
                    background: '#FFFFFF',
                    color: '#17446F',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Åpne skjerm
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
