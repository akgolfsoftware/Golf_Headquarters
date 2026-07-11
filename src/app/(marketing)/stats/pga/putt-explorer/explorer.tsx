"use client";

/**
 * PuttExplorerInteractive — client component for the interactive slider section
 *
 * Handles: distance slider, live updating 4 bar charts, narrative text.
 * Replaces old PuttExplorer component with pixel-perfect design 04 implementation.
 */

import { useState, useMemo } from "react";
import { CountUp } from "@/components/stats/count-up";
import { T } from "@/lib/v2/tokens";

export interface PuttDistanceRow {
  distanceMeters: number;
  tourAvgSunkPct: number;
  top10AvgSunkPct: number | null;
  proximityNext: number | null;
}

interface Props {
  data: PuttDistanceRow[];
}

const DISTANCES = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20];

// Broadie-estimater for amatører (hardkodet fra 04-brief)
const AMATEUR_HCP0: Record<number, number> = {
  1: 98, 2: 85, 3: 60, 4: 45, 5: 30, 6: 24, 8: 15, 10: 6, 15: 2, 20: 1,
};
const AMATEUR_HCP10: Record<number, number> = {
  1: 95, 2: 72, 3: 45, 4: 32, 5: 18, 6: 14, 8: 8, 10: 3, 15: 1, 20: 0,
};

function getNarrative(dist: number): string {
  if (dist <= 2)
    return "Selv proffer bommer her av og til. Konsentrasjon avgjør.";
  if (dist === 3)
    return "Den klassiske «birdie putt»-avstanden. Forskjellen mellom amatør og proff er størst her.";
  if (dist <= 5)
    return "PGA Tour synker hver annen. Statistikk fra Broadie sier at amatører synker annenhver.";
  if (dist <= 10)
    return "Lag-up-territorium. Proffer prioriterer 3-putt-unngåelse over sjansen for birdie.";
  return "Ren sjanse. Tour-snittet er rundt 15 %. Bra første putt = god start på neste hull.";
}

export function PuttExplorer({ data }: Props) {
  const [distIdx, setDistIdx] = useState(2); // default: index 2 = 3m
  const distance = DISTANCES[distIdx] ?? 3;

  const row = useMemo(() => {
    return (
      data.find((r) => r.distanceMeters === distance) ?? {
        distanceMeters: distance,
        tourAvgSunkPct: 82,
        top10AvgSunkPct: 90,
        proximityNext: null,
      }
    );
  }, [data, distance]);

  const hcp0 = AMATEUR_HCP0[distance] ?? 30;
  const hcp10 = AMATEUR_HCP10[distance] ?? 15;

  const bars = [
    { label: "PGA Tour-snitt", pct: row.tourAvgSunkPct, color: "var(--primary)" },
    { label: "Topp 10 putters", pct: row.top10AvgSunkPct ?? Math.round(row.tourAvgSunkPct * 1.1), color: "var(--accent)" },
    { label: "Amatør HCP 0", pct: hcp0, color: "var(--muted-foreground)" },
    { label: "Amatør HCP 10", pct: hcp10, color: T.chartFaint },
  ];

  return (
    <>
      {/* Big display block */}
      <div className="putt-big-block">
        <div>
          <div className="putt-mini-mono">PGA TOUR SYNKER</div>
          <div className="putt-big-pct">
            <CountUp value={row.tourAvgSunkPct} decimals={0} />%
          </div>
        </div>
        <div className="putt-big-x">fra</div>
        <div>
          <div className="putt-mini-mono">AVSTAND</div>
          <div className="putt-big-dist">{distance}m</div>
        </div>
      </div>

      {/* Slider */}
      <div className="putt-slider-wrap">
        <div className="putt-slider-labels">
          <span>1m</span>
          <span>20m</span>
        </div>
        <input
          type="range"
          className="putt-range"
          min={0}
          max={DISTANCES.length - 1}
          step={1}
          value={distIdx}
          onChange={(e) => setDistIdx(Number(e.target.value))}
        />
        <p className="putt-narrative">{getNarrative(distance)}</p>
      </div>

      {/* 4 bar charts */}
      <div className="putt-bars-grid" style={{ marginTop: 48 }}>
        {bars.map((bar) => (
          <div key={bar.label} className="putt-bar-card">
            <div className="putt-bar-label">{bar.label}</div>
            <div
              className="putt-bar-pct"
              style={{
                color: bar.color === "var(--accent)" ? "var(--primary)" : bar.color,
              }}
            >
              {bar.pct}%
            </div>
            <div className="putt-bar-track">
              <div
                className="putt-bar-fill"
                style={{
                  width: `${bar.pct}%`,
                  background: bar.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
