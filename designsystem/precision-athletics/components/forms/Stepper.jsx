import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Stepper({ label, value, onChange, step = 1, min = 0, max = Infinity, unit, format, size = "md", className }) {
  const set = (v) => onChange && onChange(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  return (
    <div className={cx("pa-stepper", size === "sm" && "pa-stepper--sm", size === "xl" && "pa-stepper--xl", className)}>
      {label && <span className="pa-field__label">{label}</span>}
      <div className="pa-stepper__row">
        <button type="button" className="pa-stepper__btn" aria-label={"Mindre " + (label || "")} onClick={() => set(value - step)} disabled={value <= min}>−</button>
        <span className="pa-stepper__val">{format ? format(value) : value}{unit && <span className="pa-stepper__unit"> {unit}</span>}</span>
        <button type="button" className="pa-stepper__btn" aria-label={"Mer " + (label || "")} onClick={() => set(value + step)} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}
