import React from "react";
import { useOverlayLayer } from "./overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-scrim{position:fixed;inset:0;background:var(--scrim);display:flex;align-items:center;justify-content:center;padding:var(--s5);z-index:var(--z-toast);box-sizing:border-box}
.akhq-modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);padding:var(--s5);width:min(420px,100%);display:flex;flex-direction:column;gap:var(--s4);font-family:var(--ui);color:var(--fg);box-sizing:border-box}
.akhq-modal-title{font-size:16px;font-weight:500;font-family:var(--disp);margin:0}
.akhq-modal-body{font-size:13px;color:var(--muted);line-height:1.5}
.akhq-modal-actions{display:flex;justify-content:flex-end;gap:var(--s2)}}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-modal")) { const s = document.createElement("style"); s.id = "akhq-css-modal"; s.textContent = css; document.head.appendChild(s); }
export function Modal({ open = true, title, children, actions, onClose, triggerRef, dataOdId = "panel-modal", ...rest }) {
  const layerRef = React.useRef(null);
  const titleId = React.useMemo(() => "akhq-modal-t" + Math.random().toString(36).slice(2, 8), []);
  /* Fokuskontrakten fra readme, som delt kode. modal: true gir inert +
     aria-hidden på alt utenfor laget og scroll-lås — en fokusfelle alene
     stopper Tab, men ikke skjermleserens virtuelle markør. */
  useOverlayLayer({ open, onClose, layerRef, triggerRef, modal: true });
  if (!open) return null;
  return (
    <div className="akhq-scrim">
      <div className="akhq-modal" ref={layerRef} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : "Dialog"} data-od-id={dataOdId} {...rest}>
        {title && <h2 className="akhq-modal-title" id={titleId}>{title}</h2>}
        <div className="akhq-modal-body">{children}</div>
        {actions && <div className="akhq-modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
