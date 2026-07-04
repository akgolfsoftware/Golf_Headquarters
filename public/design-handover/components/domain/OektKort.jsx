import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Tag } from "../core/Tag.jsx";

/**
 * AK Golf HQ — OektKort
 * Session card. A 3px axis-coloured left bar + state tag + location/coach/time metadata.
 * Compliance shown as a coloured dot. Used in agenda, calendar, plan views.
 */

const AXIS_TOKEN = {
  FYS:   "--axis-fys",
  TEK:   "--axis-tek",
  SLAG:  "--axis-slag",
  SPILL: "--axis-spill",
  TURN:  "--axis-turn",
};

const STATE_TAG = {
  live:      { variant: "live",    label: "Live"      },
  done:      { variant: "neutral", label: "Fullført"  },
  planned:   { variant: "outline", label: "Planlagt"  },
  cancelled: { variant: "down",    label: "Avlyst"    },
};

const CSS = `
.ak-oektkort{
  display:flex;align-items:flex-start;gap:0;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);overflow:hidden;
  width:100%;text-align:left;
  box-shadow:var(--sheen-top);
  transition:background var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
}
.ak-oektkort--interactive{cursor:pointer;}
.ak-oektkort--interactive:hover{background:var(--surface-hover);border-color:var(--border-strong);}
.ak-oektkort--interactive:active{transform:scale(.992);}
.ak-oektkort__bar{width:3px;flex-shrink:0;align-self:stretch;transition:background var(--dur-base) var(--ease-standard);}
.ak-oektkort__body{flex:1;min-width:0;padding:12px 14px;display:flex;flex-direction:column;gap:5px;}
.ak-oektkort__top{display:flex;align-items:center;gap:8px;justify-content:space-between;}
.ak-oektkort__title{
  font-size:var(--text-14);font-weight:500;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;
}
.ak-oektkort__tags{display:flex;gap:5px;flex-shrink:0;align-items:center;}
.ak-oektkort__meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ak-oektkort__detail{
  display:flex;align-items:center;gap:4px;
  font-size:var(--text-12);color:var(--text-muted);
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-oektkort-css")) {
  const s = document.createElement("style");
  s.id = "ak-oektkort-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function OektKort({
  title,
  axis,
  time,
  duration,
  location,
  coach,
  state = "planned",
  onClick,
  className = "",
  style,
}) {
  const barColor = axis ? `var(${AXIS_TOKEN[axis] || "--text-muted"})` : "var(--border)";
  const stateInfo = STATE_TAG[state] || STATE_TAG.planned;
  const El = onClick ? "button" : "div";
  const elProps = onClick ? { type: "button", onClick } : {};
  return (
    <El
      className={`ak-oektkort${onClick ? " ak-oektkort--interactive" : ""} ${className}`}
      style={style}
      {...elProps}
    >
      <div className="ak-oektkort__bar" style={{ background: barColor }} />
      <div className="ak-oektkort__body">
        <div className="ak-oektkort__top">
          <div className="ak-oektkort__title">{title}</div>
          <div className="ak-oektkort__tags">
            {axis && <Tag variant="outline" size="sm">{axis}</Tag>}
            <Tag variant={stateInfo.variant} size="sm">{stateInfo.label}</Tag>
          </div>
        </div>
        <div className="ak-oektkort__meta">
          {time && (
            <span className="ak-oektkort__detail">
              <Icon name="clock" size={13} />
              {time}{duration ? ` · ${duration}` : ""}
            </span>
          )}
          {location && (
            <span className="ak-oektkort__detail">
              <Icon name="map-pin" size={13} />
              {location}
            </span>
          )}
          {coach && (
            <span className="ak-oektkort__detail">
              <Icon name="user" size={13} />
              {coach}
            </span>
          )}
        </div>
      </div>
    </El>
  );
}
