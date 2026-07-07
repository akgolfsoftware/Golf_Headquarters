"use client";

import { useState } from "react";

import { GruppeKalenderWrapper } from "./gruppe-kalender-wrapper";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

/** Fane-velger + kalender for flere grupper på samme side (f.eks. GFGK sine fire aldersgrupper). */
export function FlereGrupperKalender({ grupper }: { grupper: GruppeKalenderData[] }) {
  const [valgtId, setValgtId] = useState(grupper[0]?.gruppeId);
  const valgt = grupper.find((g) => g.gruppeId === valgtId) ?? grupper[0];

  if (!valgt) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {grupper.map((g) => (
          <button
            key={g.gruppeId}
            type="button"
            onClick={() => setValgtId(g.gruppeId)}
            className={
              "rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition " +
              (g.gruppeId === valgt.gruppeId
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:border-primary")
            }
          >
            {g.gruppeNavn}
          </button>
        ))}
      </div>
      <GruppeKalenderWrapper data={valgt} />
    </div>
  );
}
