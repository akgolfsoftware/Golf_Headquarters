"use client";

/**
 * StatsKohortLinjegraf — multi-series line chart for cohort comparison
 * Client component (needs browser for SVG dimensions).
 */

import { useState } from "react";

export interface KohortLinjeSerie {
  label: string;
  color: string;
  dashed?: boolean;
  data: Array<{ alder: number; snitt: number }>;
}

interface StatsKohortLinjegrafProps {
  serier: KohortLinjeSerie[];
  height?: number;
}

export function StatsKohortLinjegraf({
  serier,
  height = 260,
}: StatsKohortLinjegrafProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const w = 600;
  const h = height;
  const pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  const allAlders = [...new Set(serier.flatMap((s) => s.data.map((d) => d.alder)))].sort(
    (a, b) => a - b,
  );
  const allSnitts = serier.flatMap((s) => s.data.map((d) => d.snitt));
  const yMin = Math.min(...allSnitts) - 0.5;
  const yMax = Math.max(...allSnitts) + 0.5;

  const xScale = (alder: number) => {
    if (allAlders.length < 2) return cw / 2;
    const idx = allAlders.indexOf(alder);
    return (idx / (allAlders.length - 1)) * cw;
  };
  const yScale = (v: number) => ch - ((v - yMin) / (yMax - yMin)) * ch;

  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks }, (_, i) =>
    yMin + (i / (yTicks - 1)) * (yMax - yMin),
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%", height, display: "block", overflow: "visible" }}
      aria-label="Kohort-sammenligning"
    >
      {yTickVals.map((tick, i) => {
        const ty = pad.t + yScale(tick);
        return (
          <g key={i}>
            <line
              x1={pad.l}
              y1={ty}
              x2={pad.l + cw}
              y2={ty}
              stroke="#E5E3DD"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={pad.l - 6}
              y={ty + 4}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize={10}
              fill="#5E5C57"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        );
      })}

      {allAlders.map((alder) => {
        const tx = pad.l + xScale(alder);
        return (
          <text
            key={alder}
            x={tx}
            y={pad.t + ch + 20}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={10}
            fill="#5E5C57"
          >
            {alder}
          </text>
        );
      })}

      {serier.map((serie, si) => {
        const sorted = [...serie.data].sort((a, b) => a.alder - b.alder);
        const points = sorted.map((d) => ({
          x: pad.l + xScale(d.alder),
          y: pad.t + yScale(d.snitt),
          d,
        }));
        const linePath = points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ");

        const isHovered = hovered === si;

        return (
          <g
            key={si}
            onMouseEnter={() => setHovered(si)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default" }}
          >
            <path
              d={linePath}
              fill="none"
              stroke={serie.color}
              strokeWidth={isHovered ? 3 : 2}
              strokeDasharray={serie.dashed ? "6 3" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={hovered !== null && !isHovered ? 0.4 : 1}
              style={{ transition: "opacity .2s, stroke-width .15s" }}
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3.5}
                fill={serie.color}
                stroke="#FAFAF7"
                strokeWidth={2}
                style={{ transition: "r .15s" }}
              >
                <title>
                  {serie.label} · alder {p.d.alder}: {p.d.snitt.toFixed(1)}
                </title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
