import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-cb{--h:24px;--floor:0px;display:flex;align-items:center;gap:var(--s2);min-height:max(var(--h),var(--floor));font-family:var(--ui);font-size:13px;color:var(--fg);cursor:pointer;min-width:0}
/* Avkrysset boks bruker --fg, ikke --accent: oransje er reservert for
   «Én ting nå» og fokus. En avkrysset boks er en tilstand, ikke en handling. */
.akhq-cb-in{width:16px;height:16px;flex:none;accent-color:var(--fg);cursor:inherit;margin:0}
.akhq-cb-in:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-cb-tx{text-wrap:pretty;min-width:0}
.akhq-cb:has(.akhq-cb-in:disabled){opacity:.4;cursor:not-allowed}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-cb{--floor:44px}}
/* Stand-in: samme lag og vekt som spørringen over. */
[data-coarse-test] .akhq-cb{--floor:44px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-cb")) { const s = document.createElement("style"); s.id = "akhq-css-cb"; s.textContent = css; document.head.appendChild(s); }

/**
 * Avkrysningsboks med sidestilt etikett. Bærer sin egen etikettplassering —
 * en checkbox har teksten ved siden av boksen, ikke over den, så den kan ikke
 * arve FormFields kolonneanatomi. Flere av dem grupperes i én FormField.
 */
export function Checkbox({ label, dataOdId = "felt-avkryssing", id, disabled = false, ...rest }) {
  const auto = React.useMemo(() => `akhq-cb-${Math.random().toString(36).slice(2, 8)}`, []);
  const iid = id || auto;
  return (
    <label className="akhq-cb" htmlFor={iid} data-od-id={dataOdId}>
      <input type="checkbox" id={iid} className="akhq-cb-in" disabled={disabled} {...rest} />
      <span className="akhq-cb-tx">{label}</span>
    </label>
  );
}
