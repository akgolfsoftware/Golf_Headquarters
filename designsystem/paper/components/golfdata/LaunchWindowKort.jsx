import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lwin-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-lwin{display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-lwin-hode{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-lwin-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-lwin-kolle{font-family:var(--mono);font-size:11px;font-weight:600}
.akhq-lwin-rad{display:flex;align-items:center;gap:var(--s2);min-height:28px;min-width:0}
.akhq-lwin-p{flex:none;width:88px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lwin-spor{position:relative;flex:1;height:10px;min-width:0}
.akhq-lwin-band{position:absolute;top:2px;bottom:2px;background:var(--soft-hover);border-radius:999px}
.akhq-lwin-m{--tone:var(--fg);position:absolute;top:0;bottom:0;width:3px;margin-left:-1.5px;background:var(--tone);border-radius:2px}
.akhq-lwin-v{--vind:inline;display:var(--vind);flex:none;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.akhq-lwin-naa{color:var(--fg);font-weight:600}
}
@layer akhq-container{
@container (max-width:380px){.akhq-lwin-p{width:64px;font-size:11px}.akhq-lwin-v{--vind:none}}
}
@layer akhq-modifier{
.akhq-lwin-m--ut{--tone:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lwin")) { const s = document.createElement("style"); s.id = "akhq-css-lwin"; s.textContent = css; document.head.appendChild(s); }
/* Launch-vinduet: målte utskytningsparametre (launch, spinn, angrepsvinkel)
   mot målvinduet per kølle. Bandet er vinduet; markøren er målingen —
   innenfor blekk, utenfor leire. Vinduet med tall står til høyre
   («12,4° · vindu 11–14°»); under 380 px bærer sporet alene og verdiene
   ligger i aria. Chromeless: flaten eies av Panel. Grensen mot
   StrikeSmashKort: treffbildet bor der; dette er ballens start. */
export function LaunchWindowKort({
  club, params = [],
  state = "content",
  emptyText = "Ingen TrackMan-måling ennå. Vinduene fylles fra neste økt.",
  dataOdId = "launchvindu", ...rest
}) {
  const sum = "Launch-vindu " + (club || "") + ": " + params.map((p) => p.label + " " + p.display + (p.inWindow ? " innenfor" : " utenfor") + " vinduet " + p.windowDisplay).join(", ");
  return (
    <div className="akhq-lwin-wrap">
      <Region state={state} empty={emptyText}>
        <div className="akhq-lwin" role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-lwin-hode">
            <span className="akhq-lwin-lab">Launch-vindu</span>
            {club && <span className="akhq-lwin-kolle">{club}</span>}
          </div>
          {params.map((p, i) => {
            const span = p.scaleMax - p.scaleMin || 1;
            const vFra = ((p.windowMin - p.scaleMin) / span) * 100;
            const vTil = ((p.windowMax - p.scaleMin) / span) * 100;
            const mx = Math.min(100, Math.max(0, ((p.value - p.scaleMin) / span) * 100));
            return (
              <div className="akhq-lwin-rad" key={p.label + i}>
                <span className="akhq-lwin-p">{p.label}</span>
                <span className="akhq-lwin-spor">
                  <span className="akhq-lwin-band" style={{ left: vFra + "%", width: (vTil - vFra) + "%" }} />
                  <span className={"akhq-lwin-m" + (p.inWindow ? "" : " akhq-lwin-m--ut")} style={{ left: mx + "%" }} />
                </span>
                <span className="akhq-lwin-v"><span className="akhq-lwin-naa">{p.display}</span> · vindu {p.windowDisplay}</span>
              </div>
            );
          })}
        </div>
      </Region>
    </div>
  );
}
