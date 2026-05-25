"use client";

import { ChevronUp, ChevronDown, Minus } from "lucide-react";

export type HcpTrendProps = {
  /** Positive = improving (HCP going up in amateur land, or down if scratch+).
   *  In this design: positive delta = good (accent), negative = bad (destructive). */
  delta: number;
};

export default function HcpTrend({ delta }: HcpTrendProps) {
  const up = delta > 0;
  const dn = delta < 0;
  const color = up
    ? "var(--accent)"
    : dn
      ? "var(--destructive)"
      : "rgba(250,250,247,0.6)";

  return (
    <span
      className="inline-flex items-center gap-[2px]"
      style={{ color }}
      aria-label={`HCP trend: ${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
    >
      <span className="hcp-pulse">
        {up ? (
          <ChevronUp size={14} strokeWidth={2.5} />
        ) : dn ? (
          <ChevronDown size={14} strokeWidth={2.5} />
        ) : (
          <Minus size={14} strokeWidth={2.5} />
        )}
      </span>
      <span className="tabular text-[12px]">
        {Math.abs(delta).toFixed(1)}
      </span>
    </span>
  );
}
