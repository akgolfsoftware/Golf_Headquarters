import React from 'react';

/**
 * StatBox — small labelled number tile used in stat grids (StatBox-grid
 * on Coach Cockpit, WAGR cards…). Value always JetBrains Mono; label
 * beneath in the uppercase mono eyebrow style.
 *
 * variant:
 *  - "outline" (default) — white card, hairline border
 *  - "tint"    — soft signal/brand wash background, no hard border
 *  - "filled"  — solid brand surface, white value, accent label
 * tone colours the value (and the tint wash): neutral | pos | neg | warn | info | brand.
 * delta renders a small mono change-chip under the value ("+0,4", "▲ 3").
 */
export function StatBox({ value, label, tone = 'neutral', variant = 'outline', delta, deltaTone, size = 'md', style = {}, ...rest }) {
  const toneColor = {
    neutral: 'var(--text-strong)',
    pos: 'var(--pos)',
    neg: 'var(--neg)',
    warn: 'var(--warn)',
    info: 'var(--info)',
    brand: 'var(--brand)',
  }[tone] || 'var(--text-strong)';
  const tintBg = {
    neutral: 'var(--elevated)',
    pos: 'var(--pos-soft)',
    neg: 'var(--neg-soft)',
    warn: 'var(--warn-soft)',
    info: 'var(--info-soft)',
    brand: 'var(--brand-soft)',
  }[tone] || 'var(--elevated)';

  const surface = variant === 'filled'
    ? { background: 'var(--brand)', border: '1px solid var(--brand)' }
    : variant === 'tint'
      ? { background: tintBg, border: '1px solid transparent' }
      : { background: 'var(--surface)', border: '1px solid var(--border)' };

  const valueColor = variant === 'filled' ? 'var(--brand-contrast)' : toneColor;
  const labelColor = variant === 'filled' ? 'rgba(255,255,255,0.66)' : 'var(--text-muted)';
  const dTone = deltaTone || (typeof delta === 'string' && delta.trim().startsWith('−') ? 'neg' : 'pos');
  const deltaColor = variant === 'filled'
    ? 'var(--accent)'
    : { pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)', info: 'var(--info)', neutral: 'var(--text-muted)' }[dTone] || 'var(--pos)';

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        borderRadius: 'var(--radius-card)',
        padding: size === 'sm' ? '14px 10px' : '20px 14px', textAlign: 'center',
        ...surface,
        ...style,
      }}
      {...rest}
    >
      <span style={{
        fontFamily: 'var(--font-data)', fontWeight: 'var(--weight-bold)',
        fontSize: size === 'sm' ? 'var(--text-stat)' : '2rem',
        color: valueColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>{value}</span>
      <span style={{
        fontFamily: 'var(--font-data)', fontSize: 'var(--text-label)', fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: labelColor,
      }}>{label}</span>
      {delta != null && (
        <span style={{
          fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)',
          color: deltaColor, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        }}>{delta}</span>
      )}
    </div>
  );
}
