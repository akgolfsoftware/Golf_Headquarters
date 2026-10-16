import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Checkbox({ label, disabled, className, ...rest }) {
  return (
    <label className={cx("pa-check", disabled && "pa-check--disabled", className)}>
      <input type="checkbox" disabled={disabled} {...rest} />
      <span className="pa-check__box"><Icon name="check" size={14} /></span>
      {label}
    </label>
  );
}
