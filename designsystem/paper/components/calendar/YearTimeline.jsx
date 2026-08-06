import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ytl-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-ytl{--mnd-h:56px;display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-ytl-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:2px;min-width:0}
.akhq-ytl-mnd{position:relative;display:flex;flex-direction:column;gap:3px;min-width:0;min-height:var(--mnd-h);padding:4px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);box-sizing:border-box}
.akhq-ytl-mlab{font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.akhq-ytl-ev{--tone:var(--mid);display:flex;align-items:center;gap:3px;min-width:0;font-family:var(--mono);font-size:8.5px;color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.akhq-ytl-prikk{width:5px;height:5px;border-radius:50%;background:var(--tone);flex:none}
.akhq-ytl-naa{outline:2px solid var(--fg);outline-offset:-1px}
.akhq-ytl-legend{display:flex;gap:var(--s4);font-family:var(--mono);font-size:9.5px;color:var(--muted);flex-wrap:wrap}
.akhq-ytl-l{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.akhq-ytl-sw{--tone:var(--mid);width:7px;height:7px;border-radius:50%;background:var(--tone);flex:none}
}
@layer akhq-container{
@container (max-width:640px){.akhq-ytl-grid{grid-template-columns:repeat(6,1fr)}}
@container (max-width:360px){.akhq-ytl-grid{grid-template-columns:repeat(4,1fr)}}
}
@layer akhq-modifier{
.akhq-ytl-ev--turn{--tone:var(--up)}
.akhq-ytl-ev--samling{--tone:var(--info)}
.akhq-ytl-ev--test{--tone:var(--fg)}
.akhq-ytl-sw--turn{--tone:var(--up)}
.akhq-ytl-sw--samling{--tone:var(--info)}
.akhq-ytl-sw--test{--tone:var(--fg)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ytl")) { const s = document.createElement("style"); s.id = "akhq-css-ytl"; s.textContent = css; document.head.appendChild(s); }
const TYPER = ["turn", "samling", "test"];
const TYPENAVN = { turn: "turnering", samling: "samling", test: "test" };
/* Årshjulet i én figur: tolv måneder med hendelser (turnering --up,
   samling --info, test blekk) som prikk + kortnavn. Nå-måneden er
   innrammet i blekk. Grensen mot Periodeplan: periodene (GRUNN/SPES/TURN)
   er BÅNDET; årshjulet er HENDELSENE — de to stables ofte, periodeplan
   øverst. Kolonnene bryter 12 → 6 → 4 etter container, aldri viewport.
   Ren visning; måned-drilldown eier konsumenten. */
export function YearTimeline({
  months = [], nowIndex, showLegend = true,
  state = "content",
  emptyText = "Ingen sesongoversikt ennå. Årshjulet fylles fra turneringsplanleggeren.",
  dataOdId = "aarshjul", ...rest
}) {
  const sum = "Årshjul: " + months.map((m) => m.label + (m.events && m.events.length ? " (" + m.events.map((e) => e.label).join(", ") + ")" : "")).join(", ");
  return (
    <div className="akhq-ytl-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-ytl" role="img" aria-label={sum} data-od-id={"panel-" + dataOdId} {...rest}>
          <div className="akhq-ytl-grid">
            {months.map((m, i) => (
              <div className={"akhq-ytl-mnd" + (i === nowIndex ? " akhq-ytl-naa" : "")} key={m.label + i}>
                <span className="akhq-ytl-mlab">{m.label}</span>
                {(m.events || []).slice(0, 3).map((e, j) => (
                  <span key={j} className={"akhq-ytl-ev" + (TYPER.includes(e.type) ? " akhq-ytl-ev--" + e.type : "")} title={e.label}>
                    <span className="akhq-ytl-prikk" />
                    {e.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
          {showLegend && (
            <div className="akhq-ytl-legend" aria-hidden="true">
              {TYPER.map((t) => <span className="akhq-ytl-l" key={t}><span className={"akhq-ytl-sw akhq-ytl-sw--" + t} />{TYPENAVN[t]}</span>)}
            </div>
          )}
        </div>
      </Region>
    </div>
  );
}
