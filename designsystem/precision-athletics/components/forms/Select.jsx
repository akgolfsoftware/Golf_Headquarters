import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Select({ label, hint, options = [], id, className, ...rest }) {
  const iid = id || React.useId();
  return (
    <div className={cx("pa-field", className)}>
      {label && <label className="pa-field__label" htmlFor={iid}>{label}</label>}
      <div className="pa-control pa-select">
        <select id={iid} {...rest}>
          {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevron-down" size={16} />
      </div>
      {hint && <span className="pa-field__hint">{hint}</span>}
    </div>
  );
}
