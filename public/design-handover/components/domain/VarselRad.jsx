import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — VarselRad
 * Notification / alert row. Unread: subtle lime tint on background.
 * tone: neutral · info · success · warning · error.
 */

const TONE_ICON = {
  success: "circle-check",
  warning: "triangle-alert",
  error:   "circle-x",
  info:    "info",
  neutral: "bell",
};

const CSS = `
.ak-varselrad{
  display:flex;align-items:flex-start;gap:12px;
  padding:12px 14px;width:100%;text-align:left;
  background:transparent;border:none;cursor:pointer;
  border-bottom:1px solid var(--border);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-varselrad:hover{background:var(--surface-hover);}
.ak-varselrad--unread{background:color-mix(in srgb,var(--signal) 6%,transparent);}
.ak-varselrad--unread:hover{background:color-mix(in srgb,var(--signal) 10%,transparent);}
.ak-varselrad__icon{
  display:flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:10px;flex-shrink:0;margin-top:1px;
}
.ak-varselrad__icon--info{background:var(--info-bg);color:var(--info);}
.ak-varselrad__icon--success{background:var(--success-bg);color:var(--success);}
.ak-varselrad__icon--warning{background:var(--warning-bg);color:var(--warning);}
.ak-varselrad__icon--error{background:var(--error-bg);color:var(--error);}
.ak-varselrad__icon--neutral{background:var(--surface-2);color:var(--text-muted);}
.ak-varselrad__body{flex:1;min-width:0;}
.ak-varselrad__title{font-size:var(--text-14);font-weight:500;color:var(--text);}
.ak-varselrad__sub{font-size:var(--text-13);color:var(--text-muted);margin-top:2px;line-height:1.4;}
.ak-varselrad__foot{display:flex;align-items:center;gap:6px;margin-top:3px;}
.ak-varselrad__time{font-family:var(--font-mono);font-size:10px;color:var(--text-muted);}
.ak-varselrad__dot{width:7px;height:7px;border-radius:9999px;background:var(--signal);flex-shrink:0;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-varselrad-css")) {
  const s = document.createElement("style");
  s.id = "ak-varselrad-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function VarselRad({
  icon,
  tone = "neutral",
  title,
  body,
  time,
  unread = false,
  onClick,
  className = "",
  style,
}) {
  return (
    <button
      type="button"
      className={`ak-varselrad${unread ? " ak-varselrad--unread" : ""} ${className}`}
      style={style}
      onClick={onClick}
    >
      <span className={`ak-varselrad__icon ak-varselrad__icon--${tone}`}>
        <Icon name={icon || TONE_ICON[tone]} size={18} />
      </span>
      <span className="ak-varselrad__body">
        <div className="ak-varselrad__title">{title}</div>
        {body && <div className="ak-varselrad__sub">{body}</div>}
        <div className="ak-varselrad__foot">
          {time && <span className="ak-varselrad__time">{time}</span>}
          {unread && <span className="ak-varselrad__dot" />}
        </div>
      </span>
    </button>
  );
}
