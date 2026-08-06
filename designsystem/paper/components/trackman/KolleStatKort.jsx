import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-kolle-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-kolle{display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-kolle-hode{display:flex;align-items:baseline;gap:var(--s2);margin-bottom:var(--s2)}
.akhq-kolle-navn{font-size:14px;font-weight:600;flex:1}
.akhq-kolle-antall{font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-kolle-carry{display:flex;align-items:baseline;gap:var(--s2);margin-bottom:var(--s2)}
.akhq-kolle-cv{font-family:var(--mono);font-size:24px;font-weight:600;line-height:1.05;font-variant-numeric:tabular-nums}
.akhq-kolle-spred{font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-kolle-rad{display:flex;align-items:baseline;gap:var(--s2);min-height:24px}
.akhq-kolle-rlab{flex:1;min-width:0;font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-kolle-rv{flex:none;font-family:var(--mono);font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-kolle-rad:not(:last-child){border-bottom:1px solid var(--hairline)}
}
@layer akhq-container{
@container (max-width:320px){.akhq-kolle-cv{font-size:20px}}
}
@layer akhq-modifier{
.akhq-kolle--tett .akhq-kolle-rad{min-height:20px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-kolle")) { const s = document.createElement("style"); s.id = "akhq-css-kolle"; s.textContent = css; document.head.appendChild(s); }
/* Køllas tall: carry som hero (med spredning ±), deretter parametre som
   label/verdi-rader med hårlinjer — siste rad uten strek (sett lukkes
   ikke). Spredningen står ALLTID sammen med snittet: et snitt uten
   spredning lyver om en golfkølle. Grensen mot GappingChart: gapping viser
   ALLE køllene mot hverandre; dette kortet er ÉN kølles dybde.
   Chromeless: flaten eies av Panel. */
export function KolleStatKort({
  club, count, carry, carrySpread, rows = [], dense = false,
  state = "content",
  emptyText = "Ingen målinger for denne kølla ennå.",
  dataOdId = "kollestat", ...rest
}) {
  return (
    <div className="akhq-kolle-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-kolle" + (dense ? " akhq-kolle--tett" : "")} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-kolle-hode">
            <span className="akhq-kolle-navn">{club}</span>
            {count != null && <span className="akhq-kolle-antall">{count} slag</span>}
          </div>
          {carry && (
            <div className="akhq-kolle-carry">
              <span className="akhq-kolle-cv">{carry}</span>
              {carrySpread && <span className="akhq-kolle-spred">{carrySpread}</span>}
            </div>
          )}
          {rows.map((r, i) => (
            <div className="akhq-kolle-rad" key={r.label + i}>
              <span className="akhq-kolle-rlab">{r.label}</span>
              <span className="akhq-kolle-rv">{r.value}</span>
            </div>
          ))}
        </div>
      </Region>
    </div>
  );
}
