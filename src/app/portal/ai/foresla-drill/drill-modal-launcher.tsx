"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AIForeslaaDrillModal } from "@/components/ai-foreslag/foresla-drill-modal";

export function DrillModalLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function handleClose() {
    setOpen(false);
    router.push("/portal/planlegge?tab=drills");
  }

  return (
    <>
      <div className="font-mono px-4 py-12 text-center text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        AI foreslår drills basert på dine siste 90 dager.
      </div>
      <AIForeslaaDrillModal
        open={open}
        onClose={handleClose}
        onAdd={(titles) => {
          console.info("[ai-drill] valgte drills:", titles);
        }}
      />
    </>
  );
}
