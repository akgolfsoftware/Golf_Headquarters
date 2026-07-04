import React from "react";
import { Icon } from "../core/Icon.jsx";
import { useDialogA11y } from "./dialogA11y.js";

/**
 * AK Golf HQ — Modal
 * Portal-based modal dialog. Overlay dims to --overlay; the panel is surface-2
 * with a real shadow (the only shadow in the system). Sizes: sm 380 / md 540 / lg 720.
 */

const CSS = `
.ak-modal-ov{
  position:fixed;inset:0;z-index:200;
  background:var(--overlay);
  display:flex;align-items:center;justify-content:center;padding:24px;
  animation:ak-modal-fadein var(--dur-base) var(--ease-out);
}
.ak-modal{
  position:relative;background:var(--surface-2);
  border:1px solid var(--border-strong);border-radius:var(--radius-panel);
  box-shadow:var(--shadow-sheet);
  width:100%;max-height:calc(100dvh - 48px);
  display:flex;flex-direction:column;overflow:hidden;
  animation:ak-modal-slidein var(--dur-base) var(--ease-out);
}
.ak-modal--sm{max-width:380px;}
.ak-modal--md{max-width:540px;}
.ak-modal--lg{max-width:720px;}
.ak-modal__head{
  display:flex;align-items:flex-start;justify-content:space-between;
  padding:24px 24px 0;gap:12px;flex-shrink:0;
}
.ak-modal__title{
  font-family:var(--font-display);font-size:var(--text-18);
  font-weight:var(--weight-semibold);color:var(--text);
  letter-spacing:var(--tracking-display);line-height:var(--leading-snug);
}
.ak-modal__close{
  display:flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:var(--radius-input);
  background:transparent;border:none;cursor:pointer;
  color:var(--text-muted);flex-shrink:0;margin:-4px -4px 0 0;
  transition:background var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);
}
.ak-modal__close:hover{background:var(--surface-hover);color:var(--text);}
.ak-modal__close:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-modal__sub{padding:6px 24px 0;color:var(--text-2);font-size:var(--text-14);line-height:var(--leading-body);}
.ak-modal__body{flex:1;overflow-y:auto;padding:20px 24px;overscroll-behavior:contain;}
.ak-modal:focus{outline:none;}
.ak-modal__foot{
  padding:16px 24px;display:flex;gap:10px;justify-content:flex-end;
  border-top:1px solid var(--border);flex-shrink:0;
}
@keyframes ak-modal-fadein{from{opacity:0}to{opacity:1}}
@keyframes ak-modal-slidein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-modal-css")) {
  const s = document.createElement("style");
  s.id = "ak-modal-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Modal({
  open = false,
  title,
  subtitle,
  size = "md",
  onClose,
  children,
  footer,
  className = "",
  style,
}) {
  const panelRef = React.useRef(null);
  useDialogA11y(open, onClose, panelRef);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  const content = (
    <div className="ak-modal-ov" onMouseDown={handleOverlay}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "ak-modal-title" : undefined}
        className={`ak-modal ak-modal--${size} ${className}`}
        style={style}
      >
        {(title || onClose) && (
          <div className="ak-modal__head">
            {title && <div id="ak-modal-title" className="ak-modal__title">{title}</div>}
            {onClose && (
              <button type="button" className="ak-modal__close" onClick={onClose} aria-label="Lukk">
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
        )}
        {subtitle && <div className="ak-modal__sub">{subtitle}</div>}
        <div className="ak-modal__body">{children}</div>
        {footer && <div className="ak-modal__foot">{footer}</div>}
      </div>
    </div>
  );

  if (typeof document !== "undefined" && document.body && typeof ReactDOM !== "undefined") {
    return ReactDOM.createPortal(content, document.body);
  }
  return content;
}
