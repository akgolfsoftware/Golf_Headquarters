import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Badge({ count, max = 99, tone = "neutral", showZero, label, className }) {
  if (count == null || (count === 0 && !showZero)) return null;
  const txt = count > max ? max + "+" : String(count);
  return <span className={cx("pa-count", "pa-count--" + tone, className)} aria-label={label ? count + " " + label : undefined}>{txt}</span>;
}
