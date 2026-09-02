import React from 'react';

const variantfarger = {
  junior: 'var(--ak-v-junior)', academy: 'var(--ak-signal)', hq: 'var(--ak-v-hq)',
  organisasjon: 'var(--ak-v-org)', produkt: 'var(--ak-v-produkt)', fag: 'var(--ak-fag)', noytral: 'var(--ak-dempet)'
};

export function Merkelapp({ variant = 'noytral', fylt = false, children, style, ...rest }) {
  const farge = variantfarger[variant] || variantfarger.noytral;
  return (
    <span {...rest} className="ak-maalt" style={{
      display: 'inline-flex', alignItems: 'center',
      height: 22, padding: '0 var(--ak-r-2)',
      fontSize: 'var(--ak-t-11)', fontWeight: 'var(--ak-v-500)',
      letterSpacing: 'var(--ak-sp-vid)', textTransform: 'uppercase',
      borderRadius: 'var(--ak-hjorne-sm)',
      border: '1px solid ' + (fylt ? 'transparent' : farge),
      background: fylt ? farge : 'transparent',
      color: fylt ? '#FFFFFF' : farge,
      ...style
    }}>{children}</span>
  );
}
