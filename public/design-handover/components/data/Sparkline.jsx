import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { DataPreview, nearestIndex } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — Sparkline
 * Tiny line or bar chart for KPI tiles and table rows. Neutral by default; pass
 * a lime color to highlight. No axes, no labels — pure trend ink.
 * `animate` draws the line in on mount (respects prefers-reduced-motion);
 * `endDot` marks the last point with a small dot that glows subtly — the
 * cheapest, strongest premium signal in a data tool. Use sparingly (uptrends).
 */
function usePrefersReducedMotion() {
  const [reduce] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduce;
}

export function Sparkline({
  data = [],
  loading = false,
  width = 96,
  height = 28,
  variant = "line",
  color = "var(--text-muted)",
  strokeWidth = 1.5,
  fill = false,
  animate = false,
  endDot = false,
  preview = false,
  previewLabel,
  previewFormat,
  className = "",
  style,
}) {
  const pathRef = React.useRef(null);
  const svgRef = React.useRef(null);
  const [drawn, setDrawn] = React.useState(!animate);
  const [scrub, setScrub] = React.useState(null);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!animate || reduceMotion) { setDrawn(true); return; }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [animate, reduceMotion, data.length]);

  if (loading) {
    return <Skeleton width={width} height={height} className={className} style={style} />;
  }
  if (!data || data.length === 0) {
    return (
      <span
        role="img"
        aria-label="Ingen data ennå"
        title="Ingen data ennå"
        className={className}
        style={{ display: "inline-flex", width, height, alignItems: "center",
          borderBottom: "1px dashed var(--border-strong)", ...style }}
      ></span>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const n = data.length;
  const x = (i) => (n === 1 ? width / 2 : (i / (n - 1)) * width);
  const y = (v) => height - ((v - min) / range) * (height - 2) - 1;

  const common = {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    className,
    style: { display: "block", overflow: "visible", cursor: preview ? "crosshair" : undefined, ...style },
    "aria-hidden": "true",
  };

  // Scrubber (opt-in, Fase 4.6): pekeren finner nærmeste punkt → DataPreview.
  const onScrub = (e) => {
    if (!preview || data.length < 1 || !svgRef.current) return;
    setScrub(nearestIndex(e.clientX, svgRef.current.getBoundingClientRect(), data.length));
  };
  const scrubHandlers = preview ? { ref: svgRef, onMouseMove: onScrub, onMouseLeave: () => setScrub(null) } : {};
  const wrap = (svgEl) => {
    if (!preview) return svgEl;
    const xPct = data.length < 2 ? 50 : ((scrub ?? data.length - 1) / (data.length - 1)) * 100;
    const v = data[scrub ?? data.length - 1];
    return (
      <span style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
        {svgEl}
        <DataPreview
          visible={scrub != null}
          x={`${xPct}%`}
          y={0}
          placement="top"
          label={previewLabel}
          value={previewFormat ? previewFormat(v, scrub) : v}
        />
      </span>
    );
  };

  if (variant === "bar") {
    const slot = width / n;
    const bw = slot * 0.62;
    return wrap(
      <svg {...common} {...scrubHandlers}>
        {data.map((v, i) => {
          const yy = y(v);
          const h = Math.max(1, height - yy);
          return (
            <rect
              key={i}
              x={i * slot + (slot - bw) / 2}
              y={animate && !drawn ? height : yy}
              width={bw}
              height={animate && !drawn ? 0 : h}
              rx="1.5"
              fill={color}
              style={
                animate
                  ? {
                      transition: `y var(--dur-slow) var(--ease-standard) ${i * 30}ms,
                        height var(--dur-slow) var(--ease-standard) ${i * 30}ms`,
                    }
                  : undefined
              }
            />
          );
        })}
      </svg>
    );
  }

  const pts = data.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const lastX = x(n - 1);
  const lastY = y(data[n - 1]);

  return wrap(
    <svg {...common} {...scrubHandlers}>
      {fill && (
        <polygon
          points={`0,${height} ${pts} ${width},${height}`}
          fill={color}
          opacity={animate ? (drawn ? 0.12 : 0) : 0.12}
          style={animate ? { transition: "opacity var(--dur-slow) var(--ease-standard) 300ms" } : undefined}
        />
      )}
      <polyline
        ref={pathRef}
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={animate ? 100 : undefined}
        strokeDasharray={animate ? 100 : undefined}
        strokeDashoffset={animate ? (drawn ? 0 : 100) : undefined}
        style={animate ? { transition: "stroke-dashoffset 900ms var(--ease-standard)" } : undefined}
      />
      {endDot && (
        <circle
          cx={lastX}
          cy={lastY}
          r={2.6}
          fill={color}
          opacity={animate ? (drawn ? 1 : 0) : 1}
          style={{
            transition: animate ? "opacity var(--dur-base) var(--ease-standard) 850ms" : undefined,
            animation: "ak-glow-pulse 2.4s var(--ease-standard) infinite",
            color,
          }}
        />
      )}
    </svg>
  );
}
