import React from "react";
import { Region, nf } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ssk-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-ssk{display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-ssk-hode{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-ssk-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-ssk-kolle{font-family:var(--mono);font-size:11px;font-weight:600}
.akhq-ssk-hero{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-ssk-v{font-family:var(--mono);font-size:32px;font-weight:600;line-height:1.05;font-variant-numeric:tabular-nums}
.akhq-ssk-maal{font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-ssk-strike{display:flex;height:12px;border-radius:999px;overflow:hidden;min-width:0}
.akhq-ssk-seg{min-width:2px}
.akhq-ssk-seg--hael{background:var(--mid)}
.akhq-ssk-seg--senter{background:var(--up-raw)}
.akhq-ssk-seg--taa{background:var(--muted)}
.akhq-ssk-legend{display:flex;gap:var(--s3);font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.akhq-ssk-lp{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.akhq-ssk-sw{width:7px;height:7px;border-radius:2px;flex:none}
.akhq-ssk-basis{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:340px){.akhq-ssk-v{font-size:26px}}
}
@layer akhq-modifier{
.akhq-ssk--kompakt .akhq-ssk-v{font-size:24px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ssk")) { const s = document.createElement("style"); s.id = "akhq-css-ssk"; s.textContent = css; document.head.appendChild(s); }
/* Treffkvaliteten: smash factor som hero-tall mot køllas mål, og
   treffbildet hæl/senter/tå som stablet bånd — senter er oliven (dit vil
   vi), hæl og tå gråtoner (avvik, ikke moral-rødt). Grensen mot
   LaunchWindowKort: ballens startvindu bor der; dette er kontakten.
   Chromeless: flaten eies av Panel. */
export function StrikeSmashKort({
  smash, smashTarget, club, heel = 0, center = 0, toe = 0, basis, compact = false,
  state = "content",
  emptyText = "Ingen treffdata ennå. Smash og treffbilde fylles fra neste TrackMan-økt.",
  dataOdId = "strikesmash", ...rest
}) {
  const sum = "Smash " + (smash != null ? nf(smash, 2) : "–") + (smashTarget ? " mot mål " + nf(smashTarget, 2) : "") + ". Treffbilde: hæl " + heel + " %, senter " + center + " %, tå " + toe + " %.";
  return (
    <div className="akhq-ssk-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-ssk" + (compact ? " akhq-ssk--kompakt" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-ssk-hode">
            <span className="akhq-ssk-lab">Smash og treffbilde</span>
            {club && <span className="akhq-ssk-kolle">{club}</span>}
          </div>
          <div className="akhq-ssk-hero">
            <span className="akhq-ssk-v">{smash != null ? nf(smash, 2) : "–"}</span>
            {smashTarget != null && <span className="akhq-ssk-maal">mål {nf(smashTarget, 2)}</span>}
          </div>
          <span className="akhq-ssk-strike" aria-hidden="true">
            <span className="akhq-ssk-seg akhq-ssk-seg--hael" style={{ flexGrow: Math.max(0.5, heel) }} />
            <span className="akhq-ssk-seg akhq-ssk-seg--senter" style={{ flexGrow: Math.max(0.5, center) }} />
            <span className="akhq-ssk-seg akhq-ssk-seg--taa" style={{ flexGrow: Math.max(0.5, toe) }} />
          </span>
          <span className="akhq-ssk-legend" aria-hidden="true">
            <span className="akhq-ssk-lp"><span className="akhq-ssk-sw akhq-ssk-seg--hael" />hæl {heel} %</span>
            <span className="akhq-ssk-lp"><span className="akhq-ssk-sw akhq-ssk-seg--senter" />senter {center} %</span>
            <span className="akhq-ssk-lp"><span className="akhq-ssk-sw akhq-ssk-seg--taa" />tå {toe} %</span>
          </span>
          {basis && <span className="akhq-ssk-basis">{basis}</span>}
        </div>
      </Region>
    </div>
  );
}
