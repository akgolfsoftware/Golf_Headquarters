import React from "react";
import { Icon } from "../core/Icon.jsx";

const EASE = "cubic-bezier(.2,.8,.2,1)";
const groupOf = (groups, id) => (groups.find((g) => g.items.some((i) => i.id === id)) || {}).id;

export function NavDrawer({ open, onClose, brand, groups = [], active, onSelect, footer }) {
  const [exp, setExp] = React.useState(groupOf(groups, active));
  const first = React.useRef(null);
  React.useEffect(() => { if (open) { setExp(groupOf(groups, active)); const t = setTimeout(() => first.current && first.current.focus(), 60); return () => clearTimeout(t); } }, [open]);
  React.useEffect(() => { if (!open) return; const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open]);
  const pick = (it) => { if (it.href) { window.location.href = it.href; return; } onSelect && onSelect(it.id); onClose(); };
  const actG = groupOf(groups, active);
  return (
    <div aria-hidden={!open} style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden", transition: "visibility 0s linear " + (open ? "0s" : "280ms"), overflow: "hidden" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--scrim-modal)", opacity: open ? 1 : 0, transition: "opacity 240ms " + EASE }}></div>
      <nav role="dialog" aria-modal="true" aria-label="Meny" style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "min(320px, 86%)", background: "var(--surface-flat)", borderRight: "1px solid var(--border-hairline)", transform: open ? "none" : "translateX(-102%)", transition: "transform 280ms " + EASE, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", gap: 8, padding: "0 8px 0 16px", borderBottom: "1px solid var(--border-hairline)", flex: "none" }}>
          <div style={{ display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" }}>{brand}</div>
          <span style={{ flex: 1 }}></span>
          <button type="button" onClick={onClose} aria-label="Lukk meny" style={{ width: 44, height: 44, borderRadius: 8, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text-primary)" }}><Icon name="x" size={20} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }}>
          {groups.map((g, i) => { const isExp = exp === g.id, act = actG === g.id, single = g.items.length === 1; return (
            <div key={g.id}>
              <button ref={i === 0 ? first : null} type="button" aria-expanded={single ? undefined : isExp} onClick={() => single ? pick(g.items[0]) : setExp(isExp ? null : g.id)} style={{ width: "100%", height: 48, display: "flex", alignItems: "center", gap: 16, padding: "0 16px", border: "none", background: "transparent", cursor: "pointer", color: act ? "var(--text-primary)" : "var(--text-secondary)", font: (act ? "600 " : "500 ") + "15px/1 var(--font-sans)", textAlign: "left", boxShadow: act ? "inset 3px 0 0 var(--primary)" : "none" }}>
                <Icon name={g.icon} size={20} /><span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.label}</span>
                {!single && <Icon name="chevron-down" size={16} style={{ transform: isExp ? "rotate(180deg)" : "none", transition: "transform 200ms " + EASE, color: "var(--text-faint)" }} />}
                {single && g.items[0].href && <Icon name="arrow-up-right" size={16} style={{ color: "var(--text-faint)" }} />}
              </button>
              {!single && <div style={{ display: "grid", gridTemplateRows: isExp ? "1fr" : "0fr", transition: "grid-template-rows 240ms " + EASE }}>
                <div style={{ overflow: "hidden" }}>
                  {g.items.map((it) => { const on = active === it.id; return (
                    <button key={it.id} type="button" tabIndex={isExp ? 0 : -1} onClick={() => pick(it)} aria-current={on ? "page" : undefined} style={{ width: "100%", height: 48, display: "flex", alignItems: "center", gap: 8, padding: "0 16px 0 52px", border: "none", background: on ? "var(--surface-hover)" : "transparent", cursor: "pointer", color: on ? "var(--text-primary)" : "var(--text-secondary)", font: (on ? "600 " : "400 ") + "14px/1 var(--font-sans)", textAlign: "left" }}>
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
                      {it.count != null && <span className="num" style={{ font: "var(--type-num-s)", fontSize: 11, color: it.signal ? "#fff" : "var(--text-muted)", background: it.signal ? "var(--signal)" : "transparent", borderRadius: 999, padding: it.signal ? "3px 8px" : 0 }}>{it.count}</span>}
                      {it.href && <Icon name="arrow-up-right" size={16} style={{ color: "var(--text-faint)" }} />}
                    </button>); })}
                </div>
              </div>}
            </div>); })}
        </div>
        {footer && <div style={{ padding: 16, borderTop: "1px solid var(--border-hairline)", flex: "none" }}>{footer}</div>}
      </nav>
    </div>
  );
}
