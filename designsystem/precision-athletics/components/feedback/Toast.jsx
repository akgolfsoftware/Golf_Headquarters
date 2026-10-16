import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Toast({ children, meta, action, onAction, tone, className }) {
  return (
    <div role="status" className={cx("pa-toast", tone === "signal" && "pa-toast--signal", className)}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span>{children}</span>
        {meta && <span className="pa-toast__meta">{meta}</span>}
      </div>
      {action && <button type="button" className="pa-toast__action" onClick={onAction}>{action}</button>}
    </div>
  );
}
