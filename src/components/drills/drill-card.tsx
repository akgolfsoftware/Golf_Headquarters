import { cn } from "@/lib/utils";
import { DrillCategoryDot } from "./drill-category-dot";

export type DrillCardData = {
  id: string;
  skillArea: string; // "PUTTING", "NÆRSPILL", etc. (vises som label)
  title: string;
  duration: number; // minutter
  intensity: number; // 1-10
  ngfCategoryRange: string; // f.eks. "D–G"
  timesTrained: number;
  isCoachRecommended?: boolean;
};

type DrillCardProps = {
  drill: DrillCardData;
  isActive?: boolean;
  onClick?: () => void;
};

/**
 * Drill-kort til grid-visning.
 *
 * Anatomi (per plan Del 6):
 * - Top-left: fargekodet kategori-prikk + skill-area-label (uppercase mono)
 * - Top-right (betinget): "Coach anbefalt"-badge
 * - Tittel: Inter Tight bold
 * - Meta: "15 min · Intensitet 7/10"
 * - Bottom: NGF-kategori-badge + "X ganger trent"
 * - Hover: subtle border-primary glow + translate-y-0.5
 * - Active/open: 4px venstre-kantlinje i primary
 */
export function DrillCard({ drill, isActive, onClick }: DrillCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("drill-card", isActive && "active")}
    >
      <div className="drill-card-top">
        <span className="drill-card-cat">
          <DrillCategoryDot skillArea={drill.skillArea} />
          {drill.skillArea}
        </span>
        {drill.isCoachRecommended ? (
          <span className="drill-recommend-badge">Coach anbefalt</span>
        ) : null}
      </div>

      <h3 className="drill-card-title">{drill.title}</h3>

      <p className="drill-card-meta">
        {drill.duration} min · Intensitet {drill.intensity}/10
      </p>

      <div className="drill-card-bottom">
        <span className="drill-card-ngf">{drill.ngfCategoryRange}</span>
        <span className="drill-card-trained">
          {drill.timesTrained} ganger trent
        </span>
      </div>
    </button>
  );
}
