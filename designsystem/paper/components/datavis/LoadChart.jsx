import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lch-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-lch{--h:140px;--gap:var(--s2);--vrd:block;display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-lch-plot{position:relative;display:flex;align-items:flex-end;gap:var(--gap);height:var(--h);border-bottom:1px solid var(--hairline);min-width:0}
.akhq-lch-vindu{position:absolute;left:0;right:0;background:var(--soft);border-top:1px dashed var(--hairline);border-bottom:1px dashed var(--hairline);pointer-events:none}
.akhq-lch-kol{flex:1;min-width:0;height:100%;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px}
.akhq-lch-stolpe{--bar:var(--up-raw);width:100%;max-width:40px;background:var(--bar);border-radius:2px 2px 0 0;min-height:2px}
.akhq-lch-vrd{display:var(--vrd);font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.akhq-lch-katrad{display:flex;gap:var(--gap);margin-top:4px}
.akhq-lch-kat{flex:1;min-width:0;text-align:center;font-family:var(--mono);font-size:9.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lch-note{margin-top:var(--s2);font-family:var(--mono);font-size:10px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:380px){.akhq-lch{--vrd:none;--gap:var(--s1)}}
}
@layer akhq-modifier{
.akhq-lch--lav{--h:96px}
.akhq-lch-stolpe--over{--bar:var(--dn)}
.akhq-lch-stolpe--under{--bar:var(--mid)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lch")) { const s = document.createElement("style"); s.id = "akhq-css-lch"; s.textContent = css; document.head.appendChild(s); }
/* Belastning over tid mot et anbefalt vindu: ukevolum mot periodens min–maks,
   slag per økt mot kapasitet. Vinduet tegnes som --soft-bånd bak søylene;
   innenfor = --up-raw, over taket = --dn (leire, aldri rød), under minimum =
   --mid. Terskler er anbefalinger — komponenten flagger, den sperrer aldri
   (invariant 1). BudgetBar eier ukebudsjettet i Workbench; LoadChart er
   HISTORIKKEN over mange perioder. */
export function LoadChart({
  items = [], min, max, maxScale, note, low = false,
  state = "content",
  emptyText = "Ingen belastningsdata ennå. Første loggede uke tegner den første søylen.",
  ariaLabel, dataOdId = "belastning", ...rest
}) {
  const topp = maxScale || Math.max(1, ...(typeof max === "number" ? [max * 1.15] : []), ...items.map((d) => d.value));
  const sum = ariaLabel || "Belastning: " + items.map((d) => d.label + " " + (d.display != null ? d.display : d.value)).join(", ") + (typeof min === "number" && typeof max === "number" ? ". Anbefalt vindu " + min + " til " + max + "." : "");
  return (
    <div className="akhq-lch-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-lch" + (low ? " akhq-lch--lav" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-lch-plot">
            {typeof min === "number" && typeof max === "number" && (
              <span className="akhq-lch-vindu" style={{ bottom: (min / topp) * 100 + "%", height: ((max - min) / topp) * 100 + "%" }} />
            )}
            {items.map((d, i) => {
              const tone = typeof max === "number" && d.value > max ? " akhq-lch-stolpe--over"
                : typeof min === "number" && d.value < min ? " akhq-lch-stolpe--under" : "";
              return (
                <span className="akhq-lch-kol" key={d.label + i}>
                  <span className="akhq-lch-vrd">{d.display != null ? d.display : d.value}</span>
                  <span className={"akhq-lch-stolpe" + tone} style={{ height: Math.max(1.5, (d.value / topp) * 100) + "%" }} />
                </span>
              );
            })}
          </div>
          <div className="akhq-lch-katrad" aria-hidden="true">
            {items.map((d, i) => <span className="akhq-lch-kat" key={d.label + i}>{d.label}</span>)}
          </div>
          {note && <p className="akhq-lch-note">{note}</p>}
        </div>
      </Region>
    </div>
  );
}
