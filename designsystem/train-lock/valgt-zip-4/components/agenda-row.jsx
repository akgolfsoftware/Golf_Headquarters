// components/AgendaRow.jsx — Train-lock v2
// Fasit: DESIGN-SYSTEM.md §5. Alle verdier er var(--token); ingen hex, ingen px utenfor spacing-tokens.
// Porteres til src/components/train-lock/AgendaRow.tsx. Se AgendaRow.prompt.md for reglene.

export function AgendaRow({ time, title, meta, origin = 'DEG', variant = 'withChevron', onClick }) {
  return (
    <div
      data-press={onClick ? '1' : undefined}
      data-origin={origin}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: 'var(--elev)',
        borderRadius: 'var(--radius-card)',
        padding: '14px 18px',
        boxShadow: origin === 'COACH' ? 'inset 0 0 0 2px var(--target)' : 'none',
        opacity: variant === 'muted' ? 0.5 : 1,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <div style={{ width: 46, flexShrink: 0, fontSize: 'var(--text-body)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{time}</div>
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--hair)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {origin === 'COACH' ? (
          <div style={{ fontSize: 'var(--text-caps)', fontWeight: 600, letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--mute)' }}>Forslag fra Anders</div>
        ) : null}
        <div style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>{title}</div>
        {meta ? <div style={{ fontSize: 'var(--text-meta)', color: 'var(--mute)', fontVariantNumeric: 'tabular-nums' }}>{meta}</div> : null}
      </div>
      {variant === 'withChevron' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mute)" strokeWidth="1.75" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
      ) : null}
    </div>
  );
}
