import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tms-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-tms{--kol:4;display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-tms-hode{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-tms-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-tms-okt{font-family:var(--mono);font-size:10px;color:var(--muted)}
.akhq-tms-grid{display:grid;grid-template-columns:repeat(var(--kol),1fr);gap:var(--s2)}
.akhq-tms-felt{display:flex;flex-direction:column;gap:1px;min-width:0}
.akhq-tms-flab{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-tms-fv{font-family:var(--mono);font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-tms-hoyde{display:flex;flex-direction:column;gap:3px;margin:0;padding:0;list-style:none}
.akhq-tms-h-rad{display:flex;gap:var(--s2);font-size:12px;line-height:1.4}
.akhq-tms-h-pkt{flex:none;color:var(--mid)}
}
@layer akhq-container{
@container (max-width:380px){.akhq-tms{--kol:2}}
}
@layer akhq-modifier{
.akhq-tms--tett{--kol:2}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tms")) { const s = document.createElement("style"); s.id = "akhq-css-tms"; s.textContent = css; document.head.appendChild(s); }
/* TrackMan-øktas sammendrag: fire mono-nøkkeltall (slag, køller, snitt
   smash, beste carry) + høydepunkter i klartekst. Sammendraget er døra inn
   til økta — detaljene bor i KolleStatKort, LaunchWindowKort og
   DispersionMap. Tall alltid med enhet; smash med komma-desimal.
   Chromeless: flaten eies av Panel. */
export function TrackmanSammendrag({
  sessionLabel, fields = [], highlights = [],
  state = "content",
  emptyText = "Ingen TrackMan-økt registrert ennå. Sammendraget fylles når økta er synkronisert.",
  dense = false, dataOdId = "trackman-sammendrag", ...rest
}) {
  return (
    <div className="akhq-tms-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-tms" + (dense ? " akhq-tms--tett" : "")} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-tms-hode">
            <span className="akhq-tms-lab">TrackMan-økt</span>
            {sessionLabel && <span className="akhq-tms-okt">{sessionLabel}</span>}
          </div>
          <div className="akhq-tms-grid">
            {fields.slice(0, 4).map((f, i) => (
              <div className="akhq-tms-felt" key={f.label + i}>
                <span className="akhq-tms-flab">{f.label}</span>
                <span className="akhq-tms-fv">{f.value}</span>
              </div>
            ))}
          </div>
          {highlights.length > 0 && (
            <ul className="akhq-tms-hoyde">
              {highlights.map((h, i) => (
                <li className="akhq-tms-h-rad" key={i}><span className="akhq-tms-h-pkt" aria-hidden="true">·</span>{h}</li>
              ))}
            </ul>
          )}
        </div>
      </Region>
    </div>
  );
}
