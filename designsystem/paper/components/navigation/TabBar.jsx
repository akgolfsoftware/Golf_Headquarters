import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tabbar{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;background:var(--surface);border-top:1px solid var(--border);padding:6px 0 max(6px,env(safe-area-inset-bottom));font-family:var(--ui);width:100%;box-sizing:border-box}
.akhq-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:44px;border:0;background:none;color:var(--muted);cursor:pointer;padding:4px 0;border-radius:var(--r-sm);transition:color var(--dur) var(--ease);font-family:inherit}
.akhq-tab span{font-size:10px;font-weight:500;letter-spacing:.01em}
.akhq-tab svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.akhq-tab:hover{color:var(--fg)}
.akhq-tab:active{background:var(--soft)}
.akhq-tab[aria-current=page]{color:var(--fg)}
.akhq-tab[aria-current=page] span{font-weight:600}
.akhq-tab:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-tab:disabled{opacity:.4;cursor:not-allowed}}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tabbar")) { const s = document.createElement("style"); s.id = "akhq-css-tabbar"; s.textContent = css; document.head.appendChild(s); }
export function TabBar({ items = [], current, onNavigate, dataOdId = "nav-tabbar", ...rest }) {
  return (
    <nav className="akhq-tabbar" aria-label="PlayerHQ meny" data-od-id={dataOdId} {...rest}>
      {items.map((it) => (
        <button type="button" key={it.id} className="akhq-tab" aria-current={it.id === current ? "page" : undefined} disabled={it.disabled} data-od-id={"nav-" + it.id} onClick={() => onNavigate && onNavigate(it.id)}>
          {it.icon}<span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
