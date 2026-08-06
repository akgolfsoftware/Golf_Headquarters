import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-afb-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-afb{--bh:14px;--legend:flex;display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-afb-band{display:flex;height:var(--bh);border-radius:999px;overflow:hidden;min-width:0}
.akhq-afb-seg{--tone:var(--mid);background:var(--tone);min-width:2px}
.akhq-afb-legend{display:var(--legend);flex-wrap:wrap;gap:var(--s2) var(--s4);font-family:var(--mono);font-size:10px;color:var(--muted)}
.akhq-afb-l{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.akhq-afb-sw{--tone:var(--mid);width:8px;height:8px;border-radius:2px;background:var(--tone);flex:none}
.akhq-afb-pct{color:var(--fg);font-variant-numeric:tabular-nums}
}
@layer akhq-container{
@container (max-width:340px){.akhq-afb{--bh:12px}}
}
@layer akhq-modifier{
.akhq-afb--tynn{--bh:8px}
.akhq-afb--uten-legend{--legend:none}
.akhq-afb-seg--ink{--tone:var(--fg)}
.akhq-afb-seg--info{--tone:var(--info-raw)}
.akhq-afb-seg--up{--tone:var(--up-raw)}
.akhq-afb-seg--mid{--tone:var(--mid)}
.akhq-afb-seg--soft{--tone:var(--soft-hover)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-afb")) { const s = document.createElement("style"); s.id = "akhq-css-afb"; s.textContent = css; document.head.appendChild(s); }
const TONER = ["ink", "info", "up", "mid", "soft"];
/* Fordeling over én akse som ETT stablet bånd: slagfordeling per kategori,
   tid per selskap, score per hulltype. Tonene tildeles fra en LUKKET
   femtonersliste i segmentrekkefølge (blekk, analyse-blå, oliven, mid,
   soft) — en skjerm velger aldri farger selv. Maks fem segmenter; flere
   leses ikke i et bånd, da er det BarChart eller DataTable. */
export function AkseFordelingsBar({
  segments = [], thin = false, hideLegend = false,
  state = "content",
  emptyText = "Ingen fordeling å vise ennå.",
  ariaLabel, dataOdId = "fordeling", ...rest
}) {
  const brukte = segments.slice(0, 5);
  const sum = ariaLabel || "Fordeling: " + brukte.map((s) => s.label + " " + (s.display != null ? s.display : s.pct + " prosent")).join(", ");
  return (
    <div className="akhq-afb-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-afb" + (thin ? " akhq-afb--tynn" : "") + (hideLegend ? " akhq-afb--uten-legend" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <span className="akhq-afb-band">
            {brukte.map((s, i) => (
              <span key={s.label + i} className={"akhq-afb-seg akhq-afb-seg--" + (s.tone || TONER[i])} style={{ flexGrow: Math.max(0.5, s.pct) }} />
            ))}
          </span>
          <span className="akhq-afb-legend" aria-hidden="true">
            {brukte.map((s, i) => (
              <span className="akhq-afb-l" key={s.label + i}>
                <span className={"akhq-afb-sw akhq-afb-seg--" + (s.tone || TONER[i])} />
                {s.label} <span className="akhq-afb-pct">{s.display != null ? s.display : s.pct + " %"}</span>
              </span>
            ))}
          </span>
        </div>
      </Region>
    </div>
  );
}
