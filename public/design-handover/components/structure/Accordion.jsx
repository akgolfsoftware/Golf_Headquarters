import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Accordion
 * Expand/collapse panels. defaultOpen: array of indices to start open.
 * exclusive=true: only one panel open at a time.
 */

const CSS = `
.ak-accordion{
  display:flex;flex-direction:column;
  border:1px solid var(--border);border-radius:var(--radius-card);overflow:hidden;
}
.ak-acc-item{border-bottom:1px solid var(--border);}
.ak-acc-item:last-child{border-bottom:none;}
.ak-acc-trig{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  width:100%;padding:14px 16px;background:transparent;border:none;cursor:pointer;
  text-align:left;color:var(--text);
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-acc-trig:hover{background:var(--surface-hover);}
.ak-acc-trig__lbl{font-size:var(--text-14);font-weight:500;}
.ak-acc-trig__sub{font-size:var(--text-13);color:var(--text-muted);margin-top:1px;}
.ak-acc-trig__ic{
  color:var(--text-muted);flex-shrink:0;
  transition:transform var(--dur-fast) var(--ease-standard);
}
.ak-acc-item[data-open] .ak-acc-trig__ic{transform:rotate(180deg);}
.ak-acc-body{padding:0 16px 16px;font-size:var(--text-14);color:var(--text-2);line-height:var(--leading-body);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-accordion-css")) {
  const s = document.createElement("style");
  s.id = "ak-accordion-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Accordion({ items = [], defaultOpen = [], exclusive = false, className = "", style }) {
  const [openSet, setOpenSet] = React.useState(new Set(defaultOpen));
  const toggle = (i) => {
    setOpenSet((prev) => {
      const next = new Set(exclusive ? [] : prev);
      prev.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
  return (
    <div className={`ak-accordion ${className}`} style={style}>
      {items.map((it, i) => (
        <div key={i} className="ak-acc-item" data-open={openSet.has(i) ? "" : undefined}>
          <button
            type="button"
            className="ak-acc-trig"
            onClick={() => toggle(i)}
            aria-expanded={openSet.has(i)}
          >
            <span>
              <span className="ak-acc-trig__lbl">{it.title}</span>
              {it.subtitle && <div className="ak-acc-trig__sub">{it.subtitle}</div>}
            </span>
            <Icon name="chevron-down" size={16} className="ak-acc-trig__ic" />
          </button>
          {openSet.has(i) && <div className="ak-acc-body">{it.content}</div>}
        </div>
      ))}
    </div>
  );
}
