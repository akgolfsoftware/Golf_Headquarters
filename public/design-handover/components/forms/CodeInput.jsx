import React, { useState, useRef, useEffect } from "react";

/**
 * AK Golf HQ — CodeInput
 * Separate digit boxes for verification codes (4–6). Big tabular mono, focus
 * ring per box, auto-advance, backspace-back and paste-to-fill.
 */

const CSS = `
.ak-code{display:flex;gap:10px;}
.ak-code__box{width:48px;height:56px;text-align:center;font-family:var(--font-mono);
  font-weight:600;font-size:var(--text-24);color:var(--text);background:var(--surface);
  border:1px solid var(--border);border-radius:var(--radius-input);outline:none;
  font-variant-numeric:tabular-nums;caret-color:var(--signal);
  transition:border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard);}
.ak-code__box:focus{border-color:var(--signal);box-shadow:var(--glow-signal);}
.ak-code__box--filled{border-color:var(--border-strong);}
.ak-code--error .ak-code__box{border-color:var(--down);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-code-css")) {
  const el = document.createElement("style");
  el.id = "ak-code-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  error = false,
  autoFocus = false,
  disabled = false,
  className = "",
  style,
}) {
  const fill = (v) => Array.from({ length }, (_, i) => (v ? v[i] || "" : ""));
  const [digits, setDigits] = useState(() => fill(value));
  const refs = useRef([]);

  useEffect(() => {
    if (value != null) setDigits(fill(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const emit = (next) => {
    setDigits(next);
    onChange && onChange(next.join(""));
  };

  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    emit(next);
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = fill(text);
    emit(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className={`ak-code ${error ? "ak-code--error" : ""} ${className}`} style={style}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`ak-code__box ${d ? "ak-code__box--filled" : ""}`}
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          aria-label={`Siffer ${i + 1}`}
        />
      ))}
    </div>
  );
}
