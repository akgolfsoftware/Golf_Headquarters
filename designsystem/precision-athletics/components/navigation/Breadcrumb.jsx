import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Breadcrumb({ items = [], className }) {
  return (
    <nav className={cx("pa-crumbs", className)} aria-label="Brødsmuler">
      <ol>{items.map((it, i) => { const last = i === items.length - 1; return <li key={i}>
        {last ? <span aria-current="page">{it.label}</span> : it.href ? <a href={it.href}>{it.label}</a> : <button type="button" onClick={it.onClick}>{it.label}</button>}
        {!last && <Icon name="chevron-right" size={14} />}
      </li>; })}</ol>
    </nav>
  );
}
