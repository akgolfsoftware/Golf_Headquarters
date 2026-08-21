import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sl{display:flex;flex-direction:column;gap:var(--s3);width:100%;min-width:0;font-family:var(--ui)}
.akhq-sl-rad{display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap}
.akhq-sl-felt{display:flex;flex-direction:column;gap:2px}
.akhq-sl-lab{font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.akhq-sl-logg{--floor:0px;height:max(36px,var(--floor));padding:0 var(--s4);border:1px solid var(--fg);border-radius:var(--r-pill);background:var(--fg);color:var(--surface);font-family:var(--ui);font-size:13px;font-weight:600;cursor:pointer;margin-left:auto}
.akhq-sl-logg:hover{background:var(--ink-soft)}
.akhq-sl-logg:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-sl-liste{display:flex;flex-direction:column;gap:6px}
.akhq-sl-sett{display:flex;align-items:center;gap:var(--s2);padding:6px var(--s2);border-radius:var(--r-sm);background:var(--soft)}
.akhq-sl-nr{font-family:var(--mono);font-size:10.5px;color:var(--muted);width:18px;flex:none}
.akhq-sl-v{font-family:var(--mono);font-size:12.5px;color:var(--fg);font-variant-numeric:tabular-nums}
.akhq-sl-fjern{--floor:0px;margin-left:auto;width:max(24px,var(--floor));height:max(24px,var(--floor));display:flex;align-items:center;justify-content:center;border:none;background:none;color:var(--muted);cursor:pointer;font-size:14px}
.akhq-sl-fjern:hover{color:var(--fg)}
.akhq-sl-tom{font-size:12.5px;color:var(--muted)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-sl-logg{--floor:44px}.akhq-sl-fjern{--floor:44px}}
[data-coarse-test] .akhq-sl-logg,[data-coarse-test] .akhq-sl-fjern{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sl")) { const s = document.createElement("style"); s.id = "akhq-css-sl"; s.textContent = css; document.head.appendChild(s); }
const tall = (n) => (typeof n === "number" ? String(Math.round(n * 10) / 10).replace(".", ",") : n);
const med = (n, e) => tall(n) + " " + e;
/* FYS-serielogging i live-økt: reps + vekt (2,5 kg-steg) → «Logg sett» →
   settet legges i lista. Egen kontroll fordi FYS-drills ikke telles som
   golf-reps (manifest playerhq-live-okt, 20.08.2026) — vekt er den andre
   dimensjonen kondisjons-/teknikk-drills ikke har. */
export function SettLogger({ reps, vekt, onRepsChange, onVektChange, vektSteg = 2.5, sett = [], onLoggSett, onFjernSett, dataOdId = "settlogger" }) {
  return (
    <div className="akhq-sl" data-od-id={dataOdId}>
      <div className="akhq-sl-rad">
        <div className="akhq-sl-felt">
          <span className="akhq-sl-lab">Reps</span>
          <span className="akhq-sl-v">{tall(reps)}</span>
        </div>
        <div className="akhq-sl-felt">
          <span className="akhq-sl-lab">Vekt</span>
          <span className="akhq-sl-v">{tall(vekt)} kg</span>
        </div>
        <button type="button" className="akhq-sl-logg" onClick={() => onLoggSett && onLoggSett({ reps, vekt })} data-od-id={dataOdId + "-logg"}>
          Logg sett
        </button>
      </div>
      <div className="akhq-sl-liste" role="list" aria-label="Loggede sett">
        {sett.length === 0 && <span className="akhq-sl-tom">Ingen sett logget ennå</span>}
        {sett.map((s, i) => (
          <div className="akhq-sl-sett" role="listitem" key={i}>
            <span className="akhq-sl-nr">{i + 1}</span>
            <span className="akhq-sl-v">{tall(s.reps)} × {tall(s.vekt)} kg</span>
            {onFjernSett && (
              <button type="button" className="akhq-sl-fjern" onClick={() => onFjernSett(i)} aria-label={"Fjern sett " + (i + 1)} data-od-id={dataOdId + "-fjern-" + i}>×</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
