import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function SearchField({ value, onChange, placeholder = "Søk", label = "Søk", hideLabel = true, count, id, className, ...rest }) {
  const auto = React.useId(); const fid = id || auto;
  return (
    <div className={cx("pa-field", "pa-search", className)}>
      <label className={cx("pa-field__label", hideLabel && "pa-sr")} htmlFor={fid}>{label}</label>
      <div className="pa-control pa-search__control">
        <Icon name="search" size={18} />
        <input id={fid} type="search" value={value} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder} autoComplete="off" {...rest} />
        {count != null && value ? <span className="pa-search__count">{count} TREFF</span> : null}
        {value ? <button type="button" className="pa-search__clear" aria-label="Tøm søk" onClick={() => onChange && onChange("")}><Icon name="x" size={16} /></button> : null}
      </div>
    </div>
  );
}
