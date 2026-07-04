import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Input
 * Text field with optional leading icon, a pill search variant, focus ring and
 * error state. Dark by default; inherits the light theme inside a .light scope.
 */

const CSS = `
.ak-field{display:flex;flex-direction:column;width:100%;}
.ak-field__box{position:relative;display:flex;align-items:center;width:100%;}
.ak-input{width:100%;font-family:var(--font-ui);font-size:var(--text-14);color:var(--text);
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-input);
  height:44px;padding:0 14px;outline:none;
  transition:border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard);}
.ak-input::placeholder{color:var(--text-muted);}
.ak-input:hover:not(:disabled){border-color:var(--border-strong);}
.ak-input:focus{border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-input:disabled{opacity:.5;cursor:not-allowed;}
.ak-input--sm{height:36px;font-size:var(--text-13);}
.ak-input--search{border-radius:var(--radius-pill);background:var(--surface-2);}
.ak-field--icon .ak-input{padding-left:42px;}
.ak-field--trail .ak-input{padding-right:42px;}
.ak-field__icon{position:absolute;left:14px;color:var(--text-muted);pointer-events:none;display:flex;}
.ak-field__trail{position:absolute;right:12px;color:var(--text-muted);display:flex;}
.ak-input--error{border-color:var(--down);}
.ak-input--error:focus{box-shadow:0 0 0 1px color-mix(in srgb,var(--down) 45%,transparent);}
.ak-field__msg{margin-top:6px;font-size:var(--text-12);font-family:var(--font-ui);color:var(--down);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-input-css")) {
  const el = document.createElement("style");
  el.id = "ak-input-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Input({
  leadingIcon,
  trailing,
  variant = "text",
  size = "md",
  error,
  disabled = false,
  className = "",
  style,
  ...rest
}) {
  const isSearch = variant === "search";
  const icon = leadingIcon || (isSearch ? "search" : null);
  const hasError = !!error;
  const boxCls = ["ak-field__box", icon ? "ak-field--icon" : "", trailing ? "ak-field--trail" : ""]
    .filter(Boolean)
    .join(" ");
  const inputCls = [
    "ak-input",
    `ak-input--${size}`,
    isSearch ? "ak-input--search" : "",
    hasError ? "ak-input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <label className="ak-field" style={style}>
      <div className={boxCls}>
        {icon && (
          <span className="ak-field__icon">
            {typeof icon === "string" ? <Icon name={icon} size={18} /> : icon}
          </span>
        )}
        <input className={inputCls} disabled={disabled} aria-invalid={hasError} {...rest} />
        {trailing && <span className="ak-field__trail">{trailing}</span>}
      </div>
      {typeof error === "string" && error && <span className="ak-field__msg">{error}</span>}
    </label>
  );
}
