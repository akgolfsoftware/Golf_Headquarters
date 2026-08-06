import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ukal-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-ukal{--gap:var(--s3);display:flex;flex-direction:column;gap:var(--gap);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-ukal-hd{display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;min-width:0}
.akhq-ukal-titler{display:flex;align-items:baseline;gap:var(--s2);min-width:0}
.akhq-ukal-uke{margin:0;font-size:16px;font-weight:600;white-space:nowrap}
.akhq-ukal-range{--range:inline;display:var(--range);font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-ukal-nav{display:flex;align-items:center;gap:var(--s1);margin-left:auto;flex:none}
.akhq-ukal-btn{--h:32px;--px:12px;--floor:0px;appearance:none;border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:12.5px;font-weight:500;padding:0 var(--px);min-height:max(var(--h),var(--floor));min-width:max(var(--h),var(--floor));border-radius:var(--r-sm);cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-ukal-btn:hover,.akhq-ukal-btn[data-state=hover]{background:var(--soft)}
.akhq-ukal-btn:focus-visible,.akhq-ukal-btn[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-ukal-btn--ik{--px:0px;font-size:15px;line-height:1}
.akhq-ukal-body{min-width:0}
}
@layer akhq-container{
@container (max-width:560px){.akhq-ukal{--gap:var(--s2)}.akhq-ukal-range{--range:none}}
@media(pointer:coarse){.akhq-ukal-btn{--floor:44px}}
[data-coarse-test] .akhq-ukal-btn{--floor:44px}
}
@layer akhq-modifier{
.akhq-ukal--kompakt{--gap:var(--s2)}
.akhq-ukal--kompakt .akhq-ukal-range{--range:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ukal")) { const s = document.createElement("style"); s.id = "akhq-css-ukal"; s.textContent = css; document.head.appendChild(s); }
/* Ukevisningens RAMME: uketall, datospenn, «I dag» og forrige/neste — pluss et
   valgfritt toolbar-slot (VisningsVelger hører hjemme der). Lerretet er
   children: TimeGrid i Workbench/Kalender, en AgendaRow-liste i smal spalte.
   Rammen eier navigasjonen; lerretet eier tiden. Samme skille som
   TimeGrid/Workbench: anatomi i biblioteket, oppførsel i konsumenten. */
export function UkeKalender({
  weekLabel, rangeLabel, onPrev, onNext, onToday, toolbar,
  state = "content",
  emptyText = "Ingen økter planlagt denne uken. Åpne Workbench for å legge inn den første.",
  compact = false, children, dataOdId = "ukal", ...rest
}) {
  return (
    <section className="akhq-ukal-wrap">
      <div className={"akhq-ukal" + (compact ? " akhq-ukal--kompakt" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
        <header className="akhq-ukal-hd">
          <div className="akhq-ukal-titler">
            <h2 className="akhq-ukal-uke">{weekLabel}</h2>
            {rangeLabel && <span className="akhq-ukal-range">{rangeLabel}</span>}
          </div>
          <div className="akhq-ukal-nav">
            {toolbar}
            {onToday && <button type="button" className="akhq-ukal-btn" onClick={onToday} data-od-id={"cta-" + dataOdId + "-idag"}>I dag</button>}
            {onPrev && <button type="button" className="akhq-ukal-btn akhq-ukal-btn--ik" onClick={onPrev} aria-label="Forrige uke" data-od-id={"cta-" + dataOdId + "-forrige"}>{"‹"}</button>}
            {onNext && <button type="button" className="akhq-ukal-btn akhq-ukal-btn--ik" onClick={onNext} aria-label="Neste uke" data-od-id={"cta-" + dataOdId + "-neste"}>{"›"}</button>}
          </div>
        </header>
        <div className="akhq-ukal-body">
          <Region state={state} empty={emptyText}>{children}</Region>
        </div>
      </div>
    </section>
  );
}
