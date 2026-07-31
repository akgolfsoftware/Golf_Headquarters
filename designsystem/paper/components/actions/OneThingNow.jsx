import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Wrapperen eier containeren — kortet legger om sine egne kolonner. */
.akhq-now-c{container-type:inline-size;min-width:0}
.akhq-now{display:grid;grid-template-columns:var(--cols,1fr auto);gap:var(--s5);align-items:center;padding:var(--s5);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow)}
.akhq-now-label{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-fg);margin-bottom:var(--s2)}
.akhq-now-pulse{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft);animation:akhq-pulse 2.4s var(--ease) infinite;flex:none}
@keyframes akhq-pulse{0%,100%{box-shadow:0 0 0 3px var(--accent-soft);opacity:1}50%{box-shadow:0 0 0 6px transparent;opacity:.9}}
.akhq-now-title{font-family:var(--disp);font-size:18px;font-weight:600;letter-spacing:-.01em;margin:0 0 4px;line-height:1.25}
.akhq-now-desc{margin:0;color:var(--muted);font-size:13.5px;line-height:1.5;max-width:58ch}
.akhq-now-actions{display:flex;gap:var(--s2);flex:none;flex-wrap:wrap;justify-content:var(--just,flex-end)}
}
@layer akhq-container{
/* Var @media(max-width:640px). Terskel omregnet til 520px container. */
@container (max-width:520px){.akhq-now{--cols:1fr}.akhq-now-actions{--just:flex-start}}
/* Brukerpreferanse, ikke bredde — blir @media, men hører i container-laget
   som «tilpasning til omgivelse» sammen med pointer:coarse. */
@media(prefers-reduced-motion:reduce){.akhq-now-pulse{animation:none}}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-now")) { const s = document.createElement("style"); s.id = "akhq-css-now"; s.textContent = css; document.head.appendChild(s); }
export function OneThingNow({ label = "Én ting nå", title, children, actions, dataOdId = "one-thing-now", ...rest }) {
  return (
    <div className="akhq-now-c">
    <section className="akhq-now" aria-label={label} data-od-id={dataOdId} {...rest}>
      <div>
        <div className="akhq-now-label"><span className="akhq-now-pulse" aria-hidden="true"></span> {label}</div>
        {title && <h2 className="akhq-now-title">{title}</h2>}
        {children && <p className="akhq-now-desc">{children}</p>}
      </div>
      {actions && <div className="akhq-now-actions">{actions}</div>}
    </section>
    </div>
  );
}
