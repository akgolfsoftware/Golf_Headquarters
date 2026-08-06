import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-nfok-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-nfok{display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-nfok-kick{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-nfok-ttl{margin:0;font-size:16px;font-weight:600;line-height:1.3}
.akhq-nfok-hvorfor{margin:0;font-family:var(--body);font-size:13px;line-height:1.55;max-width:52ch}
.akhq-nfok-ev{font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-nfok-plan{display:flex;gap:var(--s2);align-items:baseline;padding-top:var(--s2);border-top:1px solid var(--hairline)}
.akhq-nfok-plan-lab{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:none}
.akhq-nfok-plan-txt{font-size:12.5px;line-height:1.4}
.akhq-nfok-act{display:flex;gap:var(--s2);margin-top:2px}
}
@layer akhq-container{
@container (max-width:340px){.akhq-nfok-ttl{font-size:14.5px}}
}
@layer akhq-modifier{
.akhq-nfok--kompakt .akhq-nfok-hvorfor{font-size:12.5px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-nfok")) { const s = document.createElement("style"); s.id = "akhq-css-nfok"; s.textContent = css; document.head.appendChild(s); }
/* Neste fokus i utviklingen: området med størst SG-gevinst, hvorfor (prosa i
   du-form), evidensen (mono) og koblingen til planen. Dette er ANALYSENS
   anbefaling — IKKE «Én ting nå»: OneThingNow eier oransjen og pulsen og
   handler om akkurat nå; NesteFokusKort handler om de neste ukene og er
   blekk på papir. Handlinger sendes inn som noder (Button fra biblioteket).
   Chromeless: flaten eies av Panel. */
export function NesteFokusKort({
  title, why, evidence, planNote, actions, compact = false,
  state = "content",
  emptyText = "Ingen fokusanbefaling ennå. Fem runder med SG-data trengs.",
  dataOdId = "neste-fokus", ...rest
}) {
  return (
    <div className="akhq-nfok-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-nfok" + (compact ? " akhq-nfok--kompakt" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
          <span className="akhq-nfok-kick">Neste fokus</span>
          <h3 className="akhq-nfok-ttl">{title}</h3>
          {why && <p className="akhq-nfok-hvorfor">{why}</p>}
          {evidence && <span className="akhq-nfok-ev">{evidence}</span>}
          {planNote && (
            <div className="akhq-nfok-plan">
              <span className="akhq-nfok-plan-lab">I planen</span>
              <span className="akhq-nfok-plan-txt">{planNote}</span>
            </div>
          )}
          {actions && <div className="akhq-nfok-act">{actions}</div>}
        </div>
      </Region>
    </div>
  );
}
