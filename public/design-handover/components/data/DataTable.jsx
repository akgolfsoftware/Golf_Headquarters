import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — DataTable
 * Dense sortable table. Column options: key, label, sortable, mono, delta, width, render.
 * mono=true → JetBrains Mono tabular; delta=true → colours positive/negative values.
 * render: (value, row) => ReactNode for custom cells.
 */

const CSS = `
.ak-table-wrap{overflow-x:auto;width:100%;}
.ak-table{width:100%;border-collapse:collapse;min-width:400px;}
.ak-table th{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;
  color:var(--text-muted);padding:8px 12px;text-align:left;
  border-bottom:1px solid var(--border-strong);
  white-space:nowrap;user-select:none;
}
.ak-table th[data-sortable]{cursor:pointer;}
.ak-table th[data-sortable]:hover{color:var(--text-2);}
.ak-table th[data-sort]{color:var(--text);}
.ak-th__btn{
  all:unset;display:inline-flex;align-items:center;gap:4px;cursor:pointer;
  font:inherit;color:inherit;letter-spacing:inherit;text-transform:inherit;
}
.ak-th__btn:focus-visible{outline:2px solid var(--signal);outline-offset:2px;border-radius:2px;}
.ak-th__inner{display:inline-flex;align-items:center;gap:4px;}
.ak-table td{
  padding:10px 12px;border-bottom:1px solid var(--border);
  font-size:var(--text-14);color:var(--text-2);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;
}
.ak-table tr:last-child td{border-bottom:none;}
.ak-table tbody tr:hover td{background:var(--surface-hover);}
.ak-table td[data-mono]{
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:600;
  font-variant-numeric:tabular-nums;letter-spacing:var(--tracking-mono);color:var(--text);
}
.ak-table td[data-up]{color:var(--up);}
.ak-table td[data-down]{color:var(--down);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-table-css")) {
  const s = document.createElement("style");
  s.id = "ak-table-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function DataTable({
  columns = [],
  rows = [],
  loading = false,
  sortKey,
  sortDir = "desc",
  onSort,
  className = "",
  style,
}) {
  const [internal, setInternal] = React.useState({ key: sortKey, dir: sortDir });
  const sort = onSort ? { key: sortKey, dir: sortDir } : internal;
  const setSort = onSort
    ? (k, d) => onSort(k, d)
    : (k, d) => setInternal({ key: k, dir: d });

  if (loading) {
    return <Skeleton variant="card" width="100%" height={180} className={className} style={style} />;
  }
  if (!loading && (!rows || rows.length === 0)) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 180, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen rader ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Tabellen fylles når data er registrert.</span>
      </div>
    );
  }

  const handleSort = (col) => {
    if (!col.sortable) return;
    const newDir = sort.key === col.key && sort.dir === "desc" ? "asc" : "desc";
    setSort(col.key, newDir);
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sort.key) return 0;
    const va = a[sort.key]; const vb = b[sort.key];
    const cmp = typeof va === "number" ? va - vb : String(va ?? "").localeCompare(String(vb ?? ""));
    return sort.dir === "desc" ? -cmp : cmp;
  });

  return (
    <div className="ak-table-wrap" style={style}>
      <table className={`ak-table ${className}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                data-sortable={col.sortable ? "" : undefined}
                data-sort={sort.key === col.key ? "" : undefined}
                aria-sort={
                  col.sortable && sort.key === col.key
                    ? (sort.dir === "desc" ? "descending" : "ascending")
                    : undefined
                }
                onClick={() => handleSort(col)}
                style={{ width: col.width, textAlign: col.align || "left" }}
              >
                {col.sortable ? (
                  <button type="button" className="ak-th__btn ak-th__inner" onClick={(e) => { e.stopPropagation(); handleSort(col); }}>
                    {col.label}
                    {sort.key === col.key && (
                      <Icon name={sort.dir === "desc" ? "arrow-down" : "arrow-up"} size={11} />
                    )}
                  </button>
                ) : (
                  <span className="ak-th__inner">{col.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr key={ri} onClick={row._onClick || undefined} style={row._onClick ? { cursor: "pointer" } : undefined}>
              {columns.map((col) => {
                const val = row[col.key];
                const isUp = col.delta && typeof val === "number" && val > 0;
                const isDn = col.delta && typeof val === "number" && val < 0;
                return (
                  <td
                    key={col.key}
                    data-mono={col.mono ? "" : undefined}
                    data-up={isUp ? "" : undefined}
                    data-down={isDn ? "" : undefined}
                    style={{ textAlign: col.align || "left" }}
                  >
                    {col.render ? col.render(val, row) : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
