import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function StatusPill({ tone = "neutral", dot = true, children, className }) {
  return <span className={cx("pa-status", tone !== "neutral" && "pa-status--" + tone, className)}>{dot && <span className="pa-status__dot" />}{children}</span>;
}
