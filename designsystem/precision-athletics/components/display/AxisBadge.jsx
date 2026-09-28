import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export const AXES = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
export function AxisBadge({ axis = "fys", children, size = "md", dot = true, className }) {
  return (
    <span className={cx("pa-badge", "pa-badge--" + axis, size === "lg" && "pa-badge--lg", className)}>
      {dot && <span className="pa-badge__dot" />}
      {children ?? AXES[axis]}
    </span>
  );
}
