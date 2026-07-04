import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Banner
 * Full-width notice bar — success / warning / error / info / neutral.
 * Used for page-level alerts, plan-expiry warnings, or BankID status.
 * Dismissible via onClose; optional action link.
 */

const CSS = `
.ak-banner{
  display:flex;align-items:center;gap:12px;
  padding:12px 16px;
  font-size:var(--text-14);
  border-bottom:1px solid var(--border);
}
.ak-banner--success{background:var(--success-bg);border-color:var(--success-border);}
.ak-banner--warning{background:var(--warning-bg);border-color:var(--warning-border);}
.ak-banner--error{background:var(--error-bg);border-color:var(--error-border);}
.ak-banner--info{background:var(--info-bg);border-color:var(--info-border);}
.ak-banner--neutral{background:var(--surface-2);}
.ak-banner__ic{flex-shrink:0;display:flex;}
.ak-banner--success .ak-banner__ic{color:var(--success);}
.ak-banner--warning .ak-banner__ic{color:var(--warning);}
.ak-banner--error .ak-banner__ic{color:var(--error);}
.ak-banner--info .ak-banner__ic{color:var(--info);}
.ak-banner--neutral .ak-banner__ic{color:var(--text-muted);}
.ak-banner__body{flex:1;min-width:0;display:flex;gap:6px;align-items:baseline;flex-wrap:wrap;}
.ak-banner__title{font-weight:500;color:var(--text);}
.ak-banner__sub{color:var(--text-2);font-size:var(--text-13);}
.ak-banner__action{
  flex-shrink:0;font-weight:600;cursor:pointer;white-space:nowrap;
  background:transparent;border:none;padding:0;font-size:var(--text-13);
  color:var(--text);text-decoration:underline;text-underline-offset:2px;
}
.ak-banner__close{
  flex-shrink:0;display:flex;align-items:center;justify-content:center;
  width:24px;height:24px;border-radius:6px;background:transparent;border:none;
  cursor:pointer;color:var(--text-muted);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-banner__close:hover{background:var(--surface-hover);color:var(--text);}
.ak-banner__close:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-banner__action:focus-visible{outline:none;box-shadow:var(--glow-signal);border-radius:4px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-banner-css")) {
  const s = document.createElement("style");
  s.id = "ak-banner-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const ICONS = {
  success: "circle-check",
  warning: "triangle-alert",
  error: "circle-x",
  info: "info",
  neutral: "megaphone",
};

export function Banner({ tone = "neutral", title, description, action, onAction, onClose, className = "", style }) {
  return (
    <div
      className={`ak-banner ak-banner--${tone} ${className}`}
      style={style}
      role="alert"
    >
      <span className="ak-banner__ic"><Icon name={ICONS[tone]} size={18} /></span>
      <span className="ak-banner__body">
        {title && <span className="ak-banner__title">{title}</span>}
        {description && <span className="ak-banner__sub">{description}</span>}
      </span>
      {action && (
        <button type="button" className="ak-banner__action" onClick={onAction}>{action}</button>
      )}
      {onClose && (
        <button type="button" className="ak-banner__close" onClick={onClose} aria-label="Lukk">
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );
}
