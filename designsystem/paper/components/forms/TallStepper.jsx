import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ts{display:inline-flex;align-items:center;gap:0;border:1px solid var(--border);border-radius:var(--r-pill);background:var(--surface);font-family:var(--ui)}
.akhq-ts-btn{--floor:0px;display:flex;align-items:center;justify-content:center;width:max(36px,var(--floor));height:max(36px,var(--floor));border:none;background:transparent;color:var(--fg);font-size:16px;line-height:1;cursor:pointer;flex:none;padding:0}
.akhq-ts-btn:hover:not(:disabled){background:var(--soft)}
.akhq-ts-btn:active:not(:disabled){background:var(--soft-hover,var(--soft))}
.akhq-ts-btn:disabled{opacity:.35;cursor:not-allowed}
.akhq-ts-btn:focus-visible{outline:2px solid var(--focus);outline-offset:-2px;border-radius:var(--r-pill)}
.akhq-ts-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:44px;padding:0 var(--s2)}
.akhq-ts-val{font-family:var(--mono);font-size:15px;font-weight:600;color:var(--fg);font-variant-numeric:tabular-nums;line-height:1}
.akhq-ts-unit{font-family:var(--mono);font-size:9.5px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;line-height:1.4}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-ts-btn{--floor:44px}}
[data-coarse-test] .akhq-ts-btn{--floor:44px}
}
@layer akhq-modifier{
.akhq-ts--kompakt .akhq-ts-mid{min-width:32px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ts")) { const s = document.createElement("style"); s.id = "akhq-css-ts"; s.textContent = css; document.head.appendChild(s); }
const tall = (n) => (typeof n === "number" ? String(Math.round(n * 10) / 10).replace(".", ",") : n);
/* Numerisk stepper: −/verdi/+. Ingen tastatur-inntasting — reps og sett er
   telling, ikke tekst, og telling gjøres raskest med to knapper. Delt av
   okt-detaljs rediger-tilstand, live-øktas FYS-justering og
   onboarding-tillegget (VOKABULAR §3.4 / manifestene 20.08.2026). */
export function TallStepper({ value = 0, onChange, min = 0, max, step = 1, unit, label, kompakt = false, disabled = false, dataOdId = "felt-tallstepper" }) {
  const kanNed = !disabled && value - step >= min;
  const kanOpp = !disabled && (max === undefined || value + step <= max);
  const juster = (delta) => onChange && onChange(Math.min(max ?? Infinity, Math.max(min, value + delta)));
  return (
    <div className={"akhq-ts" + (kompakt ? " akhq-ts--kompakt" : "")} data-od-id={dataOdId} role="group" aria-label={label || "Tallstepper"}>
      <button type="button" className="akhq-ts-btn" onClick={() => juster(-step)} disabled={!kanNed} aria-label="Reduser" data-od-id={dataOdId + "-ned"}>−</button>
      <span className="akhq-ts-mid">
        <span className="akhq-ts-val" aria-live="polite">{tall(value)}</span>
        {unit && <span className="akhq-ts-unit">{unit}</span>}
      </span>
      <button type="button" className="akhq-ts-btn" onClick={() => juster(step)} disabled={!kanOpp} aria-label="Øk" data-od-id={dataOdId + "-opp"}>+</button>
    </div>
  );
}
