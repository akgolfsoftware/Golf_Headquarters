import React from 'react';

const toner = {
  info: { kant: 'var(--ak-linje-hard)', merke: 'var(--ak-tekst)' },
  ok: { kant: 'var(--ak-ok)', merke: 'var(--ak-ok)' },
  varsel: { kant: 'var(--ak-varsel)', merke: 'var(--ak-varsel)' },
  feil: { kant: 'var(--ak-feil)', merke: 'var(--ak-feil)' }
};

export function Varsel({ tilstand = 'info', tittel, handling, onLukk, children, style, ...rest }) {
  const t = toner[tilstand] || toner.info;
  return (
    <div {...rest} role={tilstand === 'feil' ? 'alert' : 'status'} className="ak-kommer" data-ak-fra="bunn" style={{
      display: 'flex', gap: 'var(--ak-r-4)', alignItems: 'flex-start',
      background: 'var(--ak-ark)', border: '1px solid var(--ak-linje)',
      borderLeft: '3px solid ' + t.merke,
      borderRadius: 'var(--ak-hjorne-sm)', padding: 'var(--ak-r-4)', ...style
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {tittel && <div style={{ fontWeight: 'var(--ak-v-500)', fontSize: 'var(--ak-t-17)', marginBottom: children ? 'var(--ak-r-1)' : 0 }}>{tittel}</div>}
        {children && <div style={{ fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)', maxWidth: '58ch' }}>{children}</div>}
        {handling && <div style={{ marginTop: 'var(--ak-r-3)' }}>{handling}</div>}
      </div>
      {onLukk && (
        <button type="button" onClick={onLukk} aria-label="Lukk melding" style={{
          flex: '0 0 auto', width: 32, height: 32, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--ak-dempet)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      )}
    </div>
  );
}
