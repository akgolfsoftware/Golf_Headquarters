import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sld{display:flex;flex-direction:column;gap:6px;width:100%;min-width:0;font-family:var(--ui)}
.akhq-sld-top{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-sld-val{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-sld-in{--h:24px;--floor:0px;width:100%;height:max(var(--h),var(--floor));margin:0;background:transparent;appearance:none;cursor:pointer}
.akhq-sld-in:focus-visible{outline:2px solid var(--focus);outline-offset:4px;border-radius:var(--r-sm)}
.akhq-sld-in::-webkit-slider-runnable-track{height:4px;border-radius:var(--r-pill);background:var(--border)}
.akhq-sld-in::-moz-range-track{height:4px;border-radius:var(--r-pill);background:var(--border)}
.akhq-sld-in::-webkit-slider-thumb{appearance:none;width:18px;height:18px;margin-top:-7px;border-radius:50%;background:var(--fg);border:2px solid var(--surface);box-shadow:var(--shadow)}
.akhq-sld-in::-moz-range-thumb{width:18px;height:18px;border:2px solid var(--surface);border-radius:50%;background:var(--fg)}
.akhq-sld-in:disabled{opacity:.4;cursor:not-allowed}
.akhq-sld-skala{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--muted)}
.akhq-sld-merke{position:relative;height:0}
.akhq-sld-note{font-family:var(--mono);font-size:11px;color:var(--muted)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-sld-in{--floor:44px}}
[data-coarse-test] .akhq-sld-in{--floor:44px}
}
@layer akhq-modifier{
.akhq-sld--dn .akhq-sld-val{color:var(--dn)}
.akhq-sld--up .akhq-sld-val{color:var(--up)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sld")) { const s = document.createElement("style"); s.id = "akhq-css-sld"; s.textContent = css; document.head.appendChild(s); }
/* Skyvekontroll for verdier der omtrentlig er godt nok og retningen betyr
   noe: ukevolum, intensitet, vekting. Er tallet en presis inntasting
   (klubbhastighet, pris), er kontrollen et tallfelt — en slider som må
   treffe eksakt er et tastatur uten taster.

   Verdien vises alltid som tall ved siden av. En slider uten avlesning er
   en gest uten svar. */
export function Slider({ min = 0, max = 100, step = 1, value, onChange, unit = "", note, scale, tone, disabled, dataOdId = "felt-slider", ...rest }) {
  const vis = (v) => (unit ? v + " " + unit : String(v));
  return (
    <div className={"akhq-sld" + (tone === "dn" ? " akhq-sld--dn" : tone === "up" ? " akhq-sld--up" : "")} data-od-id={dataOdId}>
      <div className="akhq-sld-top">
        <span className="akhq-sld-val" aria-hidden="true">{vis(value)}</span>
      </div>
      <input className="akhq-sld-in" type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        aria-valuetext={vis(value)} onChange={(e) => onChange && onChange(Number(e.target.value), e)} {...rest} />
      <div className="akhq-sld-skala">
        <span>{vis(scale ? scale[0] : min)}</span>
        <span>{vis(scale ? scale[1] : max)}</span>
      </div>
      {note && <span className="akhq-sld-note">{note}</span>}
    </div>
  );
}
