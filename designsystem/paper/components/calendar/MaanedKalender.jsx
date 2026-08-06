import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-mkal-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-mkal{--cell-h:76px;--ukecol:28px;--fler:block;display:grid;grid-template-columns:var(--ukecol) repeat(7,1fr);gap:2px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-mkal-rad{display:contents}
.akhq-mkal-udag{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:center;padding:4px 0}
.akhq-mkal-uke{font-family:var(--mono);font-size:9.5px;color:var(--mid);display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
.akhq-mkal-d{--bgc:var(--surface);--bc:var(--border);--floor:0px;position:relative;appearance:none;border:1px solid var(--bc);background:var(--bgc);border-radius:var(--r-sm);min-height:max(var(--cell-h,76px),var(--floor));min-width:0;padding:4px 6px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;cursor:pointer;font-family:var(--mono);color:inherit;text-align:left;transition:background var(--dur) var(--ease)}
.akhq-mkal-d:hover,.akhq-mkal-d[data-state=hover]{--bgc:var(--soft)}
.akhq-mkal-d:focus-visible,.akhq-mkal-d[data-state=focus]{outline:2px solid var(--focus);outline-offset:1px}
.akhq-mkal-dt{font-size:11.5px;font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:4px}
.akhq-mkal-idagm{width:5px;height:5px;border-radius:999px;background:var(--fg);flex:none}
.akhq-mkal-dots{display:flex;align-items:center;gap:3px;margin-top:auto;min-height:5px}
.akhq-mkal-dot{--pyr:var(--mid);width:5px;height:5px;border-radius:999px;background:var(--pyr);flex:none}
.akhq-mkal-dot--fys{--pyr:var(--info)}
.akhq-mkal-dot--tek{--pyr:var(--fg)}
.akhq-mkal-dot--slag{--pyr:var(--mid)}
.akhq-mkal-dot--spill{--pyr:var(--muted)}
.akhq-mkal-dot--turn{--pyr:var(--up)}
.akhq-mkal-fler{display:var(--fler);font-size:9px;color:var(--muted)}
.akhq-mkal-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
}
@layer akhq-container{
@container (max-width:560px){.akhq-mkal{--cell-h:44px;--ukecol:20px;--fler:none}}
@media(pointer:coarse){.akhq-mkal-d{--floor:44px}}
[data-coarse-test] .akhq-mkal-d{--floor:44px}
}
@layer akhq-modifier{
.akhq-mkal-d--ute{--bgc:transparent;--bc:transparent;color:var(--mid)}
.akhq-mkal-d--valgt{--bc:var(--fg);box-shadow:inset 0 0 0 1px var(--fg)}
.akhq-mkal--tett{--cell-h:44px;--fler:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-mkal")) { const s = document.createElement("style"); s.id = "akhq-css-mkal"; s.textContent = css; document.head.appendChild(s); }
const UKEDAGER = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const MAKS_PRIKKER = 3;
/* MånedsRUTENETTET: ukedagshode, ukenummer-kolonne og en dagcelle per dag.
   Hver dag er ETT treffmål som åpner dagen — øktene vises som prikker i
   pyramideområdets farge (samme mapping som SessionCard), aldri som egne
   knapper i cellen. Navigasjon (forrige/neste måned) bor i flaten eller i
   UkeKalender-rammen — rutenettet navigerer ikke seg selv.
   Roving tabindex: ett tab-stopp, piltaster flytter mellom dagene. */
export function MaanedKalender({
  weeks = [], value, onSelectDay,
  state = "content",
  emptyText = "Ingen dager å vise ennå. Velg en måned i kalenderen.",
  dense = false, dataOdId = "mkal", ...rest
}) {
  const alleDager = weeks.flatMap((u) => u.days);
  const [fokus, setFokus] = React.useState(0);
  const refs = React.useRef([]);
  const flytt = (fra, delta) => {
    const til = fra + delta;
    if (til < 0 || til >= alleDager.length) return;
    setFokus(til);
    const n = refs.current[til];
    if (n) n.focus();
  };
  const tast = (idx) => (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); flytt(idx, 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); flytt(idx, -1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); flytt(idx, 7); }
    else if (e.key === "ArrowUp") { e.preventDefault(); flytt(idx, -7); }
  };
  let idx = -1;
  return (
    <div className="akhq-mkal-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-mkal" + (dense ? " akhq-mkal--tett" : "")} role="grid" data-od-id={"panel-" + dataOdId} {...rest}>
          <div className="akhq-mkal-rad" role="row">
            <span className="akhq-mkal-uke" role="columnheader" aria-label="Ukenummer" />
            {UKEDAGER.map((d) => <span key={d} className="akhq-mkal-udag" role="columnheader">{d}</span>)}
          </div>
          {weeks.map((uke) => (
            <div className="akhq-mkal-rad" role="row" key={uke.week}>
              <span className="akhq-mkal-uke" role="rowheader">{uke.week}</span>
              {uke.days.map((dag) => {
                idx += 1;
                const i = idx;
                const valgt = value != null && dag.key === value;
                const prikker = (dag.events || []).slice(0, MAKS_PRIKKER);
                const fler = (dag.events || []).length - prikker.length;
                return (
                  <button type="button" role="gridcell" key={dag.key}
                    ref={(n) => { refs.current[i] = n; }}
                    tabIndex={i === fokus ? 0 : -1}
                    onKeyDown={tast(i)}
                    onFocus={() => setFokus(i)}
                    className={"akhq-mkal-d" + (dag.inMonth === false ? " akhq-mkal-d--ute" : "") + (valgt ? " akhq-mkal-d--valgt" : "")}
                    aria-selected={valgt || undefined}
                    aria-current={dag.today ? "date" : undefined}
                    onClick={onSelectDay ? () => onSelectDay(dag.key) : undefined}
                    data-od-id={"cta-" + dataOdId + "-" + dag.key}>
                    <span className="akhq-mkal-dt">
                      {dag.date}
                      {dag.today && <span className="akhq-mkal-idagm" aria-hidden="true" />}
                    </span>
                    <span className="akhq-mkal-dots" aria-hidden="true">
                      {prikker.map((ev, j) => <span key={j} className={"akhq-mkal-dot akhq-mkal-dot--" + String(ev.area || "").toLowerCase()} />)}
                      {fler > 0 && <span className="akhq-mkal-fler">+{fler}</span>}
                    </span>
                    <span className="akhq-mkal-sr">
                      {(dag.events || []).length > 0 ? (dag.events || []).length + " økter. " : "Ingen økter. "}{dag.today ? "I dag. " : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Region>
    </div>
  );
}
