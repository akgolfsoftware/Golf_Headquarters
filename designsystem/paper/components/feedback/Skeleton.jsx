import React from "react";
import { ensureCss } from "../data/viz.jsx";
ensureCss("akhq-css-skeleton", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Bygger p\u00e5 .akhq-skel fra data/viz.jsx \u2014 samme puls, ingen ny animasjon. */
.akhq-sk{display:block;background:var(--soft);border-radius:var(--r-sm);animation:akhq-skel 1.2s var(--ease) infinite alternate}
.akhq-sk-stack{display:flex;flex-direction:column;gap:8px}
.akhq-sk-line{height:11px}
.akhq-sk-line:last-child{width:62%}
}
@layer akhq-modifier{
.akhq-sk--text{height:11px;border-radius:3px}
.akhq-sk--circle{border-radius:50%}
.akhq-sk--num{height:20px;width:64px}
}
@layer akhq-container{
@media(prefers-reduced-motion:reduce){.akhq-sk{animation:none}}
}
`);
/* Laster-tilstanden for det Region ikke dekker: en enkelt figur med kjent
   form. Skjelettet skal ha SAMME geometri som innholdet det erstatter \u2014
   ellers hopper flaten n\u00e5r data kommer. */
export function Skeleton({ variant = "block", width, height = 48, lines = 3, radius, dataOdId = "skeleton", ...rest }) {
  if (variant === "text") {
    return (
      <div className="akhq-sk-stack" role="status" aria-label="Laster" data-od-id={dataOdId} {...rest}>
        {Array.from({ length: lines }).map((_, i) => <span key={i} className="akhq-sk akhq-sk-line" />)}
      </div>
    );
  }
  const mod = variant === "circle" ? " akhq-sk--circle" : variant === "number" ? " akhq-sk--num" : "";
  const st = { width: variant === "circle" ? height : width, height, borderRadius: radius };
  return <span className={"akhq-sk" + mod} role="status" aria-label="Laster" style={st} data-od-id={dataOdId} {...rest} />;
}
