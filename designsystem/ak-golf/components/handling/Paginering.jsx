import React from 'react';
import { IkonKnapp } from './IkonKnapp.jsx';

const Pil = ({ vei }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"
    style={{ transform: vei === 'venstre' ? 'scaleX(-1)' : undefined }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export function Paginering({ side = 1, antallSider = 1, onBytt, style }) {
  const sider = Array.from({ length: antallSider }, (_, i) => i + 1);
  return (
    <nav aria-label="Paginering" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ak-r-2)', ...style }}>
      <IkonKnapp merkelapp="Forrige side" deaktivert={side <= 1} onClick={() => onBytt && onBytt(side - 1)}><Pil vei="venstre" /></IkonKnapp>
      <div style={{ display: 'flex', gap: 'var(--ak-r-1)' }}>
        {sider.map((n) => {
          const her = n === side;
          return (
            <button key={n} type="button" onClick={() => onBytt && onBytt(n)} aria-current={her ? 'page' : undefined}
              style={{
                minWidth: 40, height: 40, cursor: 'pointer',
                fontFamily: 'var(--ak-mono)', fontSize: 'var(--ak-t-15)', fontVariantNumeric: 'tabular-nums',
                borderRadius: 'var(--ak-hjorne-sm)',
                border: '1px solid ' + (her ? 'transparent' : 'var(--ak-linje)'),
                background: her ? 'var(--ak-tekst)' : 'transparent',
                color: her ? 'var(--ak-grunn)' : 'var(--ak-tekst)'
              }}>{n}</button>
          );
        })}
      </div>
      <IkonKnapp merkelapp="Neste side" deaktivert={side >= antallSider} onClick={() => onBytt && onBytt(side + 1)}><Pil vei="hoyre" /></IkonKnapp>
      <span className="ak-etikett" style={{ marginLeft: 'var(--ak-r-3)' }}>Side {side} av {antallSider}</span>
    </nav>
  );
}
