import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — NavRail
 * AgencyOS 54px-icon-rail that expands to 244px on hover (or when expanded=true).
 * Items have a lime left-marker when active. Bottom items are pinned (settings, profile).
 */

const CSS = `
.ak-navrail{
  display:flex;flex-direction:column;
  width:var(--rail-collapsed);height:100%;
  background:var(--surface);border-right:1px solid var(--border);
  overflow:hidden;position:relative;flex-shrink:0;
  transition:width var(--dur-slow) var(--ease-standard);
  z-index:10;
}
.ak-navrail:hover,.ak-navrail[data-expanded]{width:var(--rail-expanded);}
.ak-navrail__top{
  display:flex;align-items:center;height:56px;
  padding:0 14px;flex-shrink:0;gap:12px;overflow:hidden;
}
.ak-navrail__logo{flex-shrink:0;display:flex;align-items:center;}
.ak-navrail__name{
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;
  color:var(--text-muted);white-space:nowrap;
  opacity:0;transition:opacity 160ms 80ms var(--ease-standard);
}
.ak-navrail:hover .ak-navrail__name,
.ak-navrail[data-expanded] .ak-navrail__name{opacity:1;}
.ak-navrail__body{flex:1;display:flex;flex-direction:column;gap:2px;padding:8px 6px;overflow:hidden;}
.ak-navrail__foot{padding:8px 6px 16px;display:flex;flex-direction:column;gap:2px;flex-shrink:0;overflow:hidden;}
.ak-navrail__div{height:1px;background:var(--border);margin:6px 8px;}
.ak-nri{
  display:flex;align-items:center;gap:12px;height:42px;
  padding:0 8px;border-radius:var(--radius-input);border:none;
  background:transparent;color:var(--text-muted);cursor:pointer;
  white-space:nowrap;text-decoration:none;position:relative;width:100%;text-align:left;
  transition:background var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);
}
.ak-nri:hover{background:var(--surface-hover);color:var(--text);}
.ak-nri[data-active]{background:var(--surface-2);color:var(--text);}
.ak-nri[data-active]::before{
  content:'';position:absolute;left:0;top:8px;bottom:8px;
  width:2px;border-radius:2px;background:var(--signal);
}
.ak-nri__ic{display:flex;align-items:center;justify-content:center;width:22px;flex-shrink:0;}
.ak-nri__lbl{
  font-family:var(--font-ui);font-size:var(--text-14);font-weight:500;
  opacity:0;white-space:nowrap;overflow:hidden;
  transition:opacity 160ms 80ms var(--ease-standard);flex:1;
}
.ak-navrail:hover .ak-nri__lbl,
.ak-navrail[data-expanded] .ak-nri__lbl{opacity:1;}
.ak-nri__badge{
  margin-left:auto;background:var(--signal);color:var(--on-signal);
  font-family:var(--font-mono);font-size:9px;font-weight:700;
  padding:2px 6px;border-radius:9999px;line-height:1.4;flex-shrink:0;
  opacity:0;transition:opacity 160ms 80ms var(--ease-standard);
}
.ak-navrail:hover .ak-nri__badge,
.ak-navrail[data-expanded] .ak-nri__badge{opacity:1;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-navrail-css")) {
  const s = document.createElement("style");
  s.id = "ak-navrail-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function NavItem({ icon, label, active, badge, href, onClick }) {
  const Tag = href ? "a" : "button";
  const tagProps = href ? { href } : { type: "button", onClick };
  return (
    <Tag className="ak-nri" {...tagProps} data-active={active || undefined}>
      <span className="ak-nri__ic"><Icon name={icon} size={20} /></span>
      <span className="ak-nri__lbl">{label}</span>
      {badge > 0 && <span className="ak-nri__badge">{badge}</span>}
    </Tag>
  );
}

export function NavRail({
  items = [],
  bottomItems = [],
  logo,
  wordmark = "AgencyOS",
  expanded = false,
  onSelect,
  className = "",
  style,
}) {
  return (
    <nav
      className={`ak-navrail ${className}`}
      style={style}
      {...(expanded ? { "data-expanded": "" } : {})}
    >
      <div className="ak-navrail__top">
        {logo && <span className="ak-navrail__logo">{logo}</span>}
        <span className="ak-navrail__name">{wordmark}</span>
      </div>
      <div className="ak-navrail__body">
        {items.map((it, i) => (
          <NavItem key={i} {...it} onClick={() => onSelect && onSelect(it)} />
        ))}
      </div>
      {bottomItems.length > 0 && (
        <React.Fragment>
          <div className="ak-navrail__div" />
          <div className="ak-navrail__foot">
            {bottomItems.map((it, i) => (
              <NavItem key={i} {...it} onClick={() => onSelect && onSelect(it)} />
            ))}
          </div>
        </React.Fragment>
      )}
    </nav>
  );
}
