import React from 'react';

/* Hover, trykk og snurre ligger i tokens/samspill.css — ikke her.
   onMouseEnter utløses av et trykk på mobil og blir hengende; CSS kan
   spørre om enheten har en ekte peker, og det er den eneste riktige
   måten på et merke der mobil er viktigste visning. */

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ak-r-2)',
  fontFamily: 'var(--ak-sans)', fontWeight: 'var(--ak-v-500)', lineHeight: 1,
  border: '1px solid transparent', borderRadius: 'var(--ak-hjorne-sm)',
  cursor: 'pointer', textDecoration: 'none', minHeight: 'var(--ak-treff)'
};

const stoerrelser = {
  sm: { fontSize: 'var(--ak-t-15)', padding: '0 var(--ak-r-4)', minHeight: 36 },
  md: { fontSize: 'var(--ak-t-17)', padding: '0 var(--ak-r-5)' },
  lg: { fontSize: 'var(--ak-t-21)', padding: '0 var(--ak-r-6)', minHeight: 56 }
};

/* Hviletilstand inline; hover-verdiene sendes som custom properties
   samspill.css leser. Da finnes hver farge fortsatt bare ett sted. */
const toner = {
  primaer: {
    background: 'var(--ak-signal-fyll)', color: 'var(--ak-signal-tekst)', borderColor: 'transparent',
    '--ak-h-bg': 'var(--ak-signal)', '--ak-h-kant': 'transparent', '--ak-h-tekst': 'var(--ak-signal-tekst)'
  },
  sekundaer: {
    background: 'transparent', color: 'var(--ak-tekst)', borderColor: 'var(--ak-linje-hard)',
    '--ak-h-bg': 'var(--ak-grunn-senk)', '--ak-h-kant': 'var(--ak-linje-hard)', '--ak-h-tekst': 'var(--ak-tekst)'
  },
  tekst: {
    background: 'transparent', color: 'var(--ak-signal)', borderColor: 'transparent',
    padding: '0 var(--ak-r-2)', textDecoration: 'underline', textDecorationThickness: 1, textUnderlineOffset: 4,
    '--ak-h-bg': 'transparent', '--ak-h-kant': 'transparent', '--ak-h-tekst': 'var(--ak-tekst)'
  }
};

export function Knapp({
  variant = 'primaer', storrelse = 'md', pill = false, fullBredde = false,
  deaktivert = false, laster = false, ikon, href, onClick, children, className, style, ...rest
}) {
  const av = deaktivert || laster;
  const s = {
    ...base, ...stoerrelser[storrelse], ...(toner[variant] || toner.primaer),
    borderRadius: pill ? 'var(--ak-hjorne-pill)' : 'var(--ak-hjorne-sm)',
    width: fullBredde ? '100%' : undefined,
    opacity: av ? 0.42 : 1, cursor: av ? 'not-allowed' : 'pointer',
    ...style
  };
  const Tag = href && !av ? 'a' : 'button';
  return (
    <Tag
      {...rest} href={href} style={s}
      className={['ak-trykk', className].filter(Boolean).join(' ')}
      data-ak-variant={variant}
      disabled={Tag === 'button' ? av : undefined}
      aria-disabled={av || undefined}
      aria-busy={laster || undefined}
      onClick={av ? undefined : onClick}
    >
      {laster ? <span className="ak-snurre" aria-hidden="true" /> : ikon}
      {children}
    </Tag>
  );
}
