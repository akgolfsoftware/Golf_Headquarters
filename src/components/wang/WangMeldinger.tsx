'use client';

import React, { useState } from 'react';
import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
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

const FANER = [
  { id: 'WANG-13', navn: 'Gruppeposter' },
  { id: 'WANG-14', navn: 'Til elev' },
  { id: 'WANG-15', navn: 'Foresatte' },
  { id: 'WANG-21', navn: 'Dokumenter' },
] as const;

const DOKUMENTER = [
  { navn: 'WANG Toppidrett Utøveravtale 2026/27.pdf', kat: 'Kontrakter', dato: '15.08.2026' },
  { navn: 'IUP Standardmal Golf VGS.docx', kat: 'Utviklingsplaner', dato: '01.09.2026' },
  { navn: 'Testprotokoll Fysisk og Golf WANG 2026.pdf', kat: 'Tester', dato: '10.09.2026' },
  { navn: 'Reisereglement og permisjonsregler ved turnering.pdf', kat: 'Reglement', dato: '20.08.2026' },
  { navn: 'Skolekoordinering og fraværsrutiner.pdf', kat: 'Administrasjon', dato: '25.08.2026' },
] as const;

const SKJEMATITTEL: Record<string, string> = {
  'WANG-13': 'Ny gruppepost',
  'WANG-14': 'Ny melding til elev',
  'WANG-15': 'Ny melding til foresatte',
};

/**
 * WANG-13/14/15/21 Meldinger for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/meldinger.html (pakke 6, utkast 1, 14.10.2026).
 * Avvik:
 *   - Innboksen med samtaler, foreldremøte med svar og referat og rekkevidde per
 *     dokument er ikke med. Kilden har bare sendte meldinger.
 *   - «Lest av» viser «—» til lesekvittering er koblet.
 */
export function WangMeldinger({
  aktivFane = 'WANG-13',
  onFaneEndret,
  campus = 'Fredrikstad',
}: WangMeldingerProps) {
  const [fane, setFane] = useState(aktivFane);
  const [meldinger] = useState<WangMelding[]>(WANG_MELDINGER);

  // Ny gruppepost tilstand
  const [nyTittel, setNyTittel] = useState('');
  const [nyttInnhold, setNyttInnhold] = useState('');
  const [nyMottakerNavn, setNyMottakerNavn] = useState('VG1 Golf ' + campus);

  const byttFane = (nyFane: string) => {
    setFane(nyFane);
    if (onFaneEndret) onFaneEndret(nyFane);
  };

  const synligeMeldinger = meldinger.filter((m) => {
    if (fane === 'WANG-13') return m.mottakerType === 'gruppe';
    if (fane === 'WANG-14') return m.mottakerType === 'elev';
    if (fane === 'WANG-15') return m.mottakerType === 'forelder';
    return true;
  });

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">WANG {campus} · post</p>
          <h1 className="wg-tittel">Meldinger</h1>
          <p className="wg-ingress">
            Gruppeposter, meldinger til elever og foresatte, og dokumentene gruppa bruker. Meldinger kan ikke slettes.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Gruppeposter</span>
            <strong>{meldinger.filter((m) => m.mottakerType === 'gruppe').length}</strong>
            <span className="wg-kilde">Sendt</span>
          </div>
          <div>
            <span>Til elever</span>
            <strong>{meldinger.filter((m) => m.mottakerType === 'elev').length}</strong>
            <span className="wg-kilde">Sendt</span>
          </div>
          <div>
            <span>Til foresatte</span>
            <strong>{meldinger.filter((m) => m.mottakerType === 'forelder').length}</strong>
            <span className="wg-kilde">Sendt</span>
          </div>
          <div>
            <span>Uleste svar</span>
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

      {fane !== 'WANG-21' ? (
        <div className="wg-to-kol">
          <div>
            <section className="wg-seksjon" aria-labelledby="wg-sendt-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-sendt-tittel">Sendt</h2>
                <span className="wg-kilde">{synligeMeldinger.length} meldinger</span>
              </div>
              <div className="wg-kort wg-saker">
                {synligeMeldinger.length === 0 ? (
                  <p className="wg-kilde" style={{ padding: '14px 0' }}>Ingen meldinger her ennå.</p>
                ) : (
                  synligeMeldinger.map((m) => (
                    <div key={m.id} className="wg-sak">
                      <span className={`wg-pille ${m.status === 'publisert' ? 'wg-pille-ok' : 'wg-pille-vent'}`}>
                        <i />
                        {m.status === 'publisert' ? 'Sendt' : 'Kladd'}
                      </span>
                      <b>{m.tittel}</b>
                      <p>{m.innhold}</p>
                      <p className="wg-kilde">
                        Til {m.mottakerNavn} · {m.opprettetDato} · fra {m.avsender} ({m.rolle}) · lest av —
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div>
            <section className="wg-seksjon" aria-labelledby="wg-ny-tittel">
              <div className="wg-sek-topp">
                <h2 id="wg-ny-tittel">{SKJEMATITTEL[fane] ?? 'Ny melding'}</h2>
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="wg-kort wg-fyll">
                <label className="wg-lbl">
                  <span>Mottaker</span>
                  <select value={nyMottakerNavn} onChange={(e) => setNyMottakerNavn(e.target.value)} className="wg-field">
                    {fane === 'WANG-14'
                      ? WANG_ELEVER.map((el) => (
                          <option key={el.id} value={el.navn}>{el.navn} ({el.klasse})</option>
                        ))
                      : (fane === 'WANG-15'
                          ? ['Foresatte VG1', 'Foresatte VG2', 'Foresatte VG3', 'Alle foresatte']
                          : ['VG1 Golf', 'VG2 Golf', 'VG3 Golf', 'Alle golfklasser']
                        ).map((g) => (
                          <option key={g} value={`${g} ${campus}`}>{g} {campus}</option>
                        ))}
                  </select>
                </label>
                <label className="wg-lbl">
                  <span>Tittel</span>
                  <input type="text" value={nyTittel} onChange={(e) => setNyTittel(e.target.value)} placeholder="Hva gjelder det?" className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>Melding</span>
                  <textarea value={nyttInnhold} onChange={(e) => setNyttInnhold(e.target.value)} placeholder="Skriv beskjeden her" rows={5} className="wg-field" />
                </label>
                {fane === 'WANG-14' ? (
                  <p className="wg-kilde">Foresatte til elever under 18 leser samtalen.</p>
                ) : null}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="submit" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                    Publiser melding
                  </button>
                  <WangIkkeKoblet />
                </div>
              </form>
            </section>
          </div>
        </div>
      ) : (
        <section className="wg-seksjon" aria-labelledby="wg-dok-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-dok-tittel">Dokumenter og maler</h2>
            <span className="wg-kilde">{DOKUMENTER.length} dokumenter</span>
          </div>
          <div className="wg-kort wg-rader">
            {DOKUMENTER.map((d) => (
              <div key={d.navn} className="wg-rad">
                <div>
                  <b>{d.navn}</b>
                  <p className="wg-kilde">{d.kat} · sist endret {d.dato}</p>
                </div>
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button type="button" disabled className="wg-btn wg-btn-secondary" style={IKKE_KOBLET_KNAPP_STIL}>
                    Last ned
                  </button>
                  <WangIkkeKoblet />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
