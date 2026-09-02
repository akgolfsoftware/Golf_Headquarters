import React from 'react';

export function Faktarad({ poster = [], kolonner, kompakt = false, style }) {
  const n = kolonner || Math.min(poster.length, 4);
  return (
    <dl style={{
      margin: 0, display: 'grid', gridTemplateColumns: 'repeat(' + n + ', minmax(0, 1fr))',
      borderTop: '1px solid var(--ak-linje-hard)', ...style
    }}>
      {poster.map((p, i) => (
        <div key={i} style={{
          padding: kompakt ? 'var(--ak-r-3) var(--ak-r-4) var(--ak-r-3) 0' : 'var(--ak-r-5) var(--ak-r-5) var(--ak-r-5) 0',
          borderRight: i < poster.length - 1 ? '1px solid var(--ak-linje)' : 'none',
          paddingLeft: i === 0 ? 0 : 'var(--ak-r-5)'
        }}>
          <dt className="ak-etikett" style={{ marginBottom: 'var(--ak-r-2)' }}>{p.etikett}</dt>
          <dd className="ak-maalt" style={{
            margin: 0, fontSize: kompakt ? 'var(--ak-t-21)' : 'var(--ak-t-34)', fontWeight: 'var(--ak-v-500)',
            letterSpacing: '-0.02em', color: p.fremhevet ? 'var(--ak-signal)' : 'var(--ak-tekst)'
          }}>
            {p.verdi}{p.enhet && <span style={{ fontSize: '0.55em', color: 'var(--ak-dempet)', marginLeft: 4 }}>{p.enhet}</span>}
          </dd>
          {p.note && <div style={{ marginTop: 'var(--ak-r-2)', fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>{p.note}</div>}
        </div>
      ))}
    </dl>
  );
}
