import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dprev-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-dprev{display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-dprev-scroll{overflow-x:auto;min-width:0;border:1px solid var(--hairline);border-radius:var(--r-sm)}
.akhq-dprev-tab{border-collapse:collapse;width:100%;font-family:var(--mono);font-size:10.5px}
.akhq-dprev-th{text-align:left;padding:5px 10px;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--hairline);white-space:nowrap}
.akhq-dprev-td{padding:4px 10px;color:var(--fg);font-variant-numeric:tabular-nums;white-space:nowrap;border-bottom:1px solid var(--hairline)}
.akhq-dprev-tr:last-child .akhq-dprev-td{border-bottom:0}
.akhq-dprev-mer{font-family:var(--mono);font-size:10px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:380px){.akhq-dprev-tab{font-size:10px}}
}
@layer akhq-modifier{
.akhq-dprev--tett .akhq-dprev-td{padding:2px 8px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dprev")) { const s = document.createElement("style"); s.id = "akhq-css-dprev"; s.textContent = css; document.head.appendChild(s); }
/* Forhåndsvisning av et datasett FØR det tas inn: GolfBox-import,
   TrackMan-synk, CSV-opplasting. Maks fem rader + «+ N rader til» —
   poenget er å KJENNE IGJEN dataene, ikke å lese dem; hele settet hører i
   DataTable etter import. Rullingen bor i komponentens egen container
   (DataTable-regelen). Ren visning — importknappen eier konsumenten. */
export function DataPreview({
  columns = [], rows = [], moreCount, dense = false,
  state = "content",
  emptyText = "Ingenting å forhåndsvise ennå. Velg en fil eller kilde først.",
  dataOdId = "forhandsvisning", ...rest
}) {
  const vis = rows.slice(0, 5);
  const rest_ = moreCount != null ? moreCount : Math.max(0, rows.length - vis.length);
  return (
    <div className="akhq-dprev-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-dprev" + (dense ? " akhq-dprev--tett" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
          <div className="akhq-dprev-scroll">
            <table className="akhq-dprev-tab">
              <thead><tr>{columns.map((c, i) => <th className="akhq-dprev-th" key={i} scope="col">{c}</th>)}</tr></thead>
              <tbody>
                {vis.map((r, i) => (
                  <tr className="akhq-dprev-tr" key={i}>{r.map((v, j) => <td className="akhq-dprev-td" key={j}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {rest_ > 0 && <span className="akhq-dprev-mer">+ {rest_} rader til i settet</span>}
        </div>
      </Region>
    </div>
  );
}
