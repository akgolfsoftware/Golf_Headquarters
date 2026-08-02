import React from "react";
import { ensureCss } from "../data/viz.jsx";
ensureCss("akhq-css-statusbar", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sbar{display:flex;align-items:center;gap:var(--s4);flex-wrap:wrap;border-top:1px solid var(--border);background:var(--surface);padding:0 var(--s4);min-height:26px;font-family:var(--mono);font-size:10px;letter-spacing:.04em;color:var(--muted);box-sizing:border-box}
.akhq-sbar-item{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;color:inherit}
/* Klikkbare celler er knapper. Gulvet l\u00f8ftes med ::after \u2014 statuslinjen er
   26px h\u00f8y fordi den er periferisyn, og den skal ikke vokse til 44 for at
   tre av cellene er trykkbare (gulvregel.md avsnitt 2). */
.akhq-sbar-btn{--floor:0px;position:relative;border:0;background:transparent;padding:0;margin:0;font:inherit;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;transition:color var(--dur) var(--ease)}
.akhq-sbar-btn::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:calc(100% + 12px);height:max(100%,var(--floor))}
.akhq-sbar-btn:hover{color:var(--fg)}
.akhq-sbar-btn:active{color:var(--fg);opacity:.8}
.akhq-sbar-btn:focus-visible{outline:2px solid var(--focus);outline-offset:3px;border-radius:3px}
.akhq-sbar-v{color:var(--fg);font-weight:600;font-variant-numeric:tabular-nums}
.akhq-sbar-v--up{color:var(--up)}
.akhq-sbar-v--dn{color:var(--dn)}
.akhq-sbar-v--info{color:var(--info)}
.akhq-sbar-sep{width:1px;align-self:stretch;background:var(--border);flex:none}
}
@layer akhq-container{
/* Skallkomponent: periferisyn finnes ikke p\u00e5 en telefon, og skjulingen
   f\u00f8lger vindusbredden med rette \u2014 ikke containeren. */
@media(max-width:880px){.akhq-sbar{display:none}}
@media(pointer:coarse){.akhq-sbar-btn{--floor:44px}}
[data-coarse-test] .akhq-sbar-btn{--floor:44px}
}
`);
export function StatusBar({ items = [], dataOdId = "statusbar", ...rest }) {
  return (
    <div className="akhq-sbar" role="status" aria-label="Systemstatus" data-od-id={dataOdId} {...rest}>
      {items.map((it, i) => {
        const innhold = (
          <>
            {it.label && <span>{it.label}</span>}
            {it.value !== undefined && <span className={"akhq-sbar-v" + (it.tone ? " akhq-sbar-v--" + it.tone : "")}>{it.value}</span>}
          </>
        );
        return it.onClick ? (
          <button key={i} type="button" className="akhq-sbar-btn" onClick={it.onClick} data-od-id={"cta-sbar-" + (it.id || i)}>{innhold}</button>
        ) : (
          <span key={i} className="akhq-sbar-item" data-od-id={"sbar-" + (it.id || i)}>{innhold}</span>
        );
      })}
    </div>
  );
}
