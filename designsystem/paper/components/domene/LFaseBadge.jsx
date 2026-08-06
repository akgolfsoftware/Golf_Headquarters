import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-lfb{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;box-sizing:border-box;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1;flex:none}
.akhq-lfb-steg{display:inline-flex;gap:3px}
.akhq-lfb-prikk{width:4px;height:4px;border-radius:50%;background:var(--border)}
}
@layer akhq-container{
}
@layer akhq-modifier{
.akhq-lfb--uten-steg .akhq-lfb-steg{display:none}
.akhq-lfb-prikk--naa{background:var(--fg)}
.akhq-lfb-prikk--forbi{background:var(--mid)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-lfb")) { const s = document.createElement("style"); s.id = "akhq-css-lfb"; s.textContent = css; document.head.appendChild(s); }
export const LFASER = ["L-KROPP", "L-ARM", "L-KØLLE", "L-BALL", "L-AUTO"];
/* L-fasen som badge: fargeløs (AK-vokabularet fargekodes aldri) med
   prikk-indikator for hvor i læringsløpet fasen ligger — forbi = --mid,
   nå = blekk, kommende = border. Fasene er en LUKKET rekkefølge fra CANON v1.
   AVGJORT 05.08.2026 (Anders): badgen tas IKKE i bruk — AK-formel v2 har
   ikke L-faser; appens Vei B-motorikksteg (UTEN_BALL/LAV_HAST/AUTO) er
   erstatningen. Blir liggende ubrukt i biblioteket; ikke plasser den på
   noen flate. */
export function LFaseBadge({ value, showSteps = true, dataOdId = "lfase", ...rest }) {
  const idx = LFASER.indexOf(value);
  return (
    <span className={"akhq-lfb" + (showSteps ? "" : " akhq-lfb--uten-steg")}
      title={idx >= 0 ? "Fase " + (idx + 1) + " av " + LFASER.length + ": " + value : value}
      data-od-id={"kpi-" + dataOdId} {...rest}>
      {value}
      {idx >= 0 && (
        <span className="akhq-lfb-steg" aria-hidden="true">
          {LFASER.map((f, i) => (
            <span key={f} className={"akhq-lfb-prikk" + (i === idx ? " akhq-lfb-prikk--naa" : i < idx ? " akhq-lfb-prikk--forbi" : "")} />
          ))}
        </span>
      )}
    </span>
  );
}
