import type React from "react";

/**
 * AK Golf HQ — LFaseBadge
 * Pill badge for L-phase (periodisation phase).
 * Uses the sequential forest→lime phase ramp tokens.
 * phases: Base · Forberedelse · Spesialisering · Taper · Peak
 * Portet 1:1 fra public/design-handover/components/domain/LFaseBadge.jsx.
 */

export type LFase = "Base" | "Forberedelse" | "Spesialisering" | "Taper" | "Peak";

export type LFaseBadgeProps = {
  phase: LFase;
  style?: React.CSSProperties;
  className?: string;
};

const PHASE_TOKEN: Record<LFase, string> = {
  Base: "--phase-base",
  Forberedelse: "--phase-forberedelse",
  Spesialisering: "--phase-spesialisering",
  Taper: "--phase-taper",
  Peak: "--phase-peak",
};

export function LFaseBadge({ phase, style, className = "" }: LFaseBadgeProps) {
  const token = PHASE_TOKEN[phase] || PHASE_TOKEN.Base;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "9999px",
        background: `var(${token})`,
        color: "rgba(0,0,0,0.65)",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        lineHeight: 1.7,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {phase}
    </span>
  );
}
