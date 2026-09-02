import React from 'react';

/* Fokus: kanten går til tekstfargen ved fokus (uansett inngang), og
   fokusringen (2 px signal, 2 px avstand) kommer fra .ak-felt:focus-visible
   i tokens/samspill.css — kun ved tastatur. Rettet 02.09.2026: en tidligere
   versjon satte outline: 'none' og fjernet ringen helt. */

export function Felt({
  merkelapp, hjelp, feil, enhet, verdi, onEndre, type = 'text', plassholder,
  flerlinje = false, paakrevd = false, deaktivert = false, maalt = false, id, style, className, ...rest
}) {
  const [fokus, setFokus] = React.useState(false);
  const feltId = id || React.useId();
  const kant = feil ? 'var(--ak-feil)' : fokus ? 'var(--ak-tekst)' : 'var(--ak-linje-hard)';
  const felles = {
    width: '100%', appearance: 'none', background: 'var(--ak-ark)',
    border: '1px solid ' + kant, borderRadius: 'var(--ak-hjorne-sm)',
    color: 'var(--ak-tekst)', fontFamily: maalt ? 'var(--ak-mono)' : 'var(--ak-sans)',
    fontSize: 'var(--ak-t-17)', lineHeight: 1.4,
    padding: flerlinje ? 'var(--ak-r-3) var(--ak-r-3)' : '0 var(--ak-r-3)',
    height: flerlinje ? undefined : 'var(--ak-treff)', minHeight: flerlinje ? 120 : undefined,
    paddingRight: enhet ? 'var(--ak-r-8)' : undefined,
    opacity: deaktivert ? 0.5 : 1,
    transition: 'border-color var(--ak-fart-rask) var(--ak-kurve)'
  };
  const klasse = ['ak-felt', className].filter(Boolean).join(' ');
  const felt = flerlinje
    ? <textarea {...rest} id={feltId} className={klasse} value={verdi} placeholder={plassholder} disabled={deaktivert}
        onChange={(e) => onEndre && onEndre(e.target.value)} onFocus={() => setFokus(true)} onBlur={() => setFokus(false)}
        aria-invalid={!!feil} aria-describedby={feil || hjelp ? feltId + '-note' : undefined} style={felles} />
    : <input {...rest} id={feltId} className={klasse} type={type} value={verdi} placeholder={plassholder} disabled={deaktivert}
        onChange={(e) => onEndre && onEndre(e.target.value)} onFocus={() => setFokus(true)} onBlur={() => setFokus(false)}
        aria-invalid={!!feil} aria-describedby={feil || hjelp ? feltId + '-note' : undefined} style={felles} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-2)', ...style }}>
      {merkelapp && (
        <label htmlFor={feltId} style={{ fontSize: 'var(--ak-t-15)', fontWeight: 'var(--ak-v-500)', color: 'var(--ak-tekst)' }}>
          {merkelapp}{paakrevd && <span aria-hidden="true" style={{ color: 'var(--ak-signal)' }}> *</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {felt}
        {enhet && <span className="ak-maalt" style={{
          position: 'absolute', right: 'var(--ak-r-3)', top: 0, height: 'var(--ak-treff)',
          display: 'flex', alignItems: 'center', color: 'var(--ak-svak)', fontSize: 'var(--ak-t-15)'
        }}>{enhet}</span>}
      </div>
      {(feil || hjelp) && (
        <span id={feltId + '-note'} style={{
          fontSize: 'var(--ak-t-13)', color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)'
        }}>{feil || hjelp}</span>
      )}
    </div>
  );
}
