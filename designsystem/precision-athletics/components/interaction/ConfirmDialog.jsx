import React from "react";
import { Dialog } from "../feedback/Dialog.jsx";
import { Button } from "../core/Button.jsx";
/** Bekreftelse før destruktive handlinger, publisering og bortnavigering med ulagrede endringer. */
export function ConfirmDialog({ open, kind = "destructive", title, children, consequences, confirmLabel, cancelLabel, onConfirm, onCancel, onSecondary, secondaryLabel, busy }) {
  if (!open) return null;
  const unsaved = kind === "unsaved";
  const conf = confirmLabel || (unsaved ? "Lagre og gå videre" : kind === "publish" ? "Publiser" : "Slett");
  return <Dialog open title={title || (unsaved ? "Du har ulagrede endringer" : "Er du sikker?")} onClose={onCancel} footer={<>
    <Button variant="ghost" onClick={onCancel}>{cancelLabel || (unsaved ? "Fortsett å redigere" : "Avbryt")}</Button>
    {(unsaved || onSecondary) && <Button variant="secondary" onClick={onSecondary}>{secondaryLabel || "Forkast endringer"}</Button>}
    <Button variant={kind === "destructive" ? "signal" : "primary"} loading={busy} loadingText={kind === "publish" ? "Publiserer …" : "Lagrer …"} onClick={onConfirm}>{conf}</Button>
  </>}>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {children && <div style={{ font: "var(--type-body)", color: "var(--text-primary)", textWrap: "pretty" }}>{children}</div>}
      {consequences && consequences.length > 0 && <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{consequences.map((c) => <li key={c}>{c}</li>)}</ul>}
    </div>
  </Dialog>;
}
