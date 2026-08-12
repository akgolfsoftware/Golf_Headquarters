"use client";

import { useState } from "react";

import { GruppeKalenderWrapper } from "./gruppe-kalender-wrapper";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

// Aldersgruppe-dot per Paper-fasit (gfgk-kalender.html): gull/grønn/teal/rød.
// Gjenkjennes på fri tekst i gruppenavnet ("… Mini U10" osv.) — samme mønster
// som farge-mapping ellers i GFGK-micrositen (ingen egen enum for dette).
function gruppeDot(gruppeNavn: string): string {
  const n = gruppeNavn.toLowerCase();
  if (n.includes("mini")) return "var(--gfgk-gold, #ffd000)";
  if (n.includes("basis")) return "var(--green-600, #1f7e47)";
  if (n.includes("elite")) return "var(--gfgk-red, #ef4136)";
  return "var(--gfgk-teal, #00a0b0)"; // Utvikling + fallback
}

/** Fane-velger + kalender for flere grupper på samme side (f.eks. GFGK sine fire aldersgrupper). */
export function FlereGrupperKalender({ grupper }: { grupper: GruppeKalenderData[] }) {
  const [valgtId, setValgtId] = useState(grupper[0]?.gruppeId);
  const valgt = grupper.find((g) => g.gruppeId === valgtId) ?? grupper[0];

  if (!valgt) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist">
        {grupper.map((g) => (
          <button
            key={g.gruppeId}
            type="button"
            role="tab"
            aria-selected={g.gruppeId === valgt.gruppeId}
            onClick={() => setValgtId(g.gruppeId)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-[18px] text-[14.5px] font-bold transition"
            style={
              g.gruppeId === valgt.gruppeId
                ? { background: "var(--ink)", color: "#fff" }
                : { background: "var(--n-50)", color: "var(--fg-2)" }
            }
          >
            <span
              className="block h-2 w-2 rounded-full"
              style={{ background: gruppeDot(g.gruppeNavn) }}
              aria-hidden
            />
            {g.gruppeNavn}
          </button>
        ))}
      </div>
      <GruppeKalenderWrapper data={valgt} />
    </div>
  );
}
