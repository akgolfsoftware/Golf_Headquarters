import React from "react";
import { Segmented } from "../forms/Segmented.jsx";
/** Periode og sammenligning. Sammenligning er alltid valgfri. */
export function PeriodSelector({ value, onChange, options = ["4 uker", "8 uker", "Periode", "Sesong"], compare, onCompare, compareOptions = ["Ingen", "Forrige periode", "Samme tid i fjor", "Mål"], label = "Periode" }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minWidth: 0 }}>
    <div role="group" aria-label={label} style={{ maxWidth: "100%" }}><Segmented options={options} value={value} onChange={onChange} /></div>
    {onCompare && <label style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--type-body-s)", color: "var(--text-secondary)", flexWrap: "wrap" }}>Sammenlign med
      <span className="pa-control pa-select" style={{ minWidth: 0 }}><select value={compare} onChange={(e) => onCompare(e.target.value)} aria-label="Sammenlign med">{compareOptions.map((o) => <option key={o}>{o}</option>)}</select></span>
    </label>}
  </div>;
}
