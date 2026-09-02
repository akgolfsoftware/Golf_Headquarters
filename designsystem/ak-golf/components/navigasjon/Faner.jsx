import React from 'react';

export function Faner({ faner = [], aktiv, onBytt, aksent = 'var(--ak-signal)', style }) {
  return (
    <div role="tablist" style={{ display: 'flex', gap: 'var(--ak-r-5)', borderBottom: '1px solid var(--ak-linje-hard)', ...style }}>
      {faner.map((f) => {
        const her = f.noekkel === aktiv;
        return (
          <button key={f.noekkel} role="tab" type="button" aria-selected={her} onClick={() => onBytt && onBytt(f.noekkel)}
            style={{
              position: 'relative', background: 'transparent', border: 0, cursor: 'pointer',
              padding: 'var(--ak-r-3) 0', minHeight: 'var(--ak-treff)',
              fontFamily: 'var(--ak-sans)', fontSize: 'var(--ak-t-17)', fontWeight: 'var(--ak-v-500)',
              color: her ? 'var(--ak-tekst)' : 'var(--ak-dempet)'
            }}>
            {f.tekst}
            {f.antall != null && <span className="ak-maalt" style={{ marginLeft: 8, fontSize: 'var(--ak-t-13)', color: 'var(--ak-svak)' }}>{f.antall}</span>}
            {her && <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: aksent }} />}
          </button>
        );
      })}
    </div>
  );
}
