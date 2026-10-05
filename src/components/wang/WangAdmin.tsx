'use client';

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

export function WangAdmin({
  aktivFane = 'WANG-19',
  onFaneEndret,
  campus = 'Fredrikstad',
}: WangAdminProps) {
  const [fane, setFane] = useState(aktivFane);
  const [kandidater, setKandidater] = useState<WangKandidat[]>(WANG_KANDIDATER);
  const [kandidatKvittering, setKandidatKvittering] = useState<string | null>(null);

  // Ny kandidat tilstand
  const [nyttNavn, setNyttNavn] = useState('');
  const [nyKlubb, setNyKlubb] = useState('');
  const [nyttHcp, setNyttHcp] = useState('');

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const oppdaterStatus = (id: string, nyStatus: WangKandidat['status']) => {
    setKandidater(
      kandidater.map((k) => (k.id === id ? { ...k, status: nyStatus } : k))
    );
    setKandidatKvittering(`Status oppdatert til ${nyStatus}.`);
    setTimeout(() => setKandidatKvittering(null), 3000);
  };

  const leggTilKandidat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nyttNavn.trim() || !nyttHcp.trim()) return;

    const ny: WangKandidat = {
      id: 'k-' + Date.now(),
      navn: nyttNavn,
      klubb: nyKlubb || 'Gamle Fredrikstad GK',
      handicap: parseFloat(nyttHcp) || 4.0,
      onsketCampus: campus,
      status: 'sokt',
      notat: 'Registrert av sportssjef',
    };

    setKandidater([...kandidater, ny]);
    setNyttNavn('');
    setNyKlubb('');
    setNyttHcp('');
    setKandidatKvittering(`Kandidat ${ny.navn} er lagt til.`);
    setTimeout(() => setKandidatKvittering(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Fanevelger */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E6E8EA', paddingBottom: '12px' }}>
        {[
          { id: 'WANG-19', navn: 'Trenere og roller (WANG-19)' },
          { id: 'WANG-34', navn: 'Samtykkeoversikt (WANG-34)' },
          { id: 'WANG-26', navn: 'Timeplanføring (WANG-26)' },
          { id: 'WANG-31', navn: 'Rekruttering (WANG-31)' },
          { id: 'WANG-32', navn: 'Plasser og kvoter (WANG-32)' },
          { id: 'WANG-33', navn: 'Skolekoordinering (WANG-33)' },
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

      {kandidatKvittering && (
        <div style={{ padding: '12px 16px', background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', color: '#1B5E57', fontSize: '14px' }}>
          {kandidatKvittering}
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-19: Trenere og roller                                 */}
      {/* ========================================================== */}
      {fane === 'WANG-19' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-19 · Trenerstab og tilgangsstyring
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Trenere og roller
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 140px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Trener</span>
              <span>Campus</span>
              <span>Rolle</span>
              <span>Status</span>
            </div>
            {[
              { navn: 'Anders Kristiansen', campus: 'Fredrikstad / Nasjonalt', rolle: 'Sportssjef', status: 'Aktiv' },
              { navn: 'Kjersti Jørgensen', campus: 'Oslo', rolle: 'Sportssjef', status: 'Aktiv' },
              { navn: 'Niklas Diethelm', campus: 'Romerike / Tønsberg', rolle: 'Trener', status: 'Aktiv' },
              { navn: 'Jørn Hovland', campus: 'Oslo / Stavanger', rolle: 'Trener', status: 'Aktiv' },
              { navn: 'Mia Sandtorv', campus: 'Fredrikstad', rolle: 'Trener', status: 'Aktiv' },
            ].map((t, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 140px', padding: '16px', borderTop: '1px solid #E6E8EA', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{t.navn}</span>
                <span style={{ color: '#5B7793' }}>{t.campus}</span>
                <span style={{ fontWeight: 500, color: t.rolle === 'Sportssjef' ? '#2E857D' : '#17446F' }}>{t.rolle}</span>
                <span style={{ color: '#2E857D', fontWeight: 600 }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-34: Samtykkeoversikt                                  */}
      {/* ========================================================== */}
      {fane === 'WANG-34' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-34 · GDPR, personvern og samtykker
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Samtykkeoversikt
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 140px 140px 140px', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Elev</span>
              <span>Klasse</span>
              <span>Foto & Sosiale Medier</span>
              <span>Helse / Skadejournal</span>
              <span>Foresatt-godkjenning</span>
            </div>
            {[
              { navn: 'Sofie Rasmussen', kl: 'VG1', foto: true, helse: true, for: true },
              { navn: 'Mikkel Thon', kl: 'VG1', foto: true, helse: true, for: true },
              { navn: 'Celine Brovold', kl: 'VG2', foto: true, helse: true, for: true },
              { navn: 'Felix Sanden', kl: 'VG2', foto: false, helse: true, for: true },
              { navn: 'Emma Lind', kl: 'VG3', foto: true, helse: true, for: true },
              { navn: 'Oskar Dahl', kl: 'VG3', foto: true, helse: true, for: true },
            ].map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 140px 140px 140px', padding: '16px', borderTop: '1px solid #E6E8EA', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{s.navn}</span>
                <span style={{ color: '#5B7793' }}>{s.kl}</span>
                <span style={{ color: s.foto ? '#2E857D' : '#D12A5C', fontWeight: 500 }}>
                  {s.foto ? 'Innvilget' : 'Ikke samtykket'}
                </span>
                <span style={{ color: s.helse ? '#2E857D' : '#D12A5C', fontWeight: 500 }}>
                  {s.helse ? 'Innvilget' : 'Mangler'}
                </span>
                <span style={{ color: s.for ? '#2E857D' : '#D12A5C', fontWeight: 500 }}>
                  {s.for ? 'Signert digitalt' : 'Utestående'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-26: Timeplanføring                                    */}
      {/* ========================================================== */}
      {fane === 'WANG-26' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-26 · Skolens timeplan og treningsblokker
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Timeplanføring
            </h2>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#17446F' }}>Faste treningsblokker WANG {campus}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, color: '#17446F' }}>Tirsdag 08:00 – 10:00</div>
                <div style={{ fontSize: '13px', color: '#5B7793', margin: '4px 0 8px' }}>Morgentrening Golfteknikk</div>
                <div style={{ fontSize: '12px', color: '#2E857D' }}>Obligatorisk for VG1, VG2, VG3</div>
              </div>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, color: '#17446F' }}>Onsdag 08:00 – 10:00</div>
                <div style={{ fontSize: '13px', color: '#5B7793', margin: '4px 0 8px' }}>Fysisk trening og kapasitet</div>
                <div style={{ fontSize: '12px', color: '#2E857D' }}>Styrkerom / basistrening</div>
              </div>
              <div style={{ padding: '16px', background: '#F2F5F8', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, color: '#17446F' }}>Fredag 08:00 – 10:00</div>
                <div style={{ fontSize: '13px', color: '#5B7793', margin: '4px 0 8px' }}>Morgentrening Nærspill / Test</div>
                <div style={{ fontSize: '12px', color: '#2E857D' }}>Pre-turnering forberedelse</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-31: Rekruttering                                      */}
      {/* ========================================================== */}
      {fane === 'WANG-31' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-31 · Inntak og rekruttering til skoleåret 2027/28
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Rekruttering
            </h2>
          </div>

          {/* Legg til kandidat */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#17446F' }}>Registrer ny søker / kandidat</h3>
            <form onSubmit={leggTilKandidat} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F', minWidth: '180px' }}>
                Navn
                <input
                  type="text"
                  value={nyttNavn}
                  onChange={(e) => setNyttNavn(e.target.value)}
                  placeholder="Kandidatens navn"
                  style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F', minWidth: '160px' }}>
                Hjemmeklubb
                <input
                  type="text"
                  value={nyKlubb}
                  onChange={(e) => setNyKlubb(e.target.value)}
                  placeholder="F.eks. Losby GK"
                  style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#17446F', width: '100px' }}>
                HCP
                <input
                  type="number"
                  step="0.1"
                  value={nyttHcp}
                  onChange={(e) => setNyttHcp(e.target.value)}
                  placeholder="3.2"
                  style={{ minHeight: '44px', padding: '0 12px', border: '1px solid #D2D2D2', borderRadius: '6px' }}
                />
              </label>
              <button
                type="submit"
                style={{
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
                Legg til
              </button>
            </form>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 140px 1.5fr', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Kandidat</span>
              <span>Klubb</span>
              <span>HCP</span>
              <span>Status</span>
              <span>Handlinger</span>
            </div>
            {kandidater.map((k) => (
              <div key={k.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 140px 1.5fr', padding: '16px', borderTop: '1px solid #E6E8EA', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{k.navn}</span>
                <span style={{ color: '#5B7793' }}>{k.klubb}</span>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{k.handicap}</span>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background:
                        k.status === 'tilbudt' ? '#E3F5EC' : k.status === 'provespill' ? '#FFF5E5' : '#F2F5F8',
                      color:
                        k.status === 'tilbudt' ? '#1B5E57' : k.status === 'provespill' ? '#B25E00' : '#17446F',
                    }}
                  >
                    {k.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => oppdaterStatus(k.id, 'provespill')}
                    style={{ minHeight: '44px', padding: '0 8px', borderRadius: '4px', border: '1px solid #D2D2D2', background: '#FFFFFF', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Prøvespill
                  </button>
                  <button
                    onClick={() => oppdaterStatus(k.id, 'intervju')}
                    style={{ minHeight: '44px', padding: '0 8px', borderRadius: '4px', border: '1px solid #D2D2D2', background: '#FFFFFF', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Intervju
                  </button>
                  <button
                    onClick={() => oppdaterStatus(k.id, 'tilbudt')}
                    style={{ minHeight: '44px', padding: '0 8px', borderRadius: '4px', border: '1px solid #2E857D', background: '#2E857D', color: '#FFFFFF', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Tilby plass
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-32: Plasser og kvoter                                 */}
      {/* ========================================================== */}
      {fane === 'WANG-32' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-32 · Kapasitet og plasskvoter 2026/27
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Plasser og kvoter
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>WANG Fredrikstad</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>18 / 20</div>
              <div style={{ fontSize: '12px', color: '#2E857D' }}>2 ledige plasser for neste inntak</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>WANG Oslo</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>24 / 24</div>
              <div style={{ fontSize: '12px', color: '#D12A5C' }}>Fullt besatt · Venteliste aktivert</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#5B7793' }}>WANG Stavanger</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#17446F', margin: '6px 0' }}>14 / 16</div>
              <div style={{ fontSize: '12px', color: '#2E857D' }}>2 ledige plasser</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* WANG-33: Koordinering mellom skoler                        */}
      {/* ========================================================== */}
      {fane === 'WANG-33' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500, color: '#5B7793', fontFamily: 'Montserrat, sans-serif' }}>
              WANG-33 · Koordinering mellom skoler · Personvernsikret kontaktlogg
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: '#17446F', fontFamily: 'Montserrat, sans-serif' }}>
              Skolekoordinering
            </h2>
          </div>

          <div style={{ background: '#E3F5EC', border: '1px solid #49CA9F', borderRadius: '6px', padding: '14px', fontSize: '13px', color: '#1B5E57', lineHeight: 1.5 }}>
            <strong>Personvernregel (ak-personvern):</strong> Skolene deler kun kontaktlogg (hvem snakket med hvem når og hvilket tema det gjaldt), men aldri selve meldingsinnholdet eller sensitive interne vurderinger.
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D2D2D2', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 1.5fr 1fr', padding: '12px 16px', background: '#F2F5F8', fontWeight: 600, fontSize: '12px', color: '#5B7793' }}>
              <span>Dato</span>
              <span>Parter</span>
              <span>Tema for samhandling</span>
              <span>Status</span>
            </div>
            {[
              { dato: '01.10.2026', parter: 'Fredrikstad ↔ Oslo', tema: 'Felles høstsamling på Bogstad', status: 'Avtalt program' },
              { dato: '28.09.2026', parter: 'Fredrikstad ↔ Stavanger', tema: 'Transportkoordinering Norgescup', status: 'Ferdigstilt' },
              { dato: '20.09.2026', parter: 'Nasjonalt sportssjefmøte', tema: 'Revisjon av nasjonalt testbatteri v3.1', status: 'Vedtattsført' },
            ].map((logg, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 1.5fr 1fr', padding: '16px', borderTop: '1px solid #E6E8EA', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ color: '#5B7793' }}>{logg.dato}</span>
                <span style={{ fontWeight: 600, color: '#17446F' }}>{logg.parter}</span>
                <span style={{ color: '#17446F' }}>{logg.tema}</span>
                <span style={{ color: '#2E857D', fontWeight: 500 }}>{logg.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
