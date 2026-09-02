import React from 'react';

export function Velger({ merkelapp, hjelp, feil, verdi, onEndre, valg = [], plassholder = 'Velg', deaktivert = false, id, style, ...rest }) {
  const feltId = id || React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-2)', ...style }}>
      {merkelapp && <label htmlFor={feltId} style={{ fontSize: 'var(--ak-t-15)', fontWeight: 'var(--ak-v-500)' }}>{merkelapp}</label>}
      <div style={{ position: 'relative' }}>
        <select {...rest} id={feltId} value={verdi} disabled={deaktivert} onChange={(e) => onEndre && onEndre(e.target.value)}
          aria-invalid={!!feil}
          style={{
            width: '100%', appearance: 'none', height: 'var(--ak-treff)', padding: '0 var(--ak-r-7) 0 var(--ak-r-3)',
            background: 'var(--ak-ark)', border: '1px solid ' + (feil ? 'var(--ak-feil)' : 'var(--ak-linje-hard)'),
            borderRadius: 'var(--ak-hjorne-sm)', color: verdi ? 'var(--ak-tekst)' : 'var(--ak-svak)',
            fontFamily: 'var(--ak-sans)', fontSize: 'var(--ak-t-17)', opacity: deaktivert ? 0.5 : 1
          }}>
          <option value="">{plassholder}</option>
          {valg.map((v) => <option key={v.verdi} value={v.verdi}>{v.tekst}</option>)}
        </select>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"
          style={{ position: 'absolute', right: 'var(--ak-r-3)', top: 13, color: 'var(--ak-dempet)', pointerEvents: 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {(feil || hjelp) && <span style={{ fontSize: 'var(--ak-t-13)', color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)' }}>{feil || hjelp}</span>}
    </div>
  );
}
