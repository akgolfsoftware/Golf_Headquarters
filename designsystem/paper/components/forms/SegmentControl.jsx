import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-seg{--pad:2px;padding:var(--pad);display:inline-flex;background:var(--soft);border:1px solid var(--border);border-radius:var(--r-pill);font-family:var(--ui);gap:2px}
.akhq-seg-btn{--h:28px;--floor:0px;min-height:max(var(--h),var(--floor));height:max(var(--h),var(--floor));padding:0 var(--s4);border-radius:var(--r-pill);border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;transition:background var(--dur) var(--ease),color var(--dur) var(--ease);font-family:inherit}
.akhq-seg-btn:hover:not([aria-pressed=true]):not(:disabled),.akhq-seg-btn[data-state=hover]{color:var(--fg)}
.akhq-seg-btn:active:not(:disabled),.akhq-seg-btn[data-state=active]{background:var(--bg)}
.akhq-seg-btn[aria-pressed=true]{background:var(--surface);color:var(--fg);box-shadow:inset 0 0 0 1px var(--border)}
.akhq-seg-btn:focus-visible,.akhq-seg-btn[data-state=focus]{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-seg-btn:disabled{opacity:.4;cursor:not-allowed}
}
@layer akhq-container{
/* Gulvet gjelder TREFFMÅLET — knappen — ikke den polstrede containeren.
   Var 40px til 28.07.2026: containeren ble da 44 (40 + 2×2 pad) og så riktig ut,
   men fingeren treffer knappen, og den var 4px under gulvet. Målt, ikke antatt. */
@media(pointer:coarse){.akhq-seg-btn{--floor:44px}.akhq-seg{--pad:2px}}
/* Stand-in: samme lag og vekt som spørringen over. */
[data-coarse-test] .akhq-seg-btn{--floor:44px}
[data-coarse-test] .akhq-seg{--pad:2px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-seg")) { const s = document.createElement("style"); s.id = "akhq-css-seg"; s.textContent = css; document.head.appendChild(s); }
export function SegmentControl({ options = [], value, onChange, disabled = false, dataOdId = "nav-segment", ...rest }) {
  return (
    <div className="akhq-seg" role="group" data-od-id={dataOdId} {...rest}>
      {options.map((opt) => (
        <button key={opt} type="button" className="akhq-seg-btn" aria-pressed={opt === value} disabled={disabled} onClick={() => onChange && onChange(opt)}>{opt}</button>
      ))}
    </div>
  );
}
