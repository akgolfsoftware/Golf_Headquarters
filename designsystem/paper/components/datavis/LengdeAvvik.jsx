import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lavv-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-lavv{--radh:26px;--lab:76px;--vrd:88px;display:flex;flex-direction:column;gap:3px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-lavv-hd{display:flex;font-family:var(--mono);font-size:9px;color:var(--mid);text-transform:uppercase;letter-spacing:.08em}
.akhq-lavv-hd-k{width:calc(var(--lab) + (100% - var(--lab) - var(--vrd))/2);text-align:right;padding-right:6px;box-sizing:border-box}
.akhq-lavv-hd-l{flex:1;padding-left:6px}
.akhq-lavv-rad{display:flex;align-items:center;height:var(--radh);min-width:0}
.akhq-lavv-klab{flex:none;width:var(--lab);font-family:var(--mono);font-size:10.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-lavv-spor{position:relative;flex:1;height:12px;min-width:0}
.akhq-lavv-null{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--hairline)}
.akhq-lavv-stolpe{--tone:var(--mid);position:absolute;top:1px;bottom:1px;background:var(--tone);border-radius:2px}
.akhq-lavv-vrd{flex:none;width:var(--vrd);text-align:right;font-family:var(--mono);font-size:10.5px;color:var(--fg);font-variant-numeric:tabular-nums;white-space:nowrap}
}
@layer akhq-container{
@container (max-width:380px){.akhq-lavv{--lab:56px;--vrd:72px}}
}
@layer akhq-modifier{
.akhq-lavv--tett{--radh:20px}
.akhq-lavv-stolpe--flagg{--tone:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lavv")) { const s = document.createElement("style"); s.id = "akhq-css-lavv"; s.textContent = css; document.head.appendChild(s); }
/* Lengdeavvik rundt null: carry mot mål per kølle, avstand mot pin per
   lengdeklasse. Venstre = kort, høyre = langt, nullinjen er målet. Avvik er
   RETNING, ikke moral — begge sider er --mid; kun rader konsumenten flagger
   (utenfor toleranse) tones --dn leire. Verdien står alltid med enhet og
   retning («+6 m langt»), aldri bare et tall. */
export function LengdeAvvik({
  rows = [], maxAbs, kortLabel = "kort", langtLabel = "langt",
  dense = false, state = "content",
  emptyText = "Ingen lengdedata ennå. Avvikene tegnes når slagene er målt.",
  ariaLabel, dataOdId = "lengdeavvik", ...rest
}) {
  const topp = maxAbs || Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  const sum = ariaLabel || "Lengdeavvik: " + rows.map((r) => r.label + " " + r.display).join(", ");
  return (
    <div className="akhq-lavv-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-lavv" + (dense ? " akhq-lavv--tett" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <div className="akhq-lavv-hd" aria-hidden="true">
            <span className="akhq-lavv-hd-k">← {kortLabel}</span>
            <span className="akhq-lavv-hd-l">{langtLabel} →</span>
          </div>
          {rows.map((r, i) => {
            const pct = Math.min(100, (Math.abs(r.value) / topp) * 100) / 2;
            const stil = r.value >= 0
              ? { left: "50%", width: pct + "%" }
              : { right: "50%", width: pct + "%" };
            return (
              <div className="akhq-lavv-rad" key={r.label + i}>
                <span className="akhq-lavv-klab">{r.label}</span>
                <span className="akhq-lavv-spor">
                  <span className="akhq-lavv-null" />
                  <span className={"akhq-lavv-stolpe" + (r.flagged ? " akhq-lavv-stolpe--flagg" : "")} style={stil} />
                </span>
                <span className="akhq-lavv-vrd">{r.display}</span>
              </div>
            );
          })}
        </div>
      </Region>
    </div>
  );
}
