import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dstrip-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-dstrip{--dh:52px;display:flex;gap:var(--s1);min-width:0;overflow-x:auto;padding-bottom:2px;font-family:var(--ui);color:var(--fg)}
.akhq-dstrip-d{--bgc:transparent;--tx:var(--muted);--bc:transparent;--floor:0px;position:relative;flex:1 0 44px;min-width:max(44px,var(--floor));min-height:max(var(--dh,52px),var(--floor));appearance:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:4px 2px;border:1px solid var(--bc);background:var(--bgc);color:var(--tx);border-radius:var(--r-sm);cursor:pointer;transition:background var(--dur) var(--ease),color var(--dur) var(--ease)}
.akhq-dstrip-d:hover,.akhq-dstrip-d[data-state=hover]{--bgc:var(--soft)}
.akhq-dstrip-d:focus-visible,.akhq-dstrip-d[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-dstrip-d[aria-checked=true]{--bgc:var(--cta);--tx:var(--on-cta)}
.akhq-dstrip-ud{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.akhq-dstrip-dt{font-family:var(--mono);font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.1}
.akhq-dstrip-m{width:4px;height:4px;border-radius:999px;background:currentColor;opacity:0}
.akhq-dstrip-d[data-idag] .akhq-dstrip-m{opacity:1}
.akhq-dstrip-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
}
@layer akhq-container{
@container (max-width:340px){.akhq-dstrip{--dh:48px}}
@media(pointer:coarse){.akhq-dstrip-d{--floor:44px}}
[data-coarse-test] .akhq-dstrip-d{--floor:44px}
}
@layer akhq-modifier{
.akhq-dstrip--ramme .akhq-dstrip-d{--bc:var(--border)}
.akhq-dstrip--ramme .akhq-dstrip-d[aria-checked=true]{--bc:var(--cta)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dstrip")) { const s = document.createElement("style"); s.id = "akhq-css-dstrip"; s.textContent = css; document.head.appendChild(s); }
/* PlayerHQs horisontale dagvelger: sju dager, valgt dag er blekkfylt, i dag
   har en prikk. Radiogroup med roving tabindex — ett tab-stopp, piltaster
   flytter. Grensen mot SegmentControl: DayStrip er datoforankret (ukedag +
   dato + i dag-markør), ikke en generisk verdibryter. Grensen mot DatePicker:
   DayStrip velger blant synlige dager i én uke; DatePicker velger vilkårlig
   dato i et rutenett. */
export function DayStrip({
  days = [], value, onChange, framed = false, dataOdId = "dagvelger", ...rest
}) {
  const refs = React.useRef([]);
  const valgtIdx = Math.max(0, days.findIndex((d) => d.key === value));
  const flytt = (fra, delta) => {
    const til = (fra + delta + days.length) % days.length;
    if (onChange) onChange(days[til].key);
    const n = refs.current[til];
    if (n) n.focus();
  };
  const tast = (idx) => (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); flytt(idx, 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); flytt(idx, -1); }
  };
  return (
    <div className="akhq-dstrip-wrap">
      <div className={"akhq-dstrip" + (framed ? " akhq-dstrip--ramme" : "")} role="radiogroup" aria-label="Velg dag" data-od-id={"nav-" + dataOdId} {...rest}>
        {days.map((d, i) => (
          <button type="button" role="radio" key={d.key} className="akhq-dstrip-d"
            ref={(n) => { refs.current[i] = n; }}
            aria-checked={d.key === value}
            tabIndex={i === valgtIdx ? 0 : -1}
            onKeyDown={tast(i)}
            data-idag={d.today ? "" : undefined}
            onClick={onChange ? () => onChange(d.key) : undefined}
            data-od-id={"cta-" + dataOdId + "-" + d.key}>
            <span className="akhq-dstrip-ud" aria-hidden="true">{d.weekday}</span>
            <span className="akhq-dstrip-dt" aria-hidden="true">{d.date}</span>
            <span className="akhq-dstrip-m" aria-hidden="true" />
            <span className="akhq-dstrip-sr">{d.full || d.weekday + " " + d.date}{d.today ? " (i dag)" : ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
