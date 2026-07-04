import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Sparkline } from "./Sparkline.jsx";

/**
 * AK Golf HQ — KpiTile
 * The signature metric tile: mono-caps eyebrow, an oversized tabular-mono number
 * with a small muted unit suffix, and an optional delta (↗ lime / ↘ coral).
 * Optionally pairs a sparkline below. The biggest number on screen is the hero.
 * The number counts up from 0 on mount/change (data-life) — honors
 * prefers-reduced-motion and falls back to a static render for non-numeric values.
 */

const VALUE_SIZE = { md: "var(--text-36)", lg: "var(--text-48)", xl: "var(--text-60)" };

function resolveDir(delta, trend) {
  if (trend) return trend;
  if (typeof delta === "number") return delta < 0 ? "down" : "up";
  if (typeof delta === "string") {
    const s = delta.trim();
    return s.startsWith("-") || s.startsWith("−") ? "down" : "up";
  }
  return "up";
}

/* ---- count-up: parses "2,8" / "14 400" / "-0,3" / 86, animates, re-formats ---- */
function parseNum(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { value: raw, decimals: 0, comma: false, spaced: false, sign: false };
  }
  if (typeof raw !== "string") return null;
  const m = raw.trim().match(/^([+\-−]?)([\d\s]+)(?:([.,])(\d+))?$/);
  if (!m) return null;
  const neg = m[1] === "-" || m[1] === "−";
  const intPart = parseInt(m[2].replace(/\s/g, ""), 10);
  const decStr = m[4] || "";
  const decimals = decStr.length;
  const frac = decimals ? parseInt(decStr, 10) / Math.pow(10, decimals) : 0;
  return {
    value: (neg ? -1 : 1) * (intPart + frac),
    decimals,
    comma: m[3] === ",",
    spaced: /\s/.test(m[2]),
    sign: m[1] === "+",
  };
}
function formatNum(value, meta) {
  const neg = value < 0;
  const fixed = Math.abs(value).toFixed(meta.decimals);
  const [i, d] = fixed.split(".");
  const intStr = meta.spaced ? i.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : i;
  let out = intStr + (d ? (meta.comma ? "," : ".") + d : "");
  if (neg) out = "−" + out;
  else if (meta.sign) out = "+" + out;
  return out;
}
function useCountUp(raw, duration = 900) {
  const meta = React.useMemo(() => parseNum(raw), [raw]);
  const [display, setDisplay] = React.useState(raw);
  React.useEffect(() => {
    if (!meta) { setDisplay(raw); return undefined; }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setDisplay(raw); return undefined; }
    let raf;
    const t0 = performance.now();
    const to = meta.value;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      if (p >= 1) { setDisplay(raw); return; }
      setDisplay(formatNum(to * eased, meta));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [raw, meta, duration]);
  return display;
}

export function KpiTile({
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  trend,
  sparkline,
  sparklineVariant = "line",
  size = "lg",
  className = "",
  style,
}) {
  const dir = resolveDir(delta, trend);
  const deltaColor = dir === "down" ? "var(--down)" : "var(--up)";
  const hasDelta = delta !== undefined && delta !== null && delta !== "";
  const displayValue = useCountUp(value);
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, ...style }}
    >
      {label != null && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: "var(--text-11)",
            letterSpacing: "var(--tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            lineHeight: 1,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: VALUE_SIZE[size] || VALUE_SIZE.lg,
            lineHeight: 1,
            letterSpacing: "var(--tracking-mono)",
            color: "var(--text)",
            fontVariantNumeric: "tabular-nums",
            fontVariantLigatures: "none",
          }}
        >
          {displayValue}
        </span>
        {unit != null && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: "0.42em",
              color: "var(--text-muted)",
              letterSpacing: "var(--tracking-mono)",
              position: "relative",
              top: "-0.06em",
            }}
          >
            {unit}
          </span>
        )}
        {hasDelta && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              marginLeft: "2px",
              color: deltaColor,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontSize: "var(--text-13)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Icon name={dir === "down" ? "arrow-down-right" : "arrow-up-right"} size={15} />
            {delta}
          </span>
        )}
        {deltaSuffix != null && (
          <span style={{ fontSize: "var(--text-12)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
            {deltaSuffix}
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 0 && (
        <Sparkline
          data={sparkline}
          variant={sparklineVariant}
          width={120}
          height={30}
          color={dir === "down" ? "var(--down)" : "var(--signal)"}
          animate
          endDot={dir === "up"}
          preview
          previewLabel={label}
        />
      )}
    </div>
  );
}
