"use client";

// Placeholder — SG-korrelasjon med trend kommer i Masterplan S14.

import type { SGCouplingPunkt } from "@/app/admin/analyse/__demoData";

type Props = {
  data: SGCouplingPunkt[];
};

export function AnalyseSG({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        SG-kobling
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {data.length} datapunkter
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        4 SG-kategori-kort med trend-graf + korrelasjon kommer i Masterplan S14.
      </p>
    </div>
  );
}
