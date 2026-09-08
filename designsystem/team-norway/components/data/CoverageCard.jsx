import React from 'react';

const DEFAULT_COLORS = ['var(--navy-900)', 'var(--navy-400)', 'var(--status-amber)', 'var(--ink-200)'];

export function CoverageCard({
  segments = [],
  total,
  unitLabel = 'med profil',
  source,
  staleNote,
  state = 'ready',
  layout = 'wide'
}) {
  const e = React.createElement;
  const segs = segments.map((s, i) => ({ ...s, color: s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }));
  const sum = total != null ? total : segs.reduce((a, s) => a + (Number(s.count) || 0), 0);
  const covered = Number(segs.length ? segs[0].count : 0) || 0;
  const compact = layout === 'compact';
  const loading = state === 'loading';
  const stale = state === 'error';
  const empty = state === 'ready' && covered === 0;

  const eyebrow = e('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' } },
    e('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-secondary)' } }, 'DEKNINGSGRAD'),
    stale ? e('span', {
      style: {
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase',
        color: 'var(--status-amber-text)', border: '1px dashed var(--status-amber)', borderRadius: 'var(--radius-full)', padding: '3px 9px', whiteSpace: 'nowrap'
      }
    }, 'IKKE OPPDATERT') : null
  );

  const numberTone = loading ? 'var(--text-tertiary)' : stale ? 'var(--text-secondary)' : empty ? 'var(--text-tertiary)' : 'var(--navy-900)';
  const number = loading
    ? e('div', { style: { width: '190px', height: compact ? '44px' : '58px', borderRadius: 'var(--radius-xs)', background: 'var(--ink-100)' } })
    : e('div', { style: { display: 'flex', alignItems: 'baseline', gap: compact ? '8px' : '10px' } },
        e('span', { style: { fontFamily: 'var(--font-mono)', fontSize: compact ? '52px' : 'var(--text-display)', fontWeight: 'var(--weight-semibold)', color: numberTone, letterSpacing: compact ? '-.02em' : 'var(--tracking-display)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' } }, String(covered)),
        e('span', { style: { fontSize: compact ? 'var(--text-lg)' : 'var(--text-h3)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' } }, 'av ' + sum + ' ' + unitLabel)
      );

  const bar = loading
    ? e('div', { style: { height: compact ? '10px' : '12px', borderRadius: 'var(--radius-full)', background: 'var(--ink-100)' } })
    : e('div', { style: { display: 'flex', height: compact ? '10px' : '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'var(--ink-100)' } },
        segs.map((s, i) => (Number(s.count) || 0) > 0 && s.color !== 'var(--ink-200)'
          ? e('div', { key: i, style: { width: (sum ? (Number(s.count) / sum) * 100 : 0) + '%', background: stale ? 'var(--ink-300)' : s.color } })
          : null)
      );

  const legend = loading ? null : e('div', {
    style: compact
      ? { display: 'flex', flexDirection: 'column', gap: '7px' }
      : { display: 'flex', gap: '22px', flexWrap: 'wrap' }
  }, segs.map((s, i) => e('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      e('span', { style: { width: '9px', height: '9px', borderRadius: '2px', background: stale ? 'var(--ink-300)' : s.color, flexShrink: 0 } }),
      e('span', { style: { fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: compact ? 1 : 'none', minWidth: 0 } }, s.label),
      e('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--navy-900)', fontVariantNumeric: 'tabular-nums' } }, String(s.count))
    )));

  const foot = loading
    ? e('span', { style: { fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' } }, 'Henter dekningsgrad')
    : stale
      ? e('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--status-amber-text)' } }, staleNote || 'Sist lest fra serveren')
      : source
        ? e('span', { style: { fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' } }, source)
        : null;

  const shell = {
    background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)',
    boxShadow: compact ? 'var(--shadow-sm)' : 'var(--shadow-md)',
    padding: compact ? '20px' : '26px 28px', fontFamily: 'var(--font-body)'
  };

  if (compact) {
    return e('div', { style: { ...shell, display: 'flex', flexDirection: 'column', gap: '12px' } }, eyebrow, number, bar, legend, foot);
  }
  return e('div', { style: { ...shell, display: 'flex', gap: '36px', alignItems: 'center' } },
    e('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 } }, eyebrow, number, foot),
    e('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' } }, bar, legend)
  );
}
