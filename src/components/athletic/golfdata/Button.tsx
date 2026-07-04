import type React from "react";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — Button
 * Full-radius pill. Primary = white pill / dark text on dark (dark pill / white
 * text on light, via tokens). Signal = the one loud lime action. Plus secondary
 * (hairline outline), ghost, and destructive. Sizes sm / md / lg. Icon-only when
 * given an icon and no children. CSS: ./golfdata.css (.ak-btn).
 */

export type ButtonVariant = "primary" | "signal" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Lucide icon name (string) or a React node, placed before the label. */
  iconLeft?: string | React.ReactNode;
  /** Lucide icon name (string) or a React node, placed after the label. */
  iconRight?: string | React.ReactNode;
  /** Full-width. */
  block?: boolean;
  /** Vis spinner og deaktiver interaksjon (aria-busy). */
  loading?: boolean;
  /** Render as another element/component (e.g. "a"). */
  as?: React.ElementType;
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

function renderGlyph(glyph: string | React.ReactNode, size: number): React.ReactNode {
  if (!glyph) return null;
  if (typeof glyph === "string") return <Icon name={glyph} size={size} />;
  return glyph;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  block = false,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  as,
  ...rest
}: ButtonProps) {
  const iconOnly = !children && (iconLeft || iconRight);
  const Tag = (as || "button") as React.ElementType;
  const issz = ICON_SIZE[size] || 18;
  const cls = [
    "ak-btn",
    `ak-btn--${variant}`,
    `ak-btn--${size}`,
    iconOnly ? "ak-btn--icon" : "",
    block ? "ak-btn--block" : "",
    loading ? "ak-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tagProps =
    Tag === "button"
      ? { type, disabled: disabled || loading }
      : { "aria-disabled": disabled || loading || undefined };

  return (
    <Tag className={cls} aria-busy={loading || undefined} {...tagProps} {...rest}>
      {loading && <span className="ak-btn__spin" aria-hidden="true" />}
      {renderGlyph(iconLeft, issz)}
      {children != null && <span>{children}</span>}
      {renderGlyph(iconRight, issz)}
    </Tag>
  );
}
