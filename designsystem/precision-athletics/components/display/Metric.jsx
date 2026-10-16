import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Metric({ label, value, unit, delta, deltaDir, meta, size = "md", className }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className={cx("pa-metric", size !== "md" && "pa-metric--" + size, className)}>
      {label && <span className="pa-metric__label">{label}</span>}
      <div className="pa-metric__row">
        <span className="pa-metric__value">{empty ? "—" : value}</span>
        {!empty && unit && <span className="pa-metric__unit">{unit}</span>}
        {!empty && delta && <span className={cx("pa-metric__delta", deltaDir && "pa-metric__delta--" + deltaDir)} style={{ marginLeft: 8 }}>{delta}</span>}
      </div>
      {meta && <span className="pa-metric__meta">{meta}</span>}
    </div>
  );
}
