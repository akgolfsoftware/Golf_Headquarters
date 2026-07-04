import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — EmptyState
 * Honest empty states — plain, not jokey or over-illustrated.
 * icon: Lucide name string or ReactNode. actions: ReactNode (buttons).
 * Use compact=true for inline/sidebar contexts.
 */

const CSS = `
.ak-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;padding:48px 24px;gap:10px;
}
.ak-empty--compact{padding:24px 16px;gap:8px;}
.ak-empty__icon{
  display:flex;align-items:center;justify-content:center;
  width:48px;height:48px;border-radius:14px;
  background:var(--surface-2);color:var(--text-muted);margin-bottom:2px;
}
.ak-empty--compact .ak-empty__icon{width:36px;height:36px;border-radius:10px;}
.ak-empty__title{
  font-family:var(--font-display);font-size:var(--text-16);
  font-weight:var(--weight-semibold);color:var(--text);
  letter-spacing:var(--tracking-display);
}
.ak-empty--compact .ak-empty__title{font-size:var(--text-14);}
.ak-empty__sub{
  font-size:var(--text-14);color:var(--text-muted);
  line-height:var(--leading-body);max-width:280px;
}
.ak-empty--compact .ak-empty__sub{font-size:var(--text-13);}
.ak-empty__actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:4px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-empty-css")) {
  const s = document.createElement("style");
  s.id = "ak-empty-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function EmptyState({ icon, title, description, actions, compact = false, className = "", style }) {
  return (
    <div
      className={`ak-empty${compact ? " ak-empty--compact" : ""} ${className}`}
      style={style}
    >
      {icon && (
        <div className="ak-empty__icon">
          {typeof icon === "string" ? <Icon name={icon} size={compact ? 18 : 24} /> : icon}
        </div>
      )}
      {title && <div className="ak-empty__title">{title}</div>}
      {description && <div className="ak-empty__sub">{description}</div>}
      {actions && <div className="ak-empty__actions">{actions}</div>}
    </div>
  );
}
