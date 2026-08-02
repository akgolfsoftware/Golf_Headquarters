import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-fpill-wrap{container-type:inline-size;display:block;width:100%;min-width:0}
.akhq-fpill{--gap:var(--s2);display:flex;flex-wrap:wrap;align-items:center;gap:var(--gap);margin:0;padding:0;border:0;min-width:0}
.akhq-fpill-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:0;margin:0 var(--s1) 0 0}
.akhq-fpill-p{--h:32px;--floor:0px;display:inline-flex;align-items:center;gap:6px;min-height:max(var(--h),var(--floor));box-sizing:border-box;padding:0 12px;border:1px solid var(--border);border-radius:var(--r-pill);background:var(--surface);color:var(--muted);font-family:var(--ui);font-size:12.5px;font-weight:500;line-height:1;cursor:pointer;transition:background var(--dur) var(--ease),border-color var(--dur) var(--ease),color var(--dur) var(--ease)}
.akhq-fpill-p:hover{background:var(--soft);color:var(--fg)}
.akhq-fpill-p:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
/* Valgt pille er blekkfylt — systemstandarden for fylte flater. Aldri oransje:
   oransjen er reservert for «En ting nå» og focus. */
.akhq-fpill-p[aria-pressed="true"]{background:var(--cta);border-color:var(--cta);color:var(--on-cta)}
.akhq-fpill-p[aria-pressed="true"]:hover{background:color-mix(in srgb, var(--cta) 88%, var(--bg))}
.akhq-fpill-n{font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums;opacity:.72}
/* Tilbakestill er en tekstlenke i rekken, ikke en femte pille — den velger
   ikke noe, den opphever. */
.akhq-fpill-nullstill{--h:32px;--floor:0px;display:inline-flex;align-items:center;min-height:max(var(--h),var(--floor));padding:0 var(--s2);margin-left:var(--s1);border:0;background:none;color:var(--muted);font-family:var(--ui);font-size:12.5px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:var(--r-sm)}
.akhq-fpill-nullstill:hover{color:var(--fg)}
.akhq-fpill-nullstill:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
}
@layer akhq-container{
@container (max-width:420px){.akhq-fpill{--gap:6px}}
@media(pointer:coarse){.akhq-fpill-p,.akhq-fpill-nullstill{--floor:44px}}
[data-coarse-test] .akhq-fpill-p,[data-coarse-test] .akhq-fpill-nullstill{--floor:44px}
}
@layer akhq-modifier{
.akhq-fpill--rad{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.akhq-fpill--rad::-webkit-scrollbar{display:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-fpill")) { const s = document.createElement("style"); s.id = "akhq-css-fpill"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* FilterPills: innsnevring av et sett som allerede vises. Piller, ikke faner:
   faner bytter HVA du ser, filtre bestemmer HVOR MYE av det samme du ser.
   Flervalg er standard — er valget eksklusivt, er det SegmentControl. */
export function FilterPills({
  label, options = [], value = [], onChange, multiple = true,
  resetLabel = "Nullstill", scroll = false, dataOdId = "cta-filter", ...rest
}) {
  const id = React.useMemo(() => "akhq-fpill" + (++seq), []);
  const valgt = Array.isArray(value) ? value : value == null ? [] : [value];
  const norm = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const bytt = (v) => {
    if (!onChange) return;
    if (!multiple) { onChange(valgt[0] === v ? [] : [v]); return; }
    onChange(valgt.includes(v) ? valgt.filter((x) => x !== v) : [...valgt, v]);
  };
  return (
    <div className="akhq-fpill-wrap">
      <fieldset className={"akhq-fpill" + (scroll ? " akhq-fpill--rad" : "")} data-od-id={dataOdId} {...rest}>
        {label && <legend className="akhq-fpill-lab" id={id + "-l"}>{label}</legend>}
        {norm.map((o) => {
          const på = valgt.includes(o.value);
          return (
            <button key={o.value} type="button" className="akhq-fpill-p" aria-pressed={på}
              onClick={() => bytt(o.value)} data-od-id={dataOdId + "-" + o.value}>
              <span>{o.label}</span>
              {o.count != null && <span className="akhq-fpill-n">{o.count}</span>}
            </button>
          );
        })}
        {/* Tilbakestill finnes bare når det er noe å tilbakestille. En alltid
            synlig, alltid inaktiv nullstiller er støy i rekken. */}
        {valgt.length > 0 && (
          <button type="button" className="akhq-fpill-nullstill" onClick={() => onChange && onChange([])} data-od-id={dataOdId + "-nullstill"}>
            {resetLabel} ({valgt.length})
          </button>
        )}
      </fieldset>
    </div>
  );
}
