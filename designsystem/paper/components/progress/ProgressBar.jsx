import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pbar{--h:6px;--track:var(--soft);--fill:var(--fg);font-family:var(--ui);min-width:0}
.akhq-pbar-top{display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);margin-bottom:6px}
.akhq-pbar-lab{font-size:12.5px;color:var(--muted);min-width:0}
.akhq-pbar-num{font-family:var(--mono);font-size:12px;font-variant-numeric:tabular-nums;color:var(--fg);flex:none}
.akhq-pbar-track{height:var(--h);border-radius:var(--r-pill);background:var(--track);overflow:hidden}
.akhq-pbar-fill{height:100%;border-radius:var(--r-pill);background:var(--fill);transition:width var(--dur) var(--ease)}
}
@layer akhq-modifier{
.akhq-pbar--up{--fill:var(--up-raw)}
.akhq-pbar--warn{--fill:var(--dn)}
.akhq-pbar--lg{--h:10px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-pbar")) { const s = document.createElement("style"); s.id = "akhq-css-pbar"; s.textContent = css; document.head.appendChild(s); }
export function ProgressBar({ value = 0, max = 100, label, valueText, tone = "ink", size = "md", dataOdId = "kpi-progress", ...rest }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const tekst = valueText !== undefined ? valueText : Math.round(pct) + " %";
  return (
    <div className={"akhq-pbar" + (tone !== "ink" ? " akhq-pbar--" + tone : "") + (size === "lg" ? " akhq-pbar--lg" : "")} data-od-id={dataOdId} {...rest}>
      {(label || tekst) && (
        <div className="akhq-pbar-top">
          {label && <span className="akhq-pbar-lab">{label}</span>}
          {tekst && <span className="akhq-pbar-num">{tekst}</span>}
        </div>
      )}
      <div className="akhq-pbar-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label ? undefined : "Fremdrift"} aria-valuetext={valueText}>
        <div className="akhq-pbar-fill" style={{ width: pct + "%" }}></div>
      </div>
    </div>
  );
}
