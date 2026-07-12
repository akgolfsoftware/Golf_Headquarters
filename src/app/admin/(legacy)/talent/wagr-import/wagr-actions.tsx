"use client";

import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function SynkNaaButton() {
  return (
    <button
      type="button"
      className={agBtnClass("primary")}
      onClick={() =>
        // Ærlig tekst: ingen automatisk WAGR-jobb finnes (verifisert 2026-07-13
        // — ingen cron/agent). Automatikken er egen backlog-sak.
        toast.info("Automatisk WAGR-synk er ikke koblet ennå — import skjer manuelt via CSV")
      }
    >
      <RefreshCw size={16} aria-hidden /> Synk nå
    </button>
  );
}
