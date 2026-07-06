"use client";

import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

export function RunderFilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info("Avanserte filtre kommer snart")}
      className="inline-flex h-8 cursor-pointer items-center gap-[6px] rounded-lg border border-border bg-card px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:bg-secondary"
    >
      {label}
      <ChevronDown className="h-3 w-3" strokeWidth={2} aria-hidden />
    </button>
  );
}
