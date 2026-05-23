"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AIForeslaaTurneringModal } from "@/components/ai-foreslag/foresla-turnering-modal";

export function TurneringModalLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function handleClose() {
    setOpen(false);
    router.push("/portal/planlegge?tab=turneringer");
  }

  return (
    <>
      <div className="font-mono px-4 py-12 text-center text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        AI foreslår turneringer matchet mot din HCP og kalender.
      </div>
      <AIForeslaaTurneringModal
        open={open}
        onClose={handleClose}
        onEnroll={(names) => console.info("[ai-turnering] meldt på:", names)}
      />
    </>
  );
}
