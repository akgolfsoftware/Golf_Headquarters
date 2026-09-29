import React from "react";
import { Sheet } from "../feedback/Sheet.jsx";
import { Button } from "../core/Button.jsx";
import { Icon } from "../core/Icon.jsx";
const ICON = { kalender: "calendar-x", volum: "bar-chart-3", belastning: "activity", tilgang: "lock", versjon: "git-compare" };
/** Når et slipp eller en flytting kolliderer. Viser hva som kolliderer og lar brukeren velge. */
export function ConflictSheet({ open, onClose, title = "Flyttingen gir konflikt", conflicts = [], options = [], onResolve }) {
  return <Sheet open={open} onClose={onClose} kicker="Konflikt" title={title} footer={<>{options.map((o, i) => <Button key={o.id} variant={i === 0 ? "primary" : "secondary"} fullWidth onClick={() => onResolve && onResolve(o.id)}>{o.label}</Button>)}<Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>{conflicts.map((c, i) => <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 8, background: "var(--warn-tint)" }}>
      <Icon name={ICON[c.kind] || "triangle-alert"} size={18} />
      <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ font: "500 14px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{c.text}</span>{c.meta && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-secondary)" }}>{c.meta}</span>}</span>
    </li>)}</ul>
    {options.some((o) => o.description) && <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>{options.filter((o) => o.description).map((o) => <div key={o.id}><dt style={{ font: "600 13px/1.3 var(--font-sans)" }}>{o.label}</dt><dd style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{o.description}</dd></div>)}</dl>}
  </Sheet>;
}
