"use client";

// Placeholder — Recharts tidsserie kommer i Masterplan S14.

import type { TrendPunkt } from "@/app/admin/analyse/__demoData";

type Props = {
  data: TrendPunkt[];
  valgtAgg: "uke" | "maaned";
  studentId: string;
  periodeKey: string;
};

export function AnalyseTrender({ data, valgtAgg }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Trender
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {data.length} datapunkter, aggregert per {valgtAgg}
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Stacked area-chart kommer i Masterplan S14 (Recharts).
      </p>
    </div>
  );
}
