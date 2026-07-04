import React from "react";
import { Icon } from "../core/Icon.jsx";
import { useDialogA11y } from "./dialogA11y.js";

/**
 * AK Golf HQ — Sheet
 * Bottom sheet — slides up from the bottom of the screen.
 * Primary overlay pattern for mobile (PlayerHQ) and secondary actions.
 * Max-height 92dvh; always a drag handle.
 */

const CSS = `
.ak-sheet-ov{
  position:fixed;inset:0;z-index:200;background:var(--overlay);
  animation:ak-modal-fadein var(--dur-base) var(--ease-out);
}
.ak-sheet{
  position:fixed;left:0;right:0;bottom:0;z-index:201;
  background:var(--surface-2);
  border-top:1px solid var(--border-strong);
  border-radius:var(--radius-sheet) var(--radius-sheet) 0 0;
  box-shadow:var(--shadow-sheet);
  max-height:92dvh;display:flex;flex-direction:column;overflow:hidden;
  animation:ak-sheet-up var(--dur-base) var(--ease-out);
  padding-bottom:env(safe-area-inset-bottom,0);
}
.ak-sheet__handle{
  display:flex;justify-content:center;padding:12px 0 4px;flex-shrink:0;
}
.ak-sheet__handle-bar{
  width:36px;height:4px;border-radius:2px;background:var(--border-strong);
}
.ak-sheet__head{
  display:flex;align-items:center;justify-content:space-between;
  padding:4px 20px 14px;gap:12px;flex-shrink:0;
}
.ak-sheet__title{
  font-family:var(--font-display);font-size:var(--text-18);
  font-weight:var(--weight-semibold);color:var(--text);
  letter-spacing:var(--tracking-display);
}
.ak-sheet__close{
  display:flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:var(--radius-input);
  background:transparent;border:none;cursor:pointer;color:var(--text-muted);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-sheet__close:hover{background:var(--surface-hover);color:var(--text);}
.ak-sheet__close:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-sheet__body{flex:1;overflow-y:auto;padding:0 20px 20px;overscroll-behavior:contain;}
.ak-sheet:focus{outline:none;}
.ak-sheet__foot{padding:16px 20px;border-top:1px solid var(--border);flex-shrink:0;}
@keyframes ak-sheet-up{from{transform:translateY(100%)}to{transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-sheet-css")) {
  const s = document.createElement("style");
  s.id = "ak-sheet-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Sheet({ open = false, title, onClose, children, footer, className = "", style }) {
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
      <div className="ak-sheet-ov" onMouseDown={() => onClose && onClose()} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`ak-sheet ${className}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ak-sheet__handle"><div className="ak-sheet__handle-bar" /></div>
        {(title || onClose) && (
          <div className="ak-sheet__head">
            {title && <div className="ak-sheet__title">{title}</div>}
            {onClose && (
              <button type="button" className="ak-sheet__close" onClick={onClose} aria-label="Lukk">
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
        )}
        <div className="ak-sheet__body">{children}</div>
        {footer && <div className="ak-sheet__foot">{footer}</div>}
      </div>
    </React.Fragment>
  );

  if (typeof document !== "undefined" && document.body && typeof ReactDOM !== "undefined") {
    return ReactDOM.createPortal(content, document.body);
  }
  return content;
}
