import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Radio({ label, disabled, className, ...rest }) {
  return (
    <label className={cx("pa-check pa-check--radio", disabled && "pa-check--disabled", className)}>
      <input type="radio" disabled={disabled} {...rest} />
      <span className="pa-check__box" />
      {label}
    </label>
  );
}
