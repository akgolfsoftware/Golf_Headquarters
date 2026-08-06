import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-vscrub-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-vscrub{display:flex;flex-direction:column;gap:4px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-vscrub-mark{position:relative;height:18px;min-width:0}
.akhq-vscrub-spor{position:relative;min-width:0}
.akhq-vscrub-in{--floor:0px;appearance:none;width:100%;height:max(24px,var(--floor));margin:0;background:transparent;cursor:pointer;display:block}
.akhq-vscrub-in::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:linear-gradient(to right, var(--fg) var(--fyll,0%), var(--soft-hover) var(--fyll,0%))}
.akhq-vscrub-in::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:var(--fg);border:2px solid var(--bg);box-shadow:0 0 0 1px var(--fg);margin-top:-5px}
.akhq-vscrub-in::-moz-range-track{height:4px;border-radius:999px;background:var(--soft-hover)}
.akhq-vscrub-in::-moz-range-progress{height:4px;border-radius:999px;background:var(--fg)}
.akhq-vscrub-in::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--fg);border:2px solid var(--bg);box-sizing:border-box}
.akhq-vscrub-in:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-vscrub-tid{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-vscrub-naa{color:var(--fg);font-weight:600}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-vscrub-in{--floor:44px}}
[data-coarse-test] .akhq-vscrub-in{--floor:44px}
}
@layer akhq-modifier{
.akhq-vscrub--kompakt .akhq-vscrub-mark{height:14px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-vscrub")) { const s = document.createElement("style"); s.id = "akhq-css-vscrub"; s.textContent = css; document.head.appendChild(s); }
/* Videoscrubberen for svinganalyse: native range-input (tastatur og
   skjermleser gratis) med blekk-fylt spor, og et markørfelt OVER sporet
   der PositionMarker-barna plasseres (P-posisjonene i klippet). Kontrollert:
   value/onChange i bildenummer eller millisekunder — konsumenten eier
   avspillingen. Grensen mot Slider (forms): Slider er en skjemaverdi;
   scrubberen er tidsnavigasjon i video med markørspor. */
export function VideoScrubber({
  value = 0, max = 100, onChange, currentLabel, endLabel, markers, compact = false,
  dataOdId = "videoscrubber", ...rest
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="akhq-vscrub-wrap">
      <div className={"akhq-vscrub" + (compact ? " akhq-vscrub--kompakt" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
        {markers && <div className="akhq-vscrub-mark">{markers}</div>}
        <span className="akhq-vscrub-spor">
          <input type="range" className="akhq-vscrub-in" min={0} max={max} value={value}
            onChange={onChange ? (e) => onChange(Number(e.target.value)) : undefined}
            readOnly={!onChange}
            style={{ "--fyll": pct + "%" }}
            aria-label="Spol i videoen" aria-valuetext={currentLabel}
            data-od-id={"cta-" + dataOdId} />
        </span>
        <span className="akhq-vscrub-tid" aria-hidden="true">
          <span className="akhq-vscrub-naa">{currentLabel}</span>
          <span>{endLabel}</span>
        </span>
      </div>
    </div>
  );
}
