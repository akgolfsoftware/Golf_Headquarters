import React from 'react';

export function IkonKnapp({ merkelapp, variant = 'stille', storrelse = 44, aktiv = false, deaktivert = false, onClick, children, className, style, ...rest }) {
  const fyll = variant === 'fylt';
  const tone = fyll
    ? { background: 'var(--ak-signal-fyll)', color: 'var(--ak-signal-tekst)', borderColor: 'transparent',
        '--ak-h-bg': 'var(--ak-signal)', '--ak-h-kant': 'transparent', '--ak-h-tekst': 'var(--ak-signal-tekst)' }
    : { background: aktiv ? 'var(--ak-grunn-senk)' : 'transparent', color: 'var(--ak-tekst)',
        borderColor: aktiv ? 'var(--ak-linje-hard)' : 'var(--ak-linje)',
        '--ak-h-bg': 'var(--ak-grunn-senk)', '--ak-h-kant': 'var(--ak-linje-hard)', '--ak-h-tekst': 'var(--ak-tekst)' };
  return (
    <button
      {...rest} type="button" aria-label={merkelapp} aria-pressed={aktiv || undefined}
      disabled={deaktivert} aria-disabled={deaktivert || undefined} onClick={onClick}
      className={['ak-trykk', className].filter(Boolean).join(' ')}
      style={{
        width: storrelse, height: storrelse, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--ak-hjorne-sm)', cursor: deaktivert ? 'not-allowed' : 'pointer',
        border: '1px solid transparent', opacity: deaktivert ? 0.42 : 1,
        ...tone, ...style
      }}
    >
      {children}
    </button>
  );
}
