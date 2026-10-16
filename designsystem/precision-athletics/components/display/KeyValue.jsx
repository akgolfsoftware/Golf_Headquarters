import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

const isEmpty = (v) => v === null || v === undefined || v === "";
export function KeyValue({ items = [], columns = 1, mono = true, className }) {
  const norm = items.map((it) => Array.isArray(it) ? { label: it[0], value: it[1], ...(it[2] || {}) } : it);
  return (
    <dl className={cx("pa-kv", columns > 1 && "pa-kv--grid", className)} style={columns > 1 ? { "--kv-cols": columns } : null}>
      {norm.map((it, i) => <div key={i} className="pa-kv__row">
        <dt className="pa-kv__k">{it.label}</dt>
        <dd className={cx("pa-kv__v", (it.mono ?? mono) && "is-mono")}>{isEmpty(it.value) ? "—" : it.value}{it.hint && <span className="pa-kv__hint">{it.hint}</span>}</dd>
      </div>)}
    </dl>
  );
}
