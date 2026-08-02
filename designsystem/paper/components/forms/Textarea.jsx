import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ta{--min:72px;min-height:var(--min);width:100%;box-sizing:border-box;padding:var(--s2) var(--s3);border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:13px;line-height:1.5;resize:vertical;transition:border-color var(--dur) var(--ease)}
.akhq-ta::placeholder{color:var(--muted)}
.akhq-ta:hover:not(:disabled),.akhq-ta[data-state=hover]{border-color:var(--muted)}
.akhq-ta:focus-visible,.akhq-ta[data-state=focus]{outline:2px solid var(--focus);outline-offset:1px}
.akhq-ta:disabled,.akhq-ta[data-state=disabled]{opacity:.4;cursor:not-allowed;background:var(--soft)}
.akhq-ta[aria-invalid=true]{border-color:var(--dn)}
}
@layer akhq-modifier{
.akhq-ta--sm{--min:52px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-ta")) { const s = document.createElement("style"); s.id = "akhq-css-ta"; s.textContent = css; document.head.appendChild(s); }

/**
 * Naken flerlinjekontroll. Ingen anatomi — den bor i FormField.
 * Ingen --floor: høyden er alltid godt over 44px, og et gulv her ville
 * konkurrert med --min i stedet for å beskytte noe.
 */
export function Textarea({ rows = 3, density = "md", dataOdId = "felt-notat", ...rest }) {
  return (
    <textarea
      rows={rows}
      className={"akhq-ta" + (density === "sm" ? " akhq-ta--sm" : "")}
      data-od-id={dataOdId}
      {...rest}
    />
  );
}
