import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-fleks{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;box-sizing:border-box;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1;flex:none}
.akhq-fleks-ik{font-size:10px;line-height:1}
}
@layer akhq-container{
}
@layer akhq-modifier{
.akhq-fleks--anker{background:var(--soft);border-color:transparent;color:var(--fg)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-fleks")) { const s = document.createElement("style"); s.id = "akhq-css-fleks"; s.textContent = css; document.head.appendChild(s); }
/* Fleks-merket: er økta flyttbar eller et anker? To lukkede varianter:
   «fleks» (kan flyttes fritt av plan-agenten, ~ + luftig ramme) og
   «anker» (fast tid — WANG-økter, gruppetimer; ▪ + soft-fylt). Fargeløst:
   fleksibilitet er vokabular. Informasjon, aldri knapp — flytting skjer i
   Workbench. Samme glyffer som SessionCard bruker, så merket leses likt
   på kort og i lister. */
export function FleksMerke({ kind = "fleks", dataOdId = "fleks", ...rest }) {
  const anker = kind === "anker";
  return (
    <span className={"akhq-fleks" + (anker ? " akhq-fleks--anker" : "")}
      title={anker ? "Anker — fast tid, flyttes ikke av planmotoren" : "Fleks — kan flyttes fritt innenfor uka"}
      data-od-id={"kpi-" + dataOdId} {...rest}>
      <span className="akhq-fleks-ik" aria-hidden="true">{anker ? "◪" : "~"}</span>
      {anker ? "Anker" : "Fleks"}
    </span>
  );
}
