import React from "react";
import { ensureCss } from "../data/viz.jsx";
import { Button } from "../actions/Button.jsx";
ensureCss("akhq-css-composer", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-comp-c{container-type:inline-size;min-width:0}
.akhq-comp{border-top:1px solid var(--border);background:color-mix(in srgb,var(--surface) 88%,transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:var(--s3) var(--s4);font-family:var(--ui);box-sizing:border-box}
.akhq-comp-box{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--s2);align-items:end;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);padding:var(--s2);transition:border-color var(--dur) var(--ease)}
.akhq-comp-box:hover{border-color:color-mix(in srgb,var(--fg) 22%,var(--border))}
.akhq-comp-box:focus-within{outline:2px solid var(--focus);outline-offset:2px}
/* Feltet vokser med teksten, aldri under gulvet, og stopper p\u00e5 fem linjer \u2014
   komponisten skal ikke sluke flaten den st\u00e5r under. */
.akhq-comp-in{--h:36px;--floor:0px;min-height:max(var(--h),var(--floor));max-height:120px;width:100%;border:0;background:transparent;color:var(--fg);font:400 13.5px/1.45 var(--ui);resize:none;outline:none;padding:8px var(--s2);box-sizing:border-box}
.akhq-comp-in::placeholder{color:var(--muted);opacity:1}
.akhq-comp-in:disabled{cursor:not-allowed}
.akhq-comp-right{display:flex;align-items:center;gap:var(--s2);flex:none}
.akhq-comp-hint{font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;color:var(--muted);white-space:nowrap}
.akhq-comp-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:var(--s2)}
.akhq-comp-ctx{--h:22px;--floor:0px;min-height:max(var(--h),var(--floor));display:inline-flex;align-items:center;gap:5px;padding:0 8px;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--soft);color:var(--muted);font-family:var(--mono);font-size:10px;font-weight:600;cursor:pointer;font-family:var(--mono)}
.akhq-comp-ctx:hover{color:var(--fg);border-color:color-mix(in srgb,var(--fg) 22%,var(--border))}
.akhq-comp-ctx:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-comp-ctx[aria-pressed=true]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
}
@layer akhq-container{
@container (max-width:420px){.akhq-comp-hint{display:none}}
@media(pointer:coarse){.akhq-comp-in{--floor:44px}.akhq-comp-ctx{--floor:44px}}
[data-coarse-test] .akhq-comp-in{--floor:44px}
[data-coarse-test] .akhq-comp-ctx{--floor:44px}
}
`);
/* Komponisten f\u00f8lger deg p\u00e5 alle flater \u2014 du skal kunne sp\u00f8rre om en spiller
   mens du st\u00e5r i Workbench. Derfor er den festet under flaten, aldri inne i den,
   og den m\u00e5 virke i alle tre niv\u00e5er uten \u00e5 ta plass fra dem. */
export function Composer({
  placeholder = "Sp\u00f8r om en spiller, en uke eller et tall \u2026",
  value, onChange, onSubmit, sendLabel = "Send", hint = "\u21b5 send \u00b7 \u21e7\u21b5 ny linje",
  context = [], onContextToggle, disabled = false, dataOdId = "composer", ...rest
}) {
  const ref = React.useRef(null);
  const [intern, setIntern] = React.useState("");
  const styrt = value !== undefined;
  const tekst = styrt ? value : intern;
  const skriv = (v) => { if (!styrt) setIntern(v); onChange && onChange(v); };
  const send = () => { if (!tekst || !tekst.trim()) return; onSubmit && onSubmit(tekst); if (!styrt) setIntern(""); };
  /* Autovekst: h\u00f8yden f\u00f8lger innholdet, men max-height i CSS eier taket. */
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [tekst]);
  return (
    <div className="akhq-comp-c">
      <div className="akhq-comp" data-od-id={dataOdId} {...rest}>
        {context.length > 0 && (
          <div className="akhq-comp-chips">
            {context.map((c) => (
              <button key={c.id} type="button" className="akhq-comp-ctx" aria-pressed={!!c.active} onClick={() => onContextToggle && onContextToggle(c.id)} data-od-id={"cta-comp-ctx-" + c.id}>{c.label}</button>
            ))}
          </div>
        )}
        <div className="akhq-comp-box">
          <textarea ref={ref} className="akhq-comp-in" rows={1} placeholder={placeholder} value={tekst} disabled={disabled}
            onChange={(e) => skriv(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <div className="akhq-comp-right">
            <span className="akhq-comp-hint">{hint}</span>
            <Button size="sm" variant="primary" onClick={send} disabled={disabled || !tekst || !tekst.trim()} dataOdId="cta-composer-send">{sendLabel}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
