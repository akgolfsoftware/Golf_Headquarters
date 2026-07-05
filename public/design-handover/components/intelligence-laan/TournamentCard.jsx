import React from 'react';
import { Badge } from '../core/Badge';

/**
 * TournamentCard — used in tournament lists, discovery feed, calendar.
 * variant "compact" for list rows, "full" for a standalone card,
 * "active" adds a pulsing live dot (spec: pågående turnering).
 */
export function TournamentCard({
  series, name, course, date, fieldSize, par, top25Cut, variant = 'full', active = false, onOpen, style = {}, ...rest
}) {
  const compact = variant === 'compact';
  return (
    <div
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)',
        padding: compact ? 'var(--space-4)' : 'var(--space-5)', boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column', gap: 8,
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge tone="brand">{series}</Badge>
        {active && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 2 }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pos)', animation: 'ak-pulse 1.6s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--pos)' }}>Pågår</span>
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: compact ? 'var(--text-h4)' : 'var(--text-h3)', color: 'var(--text-strong)' }}>{name}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{course} · {date}</div>
      {!compact && (
        <div style={{ display: 'flex', gap: 18, marginTop: 4 }}>
          <Stat label="spillere" value={fieldSize} />
          <Stat label="par" value={par} />
          {top25Cut && <Stat label="Top25" value={top25Cut} />}
        </div>
      )}
      <button onClick={onOpen} style={{
        alignSelf: 'flex-end', marginTop: compact ? 0 : 6, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
        fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-link)',
      }}>Åpne →</button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'var(--font-data)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)' }}>{value}</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}
