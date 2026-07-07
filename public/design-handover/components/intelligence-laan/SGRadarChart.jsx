import React from 'react';

/**
 * SGRadarChart — 5-axis radar (OTT, APP, ARG, PUTT, Consistency).
 * Player = solid brand-filled polygon; benchmark (PGA Tour) = dashed
 * grey outline. Values expected normalised 0–1 (caller maps raw SG →
 * 0–1 against whatever range makes sense).
 */
const AXES = ['OTT', 'APP', 'ARG', 'PUTT', 'Consistency'];

function pt(cx, cy, r, angle) {
  return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
}

export function SGRadarChart({ player = [], benchmark = [], size = 220, style = {}, ...rest }) {
  const cx = size / 2, cy = size / 2, R = size * 0.36;
  const n = AXES.length;
  const ring = (scale) => AXES.map((_, i) => pt(cx, cy, R * scale, (i * 2 * Math.PI) / n)).map((p) => p.join(',')).join(' ');
  const poly = (vals) => vals.map((v, i) => pt(cx, cy, R * Math.max(0, Math.min(1, v)), (i * 2 * Math.PI) / n)).map((p) => p.join(',')).join(' ');

  return (
    <svg width={size} height={size + 24} viewBox={`0 0 ${size} ${size + 24}`} style={style} {...rest}>
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={ring(s)} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {AXES.map((label, i) => {
        const [x, y] = pt(cx, cy, R * 1.18, (i * 2 * Math.PI) / n);
        return (
          <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            style={{ font: '600 9px var(--font-data)', letterSpacing: '0.04em', textTransform: 'uppercase', fill: 'var(--text-muted)' }}>
            {label}
          </text>
        );
      })}
      {benchmark.length === n && (
        <polygon points={poly(benchmark)} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
      )}
      {player.length === n && (
        <polygon points={poly(player)} fill="var(--brand)" fillOpacity="0.18" stroke="var(--brand)" strokeWidth="2" />
      )}
    </svg>
  );
}
