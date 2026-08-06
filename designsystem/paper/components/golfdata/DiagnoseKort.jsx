import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-diag-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-diag{display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-diag-kick{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-diag-ttl{margin:0;font-size:15px;font-weight:600;line-height:1.3}
.akhq-diag-txt{margin:0;font-family:var(--body);font-size:13px;line-height:1.55;color:var(--fg);max-width:52ch}
.akhq-diag-ev{display:flex;flex-direction:column;gap:3px;margin:0;padding:0;list-style:none}
.akhq-diag-ev-rad{display:flex;gap:var(--s2);font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-diag-ev-pkt{flex:none;color:var(--mid)}
.akhq-diag-neste{display:flex;gap:var(--s2);align-items:baseline;padding-top:var(--s2);border-top:1px solid var(--hairline)}
.akhq-diag-neste-lab{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:none}
.akhq-diag-neste-txt{font-size:12.5px;line-height:1.4}
}
@layer akhq-container{
@container (max-width:340px){.akhq-diag-ttl{font-size:14px}}
}
@layer akhq-modifier{
.akhq-diag--kompakt .akhq-diag-txt{font-size:12.5px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-diag")) { const s = document.createElement("style"); s.id = "akhq-css-diag"; s.textContent = css; document.head.appendChild(s); }
/* Diagnosen: coachens (eller AI-ens) lesning av et mønster — tittel, prosa i
   Lora (du-form til spilleren), evidenslinjer i mono, og «neste steg» under
   hårlinjen. Kommer diagnosen fra en agent, SKAL konsumenten legge
   ProvenanceDisclosure ved siden av — et forslag uten proveniens er ikke
   ferdig designet. Chromeless: flaten eies av Panel. */
export function DiagnoseKort({
  title, body, evidence = [], nextStep, compact = false,
  state = "content",
  emptyText = "Ingen diagnose ennå. Coach eller Caddie skriver en når mønsteret er tydelig.",
  dataOdId = "diagnose", ...rest
}) {
  return (
    <div className="akhq-diag-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-diag" + (compact ? " akhq-diag--kompakt" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
          <span className="akhq-diag-kick">Diagnose</span>
          <h3 className="akhq-diag-ttl">{title}</h3>
          {body && <p className="akhq-diag-txt">{body}</p>}
          {evidence.length > 0 && (
            <ul className="akhq-diag-ev">
              {evidence.map((e, i) => (
                <li className="akhq-diag-ev-rad" key={i}><span className="akhq-diag-ev-pkt">·</span>{e}</li>
              ))}
            </ul>
          )}
          {nextStep && (
            <div className="akhq-diag-neste">
              <span className="akhq-diag-neste-lab">Neste steg</span>
              <span className="akhq-diag-neste-txt">{nextStep}</span>
            </div>
          )}
        </div>
      </Region>
    </div>
  );
}
