import React from "react";

/**
 * AK Golf HQ — Slider
 * Range input styled with a lime fill track and custom thumb.
 * Optional label + value display. min/max/step configurable.
 */

const CSS = `
.ak-slider-wrap{display:flex;flex-direction:column;gap:8px;width:100%;}
.ak-slider-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.ak-slider-lbl{font-size:var(--text-14);color:var(--text-2);}
.ak-slider-val{
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:600;
  color:var(--text);font-variant-numeric:tabular-nums;
}
input[type=range].ak-slider{
  -webkit-appearance:none;appearance:none;
  width:100%;height:4px;border-radius:9999px;outline:none;cursor:pointer;
  background:linear-gradient(to right,
    var(--signal) var(--pct,0%), var(--track) var(--pct,0%));
}
input[type=range].ak-slider::-webkit-slider-thumb{
  -webkit-appearance:none;width:18px;height:18px;border-radius:9999px;
  background:var(--graphite-900);border:2px solid var(--signal);
  box-shadow:0 0 0 2px var(--bg);cursor:pointer;
  transition:transform var(--dur-fast) var(--ease-standard);
}
input[type=range].ak-slider::-webkit-slider-thumb:hover{transform:scale(1.15);}
input[type=range].ak-slider::-moz-range-thumb{
  width:18px;height:18px;border-radius:9999px;
  background:var(--graphite-900);border:2px solid var(--signal);cursor:pointer;
}
input[type=range].ak-slider:focus-visible{box-shadow:var(--glow-signal);}
input[type=range].ak-slider:disabled{opacity:.38;cursor:not-allowed;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-slider-css")) {
  const s = document.createElement("style");
  s.id = "ak-slider-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Slider({
  label,
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatValue,
  disabled = false,
  className = "",
  style,
}) {
  const pct = `${((value - min) / (max - min)) * 100}%`;
  return (
    <div className={`ak-slider-wrap ${className}`} style={style}>
      {(label || formatValue !== undefined) && (
        <div className="ak-slider-hd">
          {label && <span className="ak-slider-lbl">{label}</span>}
          <span className="ak-slider-val">{formatValue ? formatValue(value) : value}</span>
        </div>
      )}
      <input
        type="range"
        className="ak-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ "--pct": pct }}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
      />
    </div>
  );
}
