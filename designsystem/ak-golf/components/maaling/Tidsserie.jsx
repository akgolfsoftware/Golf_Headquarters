import React from 'react';

/* Tidsserie — én måling over tid, økt for økt. Første og siste verdi står
   skrevet; siste i signalrødt. Et valgfritt mål tegnes som stiplet linje i
   fagfargen. Ingen glatting, ingen trendlinje: punktene er det som ble målt.

   Kilde er påkrevd; dato hentes fra første og siste punkt. */

function nice(min, max, n = 4) {
  const span = max - min || 1;
  const rough = span / n;
  const p = Math.pow(10, Math.floor(Math.log10(rough)));
  const m = rough / p;
  const step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const t = [];
  for (let v = lo; v <= hi + 1e-9; v += step) t.push(+v.toFixed(6));
  return { lo, hi, step, t };
}
const no = (v, d = 1) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });

function Kildekrav({ navn }) {
  return (
    <div role="note" className="ak-maalt" style={{
      border: '1px dashed var(--ak-varsel)', borderRadius: 'var(--ak-hjorne-md)', padding: 'var(--ak-r-4)',
      color: 'var(--ak-varsel)', fontSize: 'var(--ak-t-13)'
    }}>Ikke vist: {navn} krever kilde og daterte punkter. Et diagram uten kilde er en påstand.</div>
  );
}

export function Tidsserie({
  punkter = [], enhet = '', etikett, kilde, maal, maalTekst = 'mål', desimaler = 1,
  forklaring, hoyde = 260, style
}) {
  const n = punkter.length;
  if (!kilde || n === 0 || punkter.some((p) => !p.dato)) return <Kildekrav navn="Tidsserie" />;
  const W = 640, H = hoyde, P = { t: 28, r: 64, b: 36, l: 52 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const vs = punkter.map((p) => p.verdi);
  const ny = nice(Math.min(...vs, maal ?? Infinity), Math.max(...vs, maal ?? -Infinity));
  const sx = (i) => P.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const sy = (v) => P.t + ih - ((v - ny.lo) / (ny.hi - ny.lo)) * ih;
  const linje = punkter.map((p, i) => `${sx(i).toFixed(1)},${sy(p.verdi).toFixed(1)}`).join(' ');
  const hopp = Math.max(1, Math.ceil(n / 6));
  const sist = punkter[n - 1], forst = punkter[0];

  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)', ...style }}>
      {etikett && <span className="ak-etikett">{etikett}</span>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
        aria-label={`${etikett || 'Tidsserie'}: fra ${no(forst.verdi, desimaler)} ${enhet} ${forst.dato} til ${no(sist.verdi, desimaler)} ${enhet} ${sist.dato}.`}>
        {ny.t.map((v) => <line key={'g' + v} x1={P.l} x2={P.l + iw} y1={sy(v)} y2={sy(v)} stroke="var(--ak-linje)" strokeWidth="1" />)}
        {ny.t.map((v) => <text key={'t' + v} x={P.l - 8} y={sy(v) + 4} textAnchor="end" fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{no(v, 0)}</text>)}
        {enhet && <text x={P.l} y={14} fontFamily="var(--ak-mono)" fontSize="11" letterSpacing="1.5" fill="var(--ak-dempet)">{enhet.toUpperCase()}</text>}
        {punkter.map((p, i) => (i % hopp === 0 || i === n - 1) && (
          <text key={'d' + i} x={sx(i)} y={P.t + ih + 18} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{p.dato}</text>
        ))}
        {maal != null && <g>
          <line x1={P.l} x2={P.l + iw} y1={sy(maal)} y2={sy(maal)} stroke="var(--ak-fag)" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x={P.l + iw + 8} y={sy(maal) + 4} fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-fag)">{maalTekst} {no(maal, desimaler)}</text>
        </g>}
        <polyline points={linje} fill="none" stroke="var(--ak-tekst)" strokeWidth="1.5" strokeLinejoin="miter" strokeLinecap="square" />
        {punkter.map((p, i) => <circle key={'p' + i} cx={sx(i)} cy={sy(p.verdi)} r={i === n - 1 ? 5 : 3.5} fill={i === n - 1 ? 'var(--ak-signal)' : 'var(--ak-tekst)'} />)}
        <text x={sx(0)} y={sy(forst.verdi) - 10} textAnchor="start" fontFamily="var(--ak-mono)" fontSize="13" fill="var(--ak-dempet)">{no(forst.verdi, desimaler)}</text>
        <text x={sx(n - 1) + 10} y={sy(sist.verdi) + 5} textAnchor="start" fontFamily="var(--ak-mono)" fontSize="15" fontWeight="500" fill="var(--ak-signal)">{no(sist.verdi, desimaler)}</text>
      </svg>
      {forklaring && <p style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-tekst)', maxWidth: '46ch' }}>{forklaring}</p>}
      <figcaption className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>
        {[kilde, n > 1 ? forst.dato + '–' + sist.dato : forst.dato, n + ' målinger'].join(' · ')}
      </figcaption>
    </figure>
  );
}
