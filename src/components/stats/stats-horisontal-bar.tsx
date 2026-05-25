"use client";

/**
 * StatsHorisontalBar — horizontal bar chart for distributions
 * Client component (hover state).
 */

import { useState } from "react";

export interface HorisontalBarItem {
  label: string;
  value: number;
  href?: string;
  color?: string;
}

interface StatsHorisontalBarProps {
  items: HorisontalBarItem[];
  formatValue?: (v: number) => string;
  maxValue?: number;
  /** Show percentage instead of raw value */
  asPercent?: boolean;
}

export function StatsHorisontalBar({
  items,
  formatValue,
  maxValue,
  asPercent = false,
}: StatsHorisontalBarProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((s, i) => s + i.value, 0);

  const fmt = formatValue
    ? formatValue
    : asPercent
      ? (v: number) => Math.round((v / total) * 100) + "%"
      : (v: number) => String(v);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const pct = (item.value / max) * 100;
        const isHovered = hoveredIdx === i;

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr auto",
              gap: 12,
              alignItems: "center",
              opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
              transition: "opacity .15s",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: isHovered ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "font-weight .1s",
              }}
            >
              {item.label}
            </span>
            <div
              style={{
                height: 8,
                background: "var(--s-secondary)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: item.color ?? "var(--s-primary)",
                  borderRadius: 99,
                  transition: "width .4s cubic-bezier(.2,.8,.2,1)",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontVariantNumeric: "tabular-nums",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--s-muted-fg)",
                minWidth: 40,
                textAlign: "right",
              }}
            >
              {fmt(item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
