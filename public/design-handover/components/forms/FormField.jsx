import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — FormField
 * Label + control + hint + error wrapper. Wraps any form control.
 * required adds a red asterisk. error renders an alert line with icon.
 */

const CSS = `
.ak-field{display:flex;flex-direction:column;gap:6px;width:100%;}
.ak-field__lbl{
  font-size:var(--text-13);font-weight:500;color:var(--text-2);
  display:flex;align-items:center;gap:4px;
}
.ak-field__req{color:var(--error);}
.ak-field__hint{font-size:var(--text-12);color:var(--text-muted);line-height:1.4;}
.ak-field__err{
  display:flex;align-items:center;gap:5px;
  font-size:var(--text-12);color:var(--error);line-height:1.4;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-field-css")) {
  const s = document.createElement("style");
  s.id = "ak-field-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function FormField({
  label,
  required = false,
  hint,
  error,
  children,
  htmlFor,
  className = "",
  style,
}) {
  return (
    <div className={`ak-field ${className}`} style={style}>
      {label && (
        <label className="ak-field__lbl" htmlFor={htmlFor}>
          {label}
          {required && <span className="ak-field__req" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="ak-field__err" role="alert">
          <Icon name="circle-alert" size={13} />
          {error}
        </span>
      ) : hint ? (
        <span className="ak-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
