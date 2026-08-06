import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tned-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-tned{--hero:32px;display:flex;flex-direction:column;gap:2px;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-tned-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-tned-hero{display:flex;align-items:baseline;gap:var(--s2)}
.akhq-tned-tall{font-family:var(--mono);font-size:var(--hero);font-weight:600;line-height:1.05;font-variant-numeric:tabular-nums}
.akhq-tned-enhet{font-family:var(--mono);font-size:12px;color:var(--muted)}
.akhq-tned-navn{font-size:13.5px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}
.akhq-tned-meta{font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-tned-frist{display:flex;gap:var(--s2);align-items:baseline;margin-top:4px;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.akhq-tned-frist-v{color:var(--fg);font-weight:600}
}
@layer akhq-container{
@container (max-width:320px){.akhq-tned{--hero:26px}}
}
@layer akhq-modifier{
.akhq-tned--naa .akhq-tned-tall{color:var(--up)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tned")) { const s = document.createElement("style"); s.id = "akhq-css-tned"; s.textContent = css; document.head.appendChild(s); }
/* Nedtellingen til turnering: dager igjen som hero, navn, bane/dato og
   valgfri påmeldingsfrist. daysLeft regnes av KONSUMENTEN (Oslo-korrekt
   datologikk bor i appen — komponenten kaller aldri new Date()). Ved 0
   dager («i dag») tones tallet --up: turnering er sesongens toppunkt,
   samme tone som TURN ellers. Ren visning. Chromeless: Panel eier flaten. */
export function TurneringNedtelling({
  daysLeft, name, meta, deadlineLabel,
  state = "content",
  emptyText = "Ingen kommende turnering påmeldt. Neste legges inn fra turneringsplanleggeren.",
  dataOdId = "nedtelling", ...rest
}) {
  const iDag = daysLeft === 0;
  return (
    <div className="akhq-tned-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-tned" + (iDag ? " akhq-tned--naa" : "")} data-od-id={"kpi-" + dataOdId} {...rest}>
          <span className="akhq-tned-lab">Neste turnering</span>
          <span className="akhq-tned-hero">
            <span className="akhq-tned-tall">{iDag ? "I dag" : daysLeft}</span>
            {!iDag && <span className="akhq-tned-enhet">{daysLeft === 1 ? "dag igjen" : "dager igjen"}</span>}
          </span>
          <span className="akhq-tned-navn">{name}</span>
          {meta && <span className="akhq-tned-meta">{meta}</span>}
          {deadlineLabel && (
            <span className="akhq-tned-frist">påmeldingsfrist <span className="akhq-tned-frist-v">{deadlineLabel}</span></span>
          )}
        </div>
      </Region>
    </div>
  );
}
