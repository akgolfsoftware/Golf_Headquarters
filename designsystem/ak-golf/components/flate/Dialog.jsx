import React from 'react';

/* Dialog — det som ligger over alt annet. Én oppgave, én primærhandling.
   Loft 3, radius lg, panelet kommer til syne med .ak-kommer. Bakteppet er
   tekstfargen med lav opasitet — ingen blur, ingen frostet glass; verkstedet
   er flatt.

   Tastatur: Escape lukker. Fokus flyttes inn ved åpning og tilbake til det
   som åpnet den ved lukking. Tab holder seg inne i panelet.
   `innebygd` rendrer panelet i flyt (til dokumentasjon og kort), ikke fast. */

const FOKUSERBAR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open = false, tittel, beskrivelse, handlinger, onLukk, bredde = 480, innebygd = false, children, style, ...rest }) {
  const panel = React.useRef(null);
  const forrige = React.useRef(null);
  const id = React.useId();

  React.useEffect(() => {
    if (!open || innebygd) return;
    forrige.current = document.activeElement;
    const el = panel.current;
    const forste = el && el.querySelector(FOKUSERBAR);
    (forste || el) && (forste || el).focus();
    const tast = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onLukk && onLukk(); }
      if (e.key === 'Tab' && el) {
        const alle = [...el.querySelectorAll(FOKUSERBAR)];
        if (!alle.length) return;
        const a = alle[0], b = alle[alle.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', tast);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tast);
      document.body.style.overflow = overflow;
      forrige.current && forrige.current.focus && forrige.current.focus();
    };
  }, [open, innebygd, onLukk]);

  if (!open) return null;
  const panelStil = {
    background: 'var(--ak-ark)', color: 'var(--ak-tekst)', borderRadius: 'var(--ak-hjorne-lg)',
    boxShadow: 'var(--ak-loft-3)', padding: 'var(--ak-r-6)', width: '100%', maxWidth: bredde,
    display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-4)', outline: 'none', ...style
  };
  const innhold = (
    <div {...rest} ref={panel} role="dialog" aria-modal={innebygd ? undefined : true} aria-labelledby={id + '-t'}
      aria-describedby={beskrivelse ? id + '-b' : undefined} tabIndex={-1} className="ak-kommer" style={panelStil}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ak-r-4)' }}>
        <h2 id={id + '-t'} style={{ fontFamily: 'var(--ak-display)', fontWeight: 'var(--ak-v-700)', fontSize: 'var(--ak-t-26)', letterSpacing: 'var(--ak-sp-titt)', lineHeight: 'var(--ak-lh-tett)', margin: 0, flex: 1 }}>{tittel}</h2>
        {onLukk && (
          <button type="button" onClick={onLukk} aria-label="Lukk" className="ak-trykk" style={{
            flex: '0 0 auto', width: 'var(--ak-treff)', height: 'var(--ak-treff)', margin: 'calc(-1 * var(--ak-r-2)) calc(-1 * var(--ak-r-2)) 0 0',
            border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--ak-dempet)', borderRadius: 'var(--ak-hjorne-sm)',
            '--ak-h-bg': 'var(--ak-grunn-senk)', '--ak-h-tekst': 'var(--ak-tekst)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        )}
      </div>
      {beskrivelse && <p id={id + '-b'} style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-dempet)', maxWidth: '58ch' }}>{beskrivelse}</p>}
      {children}
      {handlinger && <div style={{ display: 'flex', gap: 'var(--ak-r-3)', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 'var(--ak-r-2)' }}>{handlinger}</div>}
    </div>
  );
  if (innebygd) return innhold;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: 'var(--ak-r-4)', zIndex: 100 }}>
      <div onClick={onLukk} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'var(--ak-tekst)', opacity: 0.5 }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: bredde }}>{innhold}</div>
    </div>
  );
}
