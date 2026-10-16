import React from "react";
const STATUS = { saving: "LAGRER …", saved: "LAGRET", error: "KUNNE IKKE LAGRE · TALLENE ER BEHOLDT", dirty: "ULAGREDE ENDRINGER", conflict: "KONFLIKT · NOEN ANDRE HAR ENDRET" };
/** Primærhandling og sekundære handlinger. sticky=true legger den nederst på mobil. */
export function ActionBar({ primary, secondary, destructive, status, statusMeta, sticky = false, className }) {
  const s = status && status !== "idle" ? STATUS[status] + (statusMeta ? " · " + statusMeta : "") : null;
  const tone = status === "error" || status === "conflict" ? "var(--signal-ink)" : "var(--text-muted)";
  return <div role="group" aria-label="Handlinger" className={[sticky && "pa-actionbar--sticky", className].filter(Boolean).join(" ") || undefined} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minWidth: 0, ...(sticky ? { position: "sticky", bottom: 0, zIndex: 6, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", margin: "0 -16px" } : null) }}>
    {s && <span key={status} className="pa-swap" role="status" aria-live="polite" style={{ flex: "1 1 100%", font: "var(--type-meta)", letterSpacing: ".04em", color: tone }}>{s}</span>}
    {destructive && <div style={{ marginRight: "auto", display: "flex", gap: 8 }}>{destructive}</div>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: destructive ? 0 : "auto", flex: sticky ? "1 1 100%" : "0 1 auto", justifyContent: "flex-end" }}>{secondary}{primary}</div>
  </div>;
}
