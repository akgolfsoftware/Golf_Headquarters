import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — BottomNav
 * PlayerHQ 5-tab mobile bottom navigation. Fixed to bottom of viewport.
 * Active tab gets a subtle background pill on the icon. Unread badge is a lime dot.
 */

const CSS = `
.ak-bottomnav{
  display:flex;align-items:center;
  height:64px;padding:0 4px;
  background:var(--surface);border-top:1px solid var(--border);
  position:fixed;bottom:0;left:0;right:0;z-index:100;
  padding-bottom:env(safe-area-inset-bottom,0);
}
.ak-bni{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:8px 4px;background:transparent;border:none;cursor:pointer;
  text-decoration:none;color:var(--text-muted);
  transition:color var(--dur-fast) var(--ease-standard);
}
.ak-bni:hover{color:var(--text-2);}
.ak-bni[data-active]{color:var(--text);}
.ak-bni__pill{
  position:relative;display:flex;align-items:center;justify-content:center;
  width:44px;height:28px;border-radius:14px;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-bni[data-active] .ak-bni__pill{background:var(--surface-hover);}
.ak-bni__dot{
  position:absolute;top:2px;right:8px;
  width:6px;height:6px;border-radius:9999px;
  background:var(--signal);border:1.5px solid var(--surface);
}
.ak-bni__lbl{
  font-family:var(--font-ui);font-size:10px;font-weight:500;
  line-height:1;letter-spacing:0.01em;white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-bottomnav-css")) {
  const s = document.createElement("style");
  s.id = "ak-bottomnav-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function BottomNav({ items = [], onSelect, className = "", style }) {
  return (
    <nav className={`ak-bottomnav ${className}`} style={style}>
      {items.map((it, i) => {
        const Tag = it.href ? "a" : "button";
        const tagProps = it.href
          ? { href: it.href }
          : { type: "button", onClick: () => onSelect && onSelect(it) };
        return (
          <Tag
            key={i}
            className="ak-bni"
            data-active={it.active || undefined}
            aria-current={it.active ? "page" : undefined}
            {...tagProps}
          >
            <span className="ak-bni__pill">
              <Icon name={it.icon} size={22} />
              {it.badge && <span className="ak-bni__dot" />}
            </span>
            <span className="ak-bni__lbl">{it.label}</span>
          </Tag>
        );
      })}
    </nav>
  );
}
