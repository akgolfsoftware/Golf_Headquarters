import React from 'react';
import { Logo } from '../merke/Logo.jsx';
import { Navnelaas } from '../merke/Navnelaas.jsx';
import { Knapp } from '../handling/Knapp.jsx';
import { IkonKnapp } from '../handling/IkonKnapp.jsx';

export function Toppnav({
  lenker = [], aktiv, handling, variant, mork = false, logoRot = '/assets/logo/',
  onMeny, mobil = false, style
}) {
  return (
    <header style={{
      position: 'relative', background: mork ? 'var(--ak-grunn)' : 'var(--ak-grunn)',
      borderBottom: '1px solid var(--ak-linje)', ...style
    }}>
      <div style={{
        maxWidth: 'var(--ak-sidebredde)', margin: '0 auto', height: mobil ? 64 : 80,
        padding: mobil ? '0 var(--ak-r-4)' : '0 var(--ak-r-6)',
        display: 'flex', alignItems: 'center', gap: 'var(--ak-r-6)'
      }}>
        <a href="/" style={{ display: 'block', textDecoration: 'none', flex: '0 0 auto' }} aria-label="AK Golf, til forsiden">
          {variant
            ? <Navnelaas variant={variant} paaMorkt={mork} hoyde={mobil ? 26 : 32} rot={logoRot} />
            : <Logo variant={mork ? 'hvit-mork' : 'primaer-lys'} hoyde={mobil ? 26 : 32} rot={logoRot} />}
        </a>
        {!mobil && (
          <nav style={{ display: 'flex', gap: 'var(--ak-r-5)', flex: 1 }}>
            {lenker.map((l) => {
              const her = l.href === aktiv;
              return (
                <a key={l.href} href={l.href} style={{
                  position: 'relative', display: 'flex', alignItems: 'center', height: 80,
                  fontSize: 'var(--ak-t-15)', fontWeight: 'var(--ak-v-500)',
                  color: her ? 'var(--ak-tekst)' : 'var(--ak-dempet)', textDecoration: 'none'
                }}>
                  {l.tekst}
                  {her && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: 'var(--ak-signal)' }} />}
                </a>
              );
            })}
          </nav>
        )}
        {mobil && <span style={{ flex: 1 }} />}
        {!mobil && handling}
        {mobil && (
          <IkonKnapp merkelapp="Åpne meny" onClick={onMeny}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </IkonKnapp>
        )}
      </div>
    </header>
  );
}
