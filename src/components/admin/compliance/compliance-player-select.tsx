"use client";

/**
 * Spillervelger for Compliance-spillerpanelet (Section 1).
 * URL-state slik at panelet er delbart og server-rendret — samme mønster som
 * AnalyseSidebar. Setter ?view=compliance&studentId=<id> og beholder periode.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function CompliancePlayerSelect({
  players,
  selectedId,
  periodKey,
}: {
  players: { id: string; name: string }[];
  selectedId: string | null;
  periodKey: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (players.length === 0) return null;

  function onSelect(id: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("view", "compliance");
    params.set("studentId", id);
    startTransition(() => {
      router.push(`/admin/analyse?${params.toString()}`);
    });
  }

  return (
    <label className="inline-flex items-center gap-2">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        SPILLER
      </span>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={pending}
        data-period={periodKey}
        className="rounded-md border border-input bg-background px-3 py-1.5 font-mono text-[11px] font-bold text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
