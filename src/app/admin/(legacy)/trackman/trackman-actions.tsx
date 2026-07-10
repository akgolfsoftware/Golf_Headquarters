"use client";

import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

export function TrackmanFilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (label === "Spiller") toast.info("Filtrer via spillerkortet");
        else if (label === "Miljø") toast.info("Miljø-filter kommer snart");
        else toast.info("Kilde-filter kommer snart");
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {label}
      <ChevronDown className="h-3 w-3" strokeWidth={2} aria-hidden />
    </button>
  );
}
