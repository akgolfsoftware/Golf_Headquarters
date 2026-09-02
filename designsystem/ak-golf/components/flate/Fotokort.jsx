import React from 'react';

export function Fotokort({ bilde, alt, bildetekst, kilde, tekstOver, forhold = '3 / 2', hoyde, style, ...rest }) {
  return (
    <figure {...rest} style={{ margin: 0, ...style }}>
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 'var(--ak-hjorne-md)',
        aspectRatio: hoyde ? undefined : forhold, height: hoyde, background: 'var(--ak-grunn-senk)'
      }}>
        <img src={bilde} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {tekstOver && (
          <>
            {/* Mørkt sjikt fra bunnen — en gradering, ikke et lag over hele bildet. */}
            <span aria-hidden="true" style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(20,20,19,0.82) 0%, rgba(20,20,19,0.55) 34%, rgba(20,20,19,0) 68%)'
            }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'var(--ak-r-5)' }}>
              {tekstOver}
            </div>
          </>
        )}
      </div>
      {(bildetekst || kilde) && (
        <figcaption style={{
          marginTop: 'var(--ak-r-3)', display: 'flex', gap: 'var(--ak-r-3)', alignItems: 'baseline',
          fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)', maxWidth: '52ch'
        }}>
          <span>{bildetekst}</span>
          {kilde && <span className="ak-maalt" style={{ color: 'var(--ak-svak)', whiteSpace: 'nowrap' }}>{kilde}</span>}
        </figcaption>
      )}
    </figure>
  );
}
