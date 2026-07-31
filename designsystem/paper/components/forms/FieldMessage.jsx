import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-fm{--ton:var(--muted);font-family:var(--ui);font-size:11px;line-height:1.45;color:var(--ton);text-wrap:pretty;margin:0}
}
@layer akhq-modifier{
.akhq-fm--feil{--ton:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-fm")) { const s = document.createElement("style"); s.id = "akhq-css-fm"; s.textContent = css; document.head.appendChild(s); }

/**
 * Meldingen under et felt — hjelpetekst eller feil. Én eier, så en ekstern
 * feiloppsummering ser identisk ut med feilen under selve feltet.
 */
export function FieldMessage({ tone = "hint", id, dataOdId = "felt-melding", children, ...rest }) {
  const feil = tone === "feil";
  return (
    <p
      className={"akhq-fm" + (feil ? " akhq-fm--feil" : "")}
      id={id}
      role={feil ? "alert" : undefined}
      data-od-id={dataOdId}
      {...rest}
    >
      {children}
    </p>
  );
}
