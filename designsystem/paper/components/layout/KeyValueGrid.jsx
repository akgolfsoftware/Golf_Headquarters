import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-kvg-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-kvg{--cols:2;--rowgap:0px;--colgap:var(--s5);--pad-y:9px;--pen:0px;display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));column-gap:var(--colgap);row-gap:var(--rowgap);margin:0;min-width:0;font-family:var(--ui)}
.akhq-kvg-pair{--pair-b:1px;display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);padding:var(--pad-y) 0;border-bottom:var(--pair-b) solid var(--border);min-width:0}
/* Siste RAD mister streken — samme konvensjon som ListGroup. Med to kolonner
   er siste rad = siste barn + nest siste når det starter en rad (odd).
   --pen slår det andre leddet av i én-kolonnetilstand. */
.akhq-kvg-pair:last-child{--pair-b:0px}
.akhq-kvg-pair:nth-last-child(2):nth-child(odd){--pair-b:var(--pen)}
.akhq-kvg-k{margin:0;font-size:12.5px;color:var(--muted);min-width:0;text-wrap:pretty}
.akhq-kvg-v{margin:0;font-family:var(--mono);font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--fg);text-align:right;flex:0 1 auto;min-width:0;overflow-wrap:anywhere}
.akhq-kvg-v--text{font-family:var(--ui);text-align:right}
}
@layer akhq-container{
@container (max-width:420px){.akhq-kvg{--cols:1;--pen:1px}}
}
@layer akhq-modifier{
.akhq-kvg--one{--cols:1;--pen:1px}
.akhq-kvg--stack .akhq-kvg-pair{display:block}
.akhq-kvg--stack .akhq-kvg-v{text-align:left;margin-top:3px}
.akhq-kvg--plain .akhq-kvg-pair{--pair-b:0px;--pad-y:5px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-kvg")) { const s = document.createElement("style"); s.id = "akhq-css-kvg"; s.textContent = css; document.head.appendChild(s); }
export function KeyValueGrid({ items = [], columns = 2, layout = "inline", dividers = true, dataOdId = "kv", ...rest }) {
  const cls = "akhq-kvg" + (columns === 1 ? " akhq-kvg--one" : "") + (layout === "stack" ? " akhq-kvg--stack" : "") + (dividers ? "" : " akhq-kvg--plain");
  return (
    <div className="akhq-kvg-wrap">
      <dl className={cls} data-od-id={dataOdId} {...rest}>
        {items.map((it, i) => (
          <div className="akhq-kvg-pair" key={it.key || i}>
            <dt className="akhq-kvg-k">{it.key}</dt>
            <dd className={"akhq-kvg-v" + (it.mono === false ? " akhq-kvg-v--text" : "")}>{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
