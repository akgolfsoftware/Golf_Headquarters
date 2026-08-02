import React from "react";
import { nf, delta as dfmt, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-kpistripe", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Wrapperen eier containeren — et element kan ikke query seg selv, og
   stripen legger om sin egen grid-flow. Layoutnøytral: block, full bredde,
   ingen egen boks. */
.akhq-stripe-c{container-type:inline-size;min-width:0}
.akhq-stripe{display:grid;grid-auto-flow:var(--flow,column);grid-auto-columns:var(--cols,1fr);background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);overflow:hidden}
.akhq-stripe-cell{padding:var(--s3) var(--s4);border-left:var(--bl,1px) solid var(--border);border-top:var(--bt,0px) solid var(--border);min-width:0}
.akhq-stripe-cell:first-child{border-left:0;border-top:0}
.akhq-stripe-val{font-family:var(--mono);font-size:18px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.02em;margin-top:6px;color:var(--fg)}
.akhq-stripe-unit{font-size:11px;color:var(--muted);font-family:var(--mono);margin-left:2px;font-weight:400}
.akhq-stripe-meta{font-size:11px;color:var(--muted);margin-top:3px}
.akhq-stripe-meta .up{color:var(--up);font-family:var(--mono);font-weight:600}
.akhq-stripe-meta .dn{color:var(--dn);font-family:var(--mono);font-weight:600}
}
@layer akhq-container{
/* Var @media(max-width:640px) — viewport-hybriden fra restanselisten.
   Terskelen omregnet, ikke oversatt: 520px container. Stripen står i
   paneler, så forelderens polstring er allerede trukket fra. */
@container (max-width:520px){.akhq-stripe{--flow:row;--cols:auto}.akhq-stripe-cell{--bl:0px;--bt:1px}}
}
`);
export function KpiStripe({ items = [], state = "content", emptyText = "Ingen n\u00f8kkeltall \u00e5 vise enn\u00e5.", dataOdId = "kpi-stripe", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={72}>
      <div className="akhq-stripe-c">
        <div className="akhq-stripe" data-od-id={dataOdId} {...rest}>
        {items.map((it, i) => (
          <div className="akhq-stripe-cell" key={i}>
            <div className="akhq-lab">{it.label}</div>
            <div className="akhq-stripe-val">{typeof it.value === "number" ? nf(it.value, it.decimals ?? 0) : it.value}{it.unit && <span className="akhq-stripe-unit">{it.unit}</span>}</div>
            <div className="akhq-stripe-meta">
              {it.delta !== undefined && <span className={it.delta >= 0 ? "up" : "dn"}>{dfmt(it.delta, it.decimals ?? 1)}</span>}
              {it.delta !== undefined && (it.deltaBasis || it.window) ? " " : ""}
              {it.deltaBasis}{it.deltaBasis && it.window ? " \u00b7 " : ""}{it.window}
            </div>
          </div>
          ))}
        </div>
      </div>
    </Region>
  );
}
