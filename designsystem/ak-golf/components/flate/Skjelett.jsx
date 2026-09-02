import React from 'react';

/* Skjelett — plassen noe kommer til å ta, før det har kommet. Senket flate,
   samme radius som det som skal stå der, rolig puls (ak-puls fra samspill;
   under redusert bevegelse står den stille). Aldri en snurrer i stedet for
   innhold: skjelettet sier hvor mye som kommer, snurreren sier bare «vent».

   Sett aria-busy på beholderen rundt, og fjern skjelettet når innholdet er
   der. Skjelettet selv er aria-hidden. */

const former = {
  linje: { height: '1em', borderRadius: 'var(--ak-hjorne-sm)' },
  tittel: { height: 'var(--ak-t-26)', borderRadius: 'var(--ak-hjorne-sm)' },
  tall: { height: 'var(--ak-t-72)', width: '5ch', borderRadius: 'var(--ak-hjorne-sm)' },
  blokk: { height: 160, borderRadius: 'var(--ak-hjorne-md)' },
  bilde: { aspectRatio: '3 / 2', borderRadius: 'var(--ak-hjorne-md)' },
  rund: { width: 40, height: 40, borderRadius: 'var(--ak-hjorne-sm)' }
};

export function Skjelett({ form = 'linje', bredde, hoyde, linjer = 1, style }) {
  const f = former[form] || former.linje;
  const en = (i) => (
    <span key={i} aria-hidden="true" style={{
      display: 'block', background: 'var(--ak-grunn-senk)', animation: 'ak-puls 1600ms ease-in-out infinite',
      ...f, width: bredde ?? (form === 'linje' && linjer > 1 && i === linjes - 1 ? '62%' : f.width ?? '100%'),
      height: hoyde ?? f.height, ...style
    }} />
  );
  const linjes = Math.max(1, linjer);
  if (form === 'linje' && linjes > 1) {
    return <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-2)' }}>{Array.from({ length: linjes }, (_, i) => en(i))}</span>;
  }
  return en(0);
}
