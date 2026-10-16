import React from "react";
/** Mål for slipp. Viser aktiv, over og ugyldig. Alltid med knapp-alternativ ved siden av. */
export function DropZone({ label, hint, onDrop, accept = ["application/x-ak-drag"], valid = true, reason, children, empty, minHeight = 56 }) {
  const [over, setOver] = React.useState(false);
  const ok = (e) => accept.some((t) => e.dataTransfer.types.includes(t));
  const st = over ? (valid ? "over" : "invalid") : "idle";
  const bd = st === "over" ? "2px solid var(--border-ink)" : st === "invalid" ? "2px dashed var(--signal)" : "1px dashed var(--border-strong)";
  return <div role="group" aria-label={label} data-drop={st}
    onDragOver={(e) => { if (ok(e)) { e.preventDefault(); e.dataTransfer.dropEffect = valid ? "move" : "none"; setOver(true); } }}
    onDragLeave={() => setOver(false)}
    onDrop={(e) => { e.preventDefault(); setOver(false); if (!valid) return; const t = accept.find((x) => e.dataTransfer.types.includes(x)); onDrop && onDrop(e.dataTransfer.getData(t), e); }}
    style={{ border: children && st === "idle" ? "1px solid transparent" : bd, borderRadius: 8, minHeight, padding: 8, display: "flex", flexDirection: "column", gap: 8, background: st === "over" ? "var(--surface-hover)" : "transparent", minWidth: 0, boxSizing: "border-box", transition: "background-color var(--dur-fast) var(--ease-color), border-color var(--dur-fast) var(--ease-color)" }}>
    {children}
    {(!children || st !== "idle") && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: st === "invalid" ? "var(--signal-ink)" : "var(--text-muted)", textAlign: "center", padding: "8px 4px" }}>{st === "invalid" ? (reason || "KAN IKKE SLIPPES HER") : st === "over" ? "SLIPP FOR Å LEGGE TIL" : (empty || hint || "DRA HIT")}</span>}
  </div>;
}
