import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ht{display:flex;gap:var(--s2);width:100%}
.akhq-ht-btn{--floor:0px;flex:1;min-height:max(36px,var(--floor));display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);color:var(--fg);font-family:var(--mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;cursor:pointer}
.akhq-ht-btn:hover:not(:disabled){background:var(--soft)}
.akhq-ht-btn:active:not(:disabled){background:var(--soft-hover,var(--soft))}
.akhq-ht-btn:disabled{opacity:.4;cursor:not-allowed}
.akhq-ht-btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-ht-btn{--floor:44px}}
[data-coarse-test] .akhq-ht-btn{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ht")) { const s = document.createElement("style"); s.id = "akhq-css-ht"; s.textContent = css; document.head.appendChild(s); }
/* Hurtigtapp-rad under hovedtapperne i live-økt: +5/+10/+25 i stedet for
   femten trykk på +1. Ren tilleggshandling — den erstatter aldri
   hovedtelleren, kun raden under den (manifest playerhq-live-okt,
   20.08.2026). */
export function HurtigTapper({ steg = [5, 10, 25], onTapp, disabled = false, dataOdId = "hurtigtapper" }) {
  return (
    <div className="akhq-ht" data-od-id={dataOdId} role="group" aria-label="Hurtigtapp">
      {steg.map((n) => (
        <button type="button" key={n} className="akhq-ht-btn" disabled={disabled}
          onClick={() => onTapp && onTapp(n)} aria-label={"Legg til " + n} data-od-id={dataOdId + "-" + n}>
          +{n}
        </button>
      ))}
    </div>
  );
}
