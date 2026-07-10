"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { Calendar, Plus } from "lucide-react";

export function PlanHandlinger() {
  const router = useRouter();
  const toast = useToast();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => toast.info("Periodisering kommer snart")}
        className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
      >
        <Calendar className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Periodisering
      </button>
      <button
        type="button"
        onClick={() => router.push("/portal/planlegge")}
        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> Ny plan
      </button>
    </div>
  );
}
