"use client";

import { useRouter } from "next/navigation";

import { TN } from "@/lib/v2/team-norway";

/**
 * Spillervelgeren øverst i spillerprofilen (tegningens ppSel). Bytter spiller
 * og beholder fanen.
 */
export function SpillerVelger({ valgt, fane, spillere }: { valgt: string; fane: string; spillere: { id: string; navn: string }[] }) {
  const router = useRouter();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ fontFamily: TN.font.display, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: TN.textSecondary }}>
        Spiller · {spillere.length} i gruppen
      </span>
      <select
        value={valgt}
        onChange={(e) => router.push(`/team-norway/spiller/${encodeURIComponent(e.target.value)}?fane=${fane}`)}
        style={{ minHeight: 44, padding: "0 12px", border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.ink900, fontSize: 15, width: "100%", minWidth: 0 }}
      >
        {spillere.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}
      </select>
    </label>
  );
}
