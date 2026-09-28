import React from "react";
import { Icon } from "../core/Icon.jsx";

const go = (it, onSelect) => { if (it.href) window.location.href = it.href; else onSelect && onSelect(it.id); };

export function NavRail({ brand, groups = [], active, onSelect, footer }) {
  const [hov, setHov] = React.useState(null);
  return (
    <nav aria-label="Hovedmeny" style={{ width: 56, flex: "none", height: "100%", background: "var(--surface-flat)", borderRight: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, position: "relative", zIndex: 5, overflowY: "auto", overflowX: "visible" }}>
      {brand && <div style={{ width: 28, height: 28, display: "grid", placeItems: "center", margin: "4px 0 12px", flex: "none" }}>{brand}</div>}
      {groups.map((g, gi) => (
        <React.Fragment key={g.id}>
          {gi > 0 && <span style={{ width: 24, height: 1, background: "var(--border-hairline)", margin: "4px 0", flex: "none" }}></span>}
          {g.items.map((it) => { const on = active === it.id; return (
            <div key={it.id} style={{ position: "relative", flex: "none" }} onMouseEnter={() => setHov(it.id)} onMouseLeave={() => setHov(null)}>
              <button type="button" aria-label={it.label} aria-current={on ? "page" : undefined} onClick={() => go(it, onSelect)} style={{ width: 44, height: 40, borderRadius: 8, border: "none", display: "grid", placeItems: "center", cursor: "pointer", background: on ? "var(--primary)" : hov === it.id ? "var(--surface-hover)" : "transparent", color: on ? "var(--text-on-primary)" : "var(--text-secondary)", transition: "background 120ms", position: "relative" }}>
                <Icon name={it.icon} size={20} />
                {it.count != null && <span aria-hidden="true" style={{ position: "absolute", top: 4, right: 6, width: 8, height: 8, borderRadius: 999, background: it.signal ? "var(--signal)" : "var(--text-muted)", boxShadow: "0 0 0 2px var(--surface-flat)" }}></span>}
              </button>
              {hov === it.id && <span role="tooltip" style={{ position: "fixed", marginLeft: 52, marginTop: -30, whiteSpace: "nowrap", background: "var(--surface-inverse)", color: "var(--text-inverse)", font: "500 13px/1 var(--font-sans)", padding: "8px 12px", borderRadius: 8, pointerEvents: "none", boxShadow: "var(--shadow-raised)", zIndex: 60 }}><span style={{ font: "var(--type-meta)", opacity: .7, marginRight: 8 }}>{g.label.toUpperCase()}</span>{it.label}{it.count != null && <span className="num" style={{ marginLeft: 8, opacity: .7 }}>{it.count}</span>}</span>}
            </div>); })}
        </React.Fragment>
      ))}
      <span style={{ flex: 1 }}></span>
      {footer}
    </nav>
  );
}
