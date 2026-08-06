import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-vvelg-wrap{container-type:inline-size;display:grid;width:100%;min-width:0;justify-items:start}
.akhq-vvelg{--h:32px;--px:12px;display:inline-flex;gap:2px;padding:2px;background:var(--soft);border-radius:var(--r-sm);box-sizing:border-box;font-family:var(--ui);max-width:100%;overflow-x:auto}
.akhq-vvelg-btn{--bgc:transparent;--floor:0px;appearance:none;border:0;background:var(--bgc);color:var(--muted);font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:0 var(--px,12px);min-height:max(var(--h,32px),var(--floor));min-width:max(var(--h,32px),var(--floor));border-radius:calc(var(--r-sm) - 2px);cursor:pointer;white-space:nowrap;transition:background var(--dur) var(--ease),color var(--dur) var(--ease)}
.akhq-vvelg-btn:hover,.akhq-vvelg-btn[data-state=hover]{color:var(--fg)}
.akhq-vvelg-btn:focus-visible,.akhq-vvelg-btn[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-vvelg-btn[aria-checked=true]{--bgc:var(--surface);color:var(--fg);box-shadow:inset 0 0 0 1px var(--border)}
}
@layer akhq-container{
@container (max-width:360px){.akhq-vvelg{--px:8px}}
@media(pointer:coarse){.akhq-vvelg-btn{--floor:44px}}
[data-coarse-test] .akhq-vvelg-btn{--floor:44px}
}
@layer akhq-modifier{
.akhq-vvelg--blokk{display:flex;width:100%}
.akhq-vvelg--blokk .akhq-vvelg-btn{flex:1}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-vvelg")) { const s = document.createElement("style"); s.id = "akhq-css-vvelg"; s.textContent = css; document.head.appendChild(s); }
export const VISNINGER = [
  { key: "dag", label: "Dag" },
  { key: "uke", label: "Uke" },
  { key: "maaned", label: "Måned" },
  { key: "periode", label: "Periode" },
  { key: "agenda", label: "Agenda" },
];
/* Kalenderens visningsbryter: Dag · Uke · Måned · Periode · Agenda — en
   LUKKET union med fast rekkefølge og faste etiketter, så bytteknappen leser
   likt i Workbench, Kalenderen og PlayerHQ. Grensen mot SegmentControl:
   SegmentControl bytter vilkårlige verdier; VisningsVelger bytter KALENDER-
   visning og eier vokabularet. Trengs en ny visning, utvides VISNINGER her —
   aldri per skjerm. Radiogroup med roving tabindex. */
export function VisningsVelger({
  value = "uke", onChange, views, block = false, dataOdId = "visning", ...rest
}) {
  const alle = views ? VISNINGER.filter((v) => views.includes(v.key)) : VISNINGER;
  const refs = React.useRef([]);
  const valgtIdx = Math.max(0, alle.findIndex((v) => v.key === value));
  const flytt = (fra, delta) => {
    const til = (fra + delta + alle.length) % alle.length;
    if (onChange) onChange(alle[til].key);
    const n = refs.current[til];
    if (n) n.focus();
  };
  const tast = (idx) => (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); flytt(idx, 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); flytt(idx, -1); }
  };
  return (
    <div className="akhq-vvelg-wrap">
      <div className={"akhq-vvelg" + (block ? " akhq-vvelg--blokk" : "")} role="radiogroup" aria-label="Kalendervisning" data-od-id={"nav-" + dataOdId} {...rest}>
        {alle.map((v, i) => (
          <button type="button" role="radio" key={v.key} className="akhq-vvelg-btn"
            ref={(n) => { refs.current[i] = n; }}
            aria-checked={v.key === value}
            tabIndex={i === valgtIdx ? 0 : -1}
            onKeyDown={tast(i)}
            onClick={onChange ? () => onChange(v.key) : undefined}
            data-od-id={"cta-" + dataOdId + "-" + v.key}>
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
