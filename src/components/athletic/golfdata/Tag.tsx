import type React from "react";

/**
 * AK Golf HQ — Tag & CountBadge
 * Mono-caps status pill (AKTIV / FERDIG / PÅ VEI), category mark (A–K),
 * lime signal tag, neutral and outline. CountBadge is the small counter.
 * Radius 8 (var(--radius-tag)).
 * Portet 1:1 fra public/design-handover/components/core/Tag.jsx.
 * CSS: ./golfdata.css (.ak-tag, .ak-badge).
 */

export type TagVariant = "neutral" | "outline" | "signal" | "up" | "down" | "live";
export type TagSize = "sm" | "md";

const VARIANTS: Record<TagVariant, React.CSSProperties> = {
  neutral: { background: "var(--surface-2)", color: "var(--text-2)", borderColor: "var(--border)" },
  outline: { background: "transparent", color: "var(--text-2)", borderColor: "var(--border-strong)" },
  signal: { background: "var(--signal)", color: "var(--on-signal)", borderColor: "transparent" },
  up: { background: "color-mix(in srgb, var(--up) 15%, transparent)", color: "var(--up)", borderColor: "transparent" },
  down: { background: "color-mix(in srgb, var(--down) 16%, transparent)", color: "var(--down)", borderColor: "transparent" },
  live: { background: "color-mix(in srgb, var(--up) 14%, transparent)", color: "var(--up)", borderColor: "transparent" },
};

export type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
  size?: TagSize;
  dot?: boolean;
};

export function Tag({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  style,
  ...rest
}: TagProps) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const showDot = dot || variant === "live";
  return (
    <span
      className={`ak-tag ak-tag--${size} ${variant === "live" ? "ak-tag--live" : ""} ${className}`}
      style={{ ...v, ...style }}
      {...rest}
    >
      {showDot && <span className="ak-tag__dot" />}
      {children}
    </span>
  );
}

export type CountBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  count: React.ReactNode;
  /** tone: "signal" | "neutral". */
  tone?: "signal" | "neutral";
};

/** Small counter badge for queues / nav. */
export function CountBadge({ count, tone = "neutral", className = "", style, ...rest }: CountBadgeProps) {
  const tones: React.CSSProperties =
    tone === "signal"
      ? { background: "var(--signal)", color: "var(--on-signal)" }
      : { background: "var(--surface-hover)", color: "var(--text)" };
  return (
    <span className={`ak-badge ${className}`} style={{ ...tones, ...style }} {...rest}>
      {count}
    </span>
  );
}
