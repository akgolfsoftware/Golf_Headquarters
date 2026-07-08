import type React from "react";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — ListRow
 * The inbox / queue / task row: a leading status icon, title + subtext, and
 * right-aligned meta (a counter, a time, or a chevron). Used for notifications,
 * approval queues and task lists.
 * Portet 1:1 fra Claude Design-prosjektets components/feedback/ListRow.jsx
 * (DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-row).
 */

export type ListRowProps = Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick"> & {
  /** Leading Lucide icon name (string) or node. */
  icon?: string | React.ReactNode;
  iconTone?: "neutral" | "signal" | "up" | "down";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned meta (time, count, Tag…). */
  meta?: React.ReactNode;
  /** Lime unread dot at the right. */
  unread?: boolean;
  /** Trailing chevron (use for navigational rows). */
  chevron?: boolean;
  onClick?: React.MouseEventHandler;
  href?: string;
  as?: React.ElementType;
};

export function ListRow({
  icon,
  iconTone = "neutral",
  title,
  subtitle,
  meta,
  unread = false,
  chevron = false,
  onClick,
  href,
  as,
  className = "",
  style,
  ...rest
}: ListRowProps) {
  const interactive = !!(onClick || href);
  const Tag = (as || (href ? "a" : onClick ? "button" : "div")) as React.ElementType;
  const tagProps = href
    ? { href }
    : Tag === "button"
      ? { type: "button" as const, onClick }
      : { onClick };
  return (
    <Tag
      className={`ak-row ${interactive ? "ak-row--interactive" : ""} ${className}`}
      style={{ textDecoration: "none", ...style }}
      {...tagProps}
      {...rest}
    >
      {icon != null && (
        <span className={`ak-row__icon ak-row__icon--${iconTone}`}>
          {typeof icon === "string" ? <Icon name={icon} size={18} /> : icon}
        </span>
      )}
      <span className="ak-row__body">
        <span className="ak-row__title">{title}</span>
        {subtitle != null && <span className="ak-row__sub">{subtitle}</span>}
      </span>
      <span className="ak-row__meta">
        {meta}
        {unread && <span className="ak-row__unread" />}
        {chevron && <Icon name="chevron-right" size={18} style={{ color: "var(--text-muted)" }} />}
      </span>
    </Tag>
  );
}
