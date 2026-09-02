import React from 'react';

const toner = {
  ok: { farge: 'var(--ak-ok)', ord: 'I orden' },
  varsel: { farge: 'var(--ak-varsel)', ord: 'Følg med' },
  feil: { farge: 'var(--ak-feil)', ord: 'Feil' },
  noytral: { farge: 'var(--ak-dempet)', ord: 'Ikke satt' }
};

export function Status({ tilstand = 'noytral', children, style, ...rest }) {
  const t = toner[tilstand] || toner.noytral;
  return (
    <span {...rest} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ak-r-2)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-tekst)', ...style }}>
      <span aria-hidden="true" style={{ width: 8, height: 8, flex: '0 0 auto', background: t.farge, borderRadius: 2 }} />
      <span>{children || t.ord}</span>
    </span>
  );
}
