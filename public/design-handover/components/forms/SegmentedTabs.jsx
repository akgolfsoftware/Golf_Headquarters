import React from "react";

/**
 * AK Golf HQ — SegmentedTabs
 * Pill-shaped active state on a dark rail, mono labels. Works as a short tab row
 * (3 choices) and as a period selector (Uke / Måned / 3 mnd / År). Active pill
 * is white (dark text) — the calm strong selection treatment.
 */

const CSS = `
.ak-seg{display:inline-flex;align-items:center;gap:2px;background:var(--surface-2);
  border:1px solid var(--border);border-radius:var(--radius-pill);padding:3px;}
.ak-seg--block{display:flex;width:100%;}
.ak-seg__item{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;
  font-family:var(--font-mono);font-weight:500;color:var(--text-2);cursor:pointer;
  border:none;background:transparent;border-radius:var(--radius-pill);white-space:nowrap;
  letter-spacing:.01em;transition:color var(--dur-fast) var(--ease-standard),
  background var(--dur-fast) var(--ease-standard);}
.ak-seg__item:hover{color:var(--text);}
.ak-seg__item[aria-selected="true"]{background:var(--primary-fill);color:var(--primary-text);
  font-weight:600;}
.ak-seg--md .ak-seg__item{height:34px;padding:0 16px;font-size:var(--text-13);}
.ak-seg--sm .ak-seg__item{height:28px;padding:0 12px;font-size:var(--text-12);}
.ak-seg__item:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-seg__item[disabled]{opacity:.38;cursor:not-allowed;pointer-events:none;}
.ak-seg--disabled{opacity:.5;pointer-events:none;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-seg-css")) {
  const el = document.createElement("style");
  el.id = "ak-seg-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function SegmentedTabs({
  options = [],
  value,
  onChange,
  size = "md",
  block = false,
  disabled = false,
  className = "",
  style,
  ...rest
}) {
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <div
      className={`ak-seg ak-seg--${size} ${block ? "ak-seg--block" : ""} ${disabled ? "ak-seg--disabled" : ""} ${className}`}
      role="tablist"
      aria-disabled={disabled || undefined}
      style={style}
      {...rest}
    >
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          disabled={disabled || it.disabled || undefined}
          onClick={() => onChange && onChange(it.value)}
          className="ak-seg__item"
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
