"use client";

import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function SynkNaaButton() {
  return (
    <button
      type="button"
      className={agBtnClass("primary")}
      onClick={() => toast.info("WAGR-synk kjøres automatisk natt til mandag")}
    >
      <RefreshCw size={16} aria-hidden /> Synk nå
    </button>
  );
}
