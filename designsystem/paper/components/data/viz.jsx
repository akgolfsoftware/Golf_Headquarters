import React from "react";
export const nf = (n, d = 1) => Number(n).toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d });
export const nfi = (n) => Number(n).toLocaleString("nb-NO", { maximumFractionDigits: 0 });
export const sg = (n, d = 2) => (n >= 0 ? "+" : "\u2212") + nf(Math.abs(n), d);
export const delta = (n, d = 1) => (n >= 0 ? "\u25B2 +" : "\u25BC \u2212") + nf(Math.abs(n), d);
export function ensureCss(id, css) { if (typeof document !== "undefined" && !document.getElementById(id)) { const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); } }
ensureCss("akhq-css-viz", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-skel{background:var(--soft);border-radius:var(--r-sm);animation:akhq-skel 1.2s var(--ease) infinite alternate}
@keyframes akhq-skel{from{opacity:.55}to{opacity:1}}
.akhq-empty{font-size:12px;color:var(--muted);line-height:1.45;padding:var(--s2) 0;margin:0}
.akhq-error{font-size:12px;color:var(--dn);line-height:1.45;padding:var(--s2) 0;margin:0}
.akhq-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-val{font-family:var(--mono);font-variant-numeric:tabular-nums}
.akhq-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--s4);box-shadow:var(--shadow);min-width:0;font-family:var(--ui);color:var(--fg)}
}
`);
export function Region({ state = "content", empty = "Ingenting her enn\u00e5.", error = "Kunne ikke hente data. Pr\u00f8v igjen.", height = 48, children }) {
  if (state === "loading") return <div className="akhq-skel" role="status" aria-label="Laster" style={{ height }}></div>;
  if (state === "empty") return <p className="akhq-empty">{empty}</p>;
  if (state === "error") return <p className="akhq-error">{error}</p>;
  return children;
}
