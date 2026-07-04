import React from "react";
import { Icon } from "../core/Icon.jsx";
import { useDialogA11y } from "./dialogA11y.js";

/**
 * AK Golf HQ — Drawer
 * Side drawer. Slides in from the right (default) or left.
 * Used for coach-detail panels, filter trays, or expanded record views in AgencyOS.
 * Width: min(480px, 92vw).
 */

const CSS = `
.ak-drawer-ov{
  position:fixed;inset:0;z-index:200;background:var(--overlay);
  animation:ak-modal-fadein var(--dur-base) var(--ease-out);
}
.ak-drawer{
  position:fixed;top:0;right:0;bottom:0;z-index:201;
  width:min(480px,92vw);
  background:var(--surface-2);border-left:1px solid var(--border);
  box-shadow:var(--shadow-sheet);
  display:flex;flex-direction:column;overflow:hidden;
  animation:ak-drawer-in var(--dur-base) var(--ease-out);
}
.ak-drawer--left{right:auto;left:0;border-left:none;border-right:1px solid var(--border);
  animation:ak-drawer-in-l var(--dur-base) var(--ease-out);}
.ak-drawer__head{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 20px 16px;gap:12px;flex-shrink:0;
  border-bottom:1px solid var(--border);
}
.ak-drawer__title{
  font-family:var(--font-display);font-size:var(--text-18);
  font-weight:var(--weight-semibold);color:var(--text);
  letter-spacing:var(--tracking-display);
}
.ak-drawer__close{
  display:flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:var(--radius-input);
  background:transparent;border:none;cursor:pointer;color:var(--text-muted);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-drawer__close:hover{background:var(--surface-hover);color:var(--text);}
.ak-drawer__close:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-drawer__body{flex:1;overflow-y:auto;padding:20px;overscroll-behavior:contain;}
.ak-drawer:focus{outline:none;}
.ak-drawer__foot{padding:16px 20px;border-top:1px solid var(--border);flex-shrink:0;}
@keyframes ak-drawer-in{from{transform:translateX(100%)}to{transform:none}}
@keyframes ak-drawer-in-l{from{transform:translateX(-100%)}to{transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-drawer-css")) {
  const s = document.createElement("style");
  s.id = "ak-drawer-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Drawer({ open = false, title, side = "right", onClose, children, footer, className = "", style }) {
  const panelRef = React.useRef(null);
  useDialogA11y(open, onClose, panelRef);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const content = (
    <React.Fragment>
      <div className="ak-drawer-ov" onMouseDown={() => onClose && onClose()} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`ak-drawer${side === "left" ? " ak-drawer--left" : ""} ${className}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {(title || onClose) && (
          <div className="ak-drawer__head">
            {title && <div className="ak-drawer__title">{title}</div>}
            {onClose && (
              <button type="button" className="ak-drawer__close" onClick={onClose} aria-label="Lukk">
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
        )}
        <div className="ak-drawer__body">{children}</div>
        {footer && <div className="ak-drawer__foot">{footer}</div>}
      </div>
    </React.Fragment>
  );

  if (typeof document !== "undefined" && document.body && typeof ReactDOM !== "undefined") {
    return ReactDOM.createPortal(content, document.body);
  }
  return content;
}
