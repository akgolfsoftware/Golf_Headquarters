import React from "react";

/**
 * AK Golf HQ — Popover
 * Floating panel anchored to a trigger. Closes on outside click.
 * Sides: bottom-start (default), bottom-end, bottom, top, top-start, top-end.
 * Can be controlled (open + onOpenChange) or uncontrolled.
 */

const CSS = `
.ak-pop-anchor{position:relative;display:inline-flex;}
.ak-pop{
  position:absolute;z-index:250;
  background:var(--surface-2);
  border:1px solid var(--border-strong);
  border-radius:var(--radius-card);
  box-shadow:var(--shadow-popover);
  min-width:200px;max-width:320px;
  overflow:hidden;
  animation:ak-modal-fadein var(--dur-fast) var(--ease-out);
}
.ak-pop--bottom{top:calc(100% + 6px);left:50%;transform:translateX(-50%);}
.ak-pop--bottom-start{top:calc(100% + 6px);left:0;}
.ak-pop--bottom-end{top:calc(100% + 6px);right:0;}
.ak-pop--top{bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);}
.ak-pop--top-start{bottom:calc(100% + 6px);left:0;}
.ak-pop--top-end{bottom:calc(100% + 6px);right:0;}
.ak-pop__inner{padding:12px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-pop-css")) {
  const s = document.createElement("style");
  s.id = "ak-pop-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Popover({
  trigger,
  children,
  side = "bottom-start",
  open: controlledOpen,
  onOpenChange,
  className = "",
  style,
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <div className="ak-pop-anchor" ref={ref} style={style}>
      <span onClick={() => setOpen(!isOpen)} aria-expanded={isOpen} aria-haspopup="dialog" style={{ display: "inline-flex" }}>{trigger}</span>
      {isOpen && (
        <div className={`ak-pop ak-pop--${side} ${className}`}>
          <div className="ak-pop__inner">{children}</div>
        </div>
      )}
    </div>
  );
}
