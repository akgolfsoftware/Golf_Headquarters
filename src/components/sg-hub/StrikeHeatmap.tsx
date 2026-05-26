"use client";

import type { StrikeResult } from "@/lib/sg-hub/strike-pattern";
import { STRIKE_COLORS } from "@/lib/sg-hub/strike-pattern";

const COLS = 10;
const ROWS = 8;
const CELL_W = 24;
const CELL_H = 22;
const SVG_W = COLS * CELL_W;
const SVG_H = ROWS * CELL_H;

type Props = {
  result: StrikeResult;
  advanced?: boolean;
};

export function StrikeHeatmap({ result, advanced = false }: Props) {
  // Tell antall i hver celle
  const density = new Map<string, number>();
  for (const p of result.points) {
    const key = `${p.gridX}-${p.gridY}`;
    density.set(key, (density.get(key) ?? 0) + 1);
  }
  const maxDensity = Math.max(1, ...density.values());

  // Dominant zone-farge per celle
  const cellZone = new Map<string, string>();
  for (const p of result.points) {
    const key = `${p.gridX}-${p.gridY}`;
    if (!cellZone.has(key)) cellZone.set(key, STRIKE_COLORS[p.zone]);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="overflow-visible"
        aria-label="Strike Heatmap"
      >
        {/* Køllehode-outline */}
        <ellipse
          cx={SVG_W / 2}
          cy={SVG_H / 2}
          rx={SVG_W / 2 - 2}
          ry={SVG_H / 2 - 2}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={2}
        />

        {/* Grid-celler */}
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const key = `${col}-${row}`;
            const count = density.get(key) ?? 0;
            const color = cellZone.get(key) ?? "hsl(var(--primary))";
            const opacity = count === 0 ? 0 : 0.1 + 0.7 * (count / maxDensity);

            return (
              <rect
                key={key}
                x={col * CELL_W}
                y={row * CELL_H}
                width={CELL_W}
                height={CELL_H}
                fill={color}
                fillOpacity={opacity}
                rx={2}
              />
            );
          })
        )}

        {/* Enkeltslag-prikker — vis i advanced */}
        {advanced &&
          result.points.map((p, i) => (
            <circle
              key={i}
              cx={p.gridX * CELL_W + CELL_W / 2}
              cy={p.gridY * CELL_H + CELL_H / 2}
              r={3}
              fill={STRIKE_COLORS[p.zone]}
              fillOpacity={0.85}
            />
          ))}

        {/* Sweet-spot-markering */}
        <circle
          cx={SVG_W / 2}
          cy={SVG_H / 2}
          r={8}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />
      </svg>

      {/* Farge-legende */}
      <div className="flex flex-wrap justify-center gap-2">
        {(["SWEET", "THIN", "ROLLED", "FAT"] as const).map((zone) => (
          <div key={zone} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: STRIKE_COLORS[zone] }}
            />
            <span className="text-xs text-muted-foreground">{zone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
