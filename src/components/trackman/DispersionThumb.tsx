/**
 * DispersionThumb — TM-10 «agency-preview»-mønsteret: liten sprednings-
 * forhåndsvisning i en rad (72 px høy), «kun prikker + line, ingen essay»
 * (HANDOFF §TRACKMAN, TM-10). Server-renderbar (ingen interaksjon) —
 * brukes i TM-06s stall-tabell og TM-06s featured-kort.
 *
 * Egen, enklere komponent enn `DispersionMap` (TM-11 hero): ingen ellipse-
 * tegning, ingen klikk, ingen sigma-bryter — kun prikker og en stiplet
 * mållinje til siste slag, slik fasiten beskriver den kompakte varianten.
 */

import { TL } from "@/lib/v2/train-lock";

export function DispersionThumb({
  points,
  width = 112,
  height = 72,
}: {
  points: { lateral: number; distance: number }[];
  width?: number;
  height?: number;
}) {
  const VIEW_W = 120;
  const VIEW_H = 72;
  const PAD = 14;

  if (points.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          background: TL.dim,
          borderRadius: 10,
          flexShrink: 0,
        }}
      />
    );
  }

  const lateralVals = points.map((p) => p.lateral);
  const distanceVals = points.map((p) => p.distance);
  const maxLateral = Math.max(4, ...lateralVals.map((v) => Math.abs(v)));
  const maxDistance = Math.max(4, ...distanceVals.map((v) => Math.abs(v)));
  const scale = Math.min((VIEW_W - PAD * 2) / (maxLateral * 2), (VIEW_H - PAD * 2) / (maxDistance * 2));
  const cx = VIEW_W / 2;
  const cy = VIEW_H / 2;
  const toX = (lateral: number) => cx + lateral * scale;
  const toY = (distance: number) => cy - distance * scale;

  const siste = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={width}
      height={height}
      role="img"
      aria-label="Spredning, forhåndsvisning"
      style={{ background: TL.dock, borderRadius: 10, flexShrink: 0 }}
    >
      <line
        x1={toX(0)}
        y1={VIEW_H - 6}
        x2={toX(siste.lateral)}
        y2={toY(siste.distance)}
        stroke={TL.viz.target}
        strokeOpacity={0.4}
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <line x1={toX(siste.lateral)} y1={toY(siste.distance)} x2={toX(siste.lateral)} y2={toY(siste.distance) - 9} stroke={TL.viz.target} strokeWidth={1} />
      {points.map((p, i) => (
        <circle key={i} cx={toX(p.lateral)} cy={toY(p.distance)} r={2} fill={TL.viz.dot} />
      ))}
      <circle cx={toX(siste.lateral)} cy={toY(siste.distance)} r={4} fill="none" stroke={TL.text} strokeWidth={1} />
    </svg>
  );
}
