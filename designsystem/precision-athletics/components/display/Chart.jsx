import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

const pct = (v, min, max) => Math.max(0, Math.min(100, ((v - min) / (max - min || 1)) * 100));
const fmt = (v) => typeof v === "number" ? String(v).replace("-", "−").replace(".", ",") : v;

export function Sparkline({ values = [], min, max, goal, axis, height = 32, label, className }) {
  const nums = values.filter((v) => v != null);
  if (nums.length < 2) return <span className={cx("pa-spark", "pa-spark--empty", className)} style={{ height }}>—</span>;
  const lo = min ?? Math.min(...nums, goal ?? Infinity), hi = max ?? Math.max(...nums, goal ?? -Infinity);
  const pts = values.map((v, i) => v == null ? null : [(i / (values.length - 1)) * 100, 100 - pct(v, lo, hi)]).filter(Boolean);
  return (
    <span className={cx("pa-spark", axis && "pa-spark--" + axis, className)} style={{ height }} role="img" aria-label={label || "Utvikling: " + values.map(fmt).join(", ")}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {goal != null && <line className="pa-spark__goal" x1="0" x2="100" y1={100 - pct(goal, lo, hi)} y2={100 - pct(goal, lo, hi)} vectorEffect="non-scaling-stroke" />}
        <polyline className="pa-spark__line" points={pts.map((p) => p.join(",")).join(" ")} vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

export function GoalLine({ at, label, min = 0, max = 100 }) {
  return <span className="pa-goal" style={{ left: pct(at, min, max) + "%" }} aria-hidden={label ? undefined : "true"}>{label && <span className="pa-goal__label">{label}</span>}</span>;
}

export function BarRow({ label, value, max = 100, min = 0, goal, goalLabel, axis, display, unit, meta, className }) {
  const empty = value == null;
  return (
    <div className={cx("pa-barrow", className)}>
      <div className="pa-barrow__head"><span className="pa-barrow__label">{label}</span><span className="pa-barrow__value">{empty ? "—" : (display ?? fmt(value))}{!empty && unit && <span className="pa-barrow__unit"> {unit}</span>}</span></div>
      <div className="pa-barrow__track">
        {!empty && <span className={cx("pa-barrow__fill", axis && "pa-barrow__fill--" + axis)} style={{ width: pct(value, min, max) + "%" }}></span>}
        {goal != null && <GoalLine at={goal} min={min} max={max} />}
      </div>
      {(meta || goalLabel) && <div className="pa-barrow__meta">{meta}{meta && goalLabel ? " · " : ""}{goalLabel}</div>}
    </div>
  );
}

export function ChartAxis({ min = 0, max = 100, ticks = 5, unit, format }) {
  const vals = Array.from({ length: ticks }, (_, i) => min + ((max - min) * i) / (ticks - 1));
  const f = format || ((v) => fmt(Math.round(v * 10) / 10));
  return <div className="pa-axis" aria-hidden="true">{vals.map((v, i) => <span key={i} className="pa-axis__tick" style={{ left: (i / (ticks - 1)) * 100 + "%" }}>{f(v)}{i === ticks - 1 && unit ? " " + unit : ""}</span>)}</div>;
}

export function Chart({ kicker, title, children, axis, footer, className }) {
  return (
    <figure className={cx("pa-chart", className)}>
      {(kicker || title) && <figcaption className="pa-chart__cap">{kicker && <span className="kicker">{kicker}</span>}{title && <span className="pa-chart__title">{title}</span>}</figcaption>}
      <div className="pa-chart__body">{children}</div>
      {axis && <ChartAxis {...axis} />}
      {footer && <div className="pa-chart__foot">{footer}</div>}
    </figure>
  );
}
