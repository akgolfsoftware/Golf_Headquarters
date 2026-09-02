import React from 'react';

export function Avkrysning({ merkelapp, hjelp, avkrysset = false, onEndre, deaktivert = false, feil, id, style, ...rest }) {
  const feltId = id || React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-1)', ...style }}>
      <label htmlFor={feltId} style={{
        display: 'flex', gap: 'var(--ak-r-3)', alignItems: 'flex-start', cursor: deaktivert ? 'not-allowed' : 'pointer',
        minHeight: 'var(--ak-treff)', paddingTop: 10, opacity: deaktivert ? 0.5 : 1
      }}>
        <span style={{
          flex: '0 0 auto', width: 22, height: 22, marginTop: 1, borderRadius: 4,
          border: '1px solid ' + (feil ? 'var(--ak-feil)' : avkrysset ? 'transparent' : 'var(--ak-linje-hard)'),
          background: avkrysset ? 'var(--ak-tekst)' : 'var(--ak-ark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background-color var(--ak-fart-rask) var(--ak-kurve)'
        }}>
          {avkrysset && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ak-grunn)" strokeWidth="3" strokeLinecap="square"><path d="M5 13l4 4L19 7" /></svg>}
        </span>
        <input {...rest} id={feltId} type="checkbox" checked={avkrysset} disabled={deaktivert}
          onChange={(e) => onEndre && onEndre(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
        <span style={{ fontSize: 'var(--ak-t-15)', lineHeight: 1.45 }}>{merkelapp}</span>
      </label>
      {(feil || hjelp) && <span style={{ fontSize: 'var(--ak-t-13)', color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)', paddingLeft: 34 }}>{feil || hjelp}</span>}
    </div>
  );
}
