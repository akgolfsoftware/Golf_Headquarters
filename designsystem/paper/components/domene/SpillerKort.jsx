import React from "react";
import { Avatar } from "../primitives/Avatar.jsx";
import { StatusBadge } from "../primitives/StatusBadge.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-spk-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-spk{--h:64px;--floor:0px;--kpi:flex;display:flex;align-items:center;gap:var(--s3);width:100%;min-width:0;box-sizing:border-box;min-height:max(var(--h),var(--floor));padding:10px 12px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);font-family:var(--ui);text-align:left;color:var(--fg);cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-spk:hover,.akhq-spk[data-state=hover]{background:var(--soft)}
.akhq-spk:focus-visible,.akhq-spk[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-spk-c{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.akhq-spk-topp{display:flex;align-items:center;gap:var(--s2);min-width:0}
.akhq-spk-navn{font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-spk-meta{font-family:var(--mono);font-size:10.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-spk-kpi{display:var(--kpi);flex-direction:column;align-items:flex-end;gap:1px;flex:none}
.akhq-spk-kv{font-family:var(--mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-spk-kl{font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
}
@layer akhq-container{
@container (max-width:340px){.akhq-spk{--kpi:none}}
@media(pointer:coarse){.akhq-spk{--floor:64px}}
[data-coarse-test] .akhq-spk{--floor:64px}
}
@layer akhq-modifier{
.akhq-spk--flat{border-color:transparent;background:transparent;border-radius:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-spk")) { const s = document.createElement("style"); s.id = "akhq-css-spk"; s.textContent = css; document.head.appendChild(s); }
/* Spillerens kort i stallen og gruppene: avatar, navn, kategori-tag
   (fargeløs — A–K fargekodes aldri), metadata og én KPI. Hele kortet er ETT
   treffmål som åpner spillerprofil-artefaktet. Kategorien bæres av
   StatusBadge kind=tag; status (venter samtykke, ny) av kind=status —
   komponentene gjenbrukes, aldri kopieres. */
export function SpillerKort({
  name, category, meta, kpiValue, kpiLabel, badge, badgeTone = "mut",
  flat = false, onClick, dataOdId = "spiller", ...rest
}) {
  return (
    <div className="akhq-spk-wrap">
      <button type="button" className={"akhq-spk" + (flat ? " akhq-spk--flat" : "")} onClick={onClick} data-od-id={"cta-" + dataOdId} {...rest}>
        <Avatar name={name} size="md" decorative dataOdId={dataOdId + "-avatar"} />
        <span className="akhq-spk-c">
          <span className="akhq-spk-topp">
            <span className="akhq-spk-navn">{name}</span>
            {category && <StatusBadge kind="tag" dataOdId={dataOdId + "-kat"}>{category}</StatusBadge>}
            {badge && <StatusBadge kind="status" tone={badgeTone} dataOdId={dataOdId + "-status"}>{badge}</StatusBadge>}
          </span>
          {meta && <span className="akhq-spk-meta">{meta}</span>}
        </span>
        {kpiValue && (
          <span className="akhq-spk-kpi">
            <span className="akhq-spk-kv">{kpiValue}</span>
            {kpiLabel && <span className="akhq-spk-kl">{kpiLabel}</span>}
          </span>
        )}
      </button>
    </div>
  );
}
