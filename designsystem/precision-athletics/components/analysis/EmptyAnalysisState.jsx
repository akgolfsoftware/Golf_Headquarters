import React from "react";
import { Button } from "../core/Button.jsx";
import { Icon } from "../core/Icon.jsx";
/** Ikke nok data: sier hvor mye som finnes, hvor mye som trengs og hva man gjør nå. */
export function EmptyAnalysisState({ title, have, need, unit, text, action, actionIcon = "plus", onAction, secondary, onSecondary }) {
  const pct = have != null && need ? Math.min(100, Math.round((have / need) * 100)) : null;
  return <div className="pa-card" style={{ padding: 20, gap: 12, alignItems: "flex-start", minWidth: 0 }}>
    <span style={{ width: 40, height: 40, borderRadius: "var(--radius)", display: "grid", placeItems: "center", background: "var(--surface-sunken)" }}><Icon name="chart-no-axes-column" size={20} /></span>
    <h3 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{title}</h3>
    {text && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{text}</p>}
    {pct != null && <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}><div style={{ height: 6, borderRadius: "var(--radius-mark)", background: "var(--surface-sunken)", overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: "var(--primary)" }} /></div><span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{have} AV {need} {(unit || "").toUpperCase()} · {Math.max(0, need - have)} TIL FØR ANALYSEN VISES</span></div>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{action && <Button icon={actionIcon} onClick={onAction}>{action}</Button>}{secondary && <Button variant="ghost" onClick={onSecondary}>{secondary}</Button>}</div>
  </div>;
}
