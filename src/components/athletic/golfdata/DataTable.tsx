import React from "react";
import { Skeleton } from "./Skeleton";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — DataTable
 * Dense sortable table. Column options: key, label, sortable, mono, delta, width, render.
 * mono=true → JetBrains Mono tabular; delta=true → colours positive/negative values.
 * render: (value, row) => ReactNode for custom cells. CSS: ./golfdata.css (.ak-table).
 */

export type TableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  mono?: boolean;
  delta?: boolean;
  width?: number | string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
};

export type DataTableProps = {
  /** Vis Skeleton mens data lastes. */
  loading?: boolean;
  columns?: TableColumn[];
  rows?: Record<string, unknown>[];
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string, dir: "asc" | "desc") => void;
  className?: string;
  style?: React.CSSProperties;
};

type SortState = { key: string | undefined; dir: "asc" | "desc" };

export function DataTable({
  columns = [],
  rows = [],
  loading = false,
  sortKey,
  sortDir = "desc",
  onSort,
  className = "",
  style,
}: DataTableProps) {
  const [internal, setInternal] = React.useState<SortState>({ key: sortKey, dir: sortDir });
  const sort: SortState = onSort ? { key: sortKey, dir: sortDir } : internal;
  const setSort = onSort
    ? (k: string, d: "asc" | "desc") => onSort(k, d)
    : (k: string, d: "asc" | "desc") => setInternal({ key: k, dir: d });

  if (loading) {
    return <Skeleton variant="card" width="100%" height={180} className={className} style={style} />;
  }
  if (!loading && (!rows || rows.length === 0)) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: 16,
          boxSizing: "border-box",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-card)",
          background: "var(--surface)",
          textAlign: "center",
          ...style,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Ingen rader ennå
        </span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>
          Tabellen fylles når data er registrert.
        </span>
      </div>
    );
  }

  const handleSort = (col: TableColumn) => {
    if (!col.sortable) return;
    const newDir = sort.key === col.key && sort.dir === "desc" ? "asc" : "desc";
    setSort(col.key, newDir);
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sort.key) return 0;
    const va = a[sort.key];
    const vb = b[sort.key];
    const cmp =
      typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va ?? "").localeCompare(String(vb ?? ""));
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
                    ? sort.dir === "desc"
                      ? "descending"
                      : "ascending"
                    : undefined
                }
                onClick={() => handleSort(col)}
                style={{ width: col.width, textAlign: col.align || "left" }}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="ak-th__btn ak-th__inner"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSort(col);
                    }}
                  >
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
          {sorted.map((row, ri) => {
            const onRowClick = row._onClick as (() => void) | undefined;
            return (
              <tr key={ri} onClick={onRowClick || undefined} style={onRowClick ? { cursor: "pointer" } : undefined}>
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
                      {col.render ? col.render(val, row) : (val as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
