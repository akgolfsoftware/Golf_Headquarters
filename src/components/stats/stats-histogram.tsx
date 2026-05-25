"use client";

/**
 * StatsHistogram — 20-bar histogram with highlighted bucket + tooltip
 * Client component (interactive hover state).
 */

import { useState } from "react";

export interface HistogramBucket {
  range: string;   // e.g. "220-230"
  count: number;
}

interface StatsHistogramProps {
  data: HistogramBucket[];
  highlightIndex: number;
  height?: number;
}

export function StatsHistogram({
  data,
  highlightIndex,
  height = 160,
}: StatsHistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((b) => b.count), 1);

  return (
    <div>
      <div
        className="kat-histogram"
        style={{ height }}
      >
        {data.map((bucket, i) => {
          const pct = (bucket.count / maxCount) * 100;
          const isHighlighted = i === highlightIndex;
          const isHovered = i === hovered;
          return (
            <div
              key={i}
              className={`kat-hist-bar${isHighlighted ? " highlighted" : ""}`}
              style={{ height: `${Math.max(pct, 3)}%` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && (
                <div className="kat-hist-tooltip">
                  {bucket.range}: {bucket.count} sp.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="kat-hist-labels">
        <span>{data[0]?.range.split("-")[0]}</span>
        <span>{data[data.length - 1]?.range.split("-")[1]}</span>
      </div>
    </div>
  );
}
