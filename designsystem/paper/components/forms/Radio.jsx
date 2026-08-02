import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-rg{display:flex;flex-direction:column;gap:2px;border:0;margin:0;padding:0;min-width:0}
.akhq-rad{--h:32px;--floor:0px;display:flex;align-items:center;gap:var(--s2);min-height:max(var(--h),var(--floor));padding:0 2px;font-family:var(--ui);font-size:13px;color:var(--fg);cursor:pointer}
.akhq-rad-in{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.akhq-rad-mark{flex:none;position:relative;width:18px;height:18px;border-radius:50%;border:1.5px solid var(--mid);background:var(--surface);transition:border-color var(--dur) var(--ease)}
.akhq-rad:hover .akhq-rad-mark{border-color:var(--fg)}
.akhq-rad-in:checked+.akhq-rad-mark{border-color:var(--fg)}
.akhq-rad-in:checked+.akhq-rad-mark::after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--fg)}
.akhq-rad-in:focus-visible+.akhq-rad-mark{outline:2px solid var(--focus);outline-offset:2px}
.akhq-rad-in:disabled+.akhq-rad-mark{opacity:.4}
.akhq-rad-in:disabled~.akhq-rad-tx{opacity:.4}
.akhq-rad-tx{display:flex;flex-direction:column;gap:1px;min-width:0}
.akhq-rad-note{font-family:var(--mono);font-size:11px;color:var(--muted)}
}
@layer akhq-container{
/* Treffmottakeren er <label>, ikke den visuelt skjulte inputen — gulvregel.md
   avsnitt 3. Riggen måler samme node. */
@media(pointer:coarse){.akhq-rad{--floor:44px}}
[data-coarse-test] .akhq-rad{--floor:44px}
}
@layer akhq-modifier{
.akhq-rg--rad{flex-direction:row;flex-wrap:wrap;gap:var(--s3)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-rad")) { const s = document.createElement("style"); s.id = "akhq-css-rad"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* Radio er for få valg som skal sees samtidig: 2–4 korte alternativer der
   forskjellen mellom dem er poenget. Er valgene et filter eller en visning,
   er komponenten SegmentControl. Er de mange, er den Select eller Combobox. */
export function Radio({ name, value, checked, onChange, label, note, disabled, dataOdId = "felt-radio" }) {
  return (
    <label className="akhq-rad" data-od-id={dataOdId}>
      <input className="akhq-rad-in" type="radio" name={name} value={value} checked={checked} disabled={disabled}
        onChange={(e) => onChange && onChange(value, e)} />
      <span className="akhq-rad-mark" aria-hidden="true"></span>
      <span className="akhq-rad-tx">
        <span>{label}</span>
        {note && <span className="akhq-rad-note">{note}</span>}
      </span>
    </label>
  );
}
export function RadioGroup({ label, name, value, onChange, options = [], row = false, dataOdId = "felt-radiogruppe" }) {
  const auto = React.useMemo(() => "akhq-rg" + (++seq), []);
  const n = name || auto;
  return (
    <fieldset className={"akhq-rg" + (row ? " akhq-rg--rad" : "")} data-od-id={dataOdId} aria-label={label}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        return <Radio key={v} name={n} value={v} checked={value === v} onChange={onChange}
          label={typeof o === "string" ? o : o.label} note={o.note} disabled={o.disabled}
          dataOdId={dataOdId + "-" + v} />;
      })}
    </fieldset>
  );
}
