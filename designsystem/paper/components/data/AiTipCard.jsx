import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-aitip-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-aitip{display:flex;gap:var(--s2);align-items:flex-start;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-aitip-c{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.akhq-aitip-kick{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--info)}
.akhq-aitip-txt{margin:0;font-family:var(--body);font-size:12.5px;line-height:1.55;max-width:52ch}
.akhq-aitip-ev{font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-aitip-x{--floor:0px;position:relative;flex:none;appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--r-sm);background:transparent;color:var(--muted);font-size:13px;line-height:1;cursor:pointer;transition:color var(--dur) var(--ease),background var(--dur) var(--ease)}
.akhq-aitip-x:hover,.akhq-aitip-x[data-state=hover]{color:var(--fg);background:var(--soft)}
.akhq-aitip-x:focus-visible,.akhq-aitip-x[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-aitip-x::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100%,var(--floor));height:max(100%,var(--floor))}
}
@layer akhq-container{
@container (max-width:340px){.akhq-aitip-txt{font-size:12px}}
@media(pointer:coarse){.akhq-aitip-x{--floor:44px}}
[data-coarse-test] .akhq-aitip-x{--floor:44px}
}
@layer akhq-modifier{
.akhq-aitip--dempet .akhq-aitip-kick{color:var(--muted)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-aitip")) { const s = document.createElement("style"); s.id = "akhq-css-aitip"; s.textContent = css; document.head.appendChild(s); }
/* Caddie-tipset: kort AI-observasjon i prosa, med evidenslinje i mono og
   valgfri lukking (sesjonsbasert, aldri sperre). Kickeren er analyse-blå —
   AI er analyse, aldri oransje. Et tips er LAVTERSKELEN i AI-laget: mer
   forpliktende forslag går som PlanAction gjennom køen med
   ProvenanceDisclosure og DiffKort — aldri som tips. Evidenslinjen er
   tipsets mini-proveniens og bør alltid sendes. */
export function AiTipCard({
  source = "Caddie-tips", tip, evidence, muted = false, onDismiss,
  state = "content",
  emptyText = "Ingen tips akkurat nå.",
  dataOdId = "aitip", ...rest
}) {
  return (
    <div className="akhq-aitip-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-aitip" + (muted ? " akhq-aitip--dempet" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
          <div className="akhq-aitip-c">
            <span className="akhq-aitip-kick">{source}</span>
            <p className="akhq-aitip-txt">{tip}</p>
            {evidence && <span className="akhq-aitip-ev">{evidence}</span>}
          </div>
          {onDismiss && (
            <button type="button" className="akhq-aitip-x" aria-label="Skjul tipset" onClick={onDismiss} data-od-id={"cta-" + dataOdId + "-lukk"}>×</button>
          )}
        </div>
      </Region>
    </div>
  );
}
