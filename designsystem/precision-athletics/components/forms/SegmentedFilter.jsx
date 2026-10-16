import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function SegmentedFilter({ options = [], value, onChange, multi, label = "Filter", className }) {
  const on = (v) => multi ? (value || []).includes(v) : value === v;
  const pick = (v) => { if (!onChange) return; if (!multi) return onChange(v); const cur = value || []; onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]); };
  return (
    <div className={cx("pa-filter", className)} role="group" aria-label={label}>
      {options.map((o) => { const opt = typeof o === "string" ? { value: o, label: o } : o; return (
        <button key={opt.value} type="button" className="pa-filter__opt" aria-pressed={on(opt.value)} onClick={() => pick(opt.value)}>
          <span className="pa-filter__label">{opt.label}</span>{opt.count != null && <span className="pa-filter__count">{opt.count}</span>}
        </button>); })}
    </div>
  );
}
