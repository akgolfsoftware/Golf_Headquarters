import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

const pages = (p, n) => { if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1); const s = new Set([1, n, p - 1, p, p + 1]); const out = []; let last = 0; [...s].filter((x) => x >= 1 && x <= n).sort((a, b) => a - b).forEach((x) => { if (x - last > 1) out.push("gap" + x); out.push(x); last = x; }); return out; };
export function Pagination({ page = 1, pageCount = 1, onChange, total, perPage, label = "Sider", className }) {
  if (pageCount <= 1 && total == null) return null;
  const from = total != null && perPage ? (page - 1) * perPage + 1 : null, to = from != null ? Math.min(total, page * perPage) : null;
  return (
    <nav className={cx("pa-pager", className)} aria-label={label}>
      {from != null && <span className="pa-pager__meta">{from}–{to} AV {total}</span>}
      <div className="pa-pager__btns">
        <button type="button" className="pa-pager__btn pa-pager__btn--step" disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevron-left" size={16} /><span>Forrige</span></button>
        {pages(page, pageCount).map((x) => typeof x === "string" ? <span key={x} className="pa-pager__gap" aria-hidden="true">…</span> : <button key={x} type="button" className="pa-pager__btn" aria-current={x === page ? "page" : undefined} aria-label={"Side " + x} onClick={() => onChange(x)}>{x}</button>)}
        <button type="button" className="pa-pager__btn pa-pager__btn--step" disabled={page >= pageCount} onClick={() => onChange(page + 1)}><span>Neste</span><Icon name="chevron-right" size={16} /></button>
      </div>
    </nav>
  );
}
