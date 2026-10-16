import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function DataRow({ leading, title, sub, value, trailing, selected, onClick, className }) {
  return (
    <div className={cx("pa-row", onClick && "pa-row--interactive", selected && "pa-row--selected", className)} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      {leading}
      <div className="pa-row__main">
        <span className="pa-row__title">{title}</span>
        {sub && <span className="pa-row__sub">{sub}</span>}
      </div>
      {value != null && <span className="pa-row__value">{value}</span>}
      {trailing}
    </div>
  );
}
