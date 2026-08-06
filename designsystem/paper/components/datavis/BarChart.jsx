import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-bch-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-bch{--h:140px;--bar:var(--info-raw);--gap:var(--s2);--vrd:block;display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-bch-plot{position:relative;display:flex;align-items:flex-end;gap:var(--gap);height:var(--h);border-bottom:1px solid var(--hairline);min-width:0}
.akhq-bch-kol{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px}
.akhq-bch-stolpe{width:100%;max-width:48px;background:var(--bar);border-radius:2px 2px 0 0;min-height:2px}
.akhq-bch-vrd{display:var(--vrd);font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.akhq-bch-benk{position:absolute;left:0;right:0;border-top:1px dashed var(--mid);pointer-events:none}
.akhq-bch-benk-lab{position:absolute;right:0;transform:translateY(-100%);font-family:var(--mono);font-size:9px;color:var(--mid);padding-bottom:1px}
.akhq-bch-katrad{display:flex;gap:var(--gap);margin-top:4px}
.akhq-bch-kat{flex:1;min-width:0;text-align:center;font-family:var(--mono);font-size:9.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
}
@layer akhq-container{
@container (max-width:380px){.akhq-bch{--vrd:none;--gap:var(--s1)}}
}
@layer akhq-modifier{
.akhq-bch--lav{--h:96px}
.akhq-bch-stolpe--over{--bar:var(--up-raw)}
.akhq-bch-stolpe--under{--bar:color-mix(in srgb, var(--dn) 35%, var(--surface))}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-bch")) { const s = document.createElement("style"); s.id = "akhq-css-bch"; s.textContent = css; document.head.appendChild(s); }
/* Generiske kategorisøyler: treningstimer per uke, økter per område, runder
   per måned. Uten benchmark er alle søyler --info-raw (analyse-blå, fyll).
   Med benchmark følger golfviz-regelen: over = --up-raw, under = --dn 35 % —
   aldri rød. Verdier i mono over søylen; hele plottet har tekstlig
   sammendrag. Ren visning — drilldown hører til konsumenten. */
export function BarChart({
  items = [], max, benchmark, benchmarkLabel, low = false,
  state = "content",
  emptyText = "Ingen tall å tegne ennå. Kom tilbake når første uke er logget.",
  ariaLabel, dataOdId = "sylediagram", ...rest
}) {
  const topp = max || Math.max(1, ...items.map((d) => d.value));
  const sum = ariaLabel || "Søylediagram: " + items.map((d) => d.label + " " + (d.display != null ? d.display : d.value)).join(", ");
  return (
    <div className="akhq-bch-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-bch" + (low ? " akhq-bch--lav" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-bch-plot">
            {typeof benchmark === "number" && (
              <span className="akhq-bch-benk" style={{ bottom: Math.min(100, (benchmark / topp) * 100) + "%" }}>
                {benchmarkLabel && <span className="akhq-bch-benk-lab">{benchmarkLabel}</span>}
              </span>
            )}
            {items.map((d, i) => {
              const tone = typeof benchmark === "number" ? (d.value >= benchmark ? " akhq-bch-stolpe--over" : " akhq-bch-stolpe--under") : "";
              return (
                <span className="akhq-bch-kol" key={d.label + i}>
                  <span className="akhq-bch-vrd">{d.display != null ? d.display : d.value}</span>
                  <span className={"akhq-bch-stolpe" + tone} style={{ height: Math.max(1.5, (d.value / topp) * 100) + "%" }} />
                </span>
              );
            })}
          </div>
          <div className="akhq-bch-katrad" aria-hidden="true">
            {items.map((d, i) => <span className="akhq-bch-kat" key={d.label + i}>{d.label}</span>)}
          </div>
        </div>
      </Region>
    </div>
  );
}
