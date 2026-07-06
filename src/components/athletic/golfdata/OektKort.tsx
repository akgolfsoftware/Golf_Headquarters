import type React from "react";
import { Icon } from "./Icon";
import { Tag } from "./Tag";

/**
 * AK Golf HQ — OektKort
 * Session card. A 3px axis-coloured left bar + state tag + location/coach/time metadata.
 * Compliance shown as a coloured dot. Used in agenda, calendar, plan views.
 * Portet 1:1 fra public/design-handover/components/domain/OektKort.jsx.
 * CSS: ./golfdata.css (.ak-oektkort).
 */

export type OektAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type OektState = "live" | "done" | "planned" | "cancelled";

export type OektKortProps = {
  title: string;
  axis?: OektAxis;
  time?: string;
  duration?: string;
  location?: string;
  coach?: string;
  state?: OektState;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const AXIS_TOKEN: Record<OektAxis, string> = {
  FYS: "--axis-fys",
  TEK: "--axis-tek",
  SLAG: "--axis-slag",
  SPILL: "--axis-spill",
  TURN: "--axis-turn",
};

const STATE_TAG: Record<OektState, { variant: "live" | "neutral" | "outline" | "down"; label: string }> = {
  live: { variant: "live", label: "Live" },
  done: { variant: "neutral", label: "Fullført" },
  planned: { variant: "outline", label: "Planlagt" },
  cancelled: { variant: "down", label: "Avlyst" },
};

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
}: OektKortProps) {
  const barColor = axis ? `var(${AXIS_TOKEN[axis] || "--text-muted"})` : "var(--border)";
  const stateInfo = STATE_TAG[state] || STATE_TAG.planned;
  const El = (onClick ? "button" : "div") as React.ElementType;
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
