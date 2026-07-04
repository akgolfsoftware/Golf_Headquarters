import React from "react";

/**
 * AK Golf HQ — Radio / RadioGroup
 * Single-select. Use RadioGroup for a list; Radio for a standalone item.
 * direction: "column" (default) | "row".
 */

const CSS = `
.ak-rg{display:flex;flex-direction:column;gap:8px;}
.ak-rg--row{flex-direction:row;flex-wrap:wrap;gap:12px;}
.ak-radio{display:inline-flex;align-items:flex-start;gap:10px;cursor:pointer;user-select:none;}
.ak-radio--disabled{opacity:.38;pointer-events:none;}
.ak-radio__circle{
  width:18px;height:18px;border-radius:9999px;flex-shrink:0;margin-top:1px;
  border:1.5px solid var(--border-strong);background:transparent;
  display:flex;align-items:center;justify-content:center;
  transition:border-color var(--dur-fast) var(--ease-standard);
}
.ak-radio:hover .ak-radio__circle{border-color:var(--text-muted);}
.ak-radio:focus-visible{outline:none;}
.ak-radio:focus-visible .ak-radio__circle{box-shadow:var(--glow-signal);border-color:var(--signal);}
.ak-radio[data-checked] .ak-radio__circle{border-color:var(--signal);}
.ak-radio__dot{
  width:8px;height:8px;border-radius:9999px;background:transparent;
  transition:background var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
  transform:scale(0);
}
.ak-radio[data-checked] .ak-radio__dot{background:var(--signal);transform:scale(1);}
.ak-radio__lbl{font-size:var(--text-14);color:var(--text-2);line-height:1.4;}
.ak-radio__sub{font-size:var(--text-12);color:var(--text-muted);margin-top:2px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-radio-css")) {
  const s = document.createElement("style");
  s.id = "ak-radio-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function RadioGroup({ options = [], value, onChange, direction = "column", className = "", style }) {
  return (
    <div
      className={`ak-rg${direction === "row" ? " ak-rg--row" : ""} ${className}`}
      style={style}
      role="radiogroup"
    >
      {options.map((opt, i) => {
        const v = opt.value ?? opt;
        const l = opt.label ?? opt;
        return (
          <Radio
            key={i}
            checked={value === v}
            label={l}
            description={opt.description}
            disabled={opt.disabled}
            onChange={() => onChange && onChange(v)}
          />
        );
      })}
    </div>
  );
}

export function Radio({ checked = false, label, description, disabled = false, onChange, className = "" }) {
  return (
    <label
      className={`ak-radio${disabled ? " ak-radio--disabled" : ""} ${className}`}
      data-checked={checked ? "" : undefined}
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!disabled && onChange) onChange(); }
      }}
      onClick={() => !disabled && onChange && onChange()}
    >
      <span className="ak-radio__circle"><span className="ak-radio__dot" /></span>
      {label && (
        <span>
          <span className="ak-radio__lbl">{label}</span>
          {description && <div className="ak-radio__sub">{description}</div>}
        </span>
      )}
    </label>
  );
}
