"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { Plus } from "lucide-react";

export function NyPlanKnapp({ variant }: { variant: "header" | "empty-state" }) {
  const router = useRouter();
  const toast = useToast();

  function handleKlikk() {
    toast.info("Opprett ny FYS-plan direkte i Workbench");
    router.push("/portal/planlegge");
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={handleKlikk}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-accent transition-opacity hover:opacity-90"
      >
        <Plus className="h-3 w-3" strokeWidth={2.4} aria-hidden />
        Ny plan
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleKlikk}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-accent transition-opacity hover:opacity-90"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
      Lag din første plan
    </button>
  );
}
