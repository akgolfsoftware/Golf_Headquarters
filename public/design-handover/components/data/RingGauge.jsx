import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — RingGauge
 * Circular gauge for a single bounded metric (plan-kvalitet, ACWR, adherence %).
 * Optional `zones` colors the track by threshold (e.g. trygg/varsel/over) so the
 * arc itself carries meaning, not just the center number.
 *
 * Premium data-life: the arc sweeps in on mount and the center number counts up
 * in lockstep (respects prefers-reduced-motion); the arc endpoint gets a subtle
 * glow when the value sits in a "warn"/"over" zone.
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

function zoneColorFor(value, zones) {
  if (!zones || zones.length === 0) return null;
  for (const z of zones) {
    if (value >= z.from && value < z.to) return z.color;
  }
  return zones[zones.length - 1].color;
}

export function RingGauge({
  value = 0,
  min = 0,
  max = 100,
  size = 120,
  thickness = 9,
  label,
  unit = "%",
  color = "var(--signal)",
  zones,
  decimals = 0,
  className = "",
  style,
}) {
  const [sweep, setSweep] = React.useState(0);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) { setSweep(value); return; }
    setSweep(min);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSweep(value))
    );
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const sweepPct = Math.max(0, Math.min(1, (sweep - min) / (max - min)));
  const arcColor = zoneColorFor(value, zones) || color;
  const isWarnZone = zones && arcColor !== color && arcColor !== (zones[0] && zones[0].color);

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - sweepPct);
  const [hover, setHover] = React.useState(false);
  const zoneNow = zones && zones.find((z) => value >= z.from && value < z.to);

  const [display, setDisplay] = React.useState(min);
  React.useEffect(() => {
    if (reduceMotion) { setDisplay(value); return undefined; }
    let raf;
    const t0 = performance.now();
    const from = 0;
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      if (p >= 1) { setDisplay(value); return; }
      setDisplay(from + (value - from) * eased);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return (
    <div
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", width: size, height: size, display: "inline-block", ...style }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {zones && zones.length > 0 ? (
          zones.map((z, i) => {
            const p0 = Math.max(0, Math.min(1, (z.from - min) / (max - min)));
            const p1 = Math.max(0, Math.min(1, (z.to - min) / (max - min)));
            const seg = c * (p1 - p0);
            const gap = c - seg;
            const rotate = -90 + p0 * 360;
            return (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={z.color}
                strokeWidth={thickness}
                strokeDasharray={`${seg} ${gap}`}
                opacity={0.22}
                transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
              />
            );
          })
        ) : (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={thickness} />
        )}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 900ms var(--ease-standard), stroke 400ms var(--ease-standard)",
            filter: isWarnZone ? `drop-shadow(0 0 4px ${arcColor})` : "none",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)", fontWeight: 700,
            fontSize: size >= 100 ? "var(--text-30)" : "var(--text-20)",
            color: "var(--text)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
          }}
        >
          {display.toFixed(decimals)}
          {unit && <span style={{ fontSize: "0.5em", color: "var(--text-muted)", marginLeft: 2 }}>{unit}</span>}
        </span>
        {label != null && (
          <span
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)",
            }}
          >
            {label}
          </span>
        )}
      </div>
      <DataPreview
        visible={hover}
        x={size / 2}
        y={-2}
        placement="top"
        label={label || "Verdi"}
        value={value.toFixed(decimals)}
        unit={unit}
        accent={arcColor}
        note={zoneNow && zoneNow.label ? zoneNow.label : null}
      />
    </div>
  );
}
