import React from 'react';
import { loadSessions, deleteSession } from './session-store';

/**
 * SessionHistoryList — fullførte testøkter (fra session-store) som kort-grid.
 * Uten `sessions`-prop leser den localStorage selv og oppdaterer seg når
 * en økt fullføres i samme fane (lytter på 'akgi:sessions-changed'/storage).
 */

const S = {
  label: {
    fontFamily: 'var(--font-data)', fontSize: 'var(--text-label)', fontWeight: 'var(--weight-semibold)',
    letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)',
  },
  data: { fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)' },
};

export function SessionHistoryList({
  sessions: sessionsProp,
  onSelect,
  deletable = false,
  emptyText = 'Ingen fullførte økter ennå. Fullfør et scorekort, så dukker det opp her.',
  max,
  style = {},
  ...rest
}) {
  const [own, setOwn] = React.useState(() => (sessionsProp ? null : loadSessions()));
  React.useEffect(() => {
    if (sessionsProp) return undefined;
    const refresh = () => setOwn(loadSessions());
    window.addEventListener('storage', refresh);
    const t = setInterval(refresh, 3000);
    return () => { window.removeEventListener('storage', refresh); clearInterval(t); };
  }, [sessionsProp]);

  const sessions = sessionsProp || own || [];
  const shown = max ? sessions.slice(0, max) : sessions;

  if (!shown.length) {
    return (
      <div style={{
        padding: '22px 18px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-card)',
        ...S.data, color: 'var(--text-muted)', textAlign: 'center', ...style,
      }} {...rest}>{emptyText}</div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14, ...style }} {...rest}>
      {shown.map((s) => (
        <div
          key={s.id}
          onClick={onSelect ? () => onSelect(s) : undefined}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-sm)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
            cursor: onSelect ? 'pointer' : 'default',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={S.label}>{s.group || 'Test'}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-strong)' }}>
                {s.protocolName}
              </span>
            </div>
            {deletable && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); setOwn(loadSessions()); }}
                aria-label="Slett økt"
                style={{
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', background: 'var(--surface)',
                  color: 'var(--text-muted)', cursor: 'pointer', minWidth: 28, minHeight: 28,
                  fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)',
                }}
              >✕</button>
            )}
          </div>
          <div style={{ ...S.data, color: 'var(--text-muted)' }}>
            {[s.player, s.date, s.gender === 'jenter' ? 'Jenter' : s.gender === 'gutter' ? 'Gutter' : null].filter(Boolean).join(' · ')}
          </div>
          {s.totals && s.totals.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {s.totals.filter((t) => t.value != null).map((t) => (
                <span key={t.label} style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: 5, padding: '3px 9px',
                  borderRadius: 'var(--radius-pill)', background: 'var(--elevated)',
                  fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                }}>
                  {t.label}
                  <strong style={{ color: 'var(--text-strong)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>{t.value}</strong>
                </span>
              ))}
            </div>
          )}
          {s.witness && <div style={{ ...S.data, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Vitne: {s.witness}</div>}
        </div>
      ))}
    </div>
  );
}
