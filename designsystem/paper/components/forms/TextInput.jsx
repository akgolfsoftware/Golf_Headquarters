import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ti{--h:36px;--floor:0px;height:max(var(--h),var(--floor));width:100%;box-sizing:border-box;padding:0 var(--s3);border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:13px;transition:border-color var(--dur) var(--ease)}
.akhq-ti::placeholder{color:var(--muted)}
.akhq-ti:hover:not(:disabled),.akhq-ti[data-state=hover]{border-color:var(--muted)}
.akhq-ti:focus-visible,.akhq-ti[data-state=focus]{outline:2px solid var(--focus);outline-offset:1px}
.akhq-ti:disabled,.akhq-ti[data-state=disabled]{opacity:.4;cursor:not-allowed;background:var(--soft)}
.akhq-ti[aria-invalid=true]{border-color:var(--dn)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-ti{--floor:44px}}
/* Stand-in: samme lag og vekt som spørringen over. */
[data-coarse-test] .akhq-ti{--floor:44px}
}
@layer akhq-modifier{
.akhq-ti--sm{--h:30px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ti")) { const s = document.createElement("style"); s.id = "akhq-css-ti"; s.textContent = css; document.head.appendChild(s); }

/**
 * Naken tekstkontroll. Ingen etikett, ingen hjelpetekst, ingen feilmelding —
 * anatomien bor i FormField. Feiltilstanden leses av aria-invalid, som FormField
 * setter, så «ser feil ut» og «er annonsert som feil» aldri kan gå fra hverandre.
 */
export function TextInput({ density = "md", dataOdId = "felt-tekst", ...rest }) {
  return (
    <input
      type="text"
      className={"akhq-ti" + (density === "sm" ? " akhq-ti--sm" : "")}
      data-od-id={dataOdId}
      {...rest}
    />
  );
}
