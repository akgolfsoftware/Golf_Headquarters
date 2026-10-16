import React from "react";
import { Icon } from "../core/Icon.jsx";
export function SideNav({ brand, items = [], active, onSelect, footer }) {
  return (
    <nav className="pa-sidenav" aria-label="Hovedmeny">
      {brand && <div className="pa-sidenav__brand">{brand}</div>}
      {items.map((it, i) => it.group ? <div key={"g" + i} className="pa-sidenav__group">{it.group}</div> : (
        <button key={it.id} type="button" className="pa-sidenav__item" aria-current={active === it.id ? "page" : undefined} onClick={() => onSelect && onSelect(it.id)}>
          <Icon name={it.icon} size={18} />{it.label}
          {it.count != null && <span className={"pa-sidenav__count" + (it.signal ? " pa-sidenav__count--signal" : "")}>{it.count}</span>}
        </button>
      ))}
      <span style={{ flex: 1 }} />
      {footer}
    </nav>
  );
}
