import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — ListRow
 * The inbox / queue / task row: a leading status icon, title + subtext, and
 * right-aligned meta (a counter, a time, or a chevron). Used for notifications,
 * approval queues and task lists.
 */

const CSS = `
.ak-row{display:flex;align-items:center;gap:14px;width:100%;text-align:left;
  padding:12px 14px;background:transparent;border:none;border-radius:var(--radius-input);
  color:var(--text);cursor:default;transition:background var(--dur-fast) var(--ease-standard);}
.ak-row--interactive{cursor:pointer;}
.ak-row--interactive:hover{background:var(--surface-hover);}
.ak-row__icon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;
  border-radius:10px;flex:none;background:var(--surface-2);color:var(--text-2);}
.ak-row__icon--signal{background:color-mix(in srgb,var(--signal) 16%,transparent);color:var(--signal);}
.ak-row__icon--up{background:color-mix(in srgb,var(--up) 16%,transparent);color:var(--up);}
.ak-row__icon--down{background:color-mix(in srgb,var(--down) 16%,transparent);color:var(--down);}
.ak-row__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.ak-row__title{font-size:var(--text-14);font-weight:500;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ak-row__sub{font-size:var(--text-12);color:var(--text-muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ak-row__meta{flex:none;display:flex;align-items:center;gap:8px;color:var(--text-muted);
  font-family:var(--font-mono);font-size:var(--text-12);font-variant-numeric:tabular-nums;}
.ak-row__unread{width:7px;height:7px;border-radius:9999px;background:var(--signal);flex:none;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-row-css")) {
  const el = document.createElement("style");
  el.id = "ak-row-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

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
}) {
  const interactive = !!(onClick || href);
  const Tag = as || (href ? "a" : onClick ? "button" : "div");
  const tagProps = href ? { href } : Tag === "button" ? { type: "button", onClick } : { onClick };
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
