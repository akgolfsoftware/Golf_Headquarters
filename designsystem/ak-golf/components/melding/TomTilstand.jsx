import React from 'react';

export function TomTilstand({ tittel, forklaring, handling, style, ...rest }) {
  return (
    <div {...rest} style={{
      border: '1px dashed var(--ak-linje-hard)', borderRadius: 'var(--ak-hjorne-md)',
      background: 'transparent', padding: 'var(--ak-r-7) var(--ak-r-5)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ak-r-3)', textAlign: 'center', ...style
    }}>
      <span className="ak-maalestokk" aria-hidden="true" style={{ display: 'block', width: 96, color: 'var(--ak-svak)' }} />
      <div style={{ fontFamily: 'var(--ak-display)', fontWeight: 'var(--ak-v-600)', fontSize: 'var(--ak-t-21)', letterSpacing: 'var(--ak-sp-titt)' }}>{tittel}</div>
      {forklaring && <p style={{ fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)', maxWidth: '42ch' }}>{forklaring}</p>}
      {handling}
    </div>
  );
}
