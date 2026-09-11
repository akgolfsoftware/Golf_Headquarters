// components/StatusPill.jsx — Train-lock v3 «Warm» / v3.1 «Liv»
// Fasit: DESIGN-SYSTEM.md §5 + KODEFASIT §4/§8. Alle verdier er var(--token).
// Porteres til src/components/train-lock/StatusPill.tsx. Se StatusPill.prompt.md for reglene.

const PILL = {
  ok:     { bg: 'var(--ok-tint)', fg: 'var(--ok)' },
  warm:   { bg: 'var(--warm-tint)', fg: 'var(--warm-ink)' },
  danger: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
  mute:   { bg: 'var(--mute-tint)', fg: 'var(--mute)' },
};

export function StatusPill({ variant = 'mute', children }) {
  const c = PILL[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 'var(--pill-status-h)', padding: '0 10px', borderRadius: 'var(--radius-chip)',
      background: c.bg, color: c.fg,
      fontSize: 'var(--text-caps)', fontWeight: 600,
      letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}
