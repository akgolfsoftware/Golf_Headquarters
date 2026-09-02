import React from 'react';

export function Liste({ poster = [], onVelg, tom = 'Ingenting her ennå.', style }) {
  if (poster.length === 0) {
    return <div style={{ padding: 'var(--ak-r-6)', textAlign: 'center', color: 'var(--ak-dempet)', border: '1px solid var(--ak-linje)', borderRadius: 'var(--ak-hjorne-md)', background: 'var(--ak-ark)', ...style }}>{tom}</div>;
  }
  const klikkbar = !!onVelg;
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--ak-linje-hard)', ...style }}>
      {poster.map((p, i) => (
        <li key={i}
          className={klikkbar ? 'ak-trykk ak-rad-trykk' : undefined}
          onClick={klikkbar ? () => onVelg(p, i) : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--ak-r-4)',
            padding: 'var(--ak-r-4) var(--ak-r-3)', minHeight: 'var(--ak-treff)',
            borderBottom: '1px solid var(--ak-linje)',
            background: 'transparent',
            cursor: klikkbar ? 'pointer' : 'default'
          }}>
          {p.merke && <span className="ak-etikett" style={{ width: 64, flex: '0 0 auto' }}>{p.merke}</span>}
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 'var(--ak-t-17)', fontWeight: 'var(--ak-v-500)' }}>{p.tittel}</span>
            {p.note && <span style={{ display: 'block', fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>{p.note}</span>}
          </span>
          {p.verdi && <span className="ak-maalt" style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-tekst)' }}>{p.verdi}</span>}
          {klikkbar && (
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" style={{ color: 'var(--ak-svak)' }}><path d="M9 6l6 6-6 6" /></svg>
          )}
        </li>
      ))}
    </ul>
  );
}
