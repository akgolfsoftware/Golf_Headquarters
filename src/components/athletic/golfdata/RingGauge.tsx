"use client";

import React from "react";
import { DataPreview } from "./DataPreview";

/**
 * AK Golf HQ — RingGauge
 * Portet fra design-handover v14 (components/data/RingGauge.jsx). Sirkulær
 * gauge for én avgrenset metrikk (plan-kvalitet, ACWR, gjennomføring %).
 * `zones` fargelegger sporet etter terskel (trygg/varsel/over) slik at buen
 * selv bærer mening, ikke bare senter-tallet. Buen sveiper inn ved montering
 * og senter-tallet teller opp i takt (respekterer prefers-reduced-motion).
 */

export type RingGaugeZone = { from: number; to: number; color: string; label?: string };

export type RingGaugeProps = {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: React.ReactNode;
  unit?: React.ReactNode;
  color?: string;
  zones?: RingGaugeZone[];
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
};

function usePrefersReducedMotion(): boolean {
  const [reduce] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  return reduce;
}

function zoneColorFor(value: number, zones?: RingGaugeZone[]): string | null {
  if (!zones || zones.length === 0) return null;
  for (const z of zones) {
    if (value >= z.from && value < z.to) return z.color;
  }
  return zones[zones.length - 1].color;
}

export function RingGauge({
  value,
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
}: RingGaugeProps) {
  const [sweep, setSweep] = React.useState(min);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- statisk visning uten animasjon
      setSweep(value);
      return undefined;
    }
    setSweep(min);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setSweep(value)));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  const sweepPct = Math.max(0, Math.min(1, (sweep - min) / (max - min)));
  const arcColor = zoneColorFor(value, zones) || color;
  const isWarnZone = !!zones && arcColor !== color && arcColor !== zones[0]?.color;

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - sweepPct);
  const [hover, setHover] = React.useState(false);
  const zoneNow = zones?.find((z) => value >= z.from && value < z.to);

  const [display, setDisplay] = React.useState(min);
  React.useEffect(() => {
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- statisk visning uten animasjon
      setDisplay(value);
      return undefined;
    }
    let raf: number;
    const t0 = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      if (p >= 1) {
        setDisplay(value);
        return;
      }
      setDisplay(value * eased);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
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
                cx={size / 2}
                cy={size / 2}
                r={r}
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
          cx={size / 2}
          cy={size / 2}
          r={r}
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
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: size >= 100 ? "var(--text-30)" : "var(--text-20)",
            color: "var(--text)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {display.toFixed(decimals)}
          {unit && <span style={{ fontSize: "0.5em", color: "var(--text-muted)", marginLeft: 2 }}>{unit}</span>}
        </span>
        {label != null && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
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
        label={label ?? "Verdi"}
        value={value.toFixed(decimals)}
        unit={unit}
        accent={arcColor}
        note={zoneNow?.label ?? null}
      />
    </div>
  );
}
