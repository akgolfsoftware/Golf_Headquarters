import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

const ICON = { neutral: "info", info: "info", ok: "circle-check", warn: "triangle-alert", signal: "circle-alert" };
export function InlineAlert({ tone = "neutral", title, children, action, className }) {
  return (
    <div role={tone === "signal" ? "alert" : "status"} className={cx("pa-alert", tone !== "neutral" && "pa-alert--" + tone, className)}>
      <Icon name={ICON[tone]} size={18} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {title && <span className="pa-alert__title">{title}</span>}
        {children && <span>{children}</span>}
      </div>
      {action}
    </div>
  );
}
