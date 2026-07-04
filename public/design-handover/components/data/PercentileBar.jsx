import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — PercentileBar
 * Where a player sits within a peer distribution. A soft quartile-tinted track
 * with a marker at the player's percentile; an optional benchmark tick shows
 * a reference (e.g. squad average). No axis, no legend — the number leads.
 *
 * Premium data-life: the marker glides in from 0 on mount (respects
 * prefers-reduced-motion); hovering the track reveals the exact percentile.
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

const CSS = `
.ak-pctbar{display:flex;flex-direction:column;gap:8px;width:100%;}
.ak-pctbar__head{display:flex;align-items:baseline;justify-content:space-between;}
.ak-pctbar__label{font-family:var(--font-mono);font-size:11px;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);}
.ak-pctbar__value{font-family:var(--font-mono);font-weight:700;font-size:var(--text-16);
  color:var(--text);font-variant-numeric:tabular-nums;}
.ak-pctbar__track{position:relative;height:8px;border-radius:9999px;overflow:visible;
  background:linear-gradient(90deg,
    color-mix(in srgb, var(--signal) 12%, var(--track)) 0%,
    color-mix(in srgb, var(--signal) 12%, var(--track)) 25%,
    var(--track) 25%, var(--track) 75%,
    color-mix(in srgb, var(--signal) 12%, var(--track)) 75%,
    color-mix(in srgb, var(--signal) 12%, var(--track)) 100%);
}
.ak-pctbar__marker{
  position:absolute;top:50%;width:16px;height:16px;border-radius:9999px;
  background:var(--signal);border:2px solid var(--bg);
  transform:translate(-50%,-50%);
  transition:left 900ms var(--ease-standard);
  box-shadow:0 0 0 1px color-mix(in srgb, var(--signal) 40%, transparent);
}
.ak-pctbar__bench{
  position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--text-muted);
  border-radius:1px;transition:left 900ms var(--ease-standard);
}
.ak-pctbar__foot{display:flex;justify-content:space-between;
  font-family:var(--font-mono);font-size:9px;color:var(--text-faint);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-pctbar-css")) {
  const s = document.createElement("style");
  s.id = "ak-pctbar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function PercentileBar({
  percentile = 50,
  benchmark,
  label,
  valueLabel,
  className = "",
  style,
}) {
  const [pos, setPos] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setPos(percentile); return; }
    setPos(0);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPos(percentile)));
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
      <div
        className="ak-pctbar__track"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
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
          note={benchmark != null ? `Snitt ${benchmark}. · ${percentile - benchmark >= 0 ? "+" : ""}${percentile - benchmark} vs. snitt` : null}
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
