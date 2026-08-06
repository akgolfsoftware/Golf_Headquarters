import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-kkrav-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-kkrav{display:flex;flex-direction:column;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-kkrav-hode{display:flex;align-items:baseline;gap:var(--s2);margin-bottom:var(--s2)}
.akhq-kkrav-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-kkrav-status{font-family:var(--mono);font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-kkrav-rad{display:flex;align-items:center;gap:var(--s2);min-height:32px;min-width:0}
.akhq-kkrav-merke{flex:none;width:14px;font-family:var(--mono);font-size:11px;color:var(--up);text-align:center}
.akhq-kkrav-merke--gap{color:var(--muted)}
.akhq-kkrav-navn{flex:1;min-width:0;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-kkrav-verdi{--naa:inline;flex:none;font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-kkrav-naa{display:var(--naa);color:var(--fg);font-weight:600}
}
@layer akhq-container{
@container (max-width:340px){.akhq-kkrav-navn{font-size:11.5px}}
}
@layer akhq-modifier{
.akhq-kkrav--tett .akhq-kkrav-rad{min-height:26px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-kkrav")) { const s = document.createElement("style"); s.id = "akhq-css-kkrav"; s.textContent = css; document.head.appendChild(s); }
/* Kravene til neste kategori (A–K): én rad per testprotokoll med nå-verdi
   mot krav, ✓ når kravet er møtt. Kravene er ANBEFALINGER på veien —
   ingenting sperres av et umøtt krav (invariant 1); raden viser avstanden,
   aldri en lås. Kravverdiene kommer fra CANON via konsumenten — komponenten
   hardkoder aldri referanseverdier (FYS-formelen avventer Anders).
   Chromeless: flaten eies av Panel. */
export function KategoriKravKort({
  fromCategory, toCategory, requirements = [], dense = false,
  state = "content",
  emptyText = "Ingen kravdata ennå. Testprotokollene fyller lista.",
  dataOdId = "kategorikrav", ...rest
}) {
  const møtt = requirements.filter((r) => r.met).length;
  return (
    <div className="akhq-kkrav-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-kkrav" + (dense ? " akhq-kkrav--tett" : "")} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-kkrav-hode">
            <span className="akhq-kkrav-lab">Krav {fromCategory} → {toCategory}</span>
            <span className="akhq-kkrav-status">{møtt} av {requirements.length} møtt</span>
          </div>
          {requirements.map((r, i) => (
            <div className="akhq-kkrav-rad" key={r.label + i}>
              <span className={"akhq-kkrav-merke" + (r.met ? "" : " akhq-kkrav-merke--gap")} aria-hidden="true">{r.met ? "✓" : "·"}</span>
              <span className="akhq-kkrav-navn">{r.label}</span>
              <span className="akhq-kkrav-verdi"><span className="akhq-kkrav-naa">{r.current}</span> / {r.required}</span>
            </div>
          ))}
        </div>
      </Region>
    </div>
  );
}
