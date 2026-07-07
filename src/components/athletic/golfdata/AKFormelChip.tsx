import type React from "react";

/**
 * AK Golf HQ — AKFormelChip
 * Én formelverdi på økt/drill: arena (M0–M5), CS-nivå, læringstrinn.
 * Tolags-språk: kode kun i coach-flaten (visKode); spiller ser klarspråk.
 * Arvet (fra plan/mal) = dempet; overstyrt (satt manuelt) = solid kant + tekst.
 * Portet 1:1 fra public/design-handover/components/domain/AKFormelChip.jsx.
 * CSS: ./golfdata.css (.ak-akchip).
 */

export type AKFormelChipProps = {
  /** Formelkode — kun synlig i coach-flaten, f.eks. "M2", "CS60", "L3". */
  kode: string;
  /** Klarspråk-navn, f.eks. "Kravtrening", "60 % av maksfart". */
  navn: string;
  /** Verditilstand: "arvet" (dempet — fra plan/mal) · "overstyrt" (solid — satt manuelt). */
  tilstand?: "arvet" | "overstyrt";
  /** Vis kode (coach) eller kun klarspråk (spiller). Default true. */
  visKode?: boolean;
  /** Klikk åpner redigering (chippen blir knapp). */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function AKFormelChip({
  kode,
  navn,
  tilstand = "arvet",
  visKode = true,
  onClick,
  className = "",
  style,
}: AKFormelChipProps) {
  const Tag = (onClick ? "button" : "span") as React.ElementType;
  return (
    <Tag
      className={`ak-akchip ak-akchip--${tilstand} ${className}`}
      style={style}
      onClick={onClick}
      type={onClick ? "button" : undefined}
      title={tilstand === "overstyrt" ? "Satt manuelt — avviker fra plan/mal" : "Arvet fra plan"}
    >
      {visKode && (
        <>
          <span className="ak-akchip__kode">{kode}</span>
          <span className="ak-akchip__skille" aria-hidden="true"></span>
        </>
      )}
      <span>{navn}</span>
    </Tag>
  );
}
