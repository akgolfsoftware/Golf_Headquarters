import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — DeltaIndikator
 * Frittstående delta: retningspil + verdi i mono/tabular.
 * Opp = --up (lime), ned = --down (coral), flat = muted.
 * Redundant koding (pil + fortegn + farge) — aldri farge alene.
 */

const CSS = `
.ak-delta{
  display:inline-flex;align-items:center;gap:3px;
  font-family:var(--font-mono);font-weight:600;
  font-variant-numeric:tabular-nums;letter-spacing:var(--tracking-mono);
  white-space:nowrap;
}
.ak-delta--sm{font-size:var(--text-11);}
.ak-delta--md{font-size:var(--text-13);}
.ak-delta--opp{color:var(--up);}
.ak-delta--ned{color:var(--down);}
.ak-delta--flat{color:var(--text-muted);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-delta-css")) {
  const s = document.createElement("style");
  s.id = "ak-delta-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function DeltaIndikator({ verdi, retning, invertert = false, size = "sm", srLabel, className = "", style }) {
  let dir = retning;
  if (!dir) {
    const s = String(verdi).trim();
    dir = s.startsWith("-") || s.startsWith("−") ? "ned" : /^[0]([,.]0+)?$/.test(s) ? "flat" : "opp";
  }
  const tone = dir === "flat" ? "flat" : invertert ? (dir === "opp" ? "ned" : "opp") : dir;
  const ikon = dir === "opp" ? "arrow-up-right" : dir === "ned" ? "arrow-down-right" : "minus";
  return (
    <span className={`ak-delta ak-delta--${size} ak-delta--${tone} ${className}`} style={style}>
      <Icon name={ikon} size={size === "sm" ? 11 : 13} />
      <span>{verdi}</span>
      {srLabel && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{srLabel}</span>}
    </span>
  );
}
