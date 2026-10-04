'use client';

import React, { useState } from 'react';
import {
  WANG_TURNERINGER,
  WANG_ELEVER,
} from './wang-data';
import { formaterTall } from '@/lib/format-tall';

interface WangKonkurranseProps {
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

export function WangKonkurranse({
  aktivFane = 'WANG-10',
  onFaneEndret,
  campus = 'Fredrikstad',
}: WangKonkurranseProps) {
  const [fane, setFane] = useState(aktivFane);
  const [kalenderFilter, setKalenderFilter] = useState<'kommende' | 'gjennomfort'>('kommende');
  const [valgtTurneringId, setValgtTurneringId] = useState<string>(WANG_TURNERINGER[0]?.id || 't1');
  const [pipelineSistSynket, setPipelineSistSynket] = useState<string>('I dag 08:30');
  const [synkMelding, setSynkMelding] = useState<string | null>(null);

  // Turneringsrapportering tilstand
  const [rapportElevId, setRapportElevId] = useState<string>('sofie');
  const [rapportRunde, setRapportRunde] = useState<string>('1');
  const [rapportScore, setRapportScore] = useState<string>('71');
  const [rapportFairway, setRapportFairway] = useState<string>('10');
  const [rapportGir, setRapportGir] = useState<string>('12');
  const [rapportPutter, setRapportPutter] = useState<string>('29');
  const [rapportNotat, setRapportNotat] = useState<string>('');
  const [rapportKvittering, setRapportKvittering] = useState<string | null>(null);

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const gjeldendeTurnering = WANG_TURNERINGER.find((t) => t.id === valgtTurneringId) || WANG_TURNERINGER[0];
  const kommendeTurneringer = WANG_TURNERINGER.filter((t) => t.status === 'kommende');
  const gjennomforteTurneringer = WANG_TURNERINGER.filter((t) => t.status === 'gjennomfort');

  const synkPipeline = () => {
    setPipelineSistSynket('Akkurat nå');
    setSynkMelding('Resultater og starttider er oppdatert fra AK Golf Pipeline og GolfBox.');
    setTimeout(() => setSynkMelding(null), 4000);
  };

  const lagreRapport = (e: React.FormEvent) => {
    e.preventDefault();
    setRapportKvittering(`Rapport lagret for ${WANG_ELEVER.find((el) => el.id === rapportElevId)?.navn || 'elev'} (Runde ${rapportRunde}, Brutto ${rapportScore}).`);
    setTimeout(() => setRapportKvittering(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Fanevelger */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E6E8EA', paddingBottom: '12px' }}>
        {[
          { id: 'WANG-10', navn: 'Kalender (WANG-10)' },
          { id: 'WANG-11', navn: 'Rapportering (WANG-11)' },
          { id: 'WANG-09', navn: 'Analyse (WANG-09)' },
          { id: 'WANG-27', navn: 'Samlinger og leir (WANG-27)' },
          { id: 'WANG-50', navn: 'DataGolf (WANG-50)' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => byttFane(f.id)}
            style={{
              minHeight: '44px',
              padding: '0 16px',
              borderRadius: '999px',
              border: fane === f.id ? '1px solid #17446F' : '1px solid #D2D2D2',
              background: fane === f.id ? '#17446F' : '#FFFFFF',
              color: fane === f.id ? '#FFFFFF' : '#17446F',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {f.navn}
          </button>
        ))}
      </div>

      {synkMelding && (
        <div style={{ padding: '12px 16px', background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', color: '#1B5E57', fontSize: '14px' }}>
          {synkMelding}
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-10: Turneringskalender                                */}
      {/* ========================================================== */}
      {fane === 'WANG-10' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
                WANG-10 · WANG {campus} · Sesong 2026
              </p>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
                Turneringskalender
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#5B7793' }}>Pipeline: {pipelineSistSynket}</span>
              <button
                onClick={synkPipeline}
                style={{
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '6px',
                  border: '1px solid #D2D2D2',
                  background: '#FFFFFF',
                  color: '#17446F',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hent resultater
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setKalenderFilter('kommende')}
              style={{
                minHeight: '44px',
                padding: '0 16px',
                border: '1px solid #D2D2D2',
                borderRadius: '6px 0 0 6px',
                background: kalenderFilter === 'kommende' ? '#17446F' : '#FFFFFF',
                color: kalenderFilter === 'kommende' ? '#FFFFFF' : '#17446F',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Kommende ({kommendeTurneringer.length})
            </button>
            <button
              onClick={() => setKalenderFilter('gjennomfort')}
              style={{
                minHeight: '44px',
                padding: '0 16px',
                border: '1px solid #D2D2D2',
                borderLeft: 'none',
                borderRadius: '0 6px 6px 0',
                background: kalenderFilter === 'gjennomfort' ? '#17446F' : '#FFFFFF',
                color: kalenderFilter === 'gjennomfort' ? '#FFFFFF' : '#17446F',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Gjennomført ({gjennomforteTurneringer.length})
            </button>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 1fr 120px 100px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Dato</span>
              <span>Turnering og bane</span>
              <span>Kategori</span>
              <span>Påmeldte elever</span>
              <span>Handling</span>
            </div>
            {(kalenderFilter === 'kommende' ? kommendeTurneringer : gjennomforteTurneringer).map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1.5fr 1fr 120px 100px',
                  padding: '16px',
                  borderTop: '1px solid #E6E8EA',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
              >
                <span style={{ fontWeight: 500, color: '#17446F' }}>{t.dato}</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#17446F' }}>{t.navn}</div>
                  <div style={{ fontSize: '12px', color: '#5B7793' }}>{t.bane} · Par {t.par}</div>
                </div>
                <div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#E6E8EA', fontSize: '12px', color: '#17446F' }}>
                    {t.serie}
                  </span>
                </div>
                <span style={{ fontWeight: 600, color: '#17446F' }}>
                  {t.pamelteElever.length} elever
                </span>
                <button
                  onClick={() => {
                    setValgtTurneringId(t.id);
                    byttFane('WANG-11');
                  }}
                  style={{
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #17446F',
                    background: '#FFFFFF',
                    color: '#17446F',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Vis detaljer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-11: Turneringsrapportering                            */}
      {/* ========================================================== */}
      {fane === 'WANG-11' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
                WANG-11 · Turneringsrapportering · {gjeldendeTurnering.serie}
              </p>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
                {gjeldendeTurnering.navn}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5B7793' }}>
                {gjeldendeTurnering.bane} · Par {gjeldendeTurnering.par} · {gjeldendeTurnering.dato}
              </p>
            </div>
            <button
              onClick={() => byttFane('WANG-10')}
              style={{
                minHeight: '44px',
                padding: '0 16px',
                border: '1px solid #D2D2D2',
                borderRadius: '6px',
                background: '#FFFFFF',
                color: '#17446F',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Tilbake til kalender
            </button>
          </div>

          {rapportKvittering && (
            <div style={{ padding: '12px 16px', background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', color: '#1B5E57', fontSize: '14px' }}>
              {rapportKvittering}
            </div>
          )}

          {/* Registrering av treners rapport */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#17446F' }}>
              Registrer rundeoppfølging for elev (WANG-notat)
            </h3>
            <form onSubmit={lagreRapport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Elev
                  <select
                    value={rapportElevId}
                    onChange={(e) => setRapportElevId(e.target.value)}
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  >
                    {WANG_ELEVER.map((el) => (
                      <option key={el.id} value={el.id}>{el.navn} ({el.campus})</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Runde
                  <select
                    value={rapportRunde}
                    onChange={(e) => setRapportRunde(e.target.value)}
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  >
                    <option value="1">Runde 1</option>
                    <option value="2">Runde 2</option>
                    <option value="3">Runde 3</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Brutto score
                  <input
                    type="number"
                    value={rapportScore}
                    onChange={(e) => setRapportScore(e.target.value)}
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Fairway treff
                  <input
                    type="number"
                    value={rapportFairway}
                    onChange={(e) => setRapportFairway(e.target.value)}
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  GIR (Greens in reg)
                  <input
                    type="number"
                    value={rapportGir}
                    onChange={(e) => setRapportGir(e.target.value)}
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Antall putter
                  <input
                    type="number"
                    value={rapportPutter}
                    onChange={(e) => setRapportPutter(e.target.value)}
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                Trenerens observasjoner og læringsmomenter
                <textarea
                  value={rapportNotat}
                  onChange={(e) => setRapportNotat(e.target.value)}
                  placeholder="Hva fungerte bra? Hva skal eleven ta med seg inn i treningsuka?"
                  rows={3}
                  style={{ padding: '10px 12px', border: '1px solid #D2D2D2', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </label>
              <button
                type="submit"
                style={{
                  alignSelf: 'flex-start',
                  minHeight: '44px',
                  padding: '0 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2E857D',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Lagre runderapport
              </button>
            </form>
          </div>

          {/* Offisiell resultatliste */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', background: '#F2F5F8', borderBottom: '1px solid #E6E8EA' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#17446F' }}>Offisiell resultatliste for WANG-elever</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#5B7793' }}>Alltid brutto score ifølge AK Golf-standard</p>
            </div>
            {gjeldendeTurnering.resultater && gjeldendeTurnering.resultater.length > 0 ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 100px 100px', padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: '#5B7793', borderBottom: '1px solid #E6E8EA' }}>
                  <span>Plass</span>
                  <span>Elev</span>
                  <span>Runder</span>
                  <span>Total brutto</span>
                  <span>Til par</span>
                </div>
                {gjeldendeTurnering.resultater.map((res, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 100px 100px', padding: '14px 16px', borderTop: idx > 0 ? '1px solid #E6E8EA' : 'none', alignItems: 'center', fontSize: '14px' }}>
                    <span style={{ fontWeight: 600, color: '#17446F' }}>#{res.plassering}</span>
                    <span style={{ fontWeight: 500, color: '#17446F' }}>{res.elevNavn}</span>
                    <span style={{ color: '#5B7793' }}>{res.runder.join(' · ')}</span>
                    <span style={{ fontWeight: 700, color: '#17446F' }}>{res.totalScore}</span>
                    <span style={{ fontWeight: 600, color: res.tilPar.startsWith('-') ? '#2E857D' : '#17446F' }}>{res.tilPar}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#5B7793', fontSize: '14px' }}>
                Turneringen er ikke spilt ennå. Resultater hentes automatisk når turneringen er ferdigspilt.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-09: Turneringsanalyse                                 */}
      {/* ========================================================== */}
      {fane === 'WANG-09' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-09 · Turneringsanalyse og feltstatistikk
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Turneringsanalyse
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793', textTransform: 'uppercase' }}>Gj.snitt Brutto Score</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#17446F', margin: '8px 0 4px' }}>72.8</div>
              <div style={{ fontSize: '12px', color: '#2E857D' }}>-1.2 slag bedring fra forrige sesong</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793', textTransform: 'uppercase' }}>Greens in Regulation (GIR)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#17446F', margin: '8px 0 4px' }}>68.4%</div>
              <div style={{ fontSize: '12px', color: '#5B7793' }}>12.3 av 18 greener</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793', textTransform: 'uppercase' }}>Fairway-treff</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#17446F', margin: '8px 0 4px' }}>64.1%</div>
              <div style={{ fontSize: '12px', color: '#5B7793' }}>9.0 av 14 fairways</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793', textTransform: 'uppercase' }}>Putter per runde</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#17446F', margin: '8px 0 4px' }}>29.6</div>
              <div style={{ fontSize: '12px', color: '#2E857D' }}>1.76 putter per GIR</div>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', background: '#F2F5F8', borderBottom: '1px solid #E6E8EA' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#17446F' }}>Feltanalyse per elev · Sesong 2026</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 100px 100px 100px', padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: '#5B7793', borderBottom: '1px solid #E6E8EA' }}>
              <span>Elev</span>
              <span>Runder</span>
              <span>Snitt Brutto</span>
              <span>Fairway %</span>
              <span>GIR %</span>
              <span>Putter</span>
            </div>
            {WANG_ELEVER.map((el, i) => (
              <div key={el.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 100px 100px 100px', padding: '14px 16px', borderTop: i > 0 ? '1px solid #E6E8EA' : 'none', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{el.navn}</span>
                <span style={{ color: '#5B7793' }}>14</span>
                <span style={{ fontWeight: 700, color: '#17446F' }}>{formaterTall(71.5 + i * 0.8, 1)}</span>
                <span style={{ color: '#17446F' }}>{68 - i * 2}%</span>
                <span style={{ color: '#17446F' }}>{formaterTall(Math.round(72 - i * 2.5), 0)}%</span>
                <span style={{ color: '#17446F' }}>{formaterTall(28.8 + i * 0.4, 1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-27: Samlingsplan og leir                              */}
      {/* ========================================================== */}
      {fane === 'WANG-27' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-27 · Samlingsplan og treningsleir 2026/2027
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Samlinger og treningsleir
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#E3F5EC', color: '#1B5E57', fontSize: '12px', fontWeight: 600 }}>
                    Høstsamling
                  </span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '18px', color: '#17446F' }}>Oslo Golfklubb Bogstad</h3>
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#5B7793' }}>14.–17. oktober 2026</span>
              </div>
              <p style={{ fontSize: '14px', color: '#5B7793', margin: '0 0 16px' }}>
                Fokus på svingkapasitet mot vintersesong, TrackMan-kalibrering og nærspillstester.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ fontWeight: 500, color: '#17446F' }}>12 elever påmeldt</span>
                <span style={{ color: '#2E857D', fontWeight: 600 }}>Ansvarlig: Anders K.</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#F2F5F8', color: '#17446F', fontSize: '12px', fontWeight: 600 }}>
                    Vinterleir
                  </span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '18px', color: '#17446F' }}>Marbella, Spania (La Quinta)</h3>
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#5B7793' }}>18.–26. februar 2027</span>
              </div>
              <p style={{ fontSize: '14px', color: '#5B7793', margin: '0 0 16px' }}>
                Sesongoppkjøring på gress. Banestrategi, spilltrening 18 hull daglig og fysisk oppfølging.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ fontWeight: 500, color: '#17446F' }}>16 elever påmeldt</span>
                <span style={{ color: '#2E857D', fontWeight: 600 }}>Ansvarlig: Jørn / Niklas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-50: DataGolf                                          */}
      {/* ========================================================== */}
      {fane === 'WANG-50' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-50 · DataGolf Benchmarking & Strokes Gained
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              DataGolf Modellanalyse
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#17446F' }}>
              Strokes Gained Benchmark mot NCAA Division 1 & DP World Tour
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#5B7793' }}>
              Sammenligning av WANG-elevenes nøkkeltall mot referansenivåer fra DataGolf.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>SG Off-The-Tee</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>+0.42</div>
                <div style={{ fontSize: '12px', color: '#2E857D' }}>College D1 snitt: +0.25</div>
              </div>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>SG Approach</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>+0.18</div>
                <div style={{ fontSize: '12px', color: '#5B7793' }}>College D1 snitt: +0.30</div>
              </div>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>SG Around-The-Green</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>+0.05</div>
                <div style={{ fontSize: '12px', color: '#5B7793' }}>College D1 snitt: +0.10</div>
              </div>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>SG Putting</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>+0.22</div>
                <div style={{ fontSize: '12px', color: '#2E857D' }}>College D1 snitt: +0.12</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
