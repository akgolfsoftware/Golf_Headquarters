import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-kfjell-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-kfjell{--h:120px;--lab:flex;display:flex;flex-direction:column;gap:4px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-kfjell-svg{display:block;width:100%;height:var(--h);border-bottom:1px solid var(--hairline)}
.akhq-kfjell-omriss{fill:var(--soft-hover);stroke:var(--fg);stroke-width:1.5;vector-effect:non-scaling-stroke}
.akhq-kfjell-krav{fill:none;stroke:var(--info-raw);stroke-width:1.5;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
.akhq-kfjell-labrad{display:var(--lab);gap:2px}
.akhq-kfjell-klab{flex:1;min-width:0;text-align:center;font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.akhq-kfjell-klab--fokus{color:var(--fg);font-weight:600}
.akhq-kfjell-legend{display:flex;gap:var(--s4);font-family:var(--mono);font-size:10px;color:var(--muted)}
.akhq-kfjell-lstrek{display:inline-block;width:14px;height:0;border-top:2px solid var(--fg);vertical-align:middle;margin-right:5px}
.akhq-kfjell-lstrek--krav{border-top-style:dashed;border-top-color:var(--info-raw)}
}
@layer akhq-container{
@container (max-width:380px){.akhq-kfjell{--h:88px}.akhq-kfjell-klab{font-size:8.5px}}
}
@layer akhq-modifier{
.akhq-kfjell--lav{--h:88px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-kfjell")) { const s = document.createElement("style"); s.id = "akhq-css-kfjell"; s.textContent = css; document.head.appendChild(s); }
/* Kategorifjellet: spillerens profil over A–K-kategoriene som silhuett, med
   kravlinjen (kategoriens standard) stiplet i analyse-blå over. Der
   silhuetten ligger under kravlinjen, er gapet synlig som avstand — aldri
   som rød flate; fjellet dokumenterer, dømmer ikke. Kategorirekkefølgen
   kommer fra konsumenten (CANON eier retningen A→K vs K→A). Ren visning. */
export function KategoriFjell({
  categories = [], maxValue = 100, focus, low = false, showLegend = true,
  state = "content",
  emptyText = "Ingen kategoriprofil ennå. Testprotokollene fyller fjellet.",
  ariaLabel, dataOdId = "kategorifjell", ...rest
}) {
  const n = categories.length;
  const px = (i) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const py = (v) => 40 - Math.min(40, (v / maxValue) * 40);
  const omriss = "0,40 " + categories.map((c, i) => px(i) + "," + py(c.value)).join(" ") + " 100,40";
  const krav = categories.some((c) => typeof c.krav === "number")
    ? categories.map((c, i) => px(i) + "," + py(c.krav != null ? c.krav : 0)).join(" ")
    : null;
  const sum = ariaLabel || "Kategoriprofil: " + categories.map((c) => c.label + " " + (c.display != null ? c.display : c.value)).join(", ");
  return (
    <div className="akhq-kfjell-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-kfjell" + (low ? " akhq-kfjell--lav" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <svg className="akhq-kfjell-svg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <polygon className="akhq-kfjell-omriss" points={omriss} />
            {krav && <polyline className="akhq-kfjell-krav" points={krav} />}
          </svg>
          <span className="akhq-kfjell-labrad" aria-hidden="true">
            {categories.map((c) => (
              <span key={c.label} className={"akhq-kfjell-klab" + (focus === c.label ? " akhq-kfjell-klab--fokus" : "")}>{c.label}</span>
            ))}
          </span>
          {showLegend && krav && (
            <span className="akhq-kfjell-legend" aria-hidden="true">
              <span><span className="akhq-kfjell-lstrek" />nivå nå</span>
              <span><span className="akhq-kfjell-lstrek akhq-kfjell-lstrek--krav" />kategorikrav</span>
            </span>
          )}
        </div>
      </Region>
    </div>
  );
}
