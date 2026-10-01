import React from "react";
import { Icon } from "../core/Icon.jsx";
/** Tilbake til forrige kontekst. Viser hvor man kommer fra, ikke bare «Hjem». */
export function BackBar({ to, label = "Tilbake", onBack, trail, actions, className }) {
  const btn = { all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 12px 0 4px", borderRadius: 8, font: "500 14px/1.2 var(--font-sans)", color: "var(--text-primary)" };
  return <nav aria-label="Tilbake og plassering" className={className} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    <button type="button" onClick={onBack} style={btn} aria-label={to ? label + " til " + to : label}><Icon name="arrow-left" size={18} /><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60vw" }}>{to || label}</span></button>
    {trail && trail.length > 0 && <ol style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: 0, padding: 0, listStyle: "none", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", flex: "1 1 200px", minWidth: 0 }}>{trail.map((t, i) => <li key={i} style={{ display: "inline-flex", gap: 6, alignItems: "center", minWidth: 0 }}>{i > 0 && <span aria-hidden="true">/</span>}{t.onClick ? <button type="button" onClick={t.onClick} style={{ all: "unset", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{t.label}</button> : <span aria-current="page">{t.label}</span>}</li>)}</ol>}
    {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>{actions}</div>}
  </nav>;
}
