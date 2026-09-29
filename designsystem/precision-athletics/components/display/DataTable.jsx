import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");
const isEmpty = (v) => v === null || v === undefined || v === "";

const cmp = (a, b) => { if (isEmpty(a)) return 1; if (isEmpty(b)) return -1; const na = typeof a === "number" ? a : parseFloat(String(a).replace("−", "-").replace(/\s/g, "").replace(",", ".")); const nb = typeof b === "number" ? b : parseFloat(String(b).replace("−", "-").replace(/\s/g, "").replace(",", ".")); if (!isNaN(na) && !isNaN(nb)) return na - nb; return String(a).localeCompare(String(b), "nb"); };

export function DataTable({ columns = [], rows = [], rowKey = "id", selected, onSelect, sort: sortProp, onSort, defaultSort, caption, emptyText = "Ingen rader", className }) {
  const [own, setOwn] = React.useState(defaultSort || null);
  const sort = sortProp !== undefined ? sortProp : own;
  const setSort = (key) => { const next = sort && sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }; onSort ? onSort(next) : setOwn(next); };
  const list = React.useMemo(() => { if (!sort) return rows; const c = columns.find((x) => x.key === sort.key); const get = c && c.sortValue ? c.sortValue : (r) => r[sort.key]; const out = [...rows].sort((a, b) => cmp(get(a), get(b))); return sort.dir === "desc" ? out.reverse() : out; }, [rows, sort, columns]);
  const sortable = columns.filter((c) => c.sortable);
  const cell = (c, r) => { const v = c.render ? c.render(r) : r[c.key]; return isEmpty(v) ? "—" : v; };
  return (
    <div className={cx("pa-table", className)}>
      {sortable.length > 0 && <div className="pa-table__sortbar" role="group" aria-label="Sorter">
        <span className="pa-table__sortlbl">SORTER</span>
        {sortable.map((c) => { const on = sort && sort.key === c.key; return <button key={c.key} type="button" className="pa-table__sortchip" aria-pressed={!!on} onClick={() => setSort(c.key)}>{c.label}{on && <Icon name={sort.dir === "asc" ? "arrow-up" : "arrow-down"} size={14} />}</button>; })}
      </div>}
      <table>
        {caption && <caption className="pa-table__caption">{caption}</caption>}
        <thead><tr>{columns.map((c) => { const on = sort && sort.key === c.key; return (
          <th key={c.key} scope="col" className={cx(c.align === "right" && "is-right")} style={c.width ? { width: c.width } : null} aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
            {c.sortable ? <button type="button" className="pa-table__sort" onClick={() => setSort(c.key)}>{c.label}<Icon name={on ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "arrow-up-down"} size={14} /></button> : c.label}
          </th>); })}</tr></thead>
        <tbody>
          {list.length === 0 && <tr className="pa-table__empty"><td colSpan={columns.length}>{emptyText}</td></tr>}
          {list.map((r) => { const k = r[rowKey]; const sel = selected != null && selected === k; return (
            <tr key={k} aria-selected={onSelect ? sel : undefined} className={cx(onSelect && "is-click")} onClick={onSelect ? () => onSelect(k, r) : undefined} tabIndex={onSelect ? 0 : undefined} onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(k, r); } } : undefined}>
              {columns.map((c, i) => <td key={c.key} data-label={c.label} className={cx(i === 0 && "pa-table__lead", c.mono && "is-mono", c.align === "right" && "is-right")}>{cell(c, r)}</td>)}
            </tr>); })}
        </tbody>
      </table>
    </div>
  );
}
