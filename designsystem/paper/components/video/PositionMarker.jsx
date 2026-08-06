import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-posm{--floor:0px;position:absolute;transform:translateX(-50%);appearance:none;display:inline-flex;align-items:center;justify-content:center;height:16px;padding:0 5px;border:1px solid var(--mid);border-radius:var(--r-pill);background:var(--surface);color:var(--muted);font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.04em;white-space:nowrap;line-height:1;box-sizing:border-box;cursor:default}
.akhq-posm[data-kan-velges]{cursor:pointer}
.akhq-posm[data-kan-velges]::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100%,var(--floor));height:max(100%,var(--floor))}
.akhq-posm:focus-visible,.akhq-posm[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-posm{--floor:44px}}
[data-coarse-test] .akhq-posm{--floor:44px}
}
@layer akhq-modifier{
.akhq-posm--aktiv{background:var(--fg);color:var(--bg);border-color:var(--fg)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-posm")) { const s = document.createElement("style"); s.id = "akhq-css-posm"; s.textContent = css; document.head.appendChild(s); }
/* Posisjonsmarkøren: en liten P-etikett (P6) plassert prosentvis på en
   forelder med position:relative — videoscrubberens markørfelt eller et
   stillbilde. Aktiv posisjon er blekkfylt. Med onSelect blir markøren en
   knapp med 44 px usynlig treffsone (::after, gulvregel §2). P-vokabularet
   er fargeløst — aktiv/inaktiv skilles på blekk/ramme, aldri farge.
   Grensen mot PPositionRail (datavis): skinnen er hele P1–P10-skalaen;
   markøren er ETT punkt i en video eller på et bilde. */
export function PositionMarker({ label, pct = 0, active = false, onSelect, dataOdId, ...rest }) {
  const El = onSelect ? "button" : "span";
  return (
    <El
      {...(onSelect ? { type: "button", onClick: onSelect, "data-kan-velges": "", "aria-pressed": active ? "true" : "false" } : {})}
      className={"akhq-posm" + (active ? " akhq-posm--aktiv" : "")}
      style={{ left: Math.min(100, Math.max(0, pct)) + "%" }}
      title={label}
      data-od-id={(onSelect ? "cta-" : "kpi-") + (dataOdId || "posisjon-" + label)}
      {...rest}>
      {label}
    </El>
  );
}
