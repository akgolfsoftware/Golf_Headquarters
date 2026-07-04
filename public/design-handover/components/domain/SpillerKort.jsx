import React from "react";
import { Avatar } from "../structure/Avatar.jsx";
import { Tag } from "../core/Tag.jsx";
import { KpiTile } from "../data/KpiTile.jsx";

/**
 * AK Golf HQ — SpillerKort
 * Player card for coach roster views. Shows avatar, name, HCP/kategori/tier tags,
 * and a 3-column KPI strip (SG snitt, runder, adherence).
 */

const CSS = `
.ak-spillerkort{
  display:flex;flex-direction:column;gap:14px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:16px;
  width:100%;text-align:left;
  transition:background var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard);
}
.ak-spillerkort--interactive{cursor:pointer;border:none;}
.ak-spillerkort--interactive:hover{background:var(--surface-hover);border-color:var(--border-strong);}
.ak-spillerkort__top{display:flex;align-items:center;gap:12px;}
.ak-spillerkort__info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.ak-spillerkort__name{
  font-family:var(--font-display);font-size:var(--text-16);font-weight:600;
  color:var(--text);letter-spacing:var(--tracking-display);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.ak-spillerkort__tags{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.ak-spillerkort__kpis{
  display:grid;grid-template-columns:repeat(3,1fr);gap:0;
  border-top:1px solid var(--border);padding-top:14px;
}
.ak-spillerkort__kpis > *{padding:0 14px;}
.ak-spillerkort__kpis > *:first-child{padding-left:0;}
.ak-spillerkort__kpis > *:not(:first-child){border-left:1px solid var(--border);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-spillerkort-css")) {
  const s = document.createElement("style");
  s.id = "ak-spillerkort-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function SpillerKort({
  name,
  hcp,
  kategori,
  tier,
  sg,
  sgDelta,
  runder,
  adherence,
  avatarSrc,
  onClick,
  className = "",
  style,
}) {
  const El = onClick ? "button" : "div";
  const elProps = onClick ? { type: "button", onClick } : {};
  return (
    <El
      className={`ak-spillerkort${onClick ? " ak-spillerkort--interactive" : ""} ${className}`}
      style={style}
      {...elProps}
    >
      <div className="ak-spillerkort__top">
        <Avatar src={avatarSrc} name={name} size="md" />
        <div className="ak-spillerkort__info">
          <div className="ak-spillerkort__name">{name}</div>
          <div className="ak-spillerkort__tags">
            {hcp != null && <Tag variant="neutral" size="sm">HCP {hcp}</Tag>}
            {kategori && <Tag variant="outline" size="sm">Kat {kategori}</Tag>}
            {tier === "PRO" && <Tag variant="signal" size="sm">PRO</Tag>}
          </div>
        </div>
      </div>
      <div className="ak-spillerkort__kpis">
        <KpiTile label="SG snitt" value={sg != null ? sg : "—"} delta={sgDelta} size="md" />
        <KpiTile label="Runder" value={runder ?? "—"} size="md" />
        <KpiTile label="Adherence" value={adherence != null ? `${adherence}%` : "—"} size="md" />
      </div>
    </El>
  );
}
