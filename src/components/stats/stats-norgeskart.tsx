"use client";

/**
 * StatsNorgeskart — simplified Norway SVG map with 5 golf regions
 * Client component (hover + click state).
 *
 * Regions: ost | vest | midt | nord | sor
 * SVG is a simplified stylized outline, not geographically exact.
 */

import { useState } from "react";
import type { RegionSlug } from "@/lib/stats/klubb-til-region";

interface RegionPath {
  slug: RegionSlug;
  label: string;
  d: string;
  labelX: number;
  labelY: number;
}

// Simplified Norway regions as SVG paths (stylized, viewBox 0 0 300 600)
const REGIONER: RegionPath[] = [
  {
    slug: "ost",
    label: "Øst",
    labelX: 195,
    labelY: 360,
    d: "M 160 280 L 220 260 L 255 285 L 260 330 L 250 380 L 220 410 L 175 420 L 155 395 L 145 360 L 150 310 Z",
  },
  {
    slug: "sor",
    label: "Sør",
    labelX: 120,
    labelY: 450,
    d: "M 145 360 L 155 395 L 175 420 L 165 455 L 140 470 L 110 460 L 90 435 L 100 410 L 125 395 Z",
  },
  {
    slug: "vest",
    label: "Vest",
    labelX: 75,
    labelY: 360,
    d: "M 80 280 L 110 265 L 145 280 L 155 310 L 150 360 L 125 395 L 100 410 L 70 390 L 60 355 L 65 310 Z",
  },
  {
    slug: "midt",
    label: "Midt",
    labelX: 115,
    labelY: 220,
    d: "M 75 185 L 115 165 L 160 175 L 165 210 L 155 250 L 120 260 L 80 280 L 65 255 L 68 215 Z",
  },
  {
    slug: "nord",
    label: "Nord",
    labelX: 130,
    labelY: 95,
    d: "M 95 40 L 155 30 L 195 55 L 200 100 L 185 140 L 160 175 L 115 165 L 80 148 L 75 105 L 82 65 Z",
  },
];

const REGION_COLORS: Record<RegionSlug, { base: string; hover: string; active: string }> = {
  ost:  { base: "rgba(0, 88, 64, 0.18)",   hover: "rgba(0, 88, 64, 0.35)",   active: "hsl(var(--primary))" },
  vest: { base: "rgba(209, 248, 67, 0.30)", hover: "rgba(209, 248, 67, 0.55)", active: "#8CA015" },
  midt: { base: "rgba(30, 100, 200, 0.15)", hover: "rgba(30, 100, 200, 0.30)", active: "#1E64C8" },
  nord: { base: "rgba(120, 60, 180, 0.15)", hover: "rgba(120, 60, 180, 0.30)", active: "#783CB4" },
  sor:  { base: "rgba(200, 80, 30, 0.15)",  hover: "rgba(200, 80, 30, 0.30)",  active: "#C8501E" },
};

interface StatsNorgeskartProps {
  aktiv?: RegionSlug | null;
  onRegionClick?: (slug: RegionSlug) => void;
  size?: number;
}

export function StatsNorgeskart({
  aktiv,
  onRegionClick,
  size = 280,
}: StatsNorgeskartProps) {
  const [hovered, setHovered] = useState<RegionSlug | null>(null);

  return (
    <svg
      viewBox="0 0 300 600"
      width={size}
      height={size * 2}
      style={{ display: "block" }}
      aria-label="Norgeskart med golfregioner"
    >
      {/* Background */}
      <rect width="300" height="600" fill="var(--s-secondary)" rx="12" />

      {/* Sea texture lines */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={10 + i * 40}
          y1="0"
          x2={10 + i * 40}
          y2="600"
          stroke="var(--s-border)"
          strokeWidth={0.5}
          strokeDasharray="4 8"
          opacity={0.4}
        />
      ))}

      {/* Region paths */}
      {REGIONER.map((r) => {
        const isHovered = hovered === r.slug;
        const isAktiv = aktiv === r.slug;
        const colors = REGION_COLORS[r.slug];
        const fill = isAktiv ? colors.active : isHovered ? colors.hover : colors.base;

        return (
          <g
            key={r.slug}
            onClick={() => onRegionClick?.(r.slug)}
            onMouseEnter={() => setHovered(r.slug)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            <path
              d={r.d}
              fill={fill}
              stroke={isAktiv ? colors.active : "var(--s-border-strong)"}
              strokeWidth={isAktiv ? 2 : 1}
              style={{ transition: "fill .2s ease, stroke .15s ease" }}
            />
            <text
              x={r.labelX}
              y={r.labelY}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={11}
              fontWeight={isAktiv || isHovered ? 700 : 500}
              fill={isAktiv ? "hsl(var(--background))" : "var(--s-fg)"}
              style={{ transition: "fill .15s, font-weight .1s", userSelect: "none" }}
            >
              {r.label}
            </text>
          </g>
        );
      })}

      {/* Sea label */}
      <text
        x="28"
        y="300"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={9}
        fill="var(--s-muted-fg)"
        transform="rotate(-90, 28, 300)"
        style={{ userSelect: "none" }}
      >
        Norskehavet
      </text>
    </svg>
  );
}
