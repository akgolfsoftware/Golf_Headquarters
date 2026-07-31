import React from "react";
import { nf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-goal", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-goal{font-family:var(--ui)}
.akhq-goal-nums{display:flex;justify-content:space-between;align-items:baseline;margin-top:6px}
.akhq-goal-val{font-family:var(--mono);font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--fg)}
.akhq-goal-target{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-goal-bar{position:relative;height:6px;background:var(--soft);border-radius:var(--r-pill);margin-top:8px}
.akhq-goal-fill{position:absolute;inset:0 auto 0 0;background:var(--fg);border-radius:var(--r-pill)}
.akhq-goal-win{font-size:11px;color:var(--muted);margin-top:6px}
}
`);
export function GoalProgress({ label, value = 0, target = 1, unit, decimals = 0, window: win, state = "content", emptyText = "Sett et m\u00e5l sammen med treneren for \u00e5 f\u00f8lge fremdrift her.", dataOdId = "kpi-goal", ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / target) * 100));
  return (
    <Region state={state} empty={emptyText} height={70}>
      <div className="akhq-goal" data-od-id={dataOdId} {...rest}>
        <span className="akhq-lab">{label}</span>
        <div className="akhq-goal-nums">
          <span className="akhq-goal-val">{nf(value, decimals)}{unit && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}> {unit}</span>}</span>
          <span className="akhq-goal-target">mål {nf(target, decimals)}{unit ? " " + unit : ""}</span>
        </div>
        <div className="akhq-goal-bar"><div className="akhq-goal-fill" style={{ width: pct + "%" }}></div></div>
        {win && <div className="akhq-goal-win">{win}</div>}
      </div>
    </Region>
  );
}
