import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — BenchmarkBadge
 * Nivåstige-badge: hvor spilleren ligger an på benchmark-stigen.
 * «Projeksjon» (under pågående test/måling) = stiplet kant + trending-ikon;
 * «bekreftet» = solid kant. Nøytral farge — nivå er informasjon, ikke ros.
 */

const CSS = `
.ak-bench{
  display:inline-flex;align-items:center;gap:6px;
  border-radius:var(--radius-tag);
  font-family:var(--font-mono);font-weight:600;color:var(--text);
  background:var(--surface-2);
  white-space:nowrap;
}
.ak-bench--sm{font-size:10px;padding:3px 8px;}
.ak-bench--md{font-size:var(--text-12);padding:5px 10px;}
.ak-bench--bekreftet{border:1px solid var(--border-strong);}
.ak-bench--projeksjon{border:1px dashed var(--border-strong);}
.ak-bench__pre{font-weight:500;color:var(--text-muted);}
.ak-bench svg{color:var(--text-2);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-bench-css")) {
  const s = document.createElement("style");
  s.id = "ak-bench-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function BenchmarkBadge({ niva, prefiks, status = "bekreftet", size = "md", className = "", style }) {
  return (
    <span className={`ak-bench ak-bench--${size} ak-bench--${status} ${className}`} style={style}>
      <Icon name={status === "projeksjon" ? "trending-up" : "bar-chart-2"} size={size === "sm" ? 11 : 13} />
      {prefiks && <span className="ak-bench__pre">{prefiks}:</span>}
      <span>{niva}</span>
    </span>
  );
}
