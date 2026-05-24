"use client";

import { useState } from "react";
import { DrillCard, type DrillCardData } from "./drill-card";
import { DrillDetailPanel, type DrillDetailData } from "./drill-detail-panel";

type DrillGridProps = {
  drills: DrillCardData[];
  /**
   * Funksjon som henter full detalj-data for én drill (typisk fra Prisma).
   * Returnerer DrillDetailData som vises i slide-in panel.
   */
  loadDetail: (drillId: string) => DrillDetailData | null;
};

/**
 * Client-wrapper som håndterer state for drill-grid + slide-in panel.
 *
 * Bruk:
 * <DrillGrid drills={drills} loadDetail={getDrillDetail} />
 *
 * loadDetail kan være en in-memory lookup (hvis full data er pre-loaded)
 * eller en server action / fetch.
 */
export function DrillGrid({ drills, loadDetail }: DrillGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const detail = openId ? loadDetail(openId) : null;

  return (
    <>
      <div className="drill-grid">
        {drills.map((d) => (
          <DrillCard
            key={d.id}
            drill={d}
            isActive={d.id === openId}
            onClick={() => setOpenId(d.id)}
          />
        ))}
      </div>
      {detail ? (
        <DrillDetailPanel drill={detail} onClose={() => setOpenId(null)} />
      ) : null}
    </>
  );
}
