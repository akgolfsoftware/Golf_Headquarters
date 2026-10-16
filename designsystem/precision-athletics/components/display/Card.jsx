import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Card({ kicker, title, action, footer, tone, padded, interactive, children, className, ...rest }) {
  const hasHead = kicker || title || action;
  return (
    <div className={cx("pa-card", tone === "sunken" && "pa-card--sunken", interactive && "pa-card--interactive", padded && !hasHead && "pa-card--pad", className)} {...rest}>
      {hasHead && (
        <div className="pa-card__head">
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            {kicker && <span className="kicker">{kicker}</span>}
            {title && <div className="pa-card__title">{title}</div>}
          </div>
          {action}
        </div>
      )}
      {hasHead || !padded ? (children != null && <div className="pa-card__body">{children}</div>) : children}
      {footer && <div className="pa-card__foot">{footer}</div>}
    </div>
  );
}
