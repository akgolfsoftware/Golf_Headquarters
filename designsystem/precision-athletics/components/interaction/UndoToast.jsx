import React from "react";
import { Toast } from "../feedback/Toast.jsx";
/** Etter flytt, slett, publiser, dupliser, legg til og avvis. Angre i 8 sekunder. */
export function UndoToast({ open, message, meta, onUndo, onClose, duration = 8000, inline }) {
  React.useEffect(() => { if (!open || !onClose) return; const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, [open, duration, onClose]);
  if (!open) return null;
  const pos = inline ? {} : { position: "fixed", left: "50%", transform: "translateX(-50%)", zIndex: 60, width: "min(420px, calc(100% - 32px))" };
  return <div className={inline ? undefined : "pa-undo"} style={pos}><Toast meta={meta} action={onUndo ? "Angre" : undefined} onAction={onUndo}>{message}</Toast></div>;
}
