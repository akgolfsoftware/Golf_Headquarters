"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AIMalByggerModal } from "@/components/ai-foreslag/mal-bygger-modal";

export function MalByggerLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function handleClose() {
    setOpen(false);
    router.push("/portal/planlegge?tab=mal");
  }

  return (
    <>
      <div className="font-mono px-4 py-12 text-center text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        AI mål-bygger — 3-stegs wizard.
      </div>
      <AIMalByggerModal
        open={open}
        onClose={handleClose}
        onSave={(goals) => console.info("[ai-mal] lagret:", goals.map((g) => g.title))}
      />
    </>
  );
}
