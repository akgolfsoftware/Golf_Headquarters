import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-traj-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-traj{--h:120px;display:flex;flex-direction:column;gap:4px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-traj-svg{display:block;width:100%;height:var(--h);border-bottom:1px solid var(--hairline)}
.akhq-traj-skudd{fill:none;stroke:var(--mid);stroke-width:1;opacity:.45;vector-effect:non-scaling-stroke}
.akhq-traj-snitt{fill:none;stroke:var(--fg);stroke-width:2;vector-effect:non-scaling-stroke}
.akhq-traj-fot{display:flex;justify-content:space-between;font-family:var(--mono);font-size:9.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-traj-nokkel{display:flex;gap:var(--s4);font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-traj-nv{color:var(--fg);font-weight:600}
}
@layer akhq-container{
@container (max-width:380px){.akhq-traj{--h:88px}}
}
@layer akhq-modifier{
.akhq-traj--lav{--h:88px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-traj")) { const s = document.createElement("style"); s.id = "akhq-css-traj"; s.textContent = css; document.head.appendChild(s); }
const bane = (carry, apex, maxCarry, maxHeight) => {
  const steg = 24;
  const pts = [];
  for (let i = 0; i <= steg; i++) {
    const t = i / steg;
    const x = (carry * t / maxCarry) * 100;
    const y = 40 - (apex * 4 * t * (1 - t) / maxHeight) * 40;
    pts.push(x.toFixed(1) + "," + y.toFixed(1));
  }
  return pts.join(" ");
};
/* Ballbanen fra siden: hvert slag som dempet kurve, snittbanen i blekk.
   Kurven er en symmetrisk tilnærming fra carry + apex — en LESBAR skisse
   av høydevinduet, ikke en aerodynamisk simulering; merk det som beregnet.
   Grensen mot DispersionMap: ovenfra (retning) bor der; dette er fra siden
   (høyde). Ren visning. Chromeless: flaten eies av Panel. */
export function TrajectoryPlot({
  shots = [], mean, maxCarry, maxHeight, carryLabel, apexLabel, low = false,
  state = "content",
  emptyText = "Ingen baner å tegne ennå. TrackMan-slagene fyller plottet.",
  dataOdId = "ballbane", ...rest
}) {
  const mc = maxCarry || Math.max(1, ...shots.map((s) => s.carry), mean ? mean.carry : 0) * 1.05;
  const mh = maxHeight || Math.max(1, ...shots.map((s) => s.apex), mean ? mean.apex : 0) * 1.15;
  const sum = "Ballbane" + (mean ? ": snitt carry " + (carryLabel || mean.carry + " m") + ", apex " + (apexLabel || mean.apex + " m") : "") + ". " + shots.length + " slag.";
  return (
    <div className="akhq-traj-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-traj" + (low ? " akhq-traj--lav" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <svg className="akhq-traj-svg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            {shots.map((s, i) => <polyline key={i} className="akhq-traj-skudd" points={bane(s.carry, s.apex, mc, mh)} />)}
            {mean && <polyline className="akhq-traj-snitt" points={bane(mean.carry, mean.apex, mc, mh)} />}
          </svg>
          <div className="akhq-traj-fot" aria-hidden="true">
            <span>0 m</span>
            <span>{Math.round(mc)} m</span>
          </div>
          {mean && (
            <div className="akhq-traj-nokkel" aria-hidden="true">
              <span>carry <span className="akhq-traj-nv">{carryLabel || mean.carry + " m"}</span></span>
              <span>apex <span className="akhq-traj-nv">{apexLabel || mean.apex + " m"}</span></span>
              <span>{shots.length} slag</span>
            </div>
          )}
        </div>
      </Region>
    </div>
  );
}
