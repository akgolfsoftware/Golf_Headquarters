"use client";

import React from "react";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — Progress
 * Portet fra design-handover v14 (components/data/Progress.jsx). Fire former
 * via `variant`: ring (sirkulær gauge), bar (lineær), streak (5–7 prikker,
 * flamme på det aktive endepunktet), segment (segmentert bar, f.eks. 4/12).
 * Fyll defaulter til --signal-fill (lime i BEGGE temaer — lime-utvidelsen):
 * fylte deler får automatisk 1px --signal-fill-edge (obligatorisk på lys,
 * transparent på mørk). Flamme-ikonet bruker --signal (aldri lime-ikon på
 * lys). Send `color` for å overstyre (f.eks. akse-farge) — da uten kant.
 */

export type ProgressVariant = "ring" | "bar" | "streak" | "segment";

export type ProgressProps = {
  variant?: ProgressVariant;
  value?: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: React.ReactNode;
  unit?: React.ReactNode;
  color?: string;
  total?: number;
  filled?: number;
  active?: number;
  flame?: boolean;
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function Progress({
  variant = "bar",
  value = 0,
  max = 100,
  size = 72,
  thickness = 6,
  label,
  unit,
  color = "var(--signal-fill)",
  total = 7,
  filled = 0,
  active = 0,
  flame = true,
  showValue = true,
  className = "",
  style,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const isSignalFill = color === "var(--signal-fill)";
  const fillEdge = isSignalFill ? "inset 0 0 0 1px var(--signal-fill-edge)" : undefined;

  if (variant === "ring") {
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - pct / 100);
    return (
      <div className={className} style={{ position: "relative", width: size, height: size, ...style }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={thickness} />
          {isSignalFill && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--signal-fill-edge)"
              strokeWidth={thickness + 2}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={off}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dashoffset var(--dur-slow) var(--ease-standard)" }}
            />
          )}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset var(--dur-slow) var(--ease-standard)" }}
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
            gap: 1,
          }}
        >
          {showValue && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                fontSize: size >= 64 ? "var(--text-18)" : "var(--text-14)",
                color: "var(--text)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(pct)}
              <span style={{ fontSize: "0.6em", color: "var(--text-muted)" }}>{unit ?? "%"}</span>
            </span>
          )}
          {label != null && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "streak") {
    const activeN = active || filled;
    return (
      <div className={className} style={{ display: "flex", alignItems: "center", gap: 8, ...style }}>
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i < activeN;
          const isEndpoint = flame && i === activeN - 1;
          if (isEndpoint) {
            return <Icon key={i} name="flame" size={18} style={{ color: isSignalFill ? "var(--signal)" : color }} />;
          }
          return (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: isActive ? color : "var(--track)",
                boxShadow: isActive ? fillEdge : undefined,
              }}
            />
          );
        })}
        {label != null && (
          <span style={{ marginLeft: 4, fontFamily: "var(--font-mono)", fontSize: "var(--text-12)", color: "var(--text-2)" }}>
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "segment") {
    return (
      <div className={className} style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 2,
                background: i < filled ? color : "var(--track)",
                boxShadow: i < filled ? fillEdge : undefined,
              }}
            />
          ))}
        </div>
        {showValue && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-12)", color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
            {filled} / {total}
            {label != null ? ` · ${label}` : ""}
          </span>
        )}
      </div>
    );
  }

  // bar (default)
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {(label != null || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          {label != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-12)", color: "var(--text-2)" }}>{label}</span>}
          {showValue && (
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "var(--text-12)", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div style={{ height: 8, borderRadius: 9999, background: "var(--track)", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 9999,
            background: color,
            boxShadow: fillEdge,
            transition: "width var(--dur-slow) var(--ease-standard)",
          }}
        />
      </div>
    </div>
  );
}
