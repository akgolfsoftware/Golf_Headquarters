import React from "react";
import { ensureCss } from "../data/viz.jsx";
ensureCss("akhq-css-divider", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-div{border:0;height:1px;background:var(--border);margin:var(--s4) 0}
.akhq-div-lab{display:flex;align-items:center;gap:var(--s3);margin:var(--s4) 0;font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-div-lab::before,.akhq-div-lab::after{content:"";height:1px;background:var(--border);flex:1}
.akhq-div-lab--start::before{flex:none;width:0}
}
@layer akhq-modifier{
.akhq-div--tight{margin:var(--s2) 0}
.akhq-div--flush{margin:0}
.akhq-div--v{width:1px;height:auto;align-self:stretch;margin:0 var(--s3)}
}
`);
/* En skillelinje er ikke dekor \u2014 den er en p\u00e5stand om at to ting h\u00f8rer til
   ulike grupper. Har du ikke den p\u00e5standen, bruk avstand i stedet. */
export function Divider({ label, align = "center", spacing = "normal", vertical = false, dataOdId = "divider", ...rest }) {
  if (label) {
    return <div className={"akhq-div-lab" + (align === "start" ? " akhq-div-lab--start" : "")} data-od-id={dataOdId} {...rest}>{label}</div>;
  }
  const mod = vertical ? " akhq-div--v" : spacing === "tight" ? " akhq-div--tight" : spacing === "flush" ? " akhq-div--flush" : "";
  return <hr className={"akhq-div" + mod} data-od-id={dataOdId} {...rest} />;
}
