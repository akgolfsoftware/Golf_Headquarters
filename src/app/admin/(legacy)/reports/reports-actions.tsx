"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";

export function NyRapportButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info("Nye rapporter genereres automatisk")}
      className={className}
    >
      <Plus size={16} strokeWidth={1.5} /> Ny rapport
    </button>
  );
}
