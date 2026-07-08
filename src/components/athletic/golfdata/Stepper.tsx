import type React from "react";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — Stepper
 * Wizard step indicator. Active step has a lime-bordered circle.
 * Completed steps show a check in a lime-filled circle.
 * Connector line between steps turns lime when the left step is complete.
 * Portet 1:1 fra Claude Design-prosjektets components/structure/Stepper.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-stepper).
 */

export type StepItem = string | { label: string };

export type StepperProps = {
  steps?: StepItem[];
  current?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function Stepper({ steps = [], current = 0, className = "", style }: StepperProps) {
  return (
    <div className={`ak-stepper ${className}`} style={style}>
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div key={i} className={`ak-step${state ? ` ak-step--${state}` : ""}`}>
            <div className="ak-step__circle">{i < current ? <Icon name="check" size={13} /> : i + 1}</div>
            <span className="ak-step__lbl">{typeof step === "string" ? step : step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
