import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Pagination
 * Page navigation with smart ellipsis. Controlled via page + onChange.
 * Shows at most 7 items; ellipsis collapses distant pages.
 */

const CSS = `
.ak-pgn{display:flex;align-items:center;gap:3px;}
.ak-pg{
  display:flex;align-items:center;justify-content:center;
  width:34px;height:34px;border-radius:var(--radius-input);
  border:1px solid transparent;background:transparent;cursor:pointer;
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:600;
  color:var(--text-muted);font-variant-numeric:tabular-nums;
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-pg:hover:not(:disabled){background:var(--surface-hover);color:var(--text);}
.ak-pg[data-current]{background:var(--primary-fill);color:var(--primary-text);}
.ak-pg:disabled{opacity:.35;cursor:not-allowed;}
.ak-pg-sep{
  display:flex;align-items:center;justify-content:center;
  width:34px;font-family:var(--font-mono);font-size:var(--text-13);color:var(--text-muted);
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-pgn-css")) {
  const s = document.createElement("style");
  s.id = "ak-pgn-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Pagination({ page = 1, totalPages = 1, onChange, className = "", style }) {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav className={`ak-pgn ${className}`} style={style} aria-label="Paginering">
      <button
        type="button" className="ak-pg"
        disabled={page <= 1}
        onClick={() => onChange && onChange(page - 1)}
        aria-label="Forrige"
      >
        <Icon name="chevron-left" size={16} />
      </button>
      {pages.map((p, i) =>
        typeof p === "string" ? (
          <span key={i} className="ak-pg-sep">…</span>
        ) : (
          <button
            key={i} type="button" className="ak-pg"
            data-current={p === page ? "" : undefined}
            onClick={() => onChange && onChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button" className="ak-pg"
        disabled={page >= totalPages}
        onClick={() => onChange && onChange(page + 1)}
        aria-label="Neste"
      >
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
