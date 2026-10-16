'use client';

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
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

type ProfilFane = 'plan' | 'stats' | 'tester' | 'iup' | 'samtaler' | 'turneringer';

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

const PROFILFANER: { id: ProfilFane; label: string }[] = [
  { id: 'iup', label: 'IUP' },
  { id: 'plan', label: 'Plan' },
  { id: 'stats', label: 'Stats' },
  { id: 'tester', label: 'Tester' },
  { id: 'samtaler', label: 'Samtaler' },
  { id: 'turneringer', label: 'Turneringer' },
];

const PROVER = [
  { dato: '12. oktober', navn: 'Matematikk 1T (VG1)', tiltak: 'Heldagsprøve · morgenøkta tilpasses' },
  { dato: '23. oktober', navn: 'Norsk hovedmål (VG3)', tiltak: 'Heldag · fri fra morgentreningen' },
] as const;

const etterlevelse = (e: (typeof WANG_ELEVER)[number]) =>
  e.etterlevelseSiste4Uker.planlagtTimer > 0
    ? Math.round((e.etterlevelseSiste4Uker.gjennomfortTimer / e.etterlevelseSiste4Uker.planlagtTimer) * 100)
    : null;

const initialer = (navn: string) =>
  navn.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

/**
 * WANG-07/44/45 Elever for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/elever.html (pakke 7, utkast 1, 14.10.2026).
 * Avvik:
 *   - Fireukerssjekken viser tid mot plan per elev, ikke prosessmål og de 41
 *     spørsmålene. Kilden har ikke svarene for WANG-elevene.
 *   - Skolefravær, godkjent idrettsfravær og skjemaversjoner viser «—».
 *   - Fanene fra dagens skjerm er beholdt, med kortere navn.
 */
export function WangElever({
  aktivFane = 'WANG-07',
  onFaneEndret,
  campus = 'Fredrikstad',
  valgtElevId = 'sofie',
}: WangEleverProps) {
  const [fane, setFane] = useState(aktivFane);
  const [aktivElevId, setAktivElevId] = useState<string>(valgtElevId);
  const [profilUnderFane, setProfilUnderFane] = useState<ProfilFane>('iup');
  const [klasseFilter, setKlasseFilter] = useState<string>('Alle');
  const [sokeord, setSokeord] = useState<string>('');

  // Inviter elev tilstand (WANG-20)
  const [invNavn, setInvNavn] = useState('');
  const [invEpost, setInvEpost] = useState('');
  const [invKlasse, setInvKlasse] = useState('VG1');

  // Samtale tilstand (WANG-44)
  const [nySamtaleTema, setNySamtaleTema] = useState('');
  const [nySamtaleDato, setNySamtaleDato] = useState('2026-10-05');

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
  const under85 = WANG_ELEVER.filter((e) => (etterlevelse(e) ?? 100) < 85).length;
  const delt = WANG_ELEVER.filter((e) => e.delingsStatus === 'delt').length;

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">WANG {campus} · elevene</p>
          <h1 className="wg-tittel">Elever</h1>
          <p className="wg-ingress">IUP, fireukerssjekk og skole for hver elev. Du ser bare det eleven har delt med deg.</p>
        </div>
        <div className="wg-helt-tall">
          <div>
            <span>Elever</span>
            <strong>{WANG_ELEVER.length}</strong>
            <span className="wg-kilde">I gruppa</span>
          </div>
          <div>
            <span>Har delt</span>
            <strong>{delt}</strong>
            <span className="wg-kilde">av {WANG_ELEVER.length}</span>
          </div>
          <div className={under85 > 0 ? 'wg-signal' : undefined}>
            <span>Under 85 %</span>
            <strong>{under85}</strong>
            <span className="wg-kilde">Tid mot plan, fire uker</span>
          </div>
          <div>
            <span>Neste prøve</span>
            <strong>{PROVER[0].dato.replace('oktober', 'okt.')}</strong>
            <span className="wg-kilde">{PROVER[0].navn}</span>
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

      {fane === 'WANG-07' && (
        <section className="wg-seksjon" aria-labelledby="wg-elever-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-elever-tittel">Alle elever</h2>
            <span className="wg-kilde">4-ukers etterlevelse</span>
          </div>
          <div className="wg-rutenett" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
            <label className="wg-lbl">
              <span>Søk</span>
              <input type="search" value={sokeord} onChange={(e) => setSokeord(e.target.value)} placeholder="Navn" className="wg-field" />
            </label>
            <label className="wg-lbl">
              <span>Klasse</span>
              <select value={klasseFilter} onChange={(e) => setKlasseFilter(e.target.value)} className="wg-field">
                <option value="Alle">Alle klasser</option>
                <option value="VG1">VG1</option>
                <option value="VG2">VG2</option>
                <option value="VG3">VG3</option>
              </select>
            </label>
          </div>
          <div className="wg-kort wg-saker">
            {filtrerteElever.length === 0 ? (
              <p className="wg-kilde" style={{ padding: '14px 0' }}>Ingen elever passer søket.</p>
            ) : (
              filtrerteElever.map((el) => {
                const pst = etterlevelse(el);
                return (
                  <div key={el.id} className="wg-sak">
                    <span className="wg-avatar" aria-hidden="true">{initialer(el.navn)}</span>
                    <b>{el.navn} · {el.klasse} · HCP {el.handicap.replace('.', ',')}</b>
                    <p>
                      {pst === null ? '—' : `${pst} %`} av plan ({el.etterlevelseSiste4Uker.gjennomfortTimer} av {el.etterlevelseSiste4Uker.planlagtTimer} t) · fokus: {el.iup.hovedFokus[0] ?? '—'}
                    </p>
                    <div className="wg-knapper">
                      <button
                        type="button"
                        className="wg-btn wg-btn-secondary"
                        onClick={() => {
                          setAktivElevId(el.id);
                          byttFane('WANG-44');
                        }}
                      >
                        Åpne IUP
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {fane === 'WANG-44' && aktivElev && (
        <>
          <section className="wg-seksjon" aria-labelledby="wg-iup-tittel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span className="wg-avatar" style={{ width: 52, height: 52, fontSize: 16 }} aria-hidden="true">{initialer(aktivElev.navn)}</span>
              <div style={{ flex: '1 1 200px' }}>
                <p className="wg-dato">{aktivElev.klasse} · {aktivElev.campus} · HCP {aktivElev.handicap.replace('.', ',')}</p>
                <h2 id="wg-iup-tittel" className="wg-tittel" style={{ fontSize: 26 }}>{aktivElev.navn}</h2>
              </div>
              <label className="wg-lbl" style={{ flex: '1 1 200px' }}>
                <span>Bytt elev</span>
                <select value={aktivElevId} onChange={(e) => setAktivElevId(e.target.value)} className="wg-field">
                  {WANG_ELEVER.map((e) => (
                    <option key={e.id} value={e.id}>{e.navn} ({e.klasse})</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="wg-btn wg-btn-ghost" style={{ justifySelf: 'start' }} onClick={() => byttFane('WANG-07')}>
              Tilbake til elevene
            </button>
          </section>

          <nav aria-label="Elevprofil" className="wgf-rad">
            {PROFILFANER.map((uf) => (
              <button
                key={uf.id}
                type="button"
                aria-pressed={profilUnderFane === uf.id}
                onClick={() => setProfilUnderFane(uf.id)}
                className={`wgf ${profilUnderFane === uf.id ? 'wgf-pa' : ''}`}
              >
                {uf.label}
              </button>
            ))}
          </nav>

          {profilUnderFane === 'iup' && (
            <div className="wg-to-kol">
              <div>
                <section className="wg-kort wg-fyll">
                  <span className="wg-dato">Sesongmål 2026/2027</span>
                  <h3 style={{ margin: 0, font: '800 20px/1.25 var(--font-wang-brand, Montserrat, sans-serif)', color: 'var(--wg-navy-dyp)' }}>
                    {aktivElev.iup.sesongMaal}
                  </h3>
                  <span className="wg-dato">Hovedfokus</span>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
                    {aktivElev.iup.hovedFokus.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </section>
              </div>
              <div>
                <section className="wg-kort wg-fyll">
                  <span className="wg-dato">Tiltak og treningsprioriteter</span>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
                    {aktivElev.iup.tiltak.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  <p className="wg-kilde">Neste evalueringssamtale: {aktivElev.iup.nesteEvaluering}</p>
                  <p className="wg-kilde">Godkjenning: ikke koblet ennå</p>
                </section>
              </div>
            </div>
          )}

          {profilUnderFane === 'plan' && (
            <section className="wg-kort wg-fyll">
              <p className="wg-kilde">
                Eleven følger WANG-timeplanen med morgentrening tirsdag og torsdag, egentrening og helgeturneringer.
              </p>
            </section>
          )}

          {profilUnderFane === 'stats' && (
            <section className="wg-kort wg-fyll">
              <span className="wg-dato">Etterlevelse siste fire uker</span>
              <strong style={{ font: '800 40px/1 var(--font-wang-brand, Montserrat, sans-serif)', color: 'var(--wg-navy-dyp)' }}>
                {etterlevelse(aktivElev) === null ? '—' : `${etterlevelse(aktivElev)} %`}
              </strong>
              <p className="wg-kilde">
                Gjennomført {aktivElev.etterlevelseSiste4Uker.gjennomfortTimer} av {aktivElev.etterlevelseSiste4Uker.planlagtTimer} planlagte timer.
              </p>
            </section>
          )}

          {profilUnderFane === 'tester' && (
            <section className="wg-kort wg-rader">
              {WANG_FYSISKE_TESTER.map((t) => {
                const res = WANG_TEST_RESULTATER.find((r) => r.testId === t.id && r.elevId === aktivElev.id);
                return (
                  <div key={t.id} className="wg-rad">
                    <div>
                      <b>{t.navn}</b>
                      <p className="wg-kilde">{res ? (res.godkjent ? 'Kontrollert' : 'Egenført') : 'Ikke testet'}</p>
                    </div>
                    <span className="wg-tall">{res ? `${String(res.verdi).replace('.', ',')} ${t.enhet}` : '—'}</span>
                  </div>
                );
              })}
            </section>
          )}

          {profilUnderFane === 'samtaler' && (
            <form onSubmit={(e) => e.preventDefault()} className="wg-kort wg-fyll">
              <div className="wg-rutenett" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
                <label className="wg-lbl">
                  <span>Dato</span>
                  <input type="date" value={nySamtaleDato} onChange={(e) => setNySamtaleDato(e.target.value)} className="wg-field" />
                </label>
                <label className="wg-lbl">
                  <span>Tema</span>
                  <input type="text" value={nySamtaleTema} onChange={(e) => setNySamtaleTema(e.target.value)} placeholder="Hva snakket dere om?" className="wg-field" />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                  Lagre samtale
                </button>
                <WangIkkeKoblet />
              </div>
            </form>
          )}

          {profilUnderFane === 'turneringer' && (
            <section className="wg-kort wg-fyll">
              <p className="wg-kilde">Turneringene per elev står under Konkurranse, hentet fra ekte resultater.</p>
            </section>
          )}
        </>
      )}

      {fane === 'WANG-45' && (
        <section className="wg-seksjon" aria-labelledby="wg-fire-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-fire-tittel">Fireukerssjekk</h2>
            <span className="wg-kilde">Tid mot plan siste fire uker</span>
          </div>
          <div className="wg-kort wg-rader">
            {WANG_ELEVER.map((e) => {
              const pst = etterlevelse(e);
              const lav = pst !== null && pst < 85;
              return (
                <div key={e.id} className="wg-rad">
                  <div>
                    <b>{e.navn}</b>
                    <p className="wg-kilde">{e.etterlevelseSiste4Uker.gjennomfortTimer} av {e.etterlevelseSiste4Uker.planlagtTimer} t</p>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`wg-pille ${lav ? 'wg-pille-haster' : 'wg-pille-ok'}`}><i />{lav ? 'Trenger samtale' : 'God progresjon'}</span>
                    <span className="wg-tall">{pst === null ? '—' : `${pst} %`}</span>
                  </span>
                  <div className="wg-stolpe" role="img" aria-label={`Etterlevelse ${pst ?? 0} prosent`}>
                    <span className={lav ? 'wg-lav' : undefined} style={{ width: `${Math.min(pst ?? 0, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {fane === 'WANG-46' && (
        <section className="wg-seksjon" aria-labelledby="wg-forslag-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-forslag-tittel">Forslag til elev</h2>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-kilde">
              Du foreslår endringer i treningsuka eller delmålene i IUP. Eleven godtar eller avviser forslaget i PlayerHQ.
            </p>
            <span><WangIkkeKoblet /></span>
          </div>
        </section>
      )}

      {fane === 'WANG-47' && (
        <section className="wg-seksjon" aria-labelledby="wg-skjema-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-skjema-tittel">Skjema og kilder</h2>
          </div>
          <div className="wg-kort wg-rader">
            {['Gjeldende IUP-skjema', 'Gjeldende testbatteri', 'Data Golf-kobling'].map((n) => (
              <div key={n} className="wg-rad">
                <b>{n}</b>
                <span className="wg-tall">—</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {fane === 'WG-05' && (
        <section className="wg-seksjon" aria-labelledby="wg-trener-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-trener-tittel">Trenerflate</h2>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-kilde">Treningsgruppene og elevene hver trener har ansvar for ved WANG {campus}.</p>
          </div>
        </section>
      )}

      {fane === 'WANG-05' && (
        <section className="wg-seksjon" aria-labelledby="wg-skole-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-skole-tittel">Skole og fravær</h2>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
          <div className="wg-kort wg-rader">
            {WANG_ELEVER.map((e) => (
              <div key={e.id} className="wg-rad">
                <div>
                  <b>{e.navn}</b>
                  <p className="wg-kilde">{e.klasse} · godkjent idrettsfravær —</p>
                </div>
                <span className="wg-tall">—</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {fane === 'WG-04' && (
        <section className="wg-seksjon" aria-labelledby="wg-prove-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-prove-tittel">Prøveplan</h2>
            <span className="wg-kilde">Så testuker og reiser ikke kolliderer med store prøver</span>
          </div>
          <div className="wg-kort wg-saker">
            {PROVER.map((p) => (
              <div key={p.navn} className="wg-sak">
                <span className="wg-pille wg-pille-vent"><i />{p.dato}</span>
                <b>{p.navn}</b>
                <p>{p.tiltak}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {fane === 'WANG-20' && (
        <section className="wg-seksjon" aria-labelledby="wg-inviter-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-inviter-tittel">Inviter ny elev</h2>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="wg-kort wg-fyll" style={{ maxWidth: 600 }}>
            <label className="wg-lbl">
              <span>Elevens fulle navn</span>
              <input type="text" value={invNavn} onChange={(e) => setInvNavn(e.target.value)} placeholder="Fornavn Etternavn" className="wg-field" />
            </label>
            <label className="wg-lbl">
              <span>Elevens e-post</span>
              <input type="email" value={invEpost} onChange={(e) => setInvEpost(e.target.value)} placeholder="elev@skole.wang.no" className="wg-field" />
            </label>
            <label className="wg-lbl">
              <span>Klasse</span>
              <select value={invKlasse} onChange={(e) => setInvKlasse(e.target.value)} className="wg-field">
                <option value="VG1">VG1</option>
                <option value="VG2">VG2</option>
                <option value="VG3">VG3</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                Send invitasjonslenke
              </button>
              <WangIkkeKoblet />
            </div>
          </form>
        </section>
      )}
    </>
  );
}
