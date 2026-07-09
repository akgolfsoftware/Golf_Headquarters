"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddExerciseSheet } from "@/components/portal/add-exercise-sheet";

export function LeggTilKnapp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[12px] font-bold text-accent transition-opacity hover:opacity-90"
      >
        <Plus size={13} strokeWidth={2.5} />
        Legg til
      </button>
      <AddExerciseSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
