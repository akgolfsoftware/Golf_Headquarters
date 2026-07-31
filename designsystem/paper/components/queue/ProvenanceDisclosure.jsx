import React from "react";
import { ensureCss } from "../data/viz.jsx";
ensureCss("akhq-css-prov", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Wrapperen eier containeren: de tre kolonnene (agent · data · regel) legger
   om seg selv, og et k\u00f8-kort st\u00e5r like ofte i et 300px panel som i en
   860px hovedkolonne. */
.akhq-prov-c{container-type:inline-size;min-width:0}
.akhq-prov{border-top:1px solid var(--border);margin-top:var(--s3);padding-top:var(--s3)}
.akhq-prov-sum{--h:24px;--floor:0px;min-height:max(var(--h),var(--floor));display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);width:fit-content;transition:color var(--dur) var(--ease)}
.akhq-prov-sum::-webkit-details-marker{display:none}
.akhq-prov-sum:hover{color:var(--fg)}
.akhq-prov-sum:focus-visible{outline:2px solid var(--focus);outline-offset:3px;border-radius:3px}
.akhq-prov-caret{width:9px;height:9px;flex:none;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);transition:transform var(--dur) var(--ease)}
.akhq-prov[open] .akhq-prov-caret{transform:rotate(45deg)}
.akhq-prov-grid{display:grid;grid-template-columns:var(--cols,repeat(3,minmax(0,1fr)));gap:var(--s2);margin-top:var(--s3)}
.akhq-prov-cell{background:var(--soft);border:1px solid var(--border);border-radius:var(--r-sm);padding:var(--s2) var(--s3);min-width:0}
.akhq-prov-k{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-prov-v{font-size:12px;line-height:1.45;color:var(--fg);margin:3px 0 0}
.akhq-prov-run{font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-top:var(--s2);display:flex;gap:10px;flex-wrap:wrap}
.akhq-prov-tom{font-size:12px;color:var(--muted);line-height:1.45;margin:var(--s3) 0 0}
}
@layer akhq-container{
@container (max-width:420px){.akhq-prov-grid{--cols:minmax(0,1fr)}}
@media(pointer:coarse){.akhq-prov-sum{--floor:44px}}
[data-coarse-test] .akhq-prov-sum{--floor:44px}
}
`);
/* Et agentforslag uten proveniens er ikke ferdig designet (handoveren, avsnitt 1).
   Derfor er komponenten ikke valgfri pynt: den er kravet, uttrykt som kode. */
export function ProvenanceDisclosure({ agent, data, rule, run, label = "Hvorfor?", open = false, dataOdId = "prov", ...rest }) {
  const tom = !agent && !data && !rule;
  return (
    <div className="akhq-prov-c">
      <details className="akhq-prov" open={open} data-od-id={dataOdId} {...rest}>
        <summary className="akhq-prov-sum"><span className="akhq-prov-caret" aria-hidden="true"></span>{label}</summary>
        {tom ? (
          <p className="akhq-prov-tom">Grunnlaget er ikke registrert for denne saken. Den er lagt inn manuelt, ikke av en agent.</p>
        ) : (
          <>
            <div className="akhq-prov-grid">
              <div className="akhq-prov-cell"><div className="akhq-prov-k">agent</div><p className="akhq-prov-v">{agent || "\u2014"}</p></div>
              <div className="akhq-prov-cell"><div className="akhq-prov-k">data</div><p className="akhq-prov-v">{data || "\u2014"}</p></div>
              <div className="akhq-prov-cell"><div className="akhq-prov-k">regel</div><p className="akhq-prov-v">{rule || "\u2014"}</p></div>
            </div>
            {run && (
              <div className="akhq-prov-run">
                {run.at && <span>kj\u00f8ring {run.at}</span>}
                {run.duration && <span>{run.duration}</span>}
                {run.id && <span>{run.id}</span>}
              </div>
            )}
          </>
        )}
      </details>
    </div>
  );
}
