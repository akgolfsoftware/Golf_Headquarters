import type React from "react";
import { Eyebrow } from "./Eyebrow";

/**
 * AK Golf HQ — Card
 * The hairline base card: surface just lighter than bg + 1px border, radius 16,
 * no shadow. Optional header (eyebrow + title + action), body, footer.
 * `compact` tightens padding for dense data; `interactive` adds a hover lift.
 * CSS: ./golfdata.css (.ak-card).
 */

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  /** Mono-caps eyebrow rendered in the header. */
  eyebrow?: React.ReactNode;
  /** Card title rendered in the header. */
  title?: React.ReactNode;
  /** Right-aligned header action (e.g. a Button or "Se alle →"). */
  action?: React.ReactNode;
  /** Footer content, divided by a hairline. */
  footer?: React.ReactNode;
  /** Tighter padding + smaller title for dense data. */
  compact?: boolean;
  /** Hover lift for clickable cards. */
  interactive?: boolean;
  /** Extra style applied to the body wrapper. */
  bodyStyle?: React.CSSProperties;
  as?: React.ElementType;
};

export function Card({
  children,
  eyebrow,
  title,
  action,
  footer,
  compact = false,
  interactive = false,
  className = "",
  style,
  as: Tag = "div",
  bodyStyle,
  ...rest
}: CardProps) {
  const pad = compact ? "var(--space-4)" : "var(--space-5)";
  const hasHead = eyebrow != null || title != null || action != null;
  const titleSize = compact ? "var(--text-16)" : "var(--text-18)";
  return (
    <Tag
      className={`ak-card ${interactive ? "ak-card--interactive" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {hasHead && (
        <div className="ak-card__head" style={{ padding: pad, paddingBottom: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            {eyebrow != null && <Eyebrow>{eyebrow}</Eyebrow>}
            {title != null && (
              <h3 className="ak-card__title" style={{ fontSize: titleSize }}>
                {title}
              </h3>
            )}
          </div>
          {action != null && <div className="ak-card__action">{action}</div>}
        </div>
      )}
      <div
        style={{
          padding: pad,
          paddingTop: hasHead ? "var(--space-4)" : pad,
          ...bodyStyle,
        }}
      >
        {children}
      </div>
      {footer != null && (
        <div className="ak-card__foot" style={{ padding: `var(--space-3) ${pad}` }}>
          {footer}
        </div>
      )}
    </Tag>
  );
}
