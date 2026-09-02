import React from 'react';

/* Datovelger — en måned, uken starter mandag, norske navn. Alltid inline
   (ingen popover): på mobil er en popover det samme som en full skjerm
   uansett, og inline fungerer likt overalt. Tastatur: piltaster flytter,
   Enter velger, PageUp/PageDown bytter måned. Verdier som ISO-dato
   (YYYY-MM-DD) — aldri Date-objekter over grensen, de sklir med tidssone. */

const DAGER = ['ma', 'ti', 'on', 'to', 'fr', 'lø', 'sø'];
const MND = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const les = (s) => { const [y, m, d] = (s || '').split('-').map(Number); return s ? { y, m: m - 1, d } : null; };

export function Datovelger({ verdi, onEndre, min, max, merkelapp, markerte = [], style }) {
  const idag = new Date();
  const start = les(verdi) || { y: idag.getFullYear(), m: idag.getMonth(), d: idag.getDate() };
  const [vis, setVis] = React.useState({ y: start.y, m: start.m });
  const [fokus, setFokus] = React.useState(verdi || iso(start.y, start.m, start.d));
  const id = React.useId();
  const forste = new Date(vis.y, vis.m, 1);
  const antall = new Date(vis.y, vis.m + 1, 0).getDate();
  const forskyv = (forste.getDay() + 6) % 7;
  const celler = [...Array(forskyv).fill(null), ...Array.from({ length: antall }, (_, i) => i + 1)];
  while (celler.length % 7) celler.push(null);
  const lov = (s) => (!min || s >= min) && (!max || s <= max);
  const bytt = (delta) => setVis((v) => { const d = new Date(v.y, v.m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const flytt = (dager) => {
    const f = les(fokus); const d = new Date(f.y, f.m, f.d + dager);
    const s = iso(d.getFullYear(), d.getMonth(), d.getDate());
    setFokus(s); setVis({ y: d.getFullYear(), m: d.getMonth() });
    requestAnimationFrame(() => { const el = document.getElementById(id + '-' + s); el && el.focus(); });
  };
  const tast = (e, s) => {
    const k = e.key;
    if (k === 'ArrowLeft') { e.preventDefault(); flytt(-1); }
    else if (k === 'ArrowRight') { e.preventDefault(); flytt(1); }
    else if (k === 'ArrowUp') { e.preventDefault(); flytt(-7); }
    else if (k === 'ArrowDown') { e.preventDefault(); flytt(7); }
    else if (k === 'PageUp') { e.preventDefault(); bytt(-1); }
    else if (k === 'PageDown') { e.preventDefault(); bytt(1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); lov(s) && onEndre && onEndre(s); }
  };
  const knapp = (retning, label) => (
    <button type="button" onClick={() => bytt(retning)} aria-label={label} className="ak-trykk" style={{
      width: 'var(--ak-treff)', height: 'var(--ak-treff)', border: 0, background: 'transparent', cursor: 'pointer',
      color: 'var(--ak-tekst)', borderRadius: 'var(--ak-hjorne-sm)', '--ak-h-bg': 'var(--ak-grunn-senk)'
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
        {retning < 0 ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
      </svg>
    </button>
  );
  const idagIso = iso(idag.getFullYear(), idag.getMonth(), idag.getDate());
  return (
    <div role="group" aria-label={merkelapp || 'Velg dato'} style={{ display: 'inline-flex', flexDirection: 'column', gap: 'var(--ak-r-2)', width: 328, ...style }}>
      {merkelapp && <span style={{ fontSize: 'var(--ak-t-15)', fontWeight: 'var(--ak-v-500)' }}>{merkelapp}</span>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {knapp(-1, 'Forrige måned')}
        <span aria-live="polite" style={{ fontFamily: 'var(--ak-display)', fontWeight: 'var(--ak-v-600)', fontSize: 'var(--ak-t-21)', letterSpacing: 'var(--ak-sp-titt)' }}>{MND[vis.m]} {vis.y}</span>
        {knapp(1, 'Neste måned')}
      </div>
      <div role="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {DAGER.map((d) => <span key={d} role="columnheader" className="ak-etikett" style={{ textAlign: 'center', padding: 'var(--ak-r-1) 0' }}>{d}</span>)}
        {celler.map((d, i) => {
          if (!d) return <span key={'t' + i} role="gridcell" aria-hidden="true" />;
          const s = iso(vis.y, vis.m, d);
          const valgt = s === verdi, ok = lov(s), erIdag = s === idagIso, merket = markerte.includes(s);
          return (
            <button key={s} id={id + '-' + s} type="button" role="gridcell" aria-selected={valgt} aria-disabled={!ok || undefined}
              tabIndex={s === fokus ? 0 : -1} onKeyDown={(e) => tast(e, s)} onFocus={() => setFokus(s)}
              onClick={() => ok && onEndre && onEndre(s)} className={ok ? 'ak-trykk ak-maalt' : 'ak-maalt'} style={{
                height: 'var(--ak-treff)', border: erIdag ? '1px solid var(--ak-linje-hard)' : '1px solid transparent',
                borderRadius: 'var(--ak-hjorne-sm)', cursor: ok ? 'pointer' : 'not-allowed',
                background: valgt ? 'var(--ak-tekst)' : 'transparent', color: valgt ? 'var(--ak-grunn)' : ok ? 'var(--ak-tekst)' : 'var(--ak-svak)',
                fontSize: 'var(--ak-t-15)', position: 'relative', '--ak-h-bg': valgt ? 'var(--ak-tekst)' : 'var(--ak-grunn-senk)'
              }}>
              {d}
              {merket && <span aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 5, width: 4, height: 4, marginLeft: -2, borderRadius: 999, background: valgt ? 'var(--ak-grunn)' : 'var(--ak-signal)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
