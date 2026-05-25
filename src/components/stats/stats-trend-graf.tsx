"use client";

/**
 * StatsTrendGraf — linjegraf med SVG for snittscore per år
 * Client component (trenger browser-state for mounted check).
 */

import { useEffect, useRef, useState } from "react";

interface TrendPunkt {
  aar: number;
  snitt: number;
  antall: number;
}

interface StatsTrendGrafProps {
  data: TrendPunkt[];
  height?: number;
}

export function StatsTrendGraf({ data, height = 240 }: StatsTrendGrafProps) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  if (!mounted || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "grid",
          placeItems: "center",
          color: "var(--s-muted-fg)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        Laster graf…
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.aar - b.aar);
  const w = 600;
  const h = height;
  const pad = { t: 20, r: 20, b: 36, l: 52 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  const ys = sorted.map((d) => d.snitt);
  const yMin = Math.min(...ys) - 0.5;
  const yMax = Math.max(...ys) + 0.5;

  const xScale = (i: number) =>
    sorted.length < 2 ? cw / 2 : (i / (sorted.length - 1)) * cw;
  const yScale = (v: number) => ch - ((v - yMin) / (yMax - yMin)) * ch;

  const points = sorted.map((d, i) => ({
    x: pad.l + xScale(i),
    y: pad.t + yScale(d.snitt),
    d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(pad.t + ch).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(pad.t + ch).toFixed(1)} Z`;

  const yTicks = [yMin + 0.5, (yMin + yMax) / 2, yMax - 0.5];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%", height, display: "block", overflow: "visible" }}
      aria-label="Snittscore per år"
    >
      <defs>
        <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#005840" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#005840" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((tick, i) => {
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

      <path d={areaPath} fill="url(#trendAreaGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#005840"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#005840"
            stroke="#FAFAF7"
            strokeWidth={2}
          />
          <text
            x={p.x}
            y={pad.t + ch + 20}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={10}
            fill="#5E5C57"
          >
            {p.d.aar}
          </text>
          <title>
            {p.d.aar}: {p.d.snitt.toFixed(1)} over {p.d.antall} runder
          </title>
        </g>
      ))}
    </svg>
  );
}
