import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pfas-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-pfas{--fh:56px;--vrd:block;display:flex;gap:var(--s1);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-pfas-f{--pyr:var(--mid);--bgc:var(--surface);--floor:0px;position:relative;flex:1;min-width:0;appearance:none;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:6px 8px;min-height:max(var(--fh),var(--floor));border:1px solid var(--border);background:var(--bgc);border-radius:var(--r-sm);text-align:left;color:var(--fg);box-sizing:border-box}
.akhq-pfas-f[data-kan-velges]{cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-pfas-f[data-kan-velges]:hover,.akhq-pfas-f[data-state=hover]{--bgc:var(--soft)}
.akhq-pfas-f:focus-visible,.akhq-pfas-f[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-pfas-omr{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
.akhq-pfas-vrd{display:var(--vrd);font-family:var(--mono);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-pfas-bar{position:relative;width:100%;height:3px;background:var(--soft);border-radius:999px;margin-top:auto;overflow:hidden}
.akhq-pfas-fyll{position:absolute;left:0;top:0;bottom:0;background:var(--pyr);border-radius:999px}
.akhq-pfas-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
}
@layer akhq-container{
@container (max-width:420px){.akhq-pfas{--fh:44px;--vrd:none}}
@media(pointer:coarse){.akhq-pfas-f[data-kan-velges]{--floor:44px}}
[data-coarse-test] .akhq-pfas-f[data-kan-velges]{--floor:44px}
}
@layer akhq-modifier{
.akhq-pfas-f--fys{--pyr:var(--info)}
.akhq-pfas-f--tek{--pyr:var(--fg)}
.akhq-pfas-f--slag{--pyr:var(--mid)}
.akhq-pfas-f--spill{--pyr:var(--muted)}
.akhq-pfas-f--turn{--pyr:var(--up)}
.akhq-pfas-f--valgt{border-color:var(--fg);box-shadow:inset 0 0 0 1px var(--fg)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-pfas")) { const s = document.createElement("style"); s.id = "akhq-css-pfas"; s.textContent = css; document.head.appendChild(s); }
const REKKEFOLGE = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const KLASSE = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
/* Pyramidens fem områder som fasetter på rad: andel/volum per område, med
   valgfri klikk som filter. Rekkefølgen er PYRAMIDEN (FYS→TEK→SLAG→SPILL→
   TURN) og kan ikke overstyres — fundamentet står alltid først. Fargene er
   SessionCards pyramidemapping. Grensen mot PyramidProgress (golfviz):
   den viser NIVÅ oppover i pyramiden; fasetten viser FORDELING på tvers og
   filtrerer. Grensen mot BudgetBar: BudgetBar eier ukebudsjettet med
   invarianter; fasetten er en generisk fordeling uten regler. */
export function PyramideFasett({
  items = [], selected, onSelect,
  state = "content",
  emptyText = "Ingen fordeling ennå. Områdene fylles når økter er logget.",
  dataOdId = "pyramide", ...rest
}) {
  const kart = new Map(items.map((d) => [d.area, d]));
  const maks = Math.max(1, ...items.map((d) => d.value || 0));
  const El = onSelect ? "button" : "div";
  return (
    <div className="akhq-pfas-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-pfas" role={onSelect ? "group" : "img"} aria-label={"Pyramidefordeling: " + REKKEFOLGE.map((a) => a + " " + ((kart.get(a) || {}).display || "0")).join(", ")} data-od-id={"kpi-" + dataOdId} {...rest}>
          {REKKEFOLGE.map((a) => {
            const d = kart.get(a) || { value: 0, display: "0" };
            const valgt = selected === a;
            return (
              <El key={a}
                {...(onSelect ? { type: "button", onClick: () => onSelect(a), "data-kan-velges": "", "aria-pressed": valgt ? "true" : "false", "data-od-id": "cta-" + dataOdId + "-" + KLASSE[a] } : {})}
                className={"akhq-pfas-f akhq-pfas-f--" + KLASSE[a] + (valgt ? " akhq-pfas-f--valgt" : "")}>
                <span className="akhq-pfas-omr">{a}</span>
                <span className="akhq-pfas-vrd">{d.display != null ? d.display : d.value}</span>
                <span className="akhq-pfas-bar" aria-hidden="true"><span className="akhq-pfas-fyll" style={{ width: ((d.value || 0) / maks) * 100 + "%" }} /></span>
                {onSelect && <span className="akhq-pfas-sr">{a}: {d.display != null ? d.display : d.value}</span>}
              </El>
            );
          })}
        </div>
      </Region>
    </div>
  );
}
