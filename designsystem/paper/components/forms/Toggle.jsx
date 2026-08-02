import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-toggle{--floor:0px;min-height:var(--floor);display:inline-flex;align-items:center;gap:var(--s2);cursor:pointer;font-family:var(--ui);font-size:13px;color:var(--fg);position:relative}
.akhq-toggle input{position:absolute;opacity:0;width:0;height:0}
.akhq-toggle-track{width:36px;height:20px;border-radius:var(--r-pill);background:var(--border);position:relative;transition:background var(--dur) var(--ease);flex:none}
.akhq-toggle-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--surface);border:1px solid var(--border);box-sizing:border-box;transition:transform var(--dur) var(--ease),background var(--dur) var(--ease)}
.akhq-toggle input:checked+.akhq-toggle-track{background:var(--cta)}
.akhq-toggle input:checked+.akhq-toggle-track .akhq-toggle-knob{transform:translateX(16px);background:var(--on-cta);border-color:transparent}
.akhq-toggle:hover input:not(:disabled)+.akhq-toggle-track,.akhq-toggle[data-state=hover] .akhq-toggle-track{background:var(--mid)}
.akhq-toggle:hover input:checked:not(:disabled)+.akhq-toggle-track,.akhq-toggle[data-state=hover] input:checked+.akhq-toggle-track{background:color-mix(in srgb,var(--cta) 88%,var(--bg))}
.akhq-toggle input:focus-visible+.akhq-toggle-track,.akhq-toggle[data-state=focus] .akhq-toggle-track{outline:2px solid var(--focus);outline-offset:2px}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-toggle{--floor:44px}}
/* Stand-in: samme lag og vekt som spørringen over. */
[data-coarse-test] .akhq-toggle{--floor:44px}
}
@layer akhq-modifier{
.akhq-toggle--disabled{opacity:.4;cursor:not-allowed}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-toggle")) { const s = document.createElement("style"); s.id = "akhq-css-toggle"; s.textContent = css; document.head.appendChild(s); }
export function Toggle({ checked = false, onChange, label, ariaLabel, disabled = false, dataOdId = "toggle", ...rest }) {
  return (
    <label className={"akhq-toggle" + (disabled ? " akhq-toggle--disabled" : "")} data-od-id={dataOdId} {...rest}>
      <input type="checkbox" role="switch" aria-label={label ? undefined : ariaLabel} checked={checked} disabled={disabled} onChange={(e) => onChange && onChange(e.target.checked)} />
      <span className="akhq-toggle-track"><span className="akhq-toggle-knob"></span></span>
      {label && <span>{label}</span>}
    </label>
  );
}
