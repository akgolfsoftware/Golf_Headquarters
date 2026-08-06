import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pmod-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-pmod{display:flex;flex-direction:column;gap:3px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-pmod-hode{display:flex;align-items:baseline;gap:var(--s2);margin-bottom:2px}
.akhq-pmod-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-pmod-basis{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.akhq-pmod-rad{display:flex;align-items:center;gap:var(--s2);min-height:26px;min-width:0}
.akhq-pmod-d{flex:none;width:44px;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums;text-align:right}
.akhq-pmod-spor{position:relative;flex:1;height:8px;background:var(--soft);border-radius:999px;min-width:0;overflow:hidden}
.akhq-pmod-fyll{--tone:var(--info-raw);position:absolute;left:0;top:0;bottom:0;background:var(--tone);border-radius:999px}
.akhq-pmod-ref{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--fg);border-radius:1px}
.akhq-pmod-v{--ref:inline;flex:none;width:104px;text-align:right;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.akhq-pmod-naa{color:var(--fg);font-weight:600}
.akhq-pmod-refv{display:var(--ref)}
}
@layer akhq-container{
@container (max-width:380px){.akhq-pmod-v{width:52px}.akhq-pmod-refv{--ref:none}}
}
@layer akhq-modifier{
.akhq-pmod-fyll--over{--tone:var(--up-raw)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-pmod")) { const s = document.createElement("style"); s.id = "akhq-css-pmod"; s.textContent = css; document.head.appendChild(s); }
/* Putt-modellen: make-prosent per distanse i FOT (CANON: putting måles i
   ft, aldri meter) mot referansen for spillerens kategori. Fyllet er
   analyse-blå; over referansen tones oliven. Referansemarkøren er blekk.
   Grensen mot PuttLab (golfviz): PuttLab er øktens treningsdata; modellen
   er spillerens langsiktige kurve. Chromeless: flaten eies av Panel. */
export function PuttModellKort({
  rows = [], basis,
  state = "content",
  emptyText = "Ingen puttdata ennå. Modellen bygges fra putting-protokollene.",
  dataOdId = "puttmodell", ...rest
}) {
  const sum = "Putt-modell: " + rows.map((r) => r.ft + " fot " + r.display + " mot referanse " + r.refDisplay).join(", ");
  return (
    <div className="akhq-pmod-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-pmod" role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-pmod-hode">
            <span className="akhq-pmod-lab">Putt-modell · make-%</span>
            {basis && <span className="akhq-pmod-basis">{basis}</span>}
          </div>
          {rows.map((r, i) => (
            <div className="akhq-pmod-rad" key={r.ft + "-" + i}>
              <span className="akhq-pmod-d">{r.ft} ft</span>
              <span className="akhq-pmod-spor">
                <span className={"akhq-pmod-fyll" + (r.pct >= r.ref ? " akhq-pmod-fyll--over" : "")} style={{ width: Math.min(100, r.pct) + "%" }} />
                <span className="akhq-pmod-ref" style={{ left: Math.min(100, r.ref) + "%" }} />
              </span>
              <span className="akhq-pmod-v"><span className="akhq-pmod-naa">{r.display}</span><span className="akhq-pmod-refv"> · ref {r.refDisplay}</span></span>
            </div>
          ))}
        </div>
      </Region>
    </div>
  );
}
