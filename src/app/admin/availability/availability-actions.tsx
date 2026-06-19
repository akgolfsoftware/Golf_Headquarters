"use client";

import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function SynkButton() {
  return (
    <button
      type="button"
      className={agBtnClass("ghost")}
      onClick={() => toast.info("Synkronisering skjer automatisk hvert 15. minutt")}
    >
      <RefreshCw size={16} strokeWidth={1.5} /> Synk
    </button>
  );
}
