import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Tag } from "../core/Tag.jsx";
import { Button } from "../core/Button.jsx";

/**
 * AK Golf HQ — BookingKort
 * Booking card for SlotPicker and booking confirmation views.
 * States: available · pending · confirmed · cancelled.
 */

const STATE_MAP = {
  available:  { variant: "signal",  label: "Tilgjengelig" },
  pending:    { variant: "neutral", label: "Venter"       },
  confirmed:  { variant: "up",      label: "Bekreftet"    },
  cancelled:  { variant: "down",    label: "Avlyst"       },
};

const CSS = `
.ak-bookingkort{
  display:flex;flex-direction:column;gap:14px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:16px;
}
.ak-bookingkort__top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.ak-bookingkort__title{
  font-family:var(--font-display);font-size:var(--text-16);font-weight:600;
  color:var(--text);letter-spacing:var(--tracking-display);
}
.ak-bookingkort__details{display:flex;flex-direction:column;gap:6px;}
.ak-bookingkort__row{
  display:flex;align-items:center;gap:6px;
  font-size:var(--text-13);color:var(--text-muted);
}
.ak-bookingkort__foot{
  display:flex;gap:8px;flex-wrap:wrap;
  border-top:1px solid var(--border);padding-top:14px;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-bookingkort-css")) {
  const s = document.createElement("style");
  s.id = "ak-bookingkort-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function BookingKort({
  type,
  date,
  time,
  duration,
  location,
  coach,
  state = "pending",
  onBook,
  onCancel,
  className = "",
  style,
}) {
  const s_ = STATE_MAP[state] || STATE_MAP.pending;
  return (
    <div className={`ak-bookingkort ${className}`} style={style}>
      <div className="ak-bookingkort__top">
        <div className="ak-bookingkort__title">{type}</div>
        <Tag variant={s_.variant} size="sm">{s_.label}</Tag>
      </div>
      <div className="ak-bookingkort__details">
        {date && (
          <span className="ak-bookingkort__row">
            <Icon name="calendar" size={14} />{date}
          </span>
        )}
        {time && (
          <span className="ak-bookingkort__row">
            <Icon name="clock" size={14} />
            {time}{duration ? ` · ${duration}` : ""}
          </span>
        )}
        {location && (
          <span className="ak-bookingkort__row">
            <Icon name="map-pin" size={14} />{location}
          </span>
        )}
        {coach && (
          <span className="ak-bookingkort__row">
            <Icon name="user" size={14} />{coach}
          </span>
        )}
      </div>
      {(onBook || onCancel) && (
        <div className="ak-bookingkort__foot">
          {onBook && <Button variant="signal" size="sm" onClick={onBook}>Book</Button>}
          {onCancel && <Button variant="secondary" size="sm" onClick={onCancel}>Avbestill</Button>}
        </div>
      )}
    </div>
  );
}
