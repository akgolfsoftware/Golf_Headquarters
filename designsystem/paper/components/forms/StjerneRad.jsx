import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sr{display:flex;flex-direction:column;gap:6px;font-family:var(--ui)}
.akhq-sr-lab{font-size:13px;color:var(--fg)}
.akhq-sr-rad{display:flex;gap:2px}
.akhq-sr-btn{--floor:0px;display:flex;align-items:center;justify-content:center;width:max(32px,var(--floor));height:max(32px,var(--floor));border:none;background:none;padding:0;cursor:pointer;flex:none}
.akhq-sr-btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:var(--r-sm)}
.akhq-sr-stjerne{width:22px;height:22px;fill:none;stroke:var(--mid);stroke-width:1.5}
.akhq-sr-btn--fylt .akhq-sr-stjerne{fill:var(--fg);stroke:var(--fg)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-sr-btn{--floor:44px}}
[data-coarse-test] .akhq-sr-btn{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sr")) { const s = document.createElement("style"); s.id = "akhq-css-sr"; s.textContent = css; document.head.appendChild(s); }
const STJERNE_PATH = "M12 2.5l2.9 6.3 6.8.8-5 4.8 1.3 6.8-6-3.4-6 3.4 1.3-6.8-5-4.8 6.8-.8z";
/* 1–5-vurderingsrad med SVG-stjerner. Spillerens egen vurdering av fokus,
   gjennomføring og mestring etter en økt — aldri en karakter fra systemet
   (manifest playerhq-live-summary, 20.08.2026). Fylt stjerne er --fg, ALDRI
   --accent (oransje er reservert «Én ting nå»). Ingen minsteverdi. */
export function StjerneRad({ label, verdi = 0, onChange, dataOdId = "stjernerad" }) {
  return (
    <div className="akhq-sr" data-od-id={dataOdId}>
      {label && <span className="akhq-sr-lab" id={dataOdId + "-lab"}>{label}</span>}
      <div className="akhq-sr-rad" role="radiogroup" aria-labelledby={label ? dataOdId + "-lab" : undefined} aria-label={label ? undefined : "Vurdering, 1 til 5"}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={"akhq-sr-btn" + (n <= verdi ? " akhq-sr-btn--fylt" : "")}
            role="radio" aria-checked={n === verdi} aria-label={n + " av 5"}
            onClick={() => onChange && onChange(n)} data-od-id={dataOdId + "-" + n}>
            <svg className="akhq-sr-stjerne" viewBox="0 0 24 24" aria-hidden="true"><path d={STJERNE_PATH} /></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
