import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-bmb{--tone:var(--muted);display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;box-sizing:border-box;border-radius:var(--r-pill);border:1px solid color-mix(in srgb, var(--tone) 26%, transparent);background:color-mix(in srgb, var(--tone) 10%, transparent);color:var(--tone);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.04em;white-space:nowrap;line-height:1;flex:none;font-variant-numeric:tabular-nums}
.akhq-bmb-basis{font-weight:400;letter-spacing:.02em}
}
@layer akhq-container{
}
@layer akhq-modifier{
.akhq-bmb--up{--tone:var(--up)}
.akhq-bmb--dn{--tone:var(--dn)}
.akhq-bmb--info{--tone:var(--info)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-bmb")) { const s = document.createElement("style"); s.id = "akhq-css-bmb"; s.textContent = css; document.head.appendChild(s); }
/* Benchmark-badgen: en verdi MOT en referanse, med basis synlig i selve
   badgen («+0,4 vs kat B»). Datasemantikk er lov her (over = --up, under =
   --dn, nøytral måling = --info) fordi badgen viser DATA, ikke vokabular.
   Grensen mot StatusBadge: status/tags bor der; benchmark-badgen eier
   formatet verdi + retning + basis. Basis er obligatorisk — en delta uten
   grunnlag er støy. */
export function BenchmarkBadge({ value, basis, tone = "info", dataOdId = "benchmark", ...rest }) {
  return (
    <span className={"akhq-bmb akhq-bmb--" + tone} data-od-id={"kpi-" + dataOdId} {...rest}>
      {value}
      <span className="akhq-bmb-basis">{basis}</span>
    </span>
  );
}
