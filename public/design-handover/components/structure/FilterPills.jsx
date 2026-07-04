import React from "react";

/**
 * AK Golf HQ — FilterPills
 * Horizontally scrolling pill-filter bar. multi=true allows multiple selections.
 * Filters: [{value, label, count?, axis?}] — axis adds the categorical colour dot.
 * value: single value or array when multi=true.
 */

const CSS = `
.ak-fps{
  display:flex;align-items:center;gap:6px;
  overflow-x:auto;scrollbar-width:none;
  -webkit-overflow-scrolling:touch;
}
.ak-fps::-webkit-scrollbar{display:none;}
.ak-fp{
  display:inline-flex;align-items:center;gap:5px;
  height:32px;padding:0 12px;flex-shrink:0;
  border-radius:9999px;border:1px solid var(--border-strong);
  background:transparent;color:var(--text-2);
  font-family:var(--font-ui);font-size:var(--text-13);font-weight:500;
  cursor:pointer;white-space:nowrap;
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard),border-color var(--dur-fast) var(--ease-standard);
}
.ak-fp:hover{background:var(--surface-hover);color:var(--text);border-color:var(--text-muted);}
.ak-fp[data-active]{
  background:var(--primary-fill);color:var(--primary-text);border-color:transparent;
}
.ak-fp__axis{width:7px;height:7px;border-radius:9999px;flex-shrink:0;}
.ak-fp__count{
  font-family:var(--font-mono);font-size:10px;font-weight:700;
  background:rgba(255,255,255,0.12);border-radius:9999px;
  padding:1px 6px;line-height:1.5;
}
.ak-fp[data-active] .ak-fp__count{background:rgba(0,0,0,0.12);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-fps-css")) {
  const s = document.createElement("style");
  s.id = "ak-fps-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function FilterPills({ filters = [], value, onChange, multi = false, className = "", style }) {
  const isActive = (f) => {
    if (multi) return Array.isArray(value) && value.includes(f.value);
    return value === f.value;
  };
  const handleClick = (f) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      const next = arr.includes(f.value)
        ? arr.filter((v) => v !== f.value)
        : [...arr, f.value];
      onChange && onChange(next);
    } else {
      onChange && onChange(value === f.value ? null : f.value);
    }
  };
  return (
    <div className={`ak-fps ${className}`} style={style}>
      {filters.map((f, i) => (
        <button
          key={i}
          type="button"
          className="ak-fp"
          data-active={isActive(f) ? "" : undefined}
          onClick={() => handleClick(f)}
        >
          {f.axis && (
            <span
              className="ak-fp__axis"
              style={{ background: `var(--axis-${f.axis.toLowerCase()})` }}
            />
          )}
          {f.label}
          {f.count != null && <span className="ak-fp__count">{f.count}</span>}
        </button>
      ))}
    </div>
  );
}
