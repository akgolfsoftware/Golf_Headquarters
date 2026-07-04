import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — Pyramid
 * The AK training pyramid as a readable graph (not decoration): one labelled
 * horizontal bar per axis — FYS / TEK / SLAG / SPILL / TURN. The active axis is
 * lime; the rest are neutral. An optional `plan` value draws a target marker, so
 * the tile reads faktisk-vs-plan at a glance. Rendered apex→base (TURN on top,
 * FYS the foundation) by default.
 *
 * Premium data-life: bars grow in from 0 on mount (staggered per row,
 * respects prefers-reduced-motion) — the plan marker fades in after.
 */

function usePyramidMotion(rowCount) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [grown, setGrown] = React.useState(reduceMotion);
  React.useEffect(() => {
    if (reduceMotion) { setGrown(true); return; }
    setGrown(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowCount]);
  return { grown, reduceMotion };
}

const DEFAULT_DATA = [
  { axis: "TURN", value: 40 },
  { axis: "SPILL", value: 62 },
  { axis: "SLAG", value: 71 },
  { axis: "TEK", value: 84 },
  { axis: "FYS", value: 90 },
];

const NEUTRAL = "color-mix(in srgb, var(--text-2) 55%, transparent)";

export function Pyramid({
  data = DEFAULT_DATA,
  activeAxis,
  max = 100,
  showValues = true,
  compact = false,
  className = "",
  style,
}) {
  const rowGap = compact ? 8 : 12;
  const { grown } = usePyramidMotion(data.length);
  const [hover, setHover] = React.useState(null); // {row, x}
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: rowGap, ...style }}
    >
      {data.map((d, rowIdx) => {
        const isActive = activeAxis ? d.axis === activeAxis : false;
        const pct = Math.max(0, Math.min(100, (d.value / max) * 100));
        const planPct =
          d.plan != null ? Math.max(0, Math.min(100, (d.plan / max) * 100)) : null;
        const fillColor = isActive ? "var(--signal)" : NEUTRAL;
        return (
          <div
            key={d.axis}
            style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover({ row: rowIdx, x: e.clientX - r.left }); }}
            onMouseLeave={() => setHover((h) => (h && h.row === rowIdx ? null : h))}
          >
            <span
              style={{
                width: 46,
                flex: "none",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                fontSize: "var(--text-11)",
                letterSpacing: "0.08em",
                color: isActive ? "var(--signal)" : "var(--text-2)",
              }}
            >
              {d.axis}
            </span>
            <div
              style={{
                position: "relative",
                flex: 1,
                height: compact ? 8 : 10,
                borderRadius: 9999,
                background: "var(--track)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: grown ? `${pct}%` : "0%",
                  height: "100%",
                  borderRadius: 9999,
                  background: fillColor,
                  transition: `width 620ms var(--ease-standard) ${rowIdx * 60}ms`,
                }}
              />
              {/* plan / target marker — thin line at the planned value */}
              {planPct != null && (
                <span
                  aria-hidden="true"
                  title={`Plan: ${d.plan}`}
                  style={{
                    position: "absolute",
                    top: -2,
                    bottom: -2,
                    left: `calc(${planPct}% - 1px)`,
                    width: 2,
                    background: "var(--text)",
                    borderRadius: 1,
                    opacity: grown ? 1 : 0,
                    transition: `opacity 300ms var(--ease-standard) ${rowIdx * 60 + 500}ms`,
                  }}
                />
              )}
            </div>
            {showValues && (
              <span
                style={{
                  width: 30,
                  flex: "none",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  fontSize: "var(--text-12)",
                  color: isActive ? "var(--text)" : "var(--text-2)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d.value}
              </span>
            )}
            {hover && hover.row === rowIdx && (
              <DataPreview
                visible
                x={hover.x}
                y={-4}
                placement="top"
                label={d.axis}
                value={d.value}
                accent={isActive ? "var(--signal)" : undefined}
                delta={d.plan != null ? d.value - d.plan : undefined}
                note={d.plan != null ? `Plan ${d.plan}` : null}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
