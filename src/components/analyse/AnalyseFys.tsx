"use client";

// Placeholder — FYS-progresjon med vekt + muskelbalanse kommer i Masterplan S14.

import type { FysProgresjonRad } from "@/app/admin/analyse/actions";

type Props = {
  data: FysProgresjonRad[];
  muskelfordeling: Record<string, number>;
};

export function AnalyseFys({ data, muskelfordeling }: Props) {
  const muskler = Object.keys(muskelfordeling);
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        FYS-progresjon
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {data.length} fysiske progresjonsrader, {muskler.length} muskelgrupper
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Vekt-progresjon, muskelgruppe-balanse, intensitetsfordeling kommer i
        Masterplan S14.
      </p>
    </div>
  );
}
