import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — Stepper
 * Wizard step indicator. Active step has a lime-bordered circle.
 * Completed steps show a check in a lime-filled circle.
 * Connector line between steps turns lime when the left step is complete.
 */

const CSS = `
.ak-stepper{display:flex;align-items:flex-start;}
.ak-step{
  flex:1;display:flex;flex-direction:column;
  align-items:center;gap:6px;position:relative;
}
.ak-step:not(:last-child)::after{
  content:'';position:absolute;
  top:14px;left:calc(50% + 16px);
  right:calc(-50% + 16px);
  height:1px;background:var(--border);
  transition:background var(--dur-base) var(--ease-standard);
}
.ak-step--done:not(:last-child)::after{background:var(--signal);}
.ak-step__circle{
  width:28px;height:28px;border-radius:9999px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;
  border:1.5px solid var(--border-strong);background:var(--bg);
  font-family:var(--font-mono);font-size:11px;font-weight:700;
  color:var(--text-muted);
  transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-step--active .ak-step__circle{
  border-color:var(--signal);color:var(--text);background:var(--surface-2);
}
.ak-step--done .ak-step__circle{
  border-color:var(--signal);background:var(--signal);color:var(--on-signal);
}
.ak-step__lbl{
  font-size:var(--text-12);font-weight:500;color:var(--text-muted);
  text-align:center;line-height:1.3;
}
.ak-step--active .ak-step__lbl{color:var(--text);}
.ak-step--done .ak-step__lbl{color:var(--text-2);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-stepper-css")) {
  const s = document.createElement("style");
  s.id = "ak-stepper-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Stepper({ steps = [], current = 0, className = "", style }) {
  return (
    <div className={`ak-stepper ${className}`} style={style}>
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div key={i} className={`ak-step${state ? ` ak-step--${state}` : ""}`}>
            <div className="ak-step__circle">
              {i < current ? <Icon name="check" size={13} /> : i + 1}
            </div>
            <span className="ak-step__lbl">{typeof step === "string" ? step : step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
