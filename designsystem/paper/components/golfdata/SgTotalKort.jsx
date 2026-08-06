import React from "react";
import { Region, sg } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sgt-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-sgt{--hero:40px;display:flex;flex-direction:column;gap:var(--s1);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-sgt-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-sgt-hero{font-family:var(--mono);font-size:var(--hero);font-weight:600;line-height:1.05;font-variant-numeric:tabular-nums}
.akhq-sgt-hero--up{color:var(--up)}
.akhq-sgt-hero--dn{color:var(--dn)}
.akhq-sgt-delta{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-sgt-delta-v{color:var(--fg);font-weight:600}
.akhq-sgt-basis{font-family:var(--mono);font-size:10px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:340px){.akhq-sgt{--hero:32px}}
}
@layer akhq-modifier{
.akhq-sgt--kompakt{--hero:28px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sgt")) { const s = document.createElement("style"); s.id = "akhq-css-sgt"; s.textContent = css; document.head.appendChild(s); }
/* SG-sammendraget: totalt Strokes Gained som hero-tall med fortegn og
   komma-desimal, delta mot forrige vindu, og basis (vindu + referanse) —
   alltid synlig, aldri et tall uten grunnlag. Grensen mot SgBreakdown:
   nedbrytningen per kategori bor der; dette er totalen. Chromeless:
   flaten eies av Panel (K2 er en åpen eierbeslutning — kortet er
   innholdslaget inntil Anders avgjør chromen). */
export function SgTotalKort({
  value, delta, deltaBasis, basis, compact = false,
  state = "content",
  emptyText = "Ingen SG-data ennå. Fem runder trengs for et pålitelig tall.",
  dataOdId = "sg-total", ...rest
}) {
  const tone = value >= 0 ? " akhq-sgt-hero--up" : " akhq-sgt-hero--dn";
  return (
    <div className="akhq-sgt-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-sgt" + (compact ? " akhq-sgt--kompakt" : "")} data-od-id={"kpi-" + dataOdId} {...rest}>
          <span className="akhq-sgt-lab">Strokes Gained totalt</span>
          <span className={"akhq-sgt-hero" + tone}>{sg(value)}</span>
          {delta != null && <span className="akhq-sgt-delta"><span className="akhq-sgt-delta-v">{(delta >= 0 ? "▲ +" : "▼ −") + Math.abs(delta).toLocaleString("nb-NO", { minimumFractionDigits: 2 })}</span> {deltaBasis}</span>}
          {basis && <span className="akhq-sgt-basis">{basis}</span>}
        </div>
      </Region>
    </div>
  );
}
