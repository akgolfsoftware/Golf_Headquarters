import React from 'react';
import { Logo } from '../merke/Logo.jsx';
import { IkonKnapp } from '../handling/IkonKnapp.jsx';

export function Mobilmeny({ apen = false, lenker = [], aktiv, handling, onLukk, logoRot = '/assets/logo/', style }) {
  if (!apen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Meny" className="ak-kommer" style={{
      position: 'absolute', inset: 0, zIndex: 40, background: 'var(--ak-grunn)',
      display: 'flex', flexDirection: 'column', ...style
    }}>
      <div style={{ height: 64, padding: '0 var(--ak-r-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ak-linje)' }}>
        <Logo hoyde={26} rot={logoRot} />
        <IkonKnapp merkelapp="Lukk meny" onClick={onLukk}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </IkonKnapp>
      </div>
      <nav style={{ flex: 1, padding: 'var(--ak-r-4) 0', display: 'flex', flexDirection: 'column' }}>
        {lenker.map((l) => {
          const her = l.href === aktiv;
          return (
            <a key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--ak-r-3)',
              minHeight: 56, padding: '0 var(--ak-r-4)', textDecoration: 'none',
              borderBottom: '1px solid var(--ak-linje)',
              fontFamily: 'var(--ak-display)', fontWeight: 'var(--ak-v-600)', fontSize: 'var(--ak-t-26)',
              letterSpacing: 'var(--ak-sp-titt)', color: 'var(--ak-tekst)'
            }}>
              {her && <span aria-hidden="true" style={{ width: 3, height: 24, background: 'var(--ak-signal)' }} />}
              {l.tekst}
            </a>
          );
        })}
      </nav>
      {handling && <div style={{ padding: 'var(--ak-r-4)' }}>{handling}</div>}
    </div>
  );
}
