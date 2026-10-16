import React from "react";
import { IconButton } from "../core/IconButton.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Sheet({ open, onClose, kicker, title, children, footer, mode = "auto", inline, label, className }) {
  React.useEffect(() => { if (!open || mode === "docked" || !onClose) return; const h = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [open, mode, onClose]);
  if (!open) return null;
  const body = <>
    <header className="pa-sheet__head">
      {mode !== "docked" && <span className="pa-sheet__grip" aria-hidden="true"></span>}
      <div className="pa-sheet__titles">{kicker && <div className="kicker">{kicker}</div>}{title && <div className="pa-sheet__title">{title}</div>}</div>
      {onClose && <IconButton icon="x" label="Lukk" onClick={onClose} />}
    </header>
    <div className="pa-sheet__body">{children}</div>
    {footer && <div className="pa-sheet__foot">{footer}</div>}
  </>;
  if (mode === "docked") return <aside className={cx("pa-sheet", "pa-sheet--docked", className)} aria-label={label || title}>{body}</aside>;
  return (
    <div className={cx("pa-sheet-layer", inline && "pa-sheet-layer--inline")}>
      <div className="pa-sheet-scrim" onClick={onClose}></div>
      <div role="dialog" aria-modal="true" aria-label={label || title} className={cx("pa-sheet", "pa-sheet--" + mode, className)}>{body}</div>
    </div>
  );
}
