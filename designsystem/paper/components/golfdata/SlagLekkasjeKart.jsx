import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lekk-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-lekk{display:flex;flex-direction:column;gap:3px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-lekk-hode{display:flex;align-items:baseline;gap:var(--s2);margin-bottom:2px}
.akhq-lekk-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-lekk-basis{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.akhq-lekk-rad{display:flex;align-items:center;gap:var(--s2);min-height:28px;min-width:0}
.akhq-lekk-navn{flex:none;width:128px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lekk-spor{flex:1;height:10px;min-width:0;background:var(--soft);border-radius:999px;overflow:hidden;position:relative}
.akhq-lekk-fyll{position:absolute;left:0;top:0;bottom:0;background:color-mix(in srgb, var(--dn) 55%, var(--surface));border-radius:999px}
.akhq-lekk-v{flex:none;width:64px;text-align:right;font-family:var(--mono);font-size:10.5px;font-weight:600;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-lekk-note{font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:2px}
}
@layer akhq-container{
@container (max-width:380px){.akhq-lekk-navn{width:92px;font-size:11px}}
}
@layer akhq-modifier{
.akhq-lekk--tett .akhq-lekk-rad{min-height:22px}
.akhq-lekk-fyll--verst{background:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lekk")) { const s = document.createElement("style"); s.id = "akhq-css-lekk"; s.textContent = css; document.head.appendChild(s); }
/* Slaglekkasjen: hvor slagene renner ut, rangert etter SG-tap. Konsumenten
   sender radene ferdig sortert (størst lekkasje først); den øverste tones
   full leire, resten dempet. Verdien er alltid signert SG med
   komma-desimal («−1,84»). Grensen mot SgBreakdown: nedbrytningen viser
   ALLE kategorier begge veier; lekkasjekartet viser bare tapene, rangert.
   Chromeless: flaten eies av Panel. */
export function SlagLekkasjeKart({
  rows = [], basis, note, dense = false,
  state = "content",
  emptyText = "Ingen lekkasjer funnet ennå — eller for få runder til å se mønsteret.",
  dataOdId = "slaglekkasje", ...rest
}) {
  const maks = Math.max(0.1, ...rows.map((r) => Math.abs(r.sg)));
  const sum = "Slaglekkasje: " + rows.map((r) => r.label + " " + r.display).join(", ");
  return (
    <div className="akhq-lekk-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-lekk" + (dense ? " akhq-lekk--tett" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-lekk-hode">
            <span className="akhq-lekk-lab">Størst lekkasje</span>
            {basis && <span className="akhq-lekk-basis">{basis}</span>}
          </div>
          {rows.map((r, i) => (
            <div className="akhq-lekk-rad" key={r.label + i}>
              <span className="akhq-lekk-navn">{r.label}</span>
              <span className="akhq-lekk-spor">
                <span className={"akhq-lekk-fyll" + (i === 0 ? " akhq-lekk-fyll--verst" : "")} style={{ width: (Math.abs(r.sg) / maks) * 100 + "%" }} />
              </span>
              <span className="akhq-lekk-v">{r.display}</span>
            </div>
          ))}
          {note && <p className="akhq-lekk-note">{note}</p>}
        </div>
      </Region>
    </div>
  );
}
