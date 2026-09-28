import React from "react";
import { Sheet } from "../feedback/Sheet.jsx";
import { Button } from "../core/Button.jsx";
import { Segmented } from "../forms/Segmented.jsx";
/** Ikke-dra-alternativet: velg mål i en liste. Mobil og tastatur. */
export function MoveSheet({ open, onClose, title, item, targets = [], value, onChange, scope, scopeValue, onScope, note, onConfirm, confirmLabel = "Flytt" }) {
  return <Sheet open={open} onClose={onClose} kicker={"Flytt · " + (item || "")} title={title || "Velg ny plass"} footer={<><Button fullWidth icon="move" disabled={!value} onClick={onConfirm}>{confirmLabel}</Button><Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    {scope && <Segmented options={scope} value={scopeValue} onChange={onScope} fullWidth />}
    <div role="radiogroup" aria-label="Mål" style={{ display: "flex", flexDirection: "column", gap: 4 }}>{targets.map((t) => { const on = value === t.id;
      return <button key={t.id} type="button" role="radio" aria-checked={on} disabled={t.disabled} onClick={() => onChange && onChange(t.id)} style={{ all: "unset", cursor: t.disabled ? "not-allowed" : "pointer", display: "flex", gap: 12, alignItems: "center", minHeight: 52, padding: "8px 12px", borderRadius: 8, border: on ? "2px solid var(--border-ink)" : "1px solid var(--border-hairline)", opacity: t.disabled ? 0.55 : 1, boxSizing: "border-box" }}>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{t.label}</span>{(t.meta || t.reason) && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: t.warn ? "var(--signal-ink)" : "var(--text-muted)" }}>{t.reason || t.meta}</span>}</span>
      </button>; })}</div>
    {note && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{note}</p>}
  </Sheet>;
}
