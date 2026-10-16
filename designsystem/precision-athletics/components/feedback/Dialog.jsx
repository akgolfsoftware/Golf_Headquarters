import React from "react";
import { IconButton } from "../core/IconButton.jsx";
export function Dialog({ open = true, title, children, footer, onClose, inline, width }) {
  if (!open) return null;
  return (
    <div className={"pa-scrim" + (inline ? " pa-scrim--inline" : "")} onClick={onClose}>
      <div className="pa-dialog" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined} style={width ? { maxWidth: width } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="pa-dialog__head">
          <div className="pa-dialog__title">{title}</div>
          {onClose && <IconButton icon="x" label="Lukk" size="sm" onClick={onClose} />}
        </div>
        <div className="pa-dialog__body">{children}</div>
        {footer && <div className="pa-dialog__foot">{footer}</div>}
      </div>
    </div>
  );
}
