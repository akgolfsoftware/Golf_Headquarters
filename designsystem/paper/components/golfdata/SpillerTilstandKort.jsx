import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-stk-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-stk{--kol:4;display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-stk-grid{display:grid;grid-template-columns:repeat(var(--kol),1fr);gap:var(--s2)}
.akhq-stk-felt{display:flex;flex-direction:column;gap:1px;min-width:0}
.akhq-stk-flab{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-stk-fv{--tone:var(--fg);font-family:var(--mono);font-size:13px;font-weight:600;color:var(--tone);font-variant-numeric:tabular-nums}
.akhq-stk-flagg{display:flex;flex-direction:column;gap:3px;margin:0;padding:0;list-style:none}
.akhq-stk-flagg-rad{display:flex;gap:var(--s2);font-size:12px;line-height:1.4}
.akhq-stk-flagg-pkt{flex:none;color:var(--dn)}
.akhq-stk-basis{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:380px){.akhq-stk{--kol:2}}
}
@layer akhq-modifier{
.akhq-stk-fv--up{--tone:var(--up)}
.akhq-stk-fv--dn{--tone:var(--dn)}
.akhq-stk-fv--mut{--tone:var(--muted)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-stk")) { const s = document.createElement("style"); s.id = "akhq-css-stk"; s.textContent = css; document.head.appendChild(s); }
/* Coachens blikk på spilleren NÅ: form, etterlevelse, siste aktivitet og
   neste hendelse som fire mono-felter, pluss flagg (avvik coach bør se).
   Grensen mot VelvaereKort (domene): velvære er SPILLERENS egenrapport
   (søvn/energi/motivasjon); tilstandskortet er COACHENS aggregat. Flagg er
   informasjon til coach — aldri varsler til spilleren, og aldri sperrer.
   Chromeless: flaten eies av Panel. */
export function SpillerTilstandKort({
  fields = [], flags = [], basis,
  state = "content",
  emptyText = "Ingen aktivitet logget ennå. Tilstanden bygges fra økter og runder.",
  dataOdId = "spillertilstand", ...rest
}) {
  return (
    <div className="akhq-stk-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-stk" data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-stk-grid">
            {fields.slice(0, 4).map((f, i) => (
              <div className="akhq-stk-felt" key={f.label + i}>
                <span className="akhq-stk-flab">{f.label}</span>
                <span className={"akhq-stk-fv" + (f.tone ? " akhq-stk-fv--" + f.tone : "")}>{f.value}</span>
              </div>
            ))}
          </div>
          {flags.length > 0 && (
            <ul className="akhq-stk-flagg">
              {flags.map((f, i) => (
                <li className="akhq-stk-flagg-rad" key={i}><span className="akhq-stk-flagg-pkt" aria-hidden="true">▲</span>{f}</li>
              ))}
            </ul>
          )}
          {basis && <span className="akhq-stk-basis">{basis}</span>}
        </div>
      </Region>
    </div>
  );
}
