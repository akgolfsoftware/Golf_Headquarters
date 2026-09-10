// components/Chip.jsx — Train-lock v3 «Warm» / v3.1 «Liv»
// Fasit: DESIGN-SYSTEM.md §5 + KODEFASIT §4/§8. Alle verdier er var(--token).
// Porteres til src/components/train-lock/Chip.tsx. Se Chip.prompt.md for reglene.

const CHIP_ICON = {
  ball: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 3v18M3 12h18',
  clock: 'M12 7v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11M12 10h.01',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 12h.01',
};

export function Chip({ variant = 'default', icon, children }) {
  const warm = variant === 'warm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      height: 'var(--chip-h)', padding: '0 12px', borderRadius: 'var(--radius-chip)',
      background: warm ? 'var(--warm-tint)' : 'var(--mute-tint)',
      color: warm ? 'var(--warm-ink)' : 'var(--mute)',
      fontSize: 'var(--text-meta)', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }}>
      {icon ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={CHIP_ICON[icon] || CHIP_ICON.target} /></svg>
      ) : null}
      {children}
    </span>
  );
}
