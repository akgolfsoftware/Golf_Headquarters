import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — Heatmap
 * Generic intensity grid (booking-load by hour×day, risk by player×week, …).
 * Cells ramp from `--track` (empty) to `color` (full) by `value` (0–1); pass a
 * categorical `color` per use (signal for load, error for risk) — never mixed
 * per grid. No legend row: the darkest/lightest cell + a hover tooltip carry it.
 *
 * Premium data-life: cells fade+scale in with a row-major stagger on mount;
 * hover highlights the cell plus dims its row/column label.
 */

const CSS = `
.ak-heatmap{display:grid;}
.ak-heatmap__corner{}
.ak-heatmap__collabel, .ak-heatmap__rowlabel{
  font-family:var(--font-mono);font-size:9px;font-weight:600;color:var(--text-muted);
  display:flex;align-items:center;justify-content:center;
  transition:color var(--dur-fast) var(--ease-standard);
}
.ak-heatmap__rowlabel{justify-content:flex-end;padding-right:8px;text-transform:uppercase;letter-spacing:.04em;}
.ak-heatmap__collabel{text-transform:uppercase;letter-spacing:.04em;}
.ak-heatmap__cell{
  border-radius:4px;position:relative;cursor:default;
  transition:transform 120ms var(--ease-standard), filter 120ms var(--ease-standard);
}
.ak-heatmap__cell[data-hot]{filter:brightness(1.15);transform:scale(1.08);z-index:1;}
.ak-heatmap__tip{
  position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);
  background:var(--surface-2);border:1px solid var(--border-strong);border-radius:6px;
  padding:4px 8px;font-family:var(--font-mono);font-size:9px;color:var(--text);
  white-space:nowrap;pointer-events:none;box-shadow:var(--sheen-top-lg);z-index:2;
}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-heatmap-css")) {
  const s = document.createElement("style");
  s.id = "ak-heatmap-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function usePrefersReducedMotion() {
  const [reduce] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
}) {
  const [hover, setHover] = React.useState(null); // {r,c}
  const [drawn, setDrawn] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setDrawn(true); return; }
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
          height: 160, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen data ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Varmekartet vises når det finnes registrerte økter.</span>
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
      <div className="ak-heatmap__corner" />
      {cols.map((c, ci) => (
        <div key={ci} className="ak-heatmap__collabel"
          style={{ color: hover && hover.c === ci ? "var(--text)" : undefined }}>
          {c}
        </div>
      ))}
      {rows.map((r, ri) => (
        <React.Fragment key={ri}>
          <div className="ak-heatmap__rowlabel"
            style={{ color: hover && hover.r === ri ? "var(--text)" : undefined }}>
            {r}
          </div>
          {cols.map((_, ci) => {
            const v = Math.max(0, Math.min(1, (values[ri] && values[ri][ci]) || 0));
            const isHot = hover && hover.r === ri && hover.c === ci;
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
