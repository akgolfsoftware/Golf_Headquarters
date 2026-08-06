import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-nstige-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-nstige{--strek:16px;display:flex;align-items:center;min-width:0;box-sizing:border-box;font-family:var(--mono);color:var(--fg);flex-wrap:wrap;row-gap:var(--s2)}
.akhq-nstige-niva{--bgc:transparent;--tx:var(--muted);--bc:var(--border);display:inline-flex;align-items:center;height:22px;padding:0 10px;border:1px solid var(--bc);border-radius:var(--r-pill);background:var(--bgc);color:var(--tx);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1;flex:none}
.akhq-nstige-strek{width:var(--strek);height:1px;background:var(--border);flex:none}
.akhq-nstige-maal{font-size:9px;color:var(--muted);margin-left:4px;letter-spacing:.04em}
}
@layer akhq-container{
@container (max-width:420px){.akhq-nstige{--strek:8px}}
}
@layer akhq-modifier{
.akhq-nstige-niva--naa{--bgc:var(--cta);--tx:var(--on-cta);--bc:var(--cta)}
.akhq-nstige-niva--forbi{--tx:var(--fg);--bc:var(--mid)}
.akhq-nstige-niva--maal{--bc:var(--fg);border-style:dashed}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-nstige")) { const s = document.createElement("style"); s.id = "akhq-css-nstige"; s.textContent = css; document.head.appendChild(s); }
/* Nivåstigen: AK-stigen (Mini → Knøtt → Basis → Utvikling → Elite) eller
   andre lukkede nivårekker. FARGELØS — nivåer er vokabular, ikke
   datasemantikk: nå = blekkfylt, forbi = markert ramme, mål = stiplet
   blekkramme. Grensen mot ProgramLadder (progress): den viser progresjon
   INNI et program; stigen viser HVOR i nivårekka spilleren står.
   Nivåene kommer fra konsumenten — stigen hardkoder ingen rekker. */
export function NivaStige({
  levels = [], current, target,
  state = "content",
  emptyText = "Ingen nivåplassering ennå. Stigen settes ved første vurdering.",
  dataOdId = "nivastige", ...rest
}) {
  const sum = "Nivåstige: " + levels.join(", ") + (current ? ". Nå: " + current : "") + (target ? ". Mål: " + target : "");
  return (
    <div className="akhq-nstige-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-nstige" role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          {levels.map((n, i) => {
            const idx = levels.indexOf(current);
            const mod = n === current ? " akhq-nstige-niva--naa" : (idx >= 0 && i < idx) ? " akhq-nstige-niva--forbi" : n === target ? " akhq-nstige-niva--maal" : "";
            return (
              <React.Fragment key={n}>
                {i > 0 && <span className="akhq-nstige-strek" aria-hidden="true" />}
                <span className={"akhq-nstige-niva" + mod}>
                  {n}
                  {n === target && n !== current && <span className="akhq-nstige-maal">mål</span>}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </Region>
    </div>
  );
}
