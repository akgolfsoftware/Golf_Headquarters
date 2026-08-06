import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-t5-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-t5{display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-t5-rad{display:flex;align-items:center;gap:var(--s2);min-height:30px;min-width:0}
.akhq-t5-prikk{--tone:var(--up);width:7px;height:7px;border-radius:999px;background:var(--tone);flex:none}
.akhq-t5-navn{flex:1;min-width:0;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-t5-tall{flex:none;font-family:var(--mono);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-t5-sum{display:flex;align-items:baseline;gap:var(--s2);margin-top:var(--s2);padding-top:var(--s2);border-top:1px solid var(--hairline)}
.akhq-t5-sum-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-t5-sum-v{font-family:var(--mono);font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-t5-basis{font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:2px}
}
@layer akhq-container{
@container (max-width:320px){.akhq-t5-navn{font-size:11.5px}}
}
@layer akhq-modifier{
.akhq-t5-prikk--avvik{--tone:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-t5")) { const s = document.createElement("style"); s.id = "akhq-css-t5"; s.textContent = css; document.head.appendChild(s); }
const NAVN = [
  "Bogey eller verre på par 5",
  "Dobbeltbogey eller verre",
  "Tre putt eller flere",
  "Bogey innenfor 9-jern",
  "Uforsert straffeslag",
];
/* Tiger Five: de fem feilene som koster mest, telt per runde eller vindu.
   Målet er null — hver rad med 0 får oliven prikk, alt over null leire.
   Metrikk-navnene er LÅST (Tiger Five er et etablert rammeverk i
   strategibiblioteket) — konsumenten sender bare tallene i fast rekkefølge.
   Chromeless: flaten eies av Panel. */
export function TigerFiveKort({
  counts = [], basis,
  state = "content",
  emptyText = "Ingen runder registrert ennå. Tiger Five telles fra første scorekort.",
  dataOdId = "tiger-five", ...rest
}) {
  const total = counts.reduce((a, b) => a + (b || 0), 0);
  return (
    <div className="akhq-t5-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-t5" data-od-id={"kpi-" + dataOdId} {...rest}>
          {NAVN.map((navn, i) => {
            const c = counts[i] || 0;
            return (
              <div className="akhq-t5-rad" key={navn}>
                <span className={"akhq-t5-prikk" + (c > 0 ? " akhq-t5-prikk--avvik" : "")} aria-hidden="true" />
                <span className="akhq-t5-navn">{navn}</span>
                <span className="akhq-t5-tall">{c}</span>
              </div>
            );
          })}
          <div className="akhq-t5-sum">
            <span className="akhq-t5-sum-lab">Tiger Five totalt · mål 0</span>
            <span className="akhq-t5-sum-v">{total}</span>
          </div>
          {basis && <span className="akhq-t5-basis">{basis}</span>}
        </div>
      </Region>
    </div>
  );
}
