import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-hmap-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-hmap{--cell:22px;--radlab:64px;display:grid;grid-template-columns:var(--radlab) 1fr;gap:2px 6px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-hmap-radlab{font-family:var(--mono);font-size:9.5px;color:var(--muted);display:flex;align-items:center;justify-content:flex-end;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-hmap-rad{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;min-width:0}
.akhq-hmap-celle{--iv:var(--surface);height:var(--cell);border-radius:2px;background:var(--iv);border:1px solid var(--hairline);min-width:0}
.akhq-hmap-kollab{font-family:var(--mono);font-size:9px;color:var(--muted);text-align:center;overflow:hidden;white-space:nowrap}
.akhq-hmap-skala{display:flex;align-items:center;gap:4px;margin-top:var(--s2);font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.akhq-hmap-trinn{--iv:var(--surface);width:14px;height:8px;border-radius:2px;border:1px solid var(--hairline);background:var(--iv)}
}
@layer akhq-container{
@container (max-width:420px){.akhq-hmap{--cell:16px;--radlab:44px}}
}
@layer akhq-modifier{
.akhq-hmap-celle--i1{--iv:color-mix(in srgb, var(--info-raw) 18%, var(--surface))}
.akhq-hmap-celle--i2{--iv:color-mix(in srgb, var(--info-raw) 40%, var(--surface))}
.akhq-hmap-celle--i3{--iv:color-mix(in srgb, var(--info-raw) 65%, var(--surface))}
.akhq-hmap-celle--i4{--iv:var(--info-raw)}
.akhq-hmap--tett{--cell:16px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-hmap")) { const s = document.createElement("style"); s.id = "akhq-css-hmap"; s.textContent = css; document.head.appendChild(s); }
/* Intensitetsmatrise: treningsvolum uke × område, treffbilde retning ×
   lengde, oppmøte gruppe × uke. Fem diskrete trinn (0–4) av --info-raw
   blandet mot --surface — aldri en kontinuerlig fargeskala, for fem trinn
   kan leses og benevnes. Cellen bærer ingen tekst; verdien ligger i
   aria-label per rad og i sammendraget. */
export function Heatmap({
  rows = [], colLabels = [], showScale = true, dense = false,
  state = "content",
  emptyText = "Ingen mønster å vise ennå. Matrisen fylles etter hvert som data kommer inn.",
  ariaLabel, dataOdId = "varmekart", ...rest
}) {
  const sum = ariaLabel || "Varmekart med " + rows.length + " rader og " + colLabels.length + " kolonner.";
  return (
    <div className="akhq-hmap-wrap">
      <Region state={state} empty={emptyText}>
        <div role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className={"akhq-hmap" + (dense ? " akhq-hmap--tett" : "")}>
            {colLabels.length > 0 && (<>
              <span className="akhq-hmap-radlab" />
              <span className="akhq-hmap-rad" aria-hidden="true">
                {colLabels.map((c, i) => <span className="akhq-hmap-kollab" key={i}>{c}</span>)}
              </span>
            </>)}
            {rows.map((r, i) => (
              <React.Fragment key={r.label + i}>
                <span className="akhq-hmap-radlab">{r.label}</span>
                <span className="akhq-hmap-rad" aria-label={r.label + ": " + r.cells.map((c) => c.label || c.v).join(", ")}>
                  {r.cells.map((c, j) => (
                    <span key={j} title={c.label} className={"akhq-hmap-celle" + (c.v > 0 ? " akhq-hmap-celle--i" + Math.min(4, Math.max(1, Math.round(c.v))) : "")} />
                  ))}
                </span>
              </React.Fragment>
            ))}
          </div>
          {showScale && (
            <div className="akhq-hmap-skala" aria-hidden="true">
              <span>lite</span>
              <span className="akhq-hmap-trinn" />
              <span className="akhq-hmap-trinn akhq-hmap-celle--i1" />
              <span className="akhq-hmap-trinn akhq-hmap-celle--i2" />
              <span className="akhq-hmap-trinn akhq-hmap-celle--i3" />
              <span className="akhq-hmap-trinn akhq-hmap-celle--i4" />
              <span>mye</span>
            </div>
          )}
        </div>
      </Region>
    </div>
  );
}
