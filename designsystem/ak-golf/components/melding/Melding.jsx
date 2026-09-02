import React from 'react';

/* Melding — svaret på «hva skjedde nå»: «Lagret», «Sendt», «Kunne ikke
   lagre». Kommer nedenfra (.ak-kommer), står i ro, forsvinner når den er
   lest eller lukket. Den som viser meldingen eier tiden: kall onLukk selv
   etter 4–6 sekunder for ok/info — aldri for feil, som skal stå til de er
   lukket.

   Meldingsstakk plasserer meldingene fast nederst, midtstilt, over
   eventuelt cookie-banner (--ak-cookie-h er appens variabel; her bare
   safe-area). */

const toner = {
  info: 'var(--ak-tekst)', ok: 'var(--ak-ok)', varsel: 'var(--ak-varsel)', feil: 'var(--ak-feil)'
};

export function Melding({ tekst, tilstand = 'info', handling, onLukk, style, ...rest }) {
  return (
    <div {...rest} role={tilstand === 'feil' ? 'alert' : 'status'} className="ak-kommer" data-ak-fra="bunn" style={{
      display: 'flex', alignItems: 'center', gap: 'var(--ak-r-4)',
      background: 'var(--ak-tekst)', color: 'var(--ak-grunn)',
      borderLeft: '3px solid ' + (toner[tilstand] || toner.info),
      borderRadius: 'var(--ak-hjorne-sm)', boxShadow: 'var(--ak-loft-3)',
      padding: 'var(--ak-r-3) var(--ak-r-4)', minHeight: 'var(--ak-treff)', maxWidth: 480, ...style
    }}>
      <span style={{ flex: 1, fontSize: 'var(--ak-t-15)', fontWeight: 'var(--ak-v-500)' }}>{tekst}</span>
      {handling}
      {onLukk && (
        <button type="button" onClick={onLukk} aria-label="Lukk melding" style={{
          flex: '0 0 auto', width: 32, height: 32, border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', opacity: 0.8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      )}
    </div>
  );
}

export function Meldingsstakk({ meldinger = [], onLukk, style }) {
  if (!meldinger.length) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 110, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ak-r-2)',
      padding: 'var(--ak-r-4) var(--ak-r-4) calc(var(--ak-r-4) + env(safe-area-inset-bottom))', ...style
    }}>
      {meldinger.map((m) => (
        <Melding key={m.id} tekst={m.tekst} tilstand={m.tilstand} handling={m.handling}
          onLukk={onLukk ? () => onLukk(m.id) : undefined} style={{ pointerEvents: 'auto', width: '100%' }} />
      ))}
    </div>
  );
}
