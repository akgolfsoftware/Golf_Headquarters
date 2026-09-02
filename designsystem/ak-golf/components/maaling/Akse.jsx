import React from 'react';

/* Akse — én måling plassert på en skala, med et valgfritt mål. Svaret på
   «hvor står tallet i forhold til der det skal»: Attack Angle −3,2° mot mål
   −1,0°. Skalaen er en målestokk med tall på — altså data, ikke tekstur.

   Kilde og dato er påkrevd. */

const no = (v, d = 1) => v.toLocaleString('nb-NO', { minimumFractionDigits: d, maximumFractionDigits: d });

function Kildekrav({ navn }) {
  return (
    <div role="note" className="ak-maalt" style={{
      border: '1px dashed var(--ak-varsel)', borderRadius: 'var(--ak-hjorne-md)', padding: 'var(--ak-r-4)',
      color: 'var(--ak-varsel)', fontSize: 'var(--ak-t-13)'
    }}>Ikke vist: {navn} krever kilde og dato. Et tall uten kilde er en påstand.</div>
  );
}

export function Akse({
  verdi, min, max, enhet = '', etikett, kilde, dato, maal, maalTekst = 'mål', steg,
  desimaler = 1, forklaring, style
}) {
  if (!kilde || !dato) return <Kildekrav navn="Akse" />;
  if (typeof verdi !== 'number' || typeof min !== 'number' || typeof max !== 'number' || max <= min) return <Kildekrav navn="Akse (verdi, min og max)" />;
  const W = 640, H = 96, P = { l: 24, r: 24 };
  const iw = W - P.l - P.r;
  const sx = (v) => P.l + ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * iw;
  const s = steg ?? (max - min) / 8;
  const merker = [];
  for (let v = min; v <= max + 1e-9; v += s) merker.push(+v.toFixed(6));
  const y = 56;
  const fortegn = (v) => (v > 0 && min < 0 ? '+' : '');
  const fmt = (v) => fortegn(v) + no(v, desimaler) + enhet;
  // Merkene på skalaen skrives uten desimaler når steget er et helt tall.
  const merkeDes = Number.isInteger(s) && Number.isInteger(min) ? 0 : desimaler;
  const fmtMerke = (v) => fortegn(v) + no(v, merkeDes) + enhet;

  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)', ...style }}>
      {etikett && <span className="ak-etikett">{etikett}</span>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
        aria-label={`${etikett || 'Måling'}: ${fmt(verdi)}${maal != null ? ', mål ' + fmt(maal) : ''}, skala ${fmtMerke(min)} til ${fmtMerke(max)}.`}>
        {maal != null && <rect x={Math.min(sx(verdi), sx(maal))} y={y - 3} width={Math.abs(sx(maal) - sx(verdi))} height="6" fill="var(--ak-signal-myk)" />}
        <line x1={P.l} x2={P.l + iw} y1={y} y2={y} stroke="var(--ak-tekst)" strokeWidth="1" />
        {merker.map((v, i) => (
          <g key={i}>
            <line x1={sx(v)} x2={sx(v)} y1={y} y2={y + (i % 2 === 0 ? 14 : 8)} stroke="var(--ak-tekst)" strokeWidth="1" opacity="0.42" />
            {i % 2 === 0 && <text x={sx(v)} y={y + 30} textAnchor="middle" fontFamily="var(--ak-mono)" fontSize="11" fill="var(--ak-dempet)">{fmtMerke(v)}</text>}
          </g>
        ))}
        {maal != null && <g>
          <circle cx={sx(maal)} cy={y} r="7" fill="none" stroke="var(--ak-fag)" strokeWidth="1.5" />
          <text x={sx(maal)} y={y - 16} textAnchor="middle" fontFamily="var(--ak-mono)" fontSize="13" fill="var(--ak-fag)">{maalTekst} {fmt(maal)}</text>
        </g>}
        <g>
          <circle cx={sx(verdi)} cy={y} r="7" fill="var(--ak-signal)" />
          <text x={sx(verdi)} y={y - 16} textAnchor="middle" fontFamily="var(--ak-mono)" fontSize="15" fontWeight="500" fill="var(--ak-signal)">{fmt(verdi)}</text>
        </g>
      </svg>
      {forklaring && <p style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-tekst)', maxWidth: '46ch' }}>{forklaring}</p>}
      <figcaption className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>{[kilde, dato].join(' · ')}</figcaption>
    </figure>
  );
}
