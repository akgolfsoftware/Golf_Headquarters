import React from "react";
/* INGEN akhq-container-lag, med hensikt (03.08.2026). Chippen krymper
   rundt sin egen tekst — dens bredde ER innholdsbredden — så en
   container query mot seg selv er meningsløs ved konstruksjon. Et
   første forsøk på å gi den en container-type-wrapper gjorde det verre:
   størrelsesinneslutning i inline-aksen gjorde wrapperen 0 px bred i
   alle spalter, så terskelen fyrte alltid. Skal formelen bli mindre i
   en smal spalte, må forelderen sette en modifikator — terskelen hører
   der, ikke her. Kommentaren står UTENFOR css-literalen: en backtick i
   en CSS-kommentar terminerer template-literalen, kutter alt under den
   ut av stilarket og gjør resten til JS som kaster. */
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-akf{display:inline-flex;align-items:center;gap:5px;max-width:100%;height:20px;padding:0 8px;box-sizing:border-box;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.04em;white-space:nowrap;overflow:hidden;line-height:1}
.akhq-akf-txt{overflow:hidden;text-overflow:ellipsis}
.akhq-akf-sep{color:var(--mid);flex:none}
}
@layer akhq-modifier{
.akhq-akf--fylt{background:var(--soft);border-color:transparent}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-akf")) { const s = document.createElement("style"); s.id = "akhq-css-akf"; s.textContent = css; document.head.appendChild(s); }
/* AK-formelen som chip: mono, FARGELØS — AK-vokabularet fargekodes aldri
   (StatusBadge-regelen, bindende). Formelstrengen kommer ferdig fra
   appen/CANON; chippen formaterer ikke og validerer ikke. v2-formatet
   (17 områder) eies av CANON — chippen viser hva den får, med `parts` for
   segmentert visning med ·-skilletegn. Hele formelen ligger i title når
   den klippes. Ren visning — chip i tekst, aldri et treffmål. */
export function AKFormelChip({ formula, parts, filled = false, dataOdId = "akformel", ...rest }) {
  const full = parts ? parts.join(" · ") : formula;
  return (
    <span className={"akhq-akf" + (filled ? " akhq-akf--fylt" : "")} title={full} data-od-id={"kpi-" + dataOdId} {...rest}>
      {parts
        ? parts.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="akhq-akf-sep" aria-hidden="true">·</span>}
            <span className="akhq-akf-txt">{p}</span>
          </React.Fragment>
        ))
        : <span className="akhq-akf-txt">{formula}</span>}
    </span>
  );
}
