// components/Progress.jsx — Train-lock v3 «Warm» / v3.1 «Liv»
// Fasit: DESIGN-SYSTEM.md §5 + KODEFASIT §4/§8. Alle verdier er var(--token).
// Porteres til src/components/train-lock/Progress.tsx. Se Progress.prompt.md for reglene.

export function Progress({ value = 0, variant = 'warm', label }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div>
      {label ? (
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 'var(--text-caps)', fontWeight: 600, letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--mute)' }}>{label}</span>
          <span style={{ fontSize: 'var(--text-caps)', fontWeight: 600, color: 'var(--mute)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)} %</span>
        </div>
      ) : null}
      <div style={{ height: 'var(--progress-h)', borderRadius: 'var(--radius-pill)', background: 'var(--mute-tint)', overflow: 'hidden' }}>
        <div
          data-progress="1"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          style={{
            width: pct + '%', height: '100%', borderRadius: 'var(--radius-pill)',
            background: variant === 'warm' ? 'var(--warm)' : 'var(--mute)',
            transition: 'width var(--dur-progress) var(--ease-out)',
          }}
        />
      </div>
    </div>
  );
}
