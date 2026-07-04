import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Checkbox
 * Lime checkmark when checked. Indeterminate state supported.
 * Optional label + description. Wrap in FormField for label+error handling.
 */

const CSS = `
.ak-cb{display:inline-flex;align-items:flex-start;gap:10px;cursor:pointer;user-select:none;}
.ak-cb--disabled{opacity:.38;pointer-events:none;}
.ak-cb__box{
  width:18px;height:18px;border-radius:5px;flex-shrink:0;margin-top:1px;
  border:1.5px solid var(--border-strong);background:transparent;
  display:flex;align-items:center;justify-content:center;
  transition:border-color var(--dur-fast) var(--ease-standard),
    background var(--dur-fast) var(--ease-standard);
}
.ak-cb:hover .ak-cb__box{border-color:var(--text-muted);}
.ak-cb:focus-visible{outline:none;}
.ak-cb:focus-visible .ak-cb__box{box-shadow:var(--glow-signal);border-color:var(--signal);}
.ak-cb[data-checked] .ak-cb__box{background:var(--signal);border-color:var(--signal);}
.ak-cb[data-indeterminate] .ak-cb__box{background:var(--surface-2);border-color:var(--signal);}
.ak-cb__lbl{font-size:var(--text-14);color:var(--text-2);line-height:1.4;}
.ak-cb__sub{font-size:var(--text-12);color:var(--text-muted);margin-top:2px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-cb-css")) {
  const s = document.createElement("style");
  s.id = "ak-cb-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  description,
  disabled = false,
  className = "",
  style,
}) {
  const handleClick = () => { if (!disabled && onChange) onChange(!checked); };
  const handleKey = (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleClick(); }
  };
  return (
    <label
      className={`ak-cb${disabled ? " ak-cb--disabled" : ""} ${className}`}
      style={style}
      data-checked={checked && !indeterminate ? "" : undefined}
      data-indeterminate={indeterminate ? "" : undefined}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKey}
      onClick={handleClick}
    >
      <span className="ak-cb__box">
        {checked && !indeterminate && (
          <Icon name="check" size={12} style={{ color: "var(--on-signal)" }} />
        )}
        {indeterminate && (
          <Icon name="minus" size={12} style={{ color: "var(--signal)" }} />
        )}
      </span>
      {label && (
        <span>
          <span className="ak-cb__lbl">{label}</span>
          {description && <div className="ak-cb__sub">{description}</div>}
        </span>
      )}
    </label>
  );
}
