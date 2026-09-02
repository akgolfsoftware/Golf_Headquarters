import React from 'react';

export function Brodsmuler({ smuler = [], style }) {
  return (
    <nav aria-label="Brødsmuler" style={{ ...style }}>
      <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 'var(--ak-r-2)', margin: 0, padding: 0, alignItems: 'center' }}>
        {smuler.map((s, i) => {
          const siste = i === smuler.length - 1;
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ak-r-2)' }}>
              {i > 0 && <span aria-hidden="true" className="ak-maalt" style={{ color: 'var(--ak-svak)', fontSize: 'var(--ak-t-13)' }}>/</span>}
              {siste || !s.href
                ? <span aria-current={siste ? 'page' : undefined} className="ak-etikett" style={{ color: 'var(--ak-tekst)' }}>{s.tekst}</span>
                : <a href={s.href} className="ak-etikett" style={{ color: 'var(--ak-dempet)', textDecoration: 'none' }}>{s.tekst}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
