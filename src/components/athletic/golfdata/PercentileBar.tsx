"use client";

import React from "react";
import { DataPreview } from "./DataPreview";

/**
 * AK Golf HQ — PercentileBar
 * Where a player sits within a peer distribution. A soft quartile-tinted track
 * with a marker at the player's percentile; an optional benchmark tick shows
 * a reference (e.g. squad average). No axis, no legend — the number leads.
 * Portet 1:1 fra Claude Design-prosjektets components/data/PercentileBar.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-pctbar).
 */

function usePrefersReducedMotion(): boolean {
  const [reduce] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return reduce;
}

export type PercentileBarProps = {
  /** Spillerens persentil 0–100. */
  percentile?: number;
  /** Referanse-tick (f.eks. stall-snitt), 0–100. */
  benchmark?: number;
  label?: React.ReactNode;
  /** Verdi vist til høyre i hodet (f.eks. "78."). */
  valueLabel?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PercentileBar({
  percentile = 50,
  benchmark,
  label,
  valueLabel,
  className = "",
  style,
}: PercentileBarProps) {
  const [pos, setPos] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    // All setState skjer i rAF (aldri synkront i effekten) — samme gli-inn som
    // DS-kilden, men uten kaskaderende re-render (react-hooks/set-state-in-effect).
    if (reduceMotion) {
      const raf = requestAnimationFrame(() => setPos(percentile));
      return () => cancelAnimationFrame(raf);
    }
    const raf = requestAnimationFrame(() => {
      setPos(0);
      requestAnimationFrame(() => setPos(percentile));
    });
    return () => cancelAnimationFrame(raf);
  }, [percentile, reduceMotion]);

  return (
    <div className={`ak-pctbar ${className}`} style={style}>
      {(label || valueLabel != null) && (
        <div className="ak-pctbar__head">
          {label && <span className="ak-pctbar__label">{label}</span>}
          {valueLabel != null && <span className="ak-pctbar__value">{valueLabel}</span>}
        </div>
      )}
      <div className="ak-pctbar__track" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {benchmark != null && (
          <div className="ak-pctbar__bench" style={{ left: `${benchmark}%` }} title={`Snitt: ${benchmark}.`} />
        )}
        <div className="ak-pctbar__marker" style={{ left: `${pos}%` }} />
        <DataPreview
          visible={hover}
          x={`${percentile}%`}
          y={4}
          placement="top"
          label={label || "Persentil"}
          value={`${percentile}.`}
          accent="var(--signal)"
          note={
            benchmark != null
              ? `Snitt ${benchmark}. · ${percentile - benchmark >= 0 ? "+" : ""}${percentile - benchmark} vs. snitt`
              : null
          }
        />
      </div>
      <div className="ak-pctbar__foot">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
