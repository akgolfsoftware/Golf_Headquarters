import React from "react";

/**
 * AK Golf HQ — KanbanKolonne
 * Statuskolonne for kanban-visninger (planer, oppgaver, køer).
 * Promotert fra plans-app (ui_kits/agencyos). Header: status-prikk + tittel + teller.
 * Kort flyter som children; <KanbanKolonne.Tom> er eksplisitt tom-tilstand.
 */

const CSS = `
.ak-kanban{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px;}
.ak-kanban__head{display:flex;align-items:center;gap:8px;padding:0 2px;}
.ak-kanban__dot{width:8px;height:8px;border-radius:9999px;flex:none;}
.ak-kanban__tittel{
  font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--text);
  text-transform:uppercase;letter-spacing:.06em;
}
.ak-kanban__antall{
  font-family:var(--font-mono);font-size:9px;color:var(--text-muted);
  font-variant-numeric:tabular-nums;
}
.ak-kanban__body{
  display:flex;flex-direction:column;gap:10px;overflow-y:auto;
  padding-right:2px;min-height:0;
}
.ak-kanban-tom{
  padding:20px 12px;text-align:center;
  border:1px dashed var(--border);border-radius:var(--radius-card);
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-kanban-css")) {
  const s = document.createElement("style");
  s.id = "ak-kanban-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const TONE = {
  noytral: "var(--text-muted)",
  aktiv: "var(--signal)",
  ferdig: "var(--axis-spill)",
};

export function KanbanKolonne({ tittel, tone = "noytral", antall, children, className = "", style }) {
  const items = React.Children.toArray(children);
  const count = antall !== undefined
    ? antall
    : items.filter((c) => !(React.isValidElement(c) && c.type === Tom)).length;
  return (
    <div className={`ak-kanban ${className}`} style={style} role="group" aria-label={`${tittel} (${count})`}>
      <div className="ak-kanban__head">
        <span className="ak-kanban__dot" style={{ background: TONE[tone] }} aria-hidden="true"></span>
        <span className="ak-kanban__tittel">{tittel}</span>
        <span className="ak-kanban__antall">{count}</span>
      </div>
      <div className="ak-kanban__body">{children}</div>
    </div>
  );
}

function Tom({ children = "Ingen elementer" }) {
  return <div className="ak-kanban-tom">{children}</div>;
}

KanbanKolonne.Tom = Tom;
