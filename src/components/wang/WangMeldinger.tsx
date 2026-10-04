'use client';

import React, { useState } from 'react';
import {
  WANG_MELDINGER,
  WANG_ELEVER,
  type WangMelding,
} from './wang-data';

interface WangMeldingerProps {
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

export function WangMeldinger({
  aktivFane = 'WANG-13',
  onFaneEndret,
  campus = 'Fredrikstad',
}: WangMeldingerProps) {
  const [fane, setFane] = useState(aktivFane);
  const [meldinger, setMeldinger] = useState<WangMelding[]>(WANG_MELDINGER);

  // Ny gruppepost tilstand
  const [nyTittel, setNyTittel] = useState('');
  const [nyttInnhold, setNyttInnhold] = useState('');
  const mottakerType: 'gruppe' | 'elev' | 'forelder' = fane === 'WANG-13' ? 'gruppe' : fane === 'WANG-14' ? 'elev' : 'forelder';
  const [nyMottakerNavn, setNyMottakerNavn] = useState('VG1 Golf ' + campus);
  const [sendtKvittering, setSendtKvittering] = useState<string | null>(null);

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const sendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nyTittel.trim() || !nyttInnhold.trim()) return;

    const ny: WangMelding = {
      id: 'm-' + Date.now(),
      avsender: 'Anders Kristiansen',
      rolle: 'Sportssjef',
      mottakerType: mottakerType,
      mottakerNavn: nyMottakerNavn,
      tittel: nyTittel,
      innhold: nyttInnhold,
      opprettetDato: 'Akkurat nå',
      status: 'publisert',
      lestAvAntall: 0,
      totaltMottakere: mottakerType === 'gruppe' ? 6 : 1,
    };

    setMeldinger([ny, ...meldinger]);
    setNyTittel('');
    setNyttInnhold('');
    setSendtKvittering(`Melding "${ny.tittel}" er publisert til ${ny.mottakerNavn}.`);
    setTimeout(() => setSendtKvittering(null), 5000);
  };

  const synligeMeldinger = meldinger.filter((m) => {
    if (fane === 'WANG-13') return m.mottakerType === 'gruppe';
    if (fane === 'WANG-14') return m.mottakerType === 'elev';
    if (fane === 'WANG-15') return m.mottakerType === 'forelder';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Fanevelger */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E6E8EA', paddingBottom: '12px' }}>
        {[
          { id: 'WANG-13', navn: 'Gruppeposter (WANG-13)' },
          { id: 'WANG-14', navn: 'Post til elev (WANG-14)' },
          { id: 'WANG-15', navn: 'Foreldremøte og foresatte (WANG-15)' },
          { id: 'WANG-21', navn: 'Dokumenter og maler (WANG-21)' },
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

      {sendtKvittering && (
        <div style={{ padding: '12px 16px', background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', color: '#1B5E57', fontSize: '14px' }}>
          {sendtKvittering}
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-13 / WANG-14 / WANG-15 Felles oppretting og liste     */}
      {/* ========================================================== */}
      {fane !== 'WANG-21' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
                {fane === 'WANG-13' && 'WANG-13 · Gruppebeskjeder og fellessending'}
                {fane === 'WANG-14' && 'WANG-14 · Individuell oppfølging og tilbakemelding'}
                {fane === 'WANG-15' && 'WANG-15 · Foresattkontakt og møteinnkallinger'}
              </p>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
                {fane === 'WANG-13' && 'Gruppeposter'}
                {fane === 'WANG-14' && 'Post til elev'}
                {fane === 'WANG-15' && 'Foreldremøte og foresatte'}
              </h2>
            </div>
          </div>

          {/* Opprett ny melding */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#17446F' }}>
              {fane === 'WANG-13' && 'Opprett ny gruppepost'}
              {fane === 'WANG-14' && 'Skriv melding til elev'}
              {fane === 'WANG-15' && 'Opprett innkalling / melding til foresatte'}
            </h3>
            <form onSubmit={sendPost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Mottaker
                  {fane === 'WANG-13' && (
                    <select
                      value={nyMottakerNavn}
                      onChange={(e) => setNyMottakerNavn(e.target.value)}
                      style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                    >
                      <option value={'VG1 Golf ' + campus}>VG1 Golf {campus}</option>
                      <option value={'VG2 Golf ' + campus}>VG2 Golf {campus}</option>
                      <option value={'VG3 Golf ' + campus}>VG3 Golf {campus}</option>
                      <option value={'Alle golfklasser ' + campus}>Alle golfklasser {campus}</option>
                    </select>
                  )}
                  {fane === 'WANG-14' && (
                    <select
                      value={nyMottakerNavn}
                      onChange={(e) => setNyMottakerNavn(e.target.value)}
                      style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                    >
                      {WANG_ELEVER.map((el) => (
                        <option key={el.id} value={el.navn}>{el.navn} ({el.klasse})</option>
                      ))}
                    </select>
                  )}
                  {fane === 'WANG-15' && (
                    <select
                      value={nyMottakerNavn}
                      onChange={(e) => setNyMottakerNavn(e.target.value)}
                      style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                    >
                      <option value={'Foresatte VG1 ' + campus}>Foresatte VG1 {campus}</option>
                      <option value={'Foresatte VG2 ' + campus}>Foresatte VG2 {campus}</option>
                      <option value={'Foresatte VG3 ' + campus}>Foresatte VG3 {campus}</option>
                      <option value={'Alle foresatte ' + campus}>Alle foresatte {campus}</option>
                    </select>
                  )}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                  Tittel
                  <input
                    type="text"
                    value={nyTittel}
                    onChange={(e) => setNyTittel(e.target.value)}
                    placeholder="Tittel på innlegget..."
                    style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                  />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                Innhold
                <textarea
                  value={nyttInnhold}
                  onChange={(e) => setNyttInnhold(e.target.value)}
                  placeholder="Skriv beskjeden her..."
                  rows={4}
                  style={{ padding: '10px 12px', border: '1px solid #D2D2D2', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </label>
              <button
                type="submit"
                style={{
                  alignSelf: 'flex-start',
                  minHeight: '44px',
                  padding: '0 24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#17446F',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Publiser melding
              </button>
            </form>
          </div>

          {/* Liste over meldinger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {synligeMeldinger.length > 0 ? (
              synligeMeldinger.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D2D2D2',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793', textTransform: 'uppercase' }}>
                        Til: {m.mottakerNavn}
                      </span>
                      <h4 style={{ margin: '4px 0 0', fontSize: '18px', color: '#17446F' }}>{m.tittel}</h4>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#5B7793' }}>
                      <div>{m.opprettetDato}</div>
                      <div style={{ color: '#2E857D', fontWeight: 500 }}>
                        Lest av {m.lestAvAntall} av {m.totaltMottakere}
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#17446F', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {m.innhold}
                  </p>
                  <div style={{ borderTop: '1px solid #E6E8EA', paddingTop: '10px', fontSize: '12px', color: '#5B7793' }}>
                    Sendt av {m.avsender} ({m.rolle})
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', color: '#5B7793' }}>
                Ingen meldinger funnet for dette området ennå.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* WANG-21: Dokumenter og maler                               */
        /* ========================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-21 · Dokumentarkiv og retningslinjer
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Dokumenter og maler
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 120px 100px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Dokumentnavn</span>
              <span>Kategori</span>
              <span>Sist endret</span>
              <span>Handling</span>
            </div>
            {[
              { navn: 'WANG Toppidrett Utøveravtale 2026/27.pdf', kat: 'Kontrakter', dato: '15.08.2026' },
              { navn: 'IUP Standardmal Golf VGS.docx', kat: 'Utviklingsplaner', dato: '01.09.2026' },
              { navn: 'Testprotokoll Fysisk og Golf WANG 2026.pdf', kat: 'Tester', dato: '10.09.2026' },
              { navn: 'Reisereglement og permisjonsregler ved turnering.pdf', kat: 'Reglement', dato: '20.08.2026' },
              { navn: 'Skolekoordinering og fraværsrutiner.pdf', kat: 'Administrasjon', dato: '25.08.2026' },
            ].map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 120px 100px',
                  padding: '16px',
                  borderTop: '1px solid #E6E8EA',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
              >
                <span style={{ fontWeight: 600, color: '#17446F' }}>{d.navn}</span>
                <span style={{ color: '#5B7793' }}>{d.kat}</span>
                <span style={{ color: '#5B7793', fontSize: '13px' }}>{d.dato}</span>
                <button
                  onClick={() => alert(`Laster ned ${d.navn}...`)}
                  style={{
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #D2D2D2',
                    background: '#FFFFFF',
                    color: '#17446F',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Last ned
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
