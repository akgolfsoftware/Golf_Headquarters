import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — FleksMerke
 * Fleks-tilstand på en økt: fleks (kan flyttes) · låst (fast tid/sted) ·
 * flyttet (fleks brukt — grunnkode logget). Nøytral informasjon i mono;
 * ingen semantisk farge (flytting er ikke et brudd).
 */

const CSS = `
.ak-fleks{
  display:inline-flex;align-items:center;gap:5px;
  font-family:var(--font-mono);font-weight:600;color:var(--text-muted);
  white-space:nowrap;font-variant-numeric:tabular-nums;
}
.ak-fleks--sm{font-size:9px;}
.ak-fleks--md{font-size:10px;}
.ak-fleks__kode{
  border:1px solid var(--border-strong);border-radius:4px;
  padding:1px 5px;letter-spacing:.06em;color:var(--text-2);
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-fleks-css")) {
  const s = document.createElement("style");
  s.id = "ak-fleks-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const IKON = { fleks: "repeat", laast: "lock", flyttet: "arrow-right" };
const TEKST = { fleks: "Fleks", laast: "Fast", flyttet: "Flyttet" };

export function FleksMerke({ tilstand = "fleks", grunnkode, size = "md", className = "", style }) {
  return (
    <span className={`ak-fleks ak-fleks--${size} ${className}`} style={style}>
      <Icon name={IKON[tilstand] || "repeat"} size={size === "sm" ? 10 : 12} />
      <span>{TEKST[tilstand]}</span>
      {tilstand === "flyttet" && grunnkode && <span className="ak-fleks__kode">{grunnkode}</span>}
    </span>
  );
}
