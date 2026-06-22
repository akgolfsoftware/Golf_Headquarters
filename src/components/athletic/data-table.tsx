"use client";

import { Fragment } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";
export type SortState = { key: string; dir: SortDir } | null;

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  /** CSS-bredde, f.eks. "120px" eller "1fr" (via minmax). Default auto. */
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowId: (row: T) => string;
  /** Gruppe-separator-label per rad (f.eks. "I DAG", "MANDAG 26 MAI"). */
  groupBy?: (row: T) => string;
  sort?: SortState;
  onSort?: (sort: SortState) => void;
  selectable?: boolean;
  selected?: ReadonlySet<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  className?: string;
};

const alignCls = {
  left: "text-left justify-start",
  right: "text-right justify-end",
  center: "text-center justify-center",
} as const;

/** Generisk, sorterbar datatabell med valgfri dato-gruppering og rad-seleksjon. */
export function DataTable<T>({
  columns,
  rows,
  rowId,
  groupBy,
  sort,
  onSort,
  selectable,
  selected,
  onToggle,
  onToggleAll,
  onRowClick,
  empty,
  className,
}: DataTableProps<T>) {
  function toggleSort(key: string) {
    if (!onSort) return;
    if (sort?.key !== key) onSort({ key, dir: "asc" });
    else if (sort.dir === "asc") onSort({ key, dir: "desc" });
    else onSort(null);
  }

  const allIds = rows.map(rowId);
  const allChecked = selectable && allIds.length > 0 && allIds.every((id) => selected?.has(id));
  const colCount = columns.length + (selectable ? 1 : 0);

  // Beregn gruppe-grenser uten mutasjon under render (sammenlign mot forrige rad).
  const decorated = rows.map((row, i) => {
    const group = groupBy?.(row);
    const prevGroup = i > 0 ? groupBy?.(rows[i - 1]) : undefined;
    return { row, group, showGroup: group != null && group !== prevGroup };
  });

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-9 px-3 py-2.5">
                <CheckBox checked={!!allChecked} onChange={() => onToggleAll?.(allIds)} label="Velg alle" />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className="px-3 py-2.5"
                >
                  <button
                    type="button"
                    disabled={!c.sortable}
                    onClick={() => c.sortable && toggleSort(c.key)}
                    className={cn(
                      "flex w-full items-center gap-1 font-mono text-[9.5px] font-extrabold uppercase tracking-[0.10em]",
                      alignCls[c.align ?? "left"],
                      active ? "text-foreground" : "text-muted-foreground",
                      c.sortable && "hover:text-foreground",
                    )}
                  >
                    {c.header}
                    {c.sortable &&
                      (active ? (
                        sort?.dir === "asc" ? (
                          <ChevronUp className="h-3 w-3" strokeWidth={2} />
                        ) : (
                          <ChevronDown className="h-3 w-3" strokeWidth={2} />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" strokeWidth={1.5} />
                      ))}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={colCount} className="px-3 py-10 text-center text-sm text-muted-foreground">
                {empty ?? "Ingen rader."}
              </td>
            </tr>
          )}
          {decorated.map(({ row, group, showGroup }) => {
            const id = rowId(row);
            const isSelected = selected?.has(id);
            return (
              <Fragment key={id}>
                {showGroup && (
                  <tr>
                    <td
                      colSpan={colCount}
                      className="bg-secondary/50 px-3 py-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {group}
                    </td>
                  </tr>
                )}
                <tr
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "cursor-pointer",
                    isSelected ? "bg-accent/10" : "hover:bg-secondary/60",
                  )}
                >
                  {selectable && (
                    <td className="w-9 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <CheckBox checked={!!isSelected} onChange={() => onToggle?.(id)} label="Velg rad" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn("px-3 py-2.5 text-xs text-foreground", c.align === "right" && "text-right", c.align === "center" && "text-center")}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CheckBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded border-[1.5px]",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-transparent",
      )}
    >
      {checked && <Check className="h-[11px] w-[11px]" strokeWidth={2.5} />}
    </button>
  );
}
