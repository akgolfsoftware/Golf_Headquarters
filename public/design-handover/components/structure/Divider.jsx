import React from "react";

/**
 * AK Golf HQ — Divider
 * Hairline separator. Optional centred label (mono-caps eyebrow style).
 * vertical=true renders a 1px vertical bar (use inside a flex row).
 */

const CSS = `
.ak-div{display:flex;align-items:center;gap:12px;width:100%;}
.ak-div__line{flex:1;height:1px;background:var(--border);}
.ak-div__lbl{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;
  color:var(--text-muted);flex-shrink:0;white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-div-css")) {
  const s = document.createElement("style");
  s.id = "ak-div-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Divider({ label, vertical = false, style, className = "" }) {
  if (vertical) {
    return (
      <div
        className={className}
        style={{ width: 1, alignSelf: "stretch", background: "var(--border)", flexShrink: 0, ...style }}
        aria-hidden="true"
      />
    );
  }
  if (!label) {
    return (
      <div
        className={className}
        style={{ width: "100%", height: 1, background: "var(--border)", ...style }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className={`ak-div ${className}`} style={style} aria-hidden="true">
      <div className="ak-div__line" />
      <span className="ak-div__lbl">{label}</span>
      <div className="ak-div__line" />
    </div>
  );
}
