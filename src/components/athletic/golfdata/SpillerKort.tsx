import React from "react";
import { Avatar } from "./Avatar";
import { Tag } from "./Tag";
import { KpiTile } from "./KpiTile";

/**
 * AK Golf HQ — SpillerKort
 * Player card for coach roster views. Shows avatar, name, HCP/kategori/tier tags,
 * and a 3-column KPI strip (SG snitt, runder, adherence).
 * Ported 1:1 from design-handover domain/SpillerKort.jsx
 */

export type SpillerKortProps = {
  name: string;
  hcp?: string | number;
  kategori?: string;
  tier?: string;
  sg?: string | number;
  sgDelta?: string;
  runder?: number;
  adherence?: number;
  avatarSrc?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

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
}: SpillerKortProps) {
  const El = onClick ? "button" : "div";
  const elProps = onClick ? { type: "button" as const, onClick } : {};
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
