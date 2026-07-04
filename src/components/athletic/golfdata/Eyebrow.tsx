import type React from "react";

/**
 * AK Golf HQ — Eyebrow
 * Mono-caps mini-label. Sits above numbers and as a section marker.
 * tone: "muted" (default) · "default" (brighter) · "signal" (lime).
 */
export type EyebrowProps = React.HTMLAttributes<HTMLElement> & {
  tone?: "muted" | "default" | "signal";
  as?: React.ElementType;
};

export function Eyebrow({
  children,
  tone = "muted",
  className = "",
  style,
  as: Tag = "div",
  ...rest
}: EyebrowProps) {
  const color =
    tone === "signal"
      ? "var(--signal)"
      : tone === "default"
        ? "var(--text-2)"
        : "var(--text-muted)";
  return (
    <Tag
      className={className}
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        fontSize: "var(--text-11)",
        lineHeight: 1,
        letterSpacing: "var(--tracking-eyebrow)",
        textTransform: "uppercase",
        color,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
