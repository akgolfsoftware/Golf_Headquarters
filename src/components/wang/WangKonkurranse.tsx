'use client';

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
import React, { useState } from 'react';
import {
  WANG_TURNERINGER,
  WANG_ELEVER,
} from './wang-data';

interface WangKonkurranseProps {
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

const FANER = [
  { id: 'WANG-10', navn: 'Kalender' },
  { id: 'WANG-11', navn: 'Turnering' },
  { id: 'WANG-09', navn: 'Sesongen' },
  { id: 'WANG-27', navn: 'Samlinger' },
  { id: 'WANG-50', navn: 'Data Golf' },
] as const;

const SESONG = [
  { tall: '72,8', navn: 'Snitt brutto', kilde: '1,2 slag bedre enn forrige sesong' },
  { tall: '68,4 %', navn: 'GIR', kilde: '12,3 av 18 greener' },
  { tall: '64,1 %', navn: 'Fairway', kilde: '9,0 av 14 fairways' },
  { tall: '29,6', navn: 'Putter per runde', kilde: '1,76 putter per GIR' },
] as const;

const SAMLINGER = [
  { navn: 'Høstsamling', sted: 'Oslo Golfklubb Bogstad', dato: '14.–17. oktober 2026', pameldt: 12, ansvarlig: 'Anders K.', tekst: 'Svingkapasitet mot vintersesongen, TrackMan-kalibrering og nærspillstester.' },
  { navn: 'Vinterleir', sted: 'Marbella, Spania (La Quinta)', dato: '18.–26. februar 2027', pameldt: 16, ansvarlig: 'Jørn / Niklas', tekst: 'Sesongoppkjøring på gress. Banestrategi, 18 hull spilltrening daglig og fysisk oppfølging.' },
] as const;

const SG = [
  { navn: 'SG Off-the-tee', wang: '+0,42', ref: '+0,25' },
  { navn: 'SG Approach', wang: '+0,18', ref: '+0,30' },
  { navn: 'SG Around-the-green', wang: '+0,05', ref: '+0,10' },
  { navn: 'SG Putting', wang: '+0,22', ref: '+0,12' },
] as const;

/**
 * WANG-10/11/09/27/50 Konkurranse for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/konkurranse.html (pakke 5, utkast 1, 14.10.2026).
 * Avvik:
 *   - Trenerens evaluering per elev, uttak med kriterium og publisering er ikke med.
 *     Kilden har ikke evaluering eller uttak for WANG ennå.
 *   - Sesongtallene per elev viser «—» til runder er koblet.
 *   - Strokes Gained mot neste kategori er ikke med; Data Golf-fanen viser
 *     sammenligningen mot College D1 som før, bare for trenere.
 */
export function WangKonkurranse({
  aktivFane = 'WANG-10',
  onFaneEndret,
  campus = 'Fredrikstad',
}: WangKonkurranseProps) {
  const [fane, setFane] = useState(aktivFane);
  const [kalenderFilter, setKalenderFilter] = useState<'kommende' | 'gjennomfort'>('kommende');
  const [valgtTurneringId, setValgtTurneringId] = useState<string>(WANG_TURNERINGER[0]?.id || 't1');

  // Turneringsrapportering tilstand
  const [rapportElevId, setRapportElevId] = useState<string>('sofie');
  const [rapportRunde, setRapportRunde] = useState<string>('1');
  const [rapportScore, setRapportScore] = useState<string>('71');
  const [rapportFairway, setRapportFairway] = useState<string>('10');
  const [rapportGir, setRapportGir] = useState<string>('12');
  const [rapportPutter, setRapportPutter] = useState<string>('29');
  const [rapportNotat, setRapportNotat] = useState<string>('');

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const gjeldendeTurnering = WANG_TURNERINGER.find((t) => t.id === valgtTurneringId) || WANG_TURNERINGER[0];
  const kommendeTurneringer = WANG_TURNERINGER.filter((t) => t.status === 'kommende');
  const gjennomforteTurneringer = WANG_TURNERINGER.filter((t) => t.status === 'gjennomfort');
  const liste = kalenderFilter === 'kommende' ? kommendeTurneringer : gjennomforteTurneringer;
  const neste = kommendeTurneringer[0];

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">WANG {campus} · sesong 2026</p>
          <h1 className="wg-tittel">Konkurranse</h1>
          <p className="wg-ingress">
            Turneringer, resultater og samlinger. Påmelding skjer hos arrangøren, ikke i appen.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Kommende</span>
            <strong>{kommendeTurneringer.length}</strong>
            <span className="wg-kilde">{neste ? neste.dato : 'Ingen lagt inn'}</span>
          </div>
          <div>
            <span>Spilt</span>
            <strong>{gjennomforteTurneringer.length}</strong>
            <span className="wg-kilde">Denne sesongen</span>
          </div>
          <div>
            <span>Snitt brutto</span>
            <strong>72,8</strong>
            <span className="wg-kilde">Gruppa, sesong 2026</span>
          </div>
          <div>
            <span>Samlinger</span>
            <strong>{SAMLINGER.length}</strong>
            <span className="wg-kilde">Planlagt</span>
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <button type="button" disabled className="wg-btn wg-btn-secondary" style={IKKE_KOBLET_KNAPP_STIL}>
                Hent resultater
              </button>
              <WangIkkeKoblet />
            </span>
          </div>
          <div className="wg-filter" role="group" aria-label="Filter">
            <button type="button" aria-pressed={kalenderFilter === 'kommende'} onClick={() => setKalenderFilter('kommende')} className={`wg-chip ${kalenderFilter === 'kommende' ? 'wg-chip-pa' : ''}`}>
              Kommende ({kommendeTurneringer.length})
            </button>
            <button type="button" aria-pressed={kalenderFilter === 'gjennomfort'} onClick={() => setKalenderFilter('gjennomfort')} className={`wg-chip ${kalenderFilter === 'gjennomfort' ? 'wg-chip-pa' : ''}`}>
              Spilt ({gjennomforteTurneringer.length})
            </button>
          </div>
          <div className="wg-kort wg-saker">
            {liste.length === 0 ? (
              <p className="wg-kilde" style={{ padding: '14px 0' }}>Ingen turneringer her ennå.</p>
            ) : (
              liste.map((t) => (
                <div key={t.id} className="wg-sak">
                  <span className={`wg-pille ${t.status === 'gjennomfort' ? 'wg-pille-ok' : 'wg-pille-vent'}`}>
                    <i />
                    {t.status === 'gjennomfort' ? 'Spilt' : 'Kommende'}
                  </span>
                  <b>{t.navn}</b>
                  <p>{t.dato} · {t.bane} · {t.serie} · {t.pamelteElever.length} elever påmeldt</p>
                  <div className="wg-knapper">
                    <button
                      type="button"
                      className="wg-btn wg-btn-secondary"
                      onClick={() => {
                        setValgtTurneringId(t.id);
                        byttFane('WANG-11');
                      }}
                    >
                      Se turneringen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {fane === 'WANG-11' && gjeldendeTurnering && (
        <>
          <section className="wg-seksjon" aria-labelledby="wg-turnering-tittel">
            <div>
              <p className="wg-dato">{gjeldendeTurnering.serie} · {gjeldendeTurnering.dato}</p>
              <h2 id="wg-turnering-tittel" className="wg-tittel" style={{ fontSize: 24 }}>{gjeldendeTurnering.navn}</h2>
              <p className="wg-kilde">{gjeldendeTurnering.bane} · par {gjeldendeTurnering.par} · {gjeldendeTurnering.format}</p>
            </div>
            <button type="button" className="wg-btn wg-btn-ghost" style={{ justifySelf: 'start' }} onClick={() => byttFane('WANG-10')}>
              Tilbake til kalenderen
            </button>
          </section>

          <section className="wg-seksjon" aria-labelledby="wg-resultat-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-resultat-tittel">Resultater, brutto</h2>
            </div>
            <div className="wg-kort wg-rader">
              {gjeldendeTurnering.resultater && gjeldendeTurnering.resultater.length > 0 ? (
                gjeldendeTurnering.resultater.map((res) => (
                  <div key={res.elevNavn} className="wg-rad">
                    <div>
                      <b>{res.plassering}. {res.elevNavn}</b>
                      <p className="wg-kilde">Runder {res.runder.join(' · ')}</p>
                    </div>
                    <span className="wg-tall">{res.totalScore} ({res.tilPar.replace('-', '−')})</span>
                  </div>
                ))
              ) : (
                <p className="wg-kilde" style={{ padding: '14px 0' }}>
                  Turneringen er ikke spilt ennå. Resultatene hentes når den er ferdigspilt.
                </p>
              )}
            </div>
          </section>

          <section className="wg-seksjon" aria-labelledby="wg-rapport-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-rapport-tittel">Runderapport for elev</h2>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="wg-kort wg-fyll">
              <div className="wg-rutenett" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
                <label className="wg-lbl">
                  <span>Elev</span>
                  <select value={rapportElevId} onChange={(e) => setRapportElevId(e.target.value)} className="wg-field">
                    {WANG_ELEVER.map((el) => (
                      <option key={el.id} value={el.id}>{el.navn}</option>
                    ))}
                  </select>
                </label>
                <label className="wg-lbl">
                  <span>Runde</span>
                  <select value={rapportRunde} onChange={(e) => setRapportRunde(e.target.value)} className="wg-field">
                    <option value="1">Runde 1</option>
                    <option value="2">Runde 2</option>
                    <option value="3">Runde 3</option>
                  </select>
                </label>
                <label className="wg-lbl">
                  <span>Brutto score</span>
                  <input type="number" inputMode="numeric" value={rapportScore} onChange={(e) => setRapportScore(e.target.value)} className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>Fairway</span>
                  <input type="number" inputMode="numeric" value={rapportFairway} onChange={(e) => setRapportFairway(e.target.value)} className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>GIR</span>
                  <input type="number" inputMode="numeric" value={rapportGir} onChange={(e) => setRapportGir(e.target.value)} className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>Putter</span>
                  <input type="number" inputMode="numeric" value={rapportPutter} onChange={(e) => setRapportPutter(e.target.value)} className="wg-field" />
                </label>
              </div>
              <label className="wg-lbl">
                <span>Hva tar eleven med seg inn i treningsuka?</span>
                <textarea value={rapportNotat} onChange={(e) => setRapportNotat(e.target.value)} rows={3} className="wg-field" placeholder="Hva fungerte, og hva skal trenes?" />
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                  Lagre runderapport
                </button>
                <WangIkkeKoblet />
              </div>
            </form>
          </section>
        </>
      )}

      {fane === 'WANG-09' && (
        <>
          <section className="wg-seksjon" aria-labelledby="wg-sesong-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-sesong-tittel">Sesongen</h2>
              <span className="wg-kilde">Gruppa, brutto</span>
            </div>
            <div className="wg-helt-tall">
              {SESONG.map((s) => (
                <div key={s.navn}>
                  <span>{s.navn}</span>
                  <strong>{s.tall}</strong>
                  <span className="wg-kilde">{s.kilde}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="wg-seksjon" aria-labelledby="wg-perelev-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-perelev-tittel">Per elev</h2>
              <span className="wg-kilde">Ikke koblet ennå</span>
            </div>
            <div className="wg-kort wg-rader">
              {WANG_ELEVER.map((el) => (
                <div key={el.id} className="wg-rad">
                  <div>
                    <b>{el.navn}</b>
                    <p className="wg-kilde">Runder — · fairway — · GIR — · putter —</p>
                  </div>
                  <span className="wg-tall">—</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {fane === 'WANG-27' && (
        <section className="wg-seksjon" aria-labelledby="wg-samling-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-samling-tittel">Samlinger og leir</h2>
            <span className="wg-kilde">2026/2027</span>
          </div>
          <div className="wg-rutenett">
            {SAMLINGER.map((s) => (
              <div key={s.navn} className="wg-kort">
                <span className="wg-dato">{s.dato}</span>
                <h3>{s.navn}</h3>
                <p className="wg-kilde">{s.sted}</p>
                <p className="wg-kilde">{s.tekst}</p>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="wg-pille">{s.pameldt} elever påmeldt</span>
                  <span className="wg-pille">Ansvarlig: {s.ansvarlig}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {fane === 'WANG-50' && (
        <section className="wg-seksjon" aria-labelledby="wg-dg-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-dg-tittel">Strokes Gained mot College D1</h2>
            <span className="wg-kilde">Powered by Data Golf · bare for trenere</span>
          </div>
          <div className="wg-helt-tall">
            {SG.map((s) => (
              <div key={s.navn}>
                <span>{s.navn}</span>
                <strong>{s.wang}</strong>
                <span className="wg-kilde">College D1 snitt: {s.ref}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
