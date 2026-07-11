"use client";

import { toast } from "sonner";

export function SkjulProfilButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Kontakt support for å deaktivere kontoen")}
      className="rounded-sm border border-destructive/40 px-4 py-2 text-[12px] font-medium text-destructive"
    >
      Skjul
    </button>
  );
}
