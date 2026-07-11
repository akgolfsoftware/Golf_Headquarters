"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ChevronRight } from "lucide-react";

export function NyTekniskPlanMalButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info("Mal-oppretting gjøres fra Plan-maler")}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
      }
    >
      <Plus size={14} strokeWidth={1.5} />
      Ny teknisk plan-mal
    </button>
  );
}

export function SeAllePlanMalerLink({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/admin/plan-templates")}
      className={
        className ??
        "font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
      }
    >
      Se alle plan-maler
    </button>
  );
}

export function BrukMalLink({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/admin/plan-templates")}
      className={
        className ??
        "inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
      }
    >
      Bruk mal
      <ChevronRight size={12} strokeWidth={1.5} />
    </button>
  );
}
