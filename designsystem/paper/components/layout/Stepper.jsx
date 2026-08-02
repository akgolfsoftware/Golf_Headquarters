import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-step-wrap{container-type:inline-size;display:block;width:100%;min-width:0}
.akhq-step{--flow:row;--gap:var(--s2);display:flex;flex-direction:var(--flow);align-items:center;gap:var(--gap);margin:0;padding:0;list-style:none;min-width:0}
.akhq-step-el{display:flex;align-items:center;gap:var(--s2);min-width:0}
.akhq-step-nr{--h:26px;flex:none;display:inline-flex;align-items:center;justify-content:center;width:var(--h);height:var(--h);border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--muted);font-family:var(--mono);font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-step-tx{font-family:var(--ui);font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Gjennomført: blekkfylt. Gjeldende: blekkramme + blekktekst. Kommende: dempet.
   Tre tilstander, tre uttrykk — ingen farge, fordi et steg ikke er en
   datasemantikk. */
.akhq-step-el[data-tilstand="ferdig"] .akhq-step-nr{background:var(--cta);border-color:var(--cta);color:var(--on-cta)}
.akhq-step-el[data-tilstand="ferdig"] .akhq-step-tx{color:var(--fg)}
.akhq-step-el[data-tilstand="naa"] .akhq-step-nr{border-color:var(--fg);border-width:2px;color:var(--fg)}
.akhq-step-el[data-tilstand="naa"] .akhq-step-tx{color:var(--fg);font-weight:600}
.akhq-step-strek{flex:1 1 auto;min-width:12px;height:1px;background:var(--border)}
.akhq-step-el[data-tilstand="ferdig"]+.akhq-step-strek{background:var(--fg)}
.akhq-step-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.akhq-step-ok{width:13px;height:13px}
}
@layer akhq-container{
/* Under 520 px legger stigen seg loddrett: etikettene får plass, og
   ellipsis-kutting av «Bekreft og publiser» slutter. 520 er regnet mot
   containeren — i et Panel svarer det til ~556 i spalten. */
@container (max-width:520px){.akhq-step{--flow:column;align-items:stretch;--gap:var(--s1)}.akhq-step-strek{display:none}.akhq-step-el{padding:4px 0}}
}
@layer akhq-modifier{
.akhq-step--kompakt .akhq-step-tx{display:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-step")) { const s = document.createElement("style"); s.id = "akhq-css-step"; s.textContent = css; document.head.appendChild(s); }
const Ok = () => (
  <svg className="akhq-step-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
/* Stepper: hvor i en flerstegsflyt du er. Ren tilstandsvisning — den navigerer
   ikke, og et steg er derfor ikke en knapp. Skal brukeren kunne hoppe tilbake,
   er det skjermens egen «Tilbake», ikke stigen.

   Gjeldende steg annonseres to veier: aria-current="step" for skjermleser som
   leser lista, og en skjult «Steg 2 av 5»-setning for den som ikke gjør det.
   Uten den siste er posisjonen bare en visuell påstand. */
export function Stepper({ steps = [], current = 0, compact = false, label = "Fremdrift", dataOdId = "nav-steg", ...rest }) {
  const norm = steps.map((s) => (typeof s === "string" ? { id: s, label: s } : s));
  return (
    <div className="akhq-step-wrap">
      <ol className={"akhq-step" + (compact ? " akhq-step--kompakt" : "")} aria-label={label} data-od-id={dataOdId} {...rest}>
        {norm.map((s, i) => {
          const tilstand = i < current ? "ferdig" : i === current ? "naa" : "kommer";
          return (
            <React.Fragment key={s.id}>
              <li className="akhq-step-el" data-tilstand={tilstand} aria-current={tilstand === "naa" ? "step" : undefined}>
                <span className="akhq-step-nr" aria-hidden="true">{tilstand === "ferdig" ? <Ok /> : i + 1}</span>
                <span className="akhq-step-tx">{s.label}</span>
                {tilstand === "naa" && <span className="akhq-step-sr">Steg {i + 1} av {norm.length} · pågår</span>}
                {tilstand === "ferdig" && <span className="akhq-step-sr">Steg {i + 1} av {norm.length} · fullført</span>}
              </li>
              {i < norm.length - 1 && <span className="akhq-step-strek" aria-hidden="true" />}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
}
