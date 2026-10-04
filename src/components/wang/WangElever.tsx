'use client';

import React, { useState } from 'react';
import {
  WANG_ELEVER,
  WANG_FYSISKE_TESTER,
  WANG_TEST_RESULTATER,
} from './wang-data';

interface WangEleverProps {
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
  valgtElevId?: string;
}

export function WangElever({
  aktivFane = 'WANG-07',
  onFaneEndret,
  campus = 'Fredrikstad',
  valgtElevId = 'sofie',
}: WangEleverProps) {
  const [fane, setFane] = useState(aktivFane);
  const [aktivElevId, setAktivElevId] = useState<string>(valgtElevId);
  const [profilUnderFane, setProfilUnderFane] = useState<'plan' | 'stats' | 'tester' | 'iup' | 'samtaler' | 'turneringer'>('iup');
  const [klasseFilter, setKlasseFilter] = useState<string>('Alle');
  const [sokeord, setSokeord] = useState<string>('');

  // Inviter elev tilstand (WANG-20)
  const [invNavn, setInvNavn] = useState('');
  const [invEpost, setInvEpost] = useState('');
  const [invKlasse, setInvKlasse] = useState('VG1');
  const [invKvittering, setInvKvittering] = useState<string | null>(null);

  // Samtale tilstand (WANG-44)
  const [nySamtaleTema, setNySamtaleTema] = useState('');
  const [nySamtaleDato, setNySamtaleDato] = useState('2026-10-05');
  const [samtaleLagret, setSamtaleLagret] = useState<string | null>(null);

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const aktivElev = WANG_ELEVER.find((e) => e.id === aktivElevId) || WANG_ELEVER[0];

  const filtrerteElever = WANG_ELEVER.filter((e) => {
    if (klasseFilter !== 'Alle' && e.klasse !== klasseFilter) return false;
    if (sokeord && !e.navn.toLowerCase().includes(sokeord.toLowerCase())) return false;
    return true;
  });

  const sendInvitasjon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invNavn.trim() || !invEpost.trim()) return;
    setInvKvittering(`Invitasjon sendt til ${invNavn} (${invEpost}) for ${invKlasse} ved WANG ${campus}.`);
    setInvNavn('');
    setInvEpost('');
    setTimeout(() => setInvKvittering(null), 5000);
  };

  const lagreSamtale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nySamtaleTema.trim()) return;
    setSamtaleLagret(`Utviklingssamtale lagret for ${aktivElev.navn}.`);
    setNySamtaleTema('');
    setTimeout(() => setSamtaleLagret(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Fanevelger */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E6E8EA', paddingBottom: '12px' }}>
        {[
          { id: 'WANG-07', navn: 'Elever (WANG-07)' },
          { id: 'WANG-44', navn: 'Elevprofil & IUP (WANG-44)' },
          { id: 'WANG-45', navn: 'Fireukerssjekk (WANG-45)' },
          { id: 'WANG-46', navn: 'Forslag til elev (WANG-46)' },
          { id: 'WANG-47', navn: 'Skjema & kilder (WANG-47)' },
          { id: 'WG-05', navn: 'Trenerflate (WG-05)' },
          { id: 'WANG-05', navn: 'Skole & fravær (WANG-05)' },
          { id: 'WG-04', navn: 'Prøveplan (WG-04)' },
          { id: 'WANG-20', navn: 'Inviter elev (WANG-20)' },
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

      {/* ========================================================== */}
      {/* WANG-07: Elevoversikt                                      */}
      {/* ========================================================== */}
      {fane === 'WANG-07' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
                WANG-07 · Elevoversikt · WANG {campus}
              </p>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
                Elever
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={sokeord}
                onChange={(e) => setSokeord(e.target.value)}
                placeholder="Søk etter elev..."
                style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px', fontSize: '13px' }}
              />
              <select
                value={klasseFilter}
                onChange={(e) => setKlasseFilter(e.target.value)}
                style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px', fontSize: '13px' }}
              >
                <option value="Alle">Alle klasser</option>
                <option value="VG1">VG1</option>
                <option value="VG2">VG2</option>
                <option value="VG3">VG3</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 80px 140px 140px 100px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Navn</span>
              <span>Klasse</span>
              <span>HCP</span>
              <span>4-ukers etterlevelse</span>
              <span>Fokusområde</span>
              <span>Profil</span>
            </div>
            {filtrerteElever.map((el) => {
              const pst = Math.round((el.etterlevelseSiste4Uker.gjennomfortTimer / el.etterlevelseSiste4Uker.planlagtTimer) * 100);
              return (
                <div
                  key={el.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 80px 80px 140px 140px 100px',
                    padding: '16px',
                    borderTop: '1px solid #E6E8EA',
                    alignItems: 'center',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#17446F' }}>{el.navn}</span>
                  <span style={{ color: '#5B7793' }}>{el.klasse}</span>
                  <span style={{ fontWeight: 600, color: '#17446F' }}>{el.handicap}</span>
                  <div>
                    <span style={{ fontWeight: 700, color: pst >= 85 ? '#2E857D' : pst >= 70 ? '#F47B20' : '#D12A5C' }}>
                      {pst}%
                    </span>
                    <span style={{ fontSize: '12px', color: '#5B7793', marginLeft: '4px' }}>
                      ({el.etterlevelseSiste4Uker.gjennomfortTimer}/{el.etterlevelseSiste4Uker.planlagtTimer}t)
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#17446F' }}>
                    {el.iup.hovedFokus[0] || 'Grunntrening'}
                  </span>
                  <button
                    onClick={() => {
                      setAktivElevId(el.id);
                      byttFane('WANG-44');
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
                    Åpne IUP
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-44: Elevprofil & Individuell Utviklingsplan (IUP)     */}
      {/* ========================================================== */}
      {fane === 'WANG-44' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#17446F', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: '18px', fontWeight: 700 }}>
                {aktivElev.navn.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
                  WANG-44 · {aktivElev.klasse} {aktivElev.campus} · HCP {aktivElev.handicap}
                </p>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
                  {aktivElev.navn}
                </h2>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={aktivElevId}
                onChange={(e) => setAktivElevId(e.target.value)}
                style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px', fontSize: '13px' }}
              >
                {WANG_ELEVER.map((e) => (
                  <option key={e.id} value={e.id}>{e.navn} ({e.klasse})</option>
                ))}
              </select>
              <button
                onClick={() => byttFane('WANG-07')}
                style={{ minHeight: '44px', padding: '0 16px', border: '1px solid #D2D2D2', borderRadius: '6px', background: '#FFFFFF', color: '#17446F', fontSize: '13px', cursor: 'pointer' }}
              >
                Tilbake
              </button>
            </div>
          </div>

          {/* Underfaner i elevprofil: plan, stats, tester, iup, samtaler, turneringer */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #E6E8EA', paddingBottom: '8px' }}>
            {[
              { id: 'iup', label: 'IUP (Utviklingsplan)' },
              { id: 'plan', label: 'Plan & Uke' },
              { id: 'stats', label: 'Stats & Volum' },
              { id: 'tester', label: 'Tester' },
              { id: 'samtaler', label: 'Samtaler' },
              { id: 'turneringer', label: 'Turneringer' },
            ].map((uf) => (
              <button
                key={uf.id}
                onClick={() => setProfilUnderFane(uf.id as "plan" | "stats" | "tester" | "iup" | "samtaler" | "turneringer")}
                style={{
                  minHeight: '44px',
                  padding: '0 16px',
                  border: 'none',
                  borderBottom: profilUnderFane === uf.id ? '2px solid #D12A5C' : '2px solid transparent',
                  background: 'transparent',
                  color: profilUnderFane === uf.id ? '#17446F' : '#5B7793',
                  fontWeight: profilUnderFane === uf.id ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {uf.label}
              </button>
            ))}
          </div>

          {/* Underfane 1: IUP */}
          {profilUnderFane === 'iup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#17446F' }}>Sesongmål 2026/2027</h3>
                <div style={{ padding: '14px', background: '#F2F5F8', borderRadius: '6px', fontSize: '15px', color: '#17446F', fontWeight: 500 }}>
                  {aktivElev.iup.sesongMaal}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#17446F' }}>Hovedfokusområder</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#17446F', fontSize: '14px', lineHeight: 1.6 }}>
                    {aktivElev.iup.hovedFokus.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#17446F' }}>Konkrete tiltak og treningsprioriteter</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#17446F', fontSize: '14px', lineHeight: 1.6 }}>
                    {aktivElev.iup.tiltak.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#5B7793' }}>Neste evalueringssamtale</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#17446F' }}>{aktivElev.iup.nesteEvaluering}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#2E857D', fontWeight: 500 }}>
                  Godkjent av sportssjef og elev
                </div>
              </div>
            </div>
          )}

          {/* Underfane 2: Plan */}
          {profilUnderFane === 'plan' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#17446F' }}>Ukeplan og øktkatalog</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#5B7793' }}>
                Eleven følger standard WANG-timeplan med 3 morgentreninger ukentlig (tirsdag, onsdag, fredag) samt egentrening og helgeturneringer.
              </p>
            </div>
          )}

          {/* Underfane 3: Stats */}
          {profilUnderFane === 'stats' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#17446F' }}>Treningsvolum og etterlevelse</h3>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#17446F', marginBottom: '8px' }}>
                {Math.round((aktivElev.etterlevelseSiste4Uker.gjennomfortTimer / aktivElev.etterlevelseSiste4Uker.planlagtTimer) * 100)}%
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#5B7793' }}>
                Gjennomført {aktivElev.etterlevelseSiste4Uker.gjennomfortTimer} av {aktivElev.etterlevelseSiste4Uker.planlagtTimer} planlagte timer de siste 4 ukene.
              </p>
            </div>
          )}

          {/* Underfane 4: Tester */}
          {profilUnderFane === 'tester' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#17446F' }}>Testresultater for {aktivElev.navn}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {WANG_FYSISKE_TESTER.map((t) => {
                  const res = WANG_TEST_RESULTATER.find((r) => r.testId === t.id && r.elevId === aktivElev.id);
                  return (
                    <div key={t.id} style={{ padding: '12px', background: '#F2F5F8', borderRadius: '6px' }}>
                      <div style={{ fontSize: '12px', color: '#5B7793' }}>{t.navn}</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#17446F', margin: '4px 0' }}>
                        {res ? `${res.verdi} ${t.enhet}` : 'Ikke testet'}
                      </div>
                      <div style={{ fontSize: '11px', color: res?.godkjent ? '#2E857D' : '#D12A5C' }}>
                        {res?.godkjent ? 'Godkjent av trener' : 'Venter på test'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Underfane 5: Samtaler */}
          {profilUnderFane === 'samtaler' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#17446F' }}>Loggfør samtale med {aktivElev.navn}</h3>
                {samtaleLagret && (
                  <div style={{ padding: '10px 14px', background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', color: '#1B5E57', fontSize: '13px', marginBottom: '12px' }}>
                    {samtaleLagret}
                  </div>
                )}
                <form onSubmit={lagreSamtale} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px' }}>
                    <input
                      type="date"
                      value={nySamtaleDato}
                      onChange={(e) => setNySamtaleDato(e.target.value)}
                      style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                    />
                    <input
                      type="text"
                      value={nySamtaleTema}
                      onChange={(e) => setNySamtaleTema(e.target.value)}
                      placeholder="Tema / oppsummering av samtalen..."
                      style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      alignSelf: 'flex-start',
                      minHeight: '44px',
                      padding: '0 20px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#17446F',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Lagre samtale
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Underfane 6: Turneringer */}
          {profilUnderFane === 'turneringer' && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#17446F' }}>Turneringshistorikk</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#5B7793' }}>
                Eleven har deltatt i 4 turneringer denne sesongen med et gjennomsnitt på 72.5 slag brutto per runde.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-45: Fireukerssjekk                                    */}
      {/* ========================================================== */}
      {fane === 'WANG-45' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-45 · Fireukerssjekk og treningsetterlevelse
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Fireukerssjekk
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 100px 140px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Elev</span>
              <span>Planlagt</span>
              <span>Gjennomført</span>
              <span>Etterlevelse</span>
              <span>Status & Tiltak</span>
            </div>
            {WANG_ELEVER.map((e) => {
              const pst = Math.round((e.etterlevelseSiste4Uker.gjennomfortTimer / e.etterlevelseSiste4Uker.planlagtTimer) * 100);
              return (
                <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 100px 140px', padding: '16px', borderTop: '1px solid #E6E8EA', alignItems: 'center', fontSize: '14px' }}>
                  <span style={{ fontWeight: 600, color: '#17446F' }}>{e.navn}</span>
                  <span style={{ color: '#5B7793' }}>{e.etterlevelseSiste4Uker.planlagtTimer} timer</span>
                  <span style={{ color: '#17446F', fontWeight: 500 }}>{e.etterlevelseSiste4Uker.gjennomfortTimer} timer</span>
                  <span style={{ fontWeight: 700, color: pst >= 85 ? '#2E857D' : pst >= 70 ? '#F47B20' : '#D12A5C' }}>{pst}%</span>
                  <span style={{ fontSize: '12px', color: pst >= 85 ? '#2E857D' : '#D12A5C' }}>
                    {pst >= 85 ? 'God progresjon' : 'Trenger samtale'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-46: Forslag til elev                                  */}
      {/* ========================================================== */}
      {fane === 'WANG-46' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-46 · Treners justeringsforslag
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Forslag til elev
            </h2>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#17446F' }}>
              Her kan treneren sende konkrete forslag til endringer i treningsuken eller justering av delmål i IUP direkte til elevens PlayerHQ.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-47: Skjema og kildeversjoner                          */}
      {/* ========================================================== */}
      {fane === 'WANG-47' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-47 · Skjema- og protokollversjoner
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Skjema og kildeversjoner
            </h2>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '14px', color: '#17446F', lineHeight: 1.6 }}>
              <strong>Gjeldende IUP-skjema:</strong> Versjon 2.4 (Revidert 28.09.2026)<br />
              <strong>Gjeldende Nasjonalt Testbatteri:</strong> Versjon 3.1 (Toppidrett 2026)<br />
              <strong>DataGolf API Integrasjon:</strong> v1.2 Live
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WG-05: Trenerflate                                         */}
      {/* ========================================================== */}
      {fane === 'WG-05' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WG-05 · Treneransvar og gruppeinndeling
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Trenerflate
            </h2>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#17446F' }}>
              Viser oversikt over treningsgrupper og tildelte elever ved WANG {campus}.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-05: Skole og fravær                                   */}
      {/* ========================================================== */}
      {fane === 'WANG-05' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-05 · Skoleoppfølging og fraværsføring
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Skole og fravær
            </h2>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 140px 140px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Elev</span>
              <span>Klasse</span>
              <span>Fraværsprosent</span>
              <span>Godkjent idrettsfravær</span>
            </div>
            {WANG_ELEVER.map((e) => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 140px 140px', padding: '14px 16px', borderTop: '1px solid #E6E8EA', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{e.navn}</span>
                <span style={{ color: '#5B7793' }}>{e.klasse}</span>
                <span style={{ color: '#17446F', fontWeight: 500 }}>2.4%</span>
                <span style={{ color: '#2E857D', fontWeight: 600 }}>14 dager (Turnering)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WG-04: Prøveplan                                           */}
      {/* ========================================================== */}
      {fane === 'WG-04' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WG-04 · Skoleprøver og eksamenskalender
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Prøveplan
            </h2>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#5B7793' }}>
              Gir trenerne oversikt over elevenes prøver slik at harde fysiske testuker og reiser ikke kolliderer med store vurderinger.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, color: '#17446F' }}>12. oktober: Matematikk 1T (VG1)</div>
                <div style={{ fontSize: '12px', color: '#5B7793' }}>Heldagsprøve · Morgenøkt tilpasses</div>
              </div>
              <div style={{ padding: '12px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, color: '#17446F' }}>23. oktober: Norsk Hovedmål (VG3)</div>
                <div style={{ fontSize: '12px', color: '#5B7793' }}>Heldag · Fritak fra morgentrening</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-20: Inviter elev                                      */}
      {/* ========================================================== */}
      {fane === 'WANG-20' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-20 · Tilgangsstyring og elevinvitasjoner
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Inviter ny elev
            </h2>
          </div>

          {invKvittering && (
            <div style={{ padding: '12px 16px', background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', color: '#1B5E57', fontSize: '14px' }}>
              {invKvittering}
            </div>
          )}

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '24px', maxWidth: '600px' }}>
            <form onSubmit={sendInvitasjon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                Elevens fulle navn
                <input
                  type="text"
                  value={invNavn}
                  onChange={(e) => setInvNavn(e.target.value)}
                  placeholder="F.eks. Henrik Hovland"
                  style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                Elevens e-postadresse
                <input
                  type="email"
                  value={invEpost}
                  onChange={(e) => setInvEpost(e.target.value)}
                  placeholder="elev@skole.wang.no"
                  style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F' }}>
                Klassetrinn
                <select
                  value={invKlasse}
                  onChange={(e) => setInvKlasse(e.target.value)}
                  style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                >
                  <option value="VG1">VG1</option>
                  <option value="VG2">VG2</option>
                  <option value="VG3">VG3</option>
                </select>
              </label>
              <button
                type="submit"
                style={{
                  minHeight: '44px',
                  padding: '0 24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#17446F',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Send invitasjonslenke
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
