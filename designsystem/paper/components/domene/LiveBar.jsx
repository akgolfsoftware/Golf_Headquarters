import React from "react";
import { LiveStatus } from "./LiveStatus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lbar-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-lbar{--neste:inline;display:flex;align-items:center;gap:var(--s3);width:100%;min-width:0;box-sizing:border-box;min-height:48px;padding:8px 14px;background:var(--fg);color:var(--bg);border-radius:var(--r);font-family:var(--ui)}
.akhq-lbar-naa{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.akhq-lbar-blokk{font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lbar-neste{display:var(--neste);font-family:var(--mono);font-size:10px;color:color-mix(in srgb, var(--bg) 70%, transparent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lbar-act{display:flex;align-items:center;gap:var(--s2);flex:none}
}
@layer akhq-container{
@container (max-width:420px){.akhq-lbar{--neste:none}}
}
@layer akhq-modifier{
.akhq-lbar--flat{border-radius:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lbar")) { const s = document.createElement("style"); s.id = "akhq-css-lbar"; s.textContent = css; document.head.appendChild(s); }
/* Live-linjen under en pågående økt: LiveStatus + gjeldende blokk + neste,
   og et handlingsslot (konsumenten sender bibliotekets knapper). Blekkfylt
   flate — live-økta er det ene stedet i appen der en hel linje er invertert,
   så den aldri forveksles med innhold. Grensen mot StatusBar (shell):
   StatusBar er systemstatus i bunnen av skallet; LiveBar er ØKTAS tilstand
   og finnes bare mens økta pågår. LiveStatus komponeres med inverse-prop —
   aldri restylet herfra. */
export function LiveBar({
  mode = "live", timeLabel, currentLabel, nextLabel, actions, flat = false,
  dataOdId = "livebar", ...rest
}) {
  return (
    <div className="akhq-lbar-wrap">
      <div className={"akhq-lbar" + (flat ? " akhq-lbar--flat" : "")} role="status" data-od-id={"panel-" + dataOdId} {...rest}>
        <LiveStatus mode={mode} timeLabel={timeLabel} inverse dataOdId={dataOdId + "-status"} />
        <span className="akhq-lbar-naa">
          {currentLabel && <span className="akhq-lbar-blokk">{currentLabel}</span>}
          {nextLabel && <span className="akhq-lbar-neste">neste: {nextLabel}</span>}
        </span>
        {actions && <span className="akhq-lbar-act">{actions}</span>}
      </div>
    </div>
  );
}
