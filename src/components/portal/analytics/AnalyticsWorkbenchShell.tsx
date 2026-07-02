"use client";

/**
 * AnalyticsWorkbenchShell — hovedramme for /portal/analysere.
 * Visuelt lik Planlegg-Workbench: topbar + sidebar + main + høyre panel.
 * Håndterer valgt kategori og periode-filter.
 */

import { useState } from "react";
import { AnalyticsTopbar } from "./AnalyticsTopbar";
import { AnalyticsSidebar } from "./AnalyticsSidebar";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { AnalyticsRightPanel } from "./AnalyticsRightPanel";
import type { AnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import type { AnalyticsCategory } from "./categories";
import "./workbench.css";

export type { AnalyticsWorkbenchData };

export type PeriodFilter = "7d" | "30d" | "90d" | "1y" | "all";

export type AnalyticsWorkbenchShellProps = {
  data: AnalyticsWorkbenchData;
};

export function AnalyticsWorkbenchShell({ data }: AnalyticsWorkbenchShellProps) {
  const [category, setCategory] = useState<AnalyticsCategory>("trening-total");
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  return (
    <div className="akwb">
      <div className="wb" data-screen-label={`Analytics · ${category}`}>
        <AnalyticsTopbar />
        <div className="wb-main analytics-scope">
          <AnalyticsSidebar active={category} onSelect={setCategory} />
          <AnalyticsDashboard
            category={category}
            period={period}
            data={data}
            selectedRoundId={selectedRoundId}
            onSelectRound={setSelectedRoundId}
          />
          <AnalyticsRightPanel
            category={category}
            period={period}
            onPeriodChange={setPeriod}
            data={data}
            selectedRoundId={selectedRoundId}
          />
        </div>
        <div className="wb-status">
          <span className="sb-key">ANALYTICS WORKBENCH</span>
          <span className="sb-sep" />
          <span>
            <span className="sb-key">{data.rounds.totalRounds}</span> runder
          </span>
          <span className="sb-sep" />
          <span>
            <span className="sb-key">{data.training.sessions}</span> økter
          </span>
          <span className="sb-sep" />
          <span>
            <span className="sb-key">{data.trackman.clubs.length}</span> køller TrackMan
          </span>
        </div>
      </div>
    </div>
  );
}
