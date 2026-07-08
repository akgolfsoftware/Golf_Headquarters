"use client";

import React from "react";
import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — Heatmap
 * Portet fra design-handover v14 (components/data/Heatmap.jsx). Generisk
 * intensitet-grid (treningshistorikk per ukedag×uke, belegg per time×dag).
 * Celler rampes fra --track (tom) til `color` (full) etter `value` (0–1);
 * send én kategorisk `color` per bruk — aldri blandet per grid. Ingen
 * legend-rad: den mørkeste/lyseste cellen + en hover-tooltip bærer det.
 * CSS: ./golfdata.css (.ak-heatmap*).
 */

export type HeatmapProps = {
  rows?: string[];
  cols?: string[];
  values?: number[][];
  loading?: boolean;
  color?: string;
  cell?: number;
  gap?: number;
  fmt?: (v: number) => string;
  className?: string;
  style?: React.CSSProperties;
};

function usePrefersReducedMotion(): boolean {
  const [reduce] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  return reduce;
}

export function Heatmap({
  rows = [],
  cols = [],
  values = [],
  loading = false,
  color = "var(--signal)",
  cell = 26,
  gap = 3,
  fmt = (v) => `${Math.round(v * 100)}%`,
  className = "",
  style,
}: HeatmapProps) {
  const [hover, setHover] = React.useState<{ r: number; c: number } | null>(null);
  const [drawn, setDrawn] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- statisk visning uten animasjon
      setDrawn(true);
      return undefined;
    }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, rows.length, cols.length]);

  if (loading) {
    return <Skeleton variant="card" width="100%" height={160} className={className} style={style} />;
  }
  if (!values || values.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: 16,
          boxSizing: "border-box",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-card)",
          background: "var(--surface)",
          textAlign: "center",
          ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Ingen data ennå
        </span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>
          Varmekartet vises når det finnes registrerte økter.
        </span>
      </div>
    );
  }

  const labelCol = 54;

  return (
    <div
      className={`ak-heatmap ${className}`}
      style={{
        gridTemplateColumns: `${labelCol}px repeat(${cols.length}, ${cell}px)`,
        gridTemplateRows: `18px repeat(${rows.length}, ${cell}px)`,
        gap,
        ...style,
      }}
    >
      <div />
      {cols.map((c, ci) => (
        <div key={ci} className="ak-heatmap__collabel" style={{ color: hover?.c === ci ? "var(--text)" : undefined }}>
          {c}
        </div>
      ))}
      {rows.map((r, ri) => (
        <React.Fragment key={ri}>
          <div className="ak-heatmap__rowlabel" style={{ color: hover?.r === ri ? "var(--text)" : undefined }}>
            {r}
          </div>
          {cols.map((_, ci) => {
            const v = Math.max(0, Math.min(1, values[ri]?.[ci] ?? 0));
            const isHot = hover?.r === ri && hover?.c === ci;
            const idx = ri * cols.length + ci;
            return (
              <div
                key={ci}
                className="ak-heatmap__cell"
                data-hot={isHot ? "" : undefined}
                style={{
                  background: v === 0 ? "var(--track)" : `color-mix(in srgb, ${color} ${Math.round(v * 85)}%, var(--track))`,
                  opacity: drawn ? 1 : 0,
                  transform: drawn ? "scale(1)" : "scale(0.6)",
                  transitionProperty: "opacity, transform, filter",
                  transitionDuration: drawn ? "280ms, 280ms, 120ms" : "0ms",
                  transitionDelay: `${idx * 14}ms`,
                  transitionTimingFunction: "var(--ease-standard)",
                }}
                onMouseEnter={() => setHover({ r: ri, c: ci })}
                onMouseLeave={() => setHover(null)}
              >
                {isHot && <div className="ak-heatmap__tip">{fmt(v)}</div>}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
