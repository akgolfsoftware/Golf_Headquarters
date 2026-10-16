import React from "react";
import { ChoicePill } from "../forms/ChoicePill.jsx";
/** Filtre som bryter linje. «Alle» nullstiller. */
export function FilterChips({ options, value = [], onChange, allLabel = "Alle", label = "Filter", single }) {
  const all = !value.length;
  const tog = (v) => { if (single) return onChange([v]); onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]); };
  return <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 8, minWidth: 0 }}>
    {allLabel && <ChoicePill selected={all} onClick={() => onChange([])}>{allLabel}</ChoicePill>}
    {options.map((o) => { const v = typeof o === "string" ? o : o.value, l = typeof o === "string" ? o : o.label; return <ChoicePill key={v} axis={o.axis} selected={value.includes(v)} onClick={() => tog(v)}>{l}</ChoicePill>; })}
  </div>;
}
