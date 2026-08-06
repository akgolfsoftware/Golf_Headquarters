import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-perpl-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-perpl{--blk-h:56px;--uker:block;display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-perpl-band{position:relative;display:flex;gap:2px;width:100%;min-width:0}
.akhq-perpl-blk{--tone:var(--mid);--floor:0px;flex-basis:0;min-width:0;appearance:none;border:1px solid var(--border);border-top:3px solid var(--tone);background:var(--surface);border-radius:var(--r-sm);min-height:max(var(--blk-h),var(--floor));padding:6px 8px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;color:var(--fg);transition:background var(--dur) var(--ease)}
.akhq-perpl-blk[data-kan-velges]{cursor:pointer}
.akhq-perpl-blk[data-kan-velges]:hover,.akhq-perpl-blk[data-state=hover]{background:var(--soft)}
.akhq-perpl-blk:focus-visible,.akhq-perpl-blk[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-perpl-typ{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.akhq-perpl-uker{display:var(--uker);font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-perpl-naa{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--fg);pointer-events:none}
.akhq-perpl-fot{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}
}
@layer akhq-container{
@container (max-width:480px){.akhq-perpl{--blk-h:44px;--uker:none}}
@media(pointer:coarse){.akhq-perpl-blk[data-kan-velges]{--floor:44px}}
[data-coarse-test] .akhq-perpl-blk[data-kan-velges]{--floor:44px}
}
@layer akhq-modifier{
.akhq-perpl-blk--grunn{--tone:var(--info)}
.akhq-perpl-blk--spes{--tone:var(--fg)}
.akhq-perpl-blk--turn{--tone:var(--up)}
.akhq-perpl-blk--valgt{border-color:var(--fg);box-shadow:inset 0 0 0 1px var(--fg)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-perpl")) { const s = document.createElement("style"); s.id = "akhq-css-perpl"; s.textContent = css; document.head.appendChild(s); }
const TYPER = { GRUNN: "grunn", SPES: "spes", TURN: "turn" };
/* Sesongbåndet: GRUNN / SPES / TURN som horisontale blokker der bredden er
   antall uker (flex-grow). Nå-markøren er en blekkstrek over båndet.
   Periodetypene er en LUKKET union — AK-periodiseringen har tre, og en
   fjerde legges inn her i biblioteket, aldri per skjerm. Fargene følger
   tonevalgene i resten av kalenderfamilien (GRUNN --info, SPES --fg,
   TURN --up) — aldri oransje: en periode er aldri skjermens ene handling.
   Komponenten regner ikke uker; konsumenten sender dem. */
export function Periodeplan({
  periods = [], selected, onSelectPeriod, nowPct, nowLabel,
  startLabel, endLabel,
  state = "content",
  emptyText = "Ingen sesongplan lagt ennå. Årshjulet settes opp i Workbench.",
  dataOdId = "periodeplan", ...rest
}) {
  const El = onSelectPeriod ? "button" : "div";
  const sum = "Sesongbånd: " + periods.map((p) => p.label + " " + p.weeks + " uker").join(", ") + (nowLabel ? ". Nå: " + nowLabel : "");
  return (
    <div className="akhq-perpl-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-perpl" data-od-id={"panel-" + dataOdId} {...rest}>
          <div className="akhq-perpl-band" role="img" aria-label={sum}>
            {periods.map((p) => (
              <El key={p.id || p.label}
                {...(onSelectPeriod ? { type: "button", onClick: () => onSelectPeriod(p.id || p.label), "data-kan-velges": "" } : {})}
                className={"akhq-perpl-blk akhq-perpl-blk--" + (TYPER[p.type] || "grunn") + (selected != null && (p.id || p.label) === selected ? " akhq-perpl-blk--valgt" : "")}
                style={{ flexGrow: Math.max(1, p.weeks || 1) }}
                data-od-id={"cta-" + dataOdId + "-" + (p.id || TYPER[p.type] || "periode")}>
                <span className="akhq-perpl-typ">{p.label}</span>
                <span className="akhq-perpl-uker">{p.weeks} uker</span>
              </El>
            ))}
            {typeof nowPct === "number" && (
              <span className="akhq-perpl-naa" style={{ left: Math.min(100, Math.max(0, nowPct)) + "%" }} aria-hidden="true" />
            )}
          </div>
          {(startLabel || endLabel) && (
            <div className="akhq-perpl-fot">
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
          )}
        </div>
      </Region>
    </div>
  );
}
