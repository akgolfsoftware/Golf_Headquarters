import React from 'react';

/* Spredning — slagene der de landet, sett ovenfra. Side (venstre/høyre) på
   x-aksen, lengde på y-aksen. Ellipsen er ett standardavvik i hver retning,
   regnet fra kovariansen til de faktiske slagene — ikke tegnet på frihånd.
   Antallet slag innenfor ellipsen TELLES og skrives; det er ikke «68 %».

   Kilde og dato er påkrevd. Uten dem rendres ikke diagrammet — et diagram
   uten kilde er en påstand (11-instrumentet.md). */

function nice(min, max, n = 5) {
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
    }}>Ikke vist: {navn} krever kilde og dato. Et diagram uten kilde er en påstand.</div>
  );
}

export function Spredning({
  punkter = [], enhet = 'm', etikett, kilde, dato, antall, maal, ellipse = true,
  forklaring, hoyde = 420, style
}) {
  if (!kilde || !dato) return <Kildekrav navn="Spredning" />;
  const n = punkter.length;
  const W = 640, H = hoyde, P = { t: 20, r: 20, b: 44, l: 52 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;

  const xs = punkter.map((p) => p.side), ys = punkter.map((p) => p.lengde);
  const xMaks = Math.max(4, ...xs.map(Math.abs), maal ? Math.abs(maal.side) : 0);
  const nx = nice(-xMaks, xMaks, 6);
  const ny = nice(Math.min(...ys, maal ? maal.lengde : Infinity), Math.max(...ys, maal ? maal.lengde : -Infinity), 5);
  const sx = (v) => P.l + ((v - nx.lo) / (nx.hi - nx.lo)) * iw;
  const sy = (v) => P.t + ih - ((v - ny.lo) / (ny.hi - ny.lo)) * ih;

  // Snitt, kovarians, ellipse og telling.
  let mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0, inne = 0, poly = '';
  if (n >= 3) {
    mx = xs.reduce((a, b) => a + b, 0) / n; my = ys.reduce((a, b) => a + b, 0) / n;
    for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    sxx /= n - 1; syy /= n - 1; sxy /= n - 1;
    const det = sxx * syy - sxy * sxy;
    if (det > 1e-9) {
      for (let i = 0; i < n; i++) {
        const dx = xs[i] - mx, dy = ys[i] - my;
        const d2 = (syy * dx * dx - 2 * sxy * dx * dy + sxx * dy * dy) / det;
        if (d2 <= 1) inne++;
      }
      const tr = sxx + syy, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
      const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
      const ang = Math.atan2(l1 - sxx, sxy || 1e-9);
      const r1 = Math.sqrt(l1), r2 = Math.sqrt(Math.max(l2, 0));
      const pts = [];
      for (let k = 0; k < 64; k++) {
        const a = (k / 64) * Math.PI * 2;
        const ex = r1 * Math.cos(a), ey = r2 * Math.sin(a);
        const px = mx + ex * Math.cos(ang) - ey * Math.sin(ang);
        const py = my + ex * Math.sin(ang) + ey * Math.cos(ang);
        pts.push(sx(px).toFixed(1) + ',' + sy(py).toFixed(1));
      }
      poly = pts.join(' ');
    }
  }
  const kildedeler = [kilde, dato, (antall ?? n) + ' slag'].filter(Boolean);

  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)', ...style }}>
      {etikett && <span className="ak-etikett">{etikett}</span>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
        aria-label={`Spredning: ${n} slag. ${poly ? inne + ' av ' + n + ' innenfor ett standardavvik.' : ''}`}>
        {/* rutenett = instrumentets akser, med tall og enhet: dette ER en påstand, og den er målt */}
        {nx.t.map((v) => <line key={'x' + v} x1={sx(v)} x2={sx(v)} y1={P.t} y2={P.t + ih} stroke={v === 0 ? 'var(--ak-linje-hard)' : 'var(--ak-linje)'} strokeWidth="1" />)}
        {ny.t.map((v) => <line key={'y' + v} y1={sy(v)} y2={sy(v)} x1={P.l} x2={P.l + iw} stroke="var(--ak-linje)" strokeWidth="1" />)}
        {nx.t.map((v) => <text key={'xt' + v} x={sx(v)} y={P.t + ih + 16} textAnchor="middle" fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{v > 0 ? '+' + no(v, 0) : no(v, 0)}</text>)}
        {ny.t.map((v) => <text key={'yt' + v} x={P.l - 8} y={sy(v) + 4} textAnchor="end" fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{no(v, 0)}</text>)}
        <text x={P.l + iw} y={H - 6} textAnchor="end" fontFamily="var(--ak-mono)" fontSize="11" letterSpacing="1.5" fill="var(--ak-dempet)">SIDE ({enhet.toUpperCase()}) · VENSTRE − / HØYRE +</text>
        <text x={P.l} y={12} fontFamily="var(--ak-mono)" fontSize="11" letterSpacing="1.5" fill="var(--ak-dempet)">LENGDE ({enhet.toUpperCase()})</text>
        {poly && <polygon points={poly} fill="var(--ak-signal-myk)" stroke="var(--ak-signal)" strokeWidth="1.5" />}
        {punkter.map((p, i) => <circle key={i} cx={sx(p.side)} cy={sy(p.lengde)} r="3.5" fill="var(--ak-tekst)" fillOpacity="0.8" />)}
        {n >= 3 && <g stroke="var(--ak-signal)" strokeWidth="1.5">
          <line x1={sx(mx) - 6} x2={sx(mx) + 6} y1={sy(my)} y2={sy(my)} />
          <line x1={sx(mx)} x2={sx(mx)} y1={sy(my) - 6} y2={sy(my) + 6} />
        </g>}
        {maal && <g stroke="var(--ak-fag)" strokeWidth="1.5" fill="none">
          <circle cx={sx(maal.side)} cy={sy(maal.lengde)} r="7" />
          <line x1={sx(maal.side) - 11} x2={sx(maal.side) + 11} y1={sy(maal.lengde)} y2={sy(maal.lengde)} />
          <line x1={sx(maal.side)} x2={sx(maal.side)} y1={sy(maal.lengde) - 11} y2={sy(maal.lengde) + 11} />
        </g>}
      </svg>
      {poly && (
        <p className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-tekst)' }}>
          Snitt {mx > 0 ? '+' : ''}{no(mx)} {enhet} side · {no(my)} {enhet} lengde. Ellipsen er ett standardavvik i hver retning — {inne} av {n} slag innenfor.
        </p>
      )}
      {forklaring && <p style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-tekst)', maxWidth: '46ch' }}>{forklaring}</p>}
      <figcaption className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>{kildedeler.join(' · ')}</figcaption>
    </figure>
  );
}
