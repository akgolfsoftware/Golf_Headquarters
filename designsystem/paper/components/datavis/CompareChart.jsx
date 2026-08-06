import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-cch-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-cch{--h:140px;--gap:var(--s3);--vrd:block;display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-cch-plot{display:flex;align-items:flex-end;gap:var(--gap);height:var(--h);border-bottom:1px solid var(--hairline);min-width:0}
.akhq-cch-kol{flex:1;min-width:0;height:100%;display:flex;align-items:flex-end;justify-content:center;gap:3px}
.akhq-cch-a{width:38%;max-width:26px;background:var(--fg);border-radius:2px 2px 0 0;min-height:2px}
.akhq-cch-b{width:38%;max-width:26px;background:var(--mid);border-radius:2px 2px 0 0;min-height:2px}
.akhq-cch-katrad{display:flex;gap:var(--gap);margin-top:4px}
.akhq-cch-kat{flex:1;min-width:0;text-align:center;font-family:var(--mono);font-size:9.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-cch-legend{display:flex;gap:var(--s4);margin-top:var(--s2);font-family:var(--mono);font-size:10px;color:var(--muted)}
.akhq-cch-sw{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px;vertical-align:baseline}
.akhq-cch-sw--a{background:var(--fg)}
.akhq-cch-sw--b{background:var(--mid)}
.akhq-cch-vrdrad{display:flex;gap:var(--gap)}
.akhq-cch-vrd{display:var(--vrd);flex:1;min-width:0;text-align:center;font-family:var(--mono);font-size:9.5px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden}
}
@layer akhq-container{
@container (max-width:380px){.akhq-cch{--vrd:none;--gap:var(--s2)}}
}
@layer akhq-modifier{
.akhq-cch--info .akhq-cch-b{background:var(--info-raw)}
.akhq-cch--info .akhq-cch-sw--b{background:var(--info-raw)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-cch")) { const s = document.createElement("style"); s.id = "akhq-css-cch"; s.textContent = css; document.head.appendChild(s); }
/* Parvise søyler: deg mot benchmark, før mot etter, denne sesongen mot
   forrige. Serie A er alltid spilleren (blekk), serie B sammenligningen
   (--mid, eller --info-raw med info-modifikatoren når B er en måling, ikke
   en referanse). To serier er taket — tre leses ikke i søylepar; da er det
   DataTable eller to CompareChart. */
export function CompareChart({
  pairs = [], seriesA = "Nå", seriesB = "Referanse", info = false,
  max, state = "content",
  emptyText = "Ingenting å sammenligne ennå. To datapunkter trengs.",
  ariaLabel, dataOdId = "sammenligning", ...rest
}) {
  const topp = max || Math.max(1, ...pairs.flatMap((p) => [p.a, p.b]));
  const sum = ariaLabel || "Sammenligning " + seriesA + " mot " + seriesB + ": " + pairs.map((p) => p.label + " " + (p.aDisplay != null ? p.aDisplay : p.a) + " mot " + (p.bDisplay != null ? p.bDisplay : p.b)).join(", ");
  return (
    <div className="akhq-cch-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-cch" + (info ? " akhq-cch--info" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-cch-vrdrad" aria-hidden="true">
            {pairs.map((p, i) => <span className="akhq-cch-vrd" key={i}>{(p.aDisplay != null ? p.aDisplay : p.a) + " · " + (p.bDisplay != null ? p.bDisplay : p.b)}</span>)}
          </div>
          <div className="akhq-cch-plot">
            {pairs.map((p, i) => (
              <span className="akhq-cch-kol" key={p.label + i}>
                <span className="akhq-cch-a" style={{ height: Math.max(1.5, (p.a / topp) * 100) + "%" }} />
                <span className="akhq-cch-b" style={{ height: Math.max(1.5, (p.b / topp) * 100) + "%" }} />
              </span>
            ))}
          </div>
          <div className="akhq-cch-katrad" aria-hidden="true">
            {pairs.map((p, i) => <span className="akhq-cch-kat" key={p.label + i}>{p.label}</span>)}
          </div>
          <div className="akhq-cch-legend" aria-hidden="true">
            <span><span className="akhq-cch-sw akhq-cch-sw--a" />{seriesA}</span>
            <span><span className="akhq-cch-sw akhq-cch-sw--b" />{seriesB}</span>
          </div>
        </div>
      </Region>
    </div>
  );
}
