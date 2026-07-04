import React from "react";

/**
 * AK Golf HQ — Toggle
 * Switch: lime when on, neutral grey when off. Calm 200ms slide.
 */

const CSS = `
.ak-toggle{position:relative;display:inline-flex;align-items:center;flex:none;
  border:none;padding:0;cursor:pointer;border-radius:9999px;background:var(--track);
  transition:background var(--dur-base) var(--ease-standard);}
.ak-toggle:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-toggle[aria-checked="true"]{background:var(--signal);}
.ak-toggle[disabled]{opacity:.4;cursor:not-allowed;}
.ak-toggle__knob{position:absolute;top:50%;transform:translateY(-50%);
  background:var(--knob);border-radius:9999px;box-shadow:0 1px 2px rgba(0,0,0,.4);
  transition:left var(--dur-base) var(--ease-standard);}
.ak-toggle--md{width:44px;height:24px;}
.ak-toggle--md .ak-toggle__knob{width:18px;height:18px;left:3px;}
.ak-toggle--md[aria-checked="true"] .ak-toggle__knob{left:23px;}
.ak-toggle--sm{width:36px;height:20px;}
.ak-toggle--sm .ak-toggle__knob{width:14px;height:14px;left:3px;}
.ak-toggle--sm[aria-checked="true"] .ak-toggle__knob{left:19px;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-toggle-css")) {
  const el = document.createElement("style");
  el.id = "ak-toggle-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Toggle({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  className = "",
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      className={`ak-toggle ak-toggle--${size} ${className}`}
      style={style}
      {...rest}
    >
      <span className="ak-toggle__knob" />
    </button>
  );
}
