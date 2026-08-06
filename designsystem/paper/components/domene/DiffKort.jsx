import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dfk-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-dfk{display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-dfk-hode{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:var(--s2)}
.akhq-dfk-rad{--stable:row;display:flex;flex-direction:var(--stable);align-items:baseline;gap:4px var(--s2);min-height:28px;min-width:0;padding:3px 0}
.akhq-dfk-rad:not(:last-child){border-bottom:1px solid var(--hairline)}
.akhq-dfk-felt{flex:none;width:112px;font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-dfk-verdier{flex:1;min-width:0;display:flex;align-items:baseline;gap:var(--s2);flex-wrap:wrap}
.akhq-dfk-fra{font-family:var(--mono);font-size:11px;color:var(--mid);text-decoration:line-through;font-variant-numeric:tabular-nums}
.akhq-dfk-pil{color:var(--mid);flex:none;font-family:var(--mono);font-size:11px}
.akhq-dfk-til{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-dfk-ny{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--info)}
}
@layer akhq-container{
@container (max-width:360px){.akhq-dfk-rad{--stable:column}.akhq-dfk-felt{width:100%}}
}
@layer akhq-modifier{
.akhq-dfk--tett .akhq-dfk-rad{min-height:22px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dfk")) { const s = document.createElement("style"); s.id = "akhq-css-dfk"; s.textContent = css; document.head.appendChild(s); }
/* Endringsdiffen: hva et forslag faktisk endrer, felt for felt — fra-verdi
   gjennomstreket i --mid, til-verdi halvfet blekk, nye felter merket NY i
   analyse-blå. Underlaget for godkjenninger (PlanAction): ingen skal
   godkjenne noe uten å se diffen. Ren visning — godkjenn/avvis-knappene
   eier konsumenten (QueueCard/godkjenningsflaten). Fra en agent? Legg
   ProvenanceDisclosure ved siden av. Chromeless: Panel eier flaten. */
export function DiffKort({
  title = "Endringer", rows = [], dense = false,
  state = "content",
  emptyText = "Ingen endringer å vise — forslaget er identisk med dagens plan.",
  dataOdId = "diff", ...rest
}) {
  return (
    <div className="akhq-dfk-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-dfk" + (dense ? " akhq-dfk--tett" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
          <span className="akhq-dfk-hode">{title}</span>
          {rows.map((r, i) => (
            <div className="akhq-dfk-rad" key={r.field + i}>
              <span className="akhq-dfk-felt">{r.field}</span>
              <span className="akhq-dfk-verdier">
                {r.from != null
                  ? (<>
                    <span className="akhq-dfk-fra">{r.from}</span>
                    <span className="akhq-dfk-pil" aria-hidden="true">→</span>
                  </>)
                  : <span className="akhq-dfk-ny">Ny</span>}
                <span className="akhq-dfk-til">{r.to}</span>
              </span>
            </div>
          ))}
        </div>
      </Region>
    </div>
  );
}
