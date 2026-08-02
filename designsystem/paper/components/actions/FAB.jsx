import React from "react";
import { ensureCss } from "../data/viz.jsx";
ensureCss("akhq-css-fab", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Gulvet er 56, ikke 44: en FAB tas med tommelen i bevegelse, ofte med
   hanske. Den er over gulvet med hensikt, ikke ved slurv. */
.akhq-fab{--h:56px;--floor:0px;position:fixed;right:var(--s4);bottom:calc(var(--s4) + var(--fab-lift,0px));height:max(var(--h),var(--floor));min-height:max(var(--h),var(--floor));padding:0 var(--pad-x,18px);display:inline-flex;align-items:center;gap:9px;border-radius:var(--r-pill);border:1px solid var(--cta);background:var(--cta);color:var(--on-cta);font-family:var(--ui);font-size:13.5px;font-weight:600;cursor:pointer;box-shadow:var(--shadow);z-index:var(--z-sticky);transition:background var(--dur) var(--ease),transform var(--dur) var(--ease)}
.akhq-fab:hover{background:color-mix(in srgb,var(--cta) 88%,var(--bg))}
.akhq-fab:active{transform:translateY(1px);background:color-mix(in srgb,var(--cta) 76%,var(--bg))}
.akhq-fab:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.akhq-fab:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
.akhq-fab-ic{width:18px;height:18px;flex:none;display:grid;place-items:center}
}
@layer akhq-modifier{
/* Bare ikon: sirkel. Etiketten m\u00e5 fortsatt finnes, som aria-label. */
.akhq-fab--ic{--pad-x:0px;width:max(var(--h),var(--floor));justify-content:center}
/* Over bunnfanene p\u00e5 mobil, ellers d\u00f8r den under tabbaren. */
.akhq-fab--overtab{--fab-lift:56px}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-fab{--floor:56px}}
[data-coarse-test] .akhq-fab{--floor:56px}
}
`);
export function FAB({ label, icon, iconOnly = false, overTab = false, disabled = false, onClick, dataOdId = "cta-fab", ...rest }) {
  return (
    <button type="button"
      className={"akhq-fab" + (iconOnly ? " akhq-fab--ic" : "") + (overTab ? " akhq-fab--overtab" : "")}
      aria-label={iconOnly ? label : undefined} disabled={disabled} onClick={onClick} data-od-id={dataOdId} {...rest}>
      {icon && <span className="akhq-fab-ic" aria-hidden="true">{icon}</span>}
      {!iconOnly && label}
    </button>
  );
}
