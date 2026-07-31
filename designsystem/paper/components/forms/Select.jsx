import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sel-w{position:relative;display:block;width:100%}
.akhq-sel{--h:36px;--floor:0px;height:max(var(--h),var(--floor));width:100%;box-sizing:border-box;padding:0 32px 0 var(--s3);border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:13px;appearance:none;cursor:pointer;transition:border-color var(--dur) var(--ease)}
.akhq-sel:hover:not(:disabled),.akhq-sel[data-state=hover]{border-color:var(--muted)}
.akhq-sel:focus-visible,.akhq-sel[data-state=focus]{outline:2px solid var(--focus);outline-offset:1px}
.akhq-sel:disabled,.akhq-sel[data-state=disabled]{opacity:.4;cursor:not-allowed;background:var(--soft)}
.akhq-sel[aria-invalid=true]{border-color:var(--dn)}
.akhq-sel-pil{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-right:1.5px solid var(--muted);border-bottom:1.5px solid var(--muted);rotate:45deg;margin-top:-3px;pointer-events:none}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-sel{--floor:44px}}
[data-coarse-test] .akhq-sel{--floor:44px}
}
@layer akhq-modifier{
.akhq-sel--sm{--h:30px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sel")) { const s = document.createElement("style"); s.id = "akhq-css-sel"; s.textContent = css; document.head.appendChild(s); }
/* Naken valgkontroll på en ekte <select>. Den native listen er ikke et
   kompromiss: på telefon er systemets hjulvelger raskere og mer tilgjengelig
   enn noe vi kan tegne, og et sett faste valg trenger ingen filtrering.
   Trenger valget søk eller mange rader, er komponenten Combobox. */
export function Select({ options = [], placeholder, density = "md", dataOdId = "felt-valg", ...rest }) {
  return (
    <span className="akhq-sel-w">
      <select className={"akhq-sel" + (density === "sm" ? " akhq-sel--sm" : "")} data-od-id={dataOdId} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const t = typeof o === "string" ? o : o.label;
          return <option key={v} value={v} disabled={o.disabled}>{t}</option>;
        })}
      </select>
      <span className="akhq-sel-pil" aria-hidden="true"></span>
    </span>
  );
}
