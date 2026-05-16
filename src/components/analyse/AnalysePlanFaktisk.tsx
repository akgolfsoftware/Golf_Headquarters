"use client";

// Placeholder — adherence-tabell med hopp-over kommer i Masterplan S14.

import type { PlanVsActual } from "@/app/admin/analyse/actions";

type Props = {
  data: PlanVsActual[];
};

export function AnalysePlanFaktisk({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Plan vs faktisk
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {data.length} rader sammenligner planlagt vs gjennomført
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Adherence-prosent, tabell, hopp-over-økter kommer i Masterplan S14.
      </p>
    </div>
  );
}
