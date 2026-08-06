import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-vvk-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-vvk{display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-vvk-hode{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-vvk-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-vvk-basis{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.akhq-vvk-rad{display:flex;align-items:center;gap:var(--s2);min-height:26px}
.akhq-vvk-navn{flex:1;min-width:0;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-vvk-prikker{display:flex;gap:4px;flex:none}
.akhq-vvk-p{width:8px;height:8px;border-radius:50%;background:var(--soft-hover);flex:none}
.akhq-vvk-v{flex:none;width:32px;text-align:right;font-family:var(--mono);font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-vvk-note{margin:0;font-family:var(--body);font-size:12.5px;color:var(--muted);line-height:1.5;max-width:52ch}
.akhq-vvk-pv{display:flex;gap:6px;align-items:baseline;font-family:var(--mono);font-size:9px;color:var(--mid);letter-spacing:.04em}
}
@layer akhq-container{
@container (max-width:320px){.akhq-vvk-navn{font-size:11.5px}}
}
@layer akhq-modifier{
.akhq-vvk--tett .akhq-vvk-rad{min-height:20px}
.akhq-vvk-p--fylt{background:var(--fg)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-vvk")) { const s = document.createElement("style"); s.id = "akhq-css-vvk"; s.textContent = css; document.head.appendChild(s); }
/* Velvære: spillerens EGENRAPPORT (søvn, energi, motivasjon, kropp) som
   1–5-prikker i blekk — aldri farget skala: en 2-er på søvn er informasjon
   til treningen, ikke en dom. LIFE-kodene bor i notatet når de brukes.
   PERSONVERN: egenrapporten er sensitiv — kun spilleren og coach ser den;
   for mindreårige aldri i sky-prompt uten anonymisering, aldri i
   foreldreportalen uten eget samtykke. Grensen mot SpillerTilstandKort:
   det er coachens dataaggregat; dette er spillerens stemme.
   Chromeless: Panel eier flaten. */
export function VelvaereKort({
  fields = [], note, basis, dense = false,
  state = "content",
  emptyText = "Ingen registrering i dag ennå. Ta de fire spørsmålene før økta.",
  dataOdId = "velvaere", ...rest
}) {
  return (
    <div className="akhq-vvk-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-vvk" + (dense ? " akhq-vvk--tett" : "")} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-vvk-hode">
            <span className="akhq-vvk-lab">Velvære</span>
            {basis && <span className="akhq-vvk-basis">{basis}</span>}
          </div>
          {fields.map((f, i) => (
            <div className="akhq-vvk-rad" key={f.label + i}>
              <span className="akhq-vvk-navn">{f.label}</span>
              <span className="akhq-vvk-prikker" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => <span key={n} className={"akhq-vvk-p" + (n <= f.value ? " akhq-vvk-p--fylt" : "")} />)}
              </span>
              <span className="akhq-vvk-v">{f.value}/5</span>
            </div>
          ))}
          {note && <p className="akhq-vvk-note">{note}</p>}
          <span className="akhq-vvk-pv">Kun du og coach ser dette.</span>
        </div>
      </Region>
    </div>
  );
}
