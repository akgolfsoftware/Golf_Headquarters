import React from "react";
import { Avatar } from "../structure/Avatar.jsx";
import { Tag } from "../core/Tag.jsx";
import { Button } from "../core/Button.jsx";

/**
 * AK Golf HQ — SamtykkKort
 * Parent consent card. Shows player, consent type, description, and approve/reject actions.
 * status: pending · approved · rejected.
 */

const STATUS_MAP = {
  pending:  { variant: "neutral", label: "Venter"   },
  approved: { variant: "up",      label: "Godkjent" },
  rejected: { variant: "down",    label: "Avvist"   },
};

const CSS = `
.ak-samtykk{
  display:flex;flex-direction:column;gap:16px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:20px;
}
.ak-samtykk__header{display:flex;align-items:center;gap:12px;}
.ak-samtykk__info{flex:1;min-width:0;}
.ak-samtykk__title{
  font-family:var(--font-display);font-size:var(--text-16);font-weight:600;
  color:var(--text);letter-spacing:var(--tracking-display);
}
.ak-samtykk__sub{font-size:var(--text-13);color:var(--text-muted);margin-top:2px;}
.ak-samtykk__body{
  background:var(--surface-2);border:1px solid var(--border);
  border-radius:var(--radius-input);padding:14px;
  font-size:var(--text-13);color:var(--text-2);line-height:var(--leading-body);
}
.ak-samtykk__foot{display:flex;gap:8px;flex-wrap:wrap;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-samtykk-css")) {
  const s = document.createElement("style");
  s.id = "ak-samtykk-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function SamtykkKort({
  playerName,
  playerAvatar,
  type,
  description,
  status = "pending",
  onApprove,
  onReject,
  className = "",
  style,
}) {
  const s_ = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <div className={`ak-samtykk ${className}`} style={style}>
      <div className="ak-samtykk__header">
        {playerName && <Avatar name={playerName} src={playerAvatar} size="sm" />}
        <div className="ak-samtykk__info">
          <div className="ak-samtykk__title">{type || "Samtykke"}</div>
          {playerName && <div className="ak-samtykk__sub">Gjelder: {playerName}</div>}
        </div>
        <Tag variant={s_.variant} size="sm">{s_.label}</Tag>
      </div>
      {description && <div className="ak-samtykk__body">{description}</div>}
      {status === "pending" && (onApprove || onReject) && (
        <div className="ak-samtykk__foot">
          {onApprove && <Button variant="signal" size="sm" onClick={onApprove}>Godkjenn</Button>}
          {onReject && <Button variant="secondary" size="sm" onClick={onReject}>Avvis</Button>}
        </div>
      )}
    </div>
  );
}
