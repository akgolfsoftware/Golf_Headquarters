import React from 'react';

/* Fordeling — hvordan målingene fordeler seg. Søyler per intervall, snittet
   som signalrød strek, ett standardavvik som svakt bånd. Intervallbredden
   velges automatisk (Freedman–Diaconis) hvis den ikke er satt.

   Kilde og dato er påkrevd. */

const no = (v, d = 1) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });

function Kildekrav({ navn }) {
  return (
    <div role="note" className="ak-maalt" style={{
      border: '1px dashed var(--ak-varsel)', borderRadius: 'var(--ak-hjorne-md)', padding: 'var(--ak-r-4)',
      color: 'var(--ak-varsel)', fontSize: 'var(--ak-t-13)'
    }}>Ikke vist: {navn} krever kilde og dato. Et diagram uten kilde er en påstand.</div>
  );
}

export function Fordeling({
  verdier = [], enhet = '', etikett, kilde, dato, bredde, desimaler = 1,
  forklaring, hoyde = 260, style
}) {
  const n = verdier.length;
  if (!kilde || !dato) return <Kildekrav navn="Fordeling" />;
  if (n < 2) return <Kildekrav navn="Fordeling (minst to målinger)" />;
  const s = [...verdier].sort((a, b) => a - b);
  const snitt = s.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - snitt) ** 2, 0) / (n - 1));
  const q = (p) => s[Math.min(n - 1, Math.floor(p * (n - 1)))];
  const iqr = q(0.75) - q(0.25);
  let b = bredde ?? (2 * iqr) / Math.cbrt(n);
  if (!b || b <= 0) b = (s[n - 1] - s[0]) / Math.max(1, Math.ceil(Math.sqrt(n))) || 1;
  const lo = Math.floor(s[0] / b) * b, hi = Math.ceil((s[n - 1] + 1e-9) / b) * b;
  const antallBin = Math.max(1, Math.round((hi - lo) / b));
  const bins = new Array(antallBin).fill(0);
  for (const v of s) bins[Math.min(antallBin - 1, Math.floor((v - lo) / b))]++;
  const maks = Math.max(...bins);

  // Toppen holder to tekstlinjer: enhetslinja (y 14) og snitt-etiketten (y 36).
  const W = 640, H = hoyde, P = { t: 48, r: 20, b: 36, l: 36 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const sx = (v) => P.l + ((v - lo) / (hi - lo)) * iw;
  const sy = (c) => P.t + ih - (c / maks) * ih;
  const hopp = Math.max(1, Math.ceil(antallBin / 8));
  const snittX = sx(snitt);
  const snittTekst = `snitt ${no(snitt, desimaler)}${enhet ? ' ' + enhet : ''}`;
  const snittHoyre = snittX < P.l + iw * 0.6;

  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)', ...style }}>
      {etikett && <span className="ak-etikett">{etikett}</span>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
        aria-label={`${etikett || 'Fordeling'}: ${n} målinger, snitt ${no(snitt, desimaler)} ${enhet}, standardavvik ${no(sd, desimaler)}.`}>
        <rect x={sx(snitt - sd)} y={P.t} width={Math.max(0, sx(snitt + sd) - sx(snitt - sd))} height={ih} fill="var(--ak-signal-myk)" />
        {bins.map((c, i) => (
          <rect key={i} x={sx(lo + i * b) + 1} y={sy(c)} width={Math.max(1, sx(lo + b) - sx(lo) - 2)} height={ih - (sy(c) - P.t)} fill="var(--ak-dempet)" />
        ))}
        <line x1={P.l} x2={P.l + iw} y1={P.t + ih} y2={P.t + ih} stroke="var(--ak-linje-hard)" strokeWidth="1" />
        {bins.map((_, i) => i % hopp === 0 && (
          <text key={'t' + i} x={sx(lo + i * b)} y={P.t + ih + 18} textAnchor="middle" fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{no(lo + i * b, 0)}</text>
        ))}
        <text x={P.l + iw} y={P.t + ih + 18} textAnchor="end" fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{no(hi, 0)}</text>
        <line x1={snittX} x2={snittX} y1={P.t - 6} y2={P.t + ih} stroke="var(--ak-signal)" strokeWidth="1.5" />
        <text x={snittHoyre ? snittX + 8 : snittX - 8} y={36} textAnchor={snittHoyre ? 'start' : 'end'} fontFamily="var(--ak-mono)" fontSize="13" fontWeight="500" fill="var(--ak-signal)">{snittTekst}</text>
        <text x={P.l} y={14} fontFamily="var(--ak-mono)" fontSize="11" letterSpacing="1.5" fill="var(--ak-dempet)">ANTALL PER {no(b, b < 1 ? 1 : 0)} {enhet.toUpperCase()}</text>
      </svg>
      <p className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-tekst)' }}>
        Snitt {no(snitt, desimaler)} {enhet} · standardavvik {no(sd, desimaler)} {enhet} · båndet er ett standardavvik til hver side.
      </p>
      {forklaring && <p style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-tekst)', maxWidth: '46ch' }}>{forklaring}</p>}
      <figcaption className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>{[kilde, dato, n + ' målinger'].join(' · ')}</figcaption>
    </figure>
  );
}
