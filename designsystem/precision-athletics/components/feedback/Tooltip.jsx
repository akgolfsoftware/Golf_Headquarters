import React from "react";
export function Tooltip({ label, placement = "top", open, children }) {
  return (
    <span className="pa-tip">
      {children}
      <span role="tooltip" className={"pa-tip__bubble" + (placement === "bottom" ? " pa-tip__bubble--bottom" : "") + (open ? " pa-tip__bubble--open" : "")}>{label}</span>
    </span>
  );
}
