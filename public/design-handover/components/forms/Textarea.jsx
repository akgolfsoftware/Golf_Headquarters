import React from "react";

/**
 * AK Golf HQ — Textarea
 * Multi-line text input. Matches Input styling. error state adds a red border.
 * Optional maxLength shows a mono counter. resize="vertical" (default).
 */

const CSS = `
.ak-textarea{
  display:block;width:100%;box-sizing:border-box;
  padding:11px 13px;min-height:96px;
  background:var(--surface);border:1px solid var(--border-strong);
  border-radius:var(--radius-input);
  font-family:var(--font-ui);font-size:var(--text-14);
  color:var(--text);line-height:var(--leading-body);
  resize:vertical;outline:none;
  transition:border-color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard);
}
.ak-textarea::placeholder{color:var(--text-muted);}
.ak-textarea:hover{border-color:var(--text-muted);}
.ak-textarea:focus{border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-textarea:disabled{opacity:.38;cursor:not-allowed;resize:none;}
.ak-textarea--error{border-color:var(--error)!important;}
.ak-textarea-foot{
  display:flex;justify-content:flex-end;margin-top:4px;
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
  font-variant-numeric:tabular-nums;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-textarea-css")) {
  const s = document.createElement("style");
  s.id = "ak-textarea-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  error = false,
  maxLength,
  className = "",
  style,
  ...rest
}) {
  const len = typeof value === "string" ? value.length : 0;
  return (
    <div style={{ width: "100%" }}>
      <textarea
        className={`ak-textarea${error ? " ak-textarea--error" : ""} ${className}`}
        style={style}
        value={value}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => onChange && onChange(e.target.value)}
        {...rest}
      />
      {maxLength != null && (
        <div className="ak-textarea-foot">{len} / {maxLength}</div>
      )}
    </div>
  );
}
