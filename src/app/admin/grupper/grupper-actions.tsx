"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";

export function NyGruppeButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info("Gruppe-oppretting kommer snart")}
      className={className}
    >
      <Plus size={16} strokeWidth={1.5} /> Ny gruppe
    </button>
  );
}
