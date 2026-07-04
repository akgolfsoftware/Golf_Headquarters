import React from "react";

/**
 * AK Golf HQ — Tooltip
 * Wrap any child with <Tooltip label="…">. Appears after a 400ms delay on hover/focus.
 * Sides: top (default), bottom, left, right. Max-width 240px; wraps if needed.
 */

const CSS = `
.ak-tt-wrap{position:relative;display:inline-flex;}
.ak-tt{
  position:absolute;z-index:300;
  background:var(--graphite-100);
  border:1px solid var(--border-strong);
  border-radius:var(--radius-tag);
  box-shadow:var(--shadow-popover);
  padding:6px 10px;
  font-family:var(--font-ui);font-size:var(--text-12);
  color:var(--text-2);max-width:240px;
  pointer-events:none;
  animation:ak-modal-fadein var(--dur-fast) var(--ease-out);
  white-space:normal;line-height:1.4;
}
.ak-tt--top{bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);}
.ak-tt--bottom{top:calc(100% + 6px);left:50%;transform:translateX(-50%);}
.ak-tt--left{right:calc(100% + 6px);top:50%;transform:translateY(-50%);}
.ak-tt--right{left:calc(100% + 6px);top:50%;transform:translateY(-50%);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-tt-css")) {
  const s = document.createElement("style");
  s.id = "ak-tt-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Tooltip({ children, label, side = "top", delay = 400 }) {
  const [vis, setVis] = React.useState(false);
  const timer = React.useRef(null);
  if (!label) return children;
  const show = () => { timer.current = setTimeout(() => setVis(true), delay); };
  const hide = () => { clearTimeout(timer.current); setVis(false); };
  return (
    <span
      className="ak-tt-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {vis && <span className={`ak-tt ak-tt--${side}`} role="tooltip">{label}</span>}
    </span>
  );
}
