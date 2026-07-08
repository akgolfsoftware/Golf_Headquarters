import type React from "react";

/**
 * AK Golf HQ — StatusDot
 * One small token-driven status dot — the single replacement for the older
 * pulse / presence / severity dots. Colour by `tone`, optional `pulse` glow,
 * `overlay` mode for avatars.
 * Portet 1:1 fra Claude Design-prosjektets components/core/StatusDot.jsx
 * (DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-sd).
 */

export type StatusTone = "signal" | "online" | "busy" | "warning" | "critical" | "idle";

const TONE: Record<StatusTone, string> = {
  signal: "var(--signal)",
  online: "var(--up)",
  busy: "var(--destructive)",
  critical: "var(--destructive)",
  warning: "var(--warning)",
  idle: "var(--text-muted)",
};
const SIZE: Record<"sm" | "md" | "lg", number> = { sm: 6, md: 8, lg: 10 };

export type StatusDotProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> & {
  tone?: StatusTone;
  /** Soft pulsing glow (off by default). Respects prefers-reduced-motion. */
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  /** Pin to the bottom-right inside a position:relative avatar box (2px ring). */
  overlay?: boolean;
  /** Standalone label → role="img" + aria-label. Omit when it accompanies text. */
  label?: string;
};

export function StatusDot({
  tone = "idle",
  pulse = false,
  size = "md",
  overlay = false,
  label,
  className = "",
  style,
  ...rest
}: StatusDotProps) {
  const color = TONE[tone] || TONE.idle;
  const px = SIZE[size] || SIZE.md;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <span
      className={`ak-sd${pulse ? " ak-sd--pulse" : ""}${overlay ? " ak-sd--overlay" : ""} ${className}`}
      style={
        {
          width: px,
          height: px,
          "--ak-sd-color": color,
          "--ak-sd-glow": `color-mix(in srgb, ${color} 55%, transparent)`,
          ...style,
        } as React.CSSProperties
      }
      {...a11y}
      {...rest}
    />
  );
}
