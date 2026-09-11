// components/Card.jsx — Train-lock v2
// Fasit: DESIGN-SYSTEM.md §5. Alle verdier er var(--token); ingen hex, ingen px utenfor spacing-tokens.
// Porteres til src/components/train-lock/Card.tsx. Se Card.prompt.md for reglene.

const SURFACE = {
  elev: { background: 'var(--elev)', boxShadow: 'var(--shadow-card)' },
  dock: { background: 'var(--dock)', boxShadow: 'none' },
  hairline: { background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--hair)' },
};

export function Card({ variant = 'elev', state = 'default', as = 'div', children, ...rest }) {
  const Tag = as;
  return (
    <Tag
      data-press={as === 'button' ? '1' : undefined}
      data-state={state}
      style={{
        borderRadius: 'var(--radius-card)',
        padding: 'var(--pad-card-mobile)',
        border: 0,
        textAlign: 'left',
        font: 'inherit',
        color: 'var(--text)',
        opacity: state === 'muted' ? 0.5 : 1,
        cursor: as === 'button' ? 'pointer' : undefined,
        ...SURFACE[variant],
        ...(state === 'selected' ? { boxShadow: 'inset 0 0 0 2px var(--text)' } : null),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
