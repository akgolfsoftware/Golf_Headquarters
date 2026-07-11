"use client";

import { useTransition } from "react";
import { Link2 } from "lucide-react";
import { bulkKoblTurneringerTilArsplan } from "../turneringer/actions";

export function BulkKoblTurneringer({
  seasonPlanId,
  year,
  antall,
}: {
  seasonPlanId: string;
  year: number;
  antall: number;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await bulkKoblTurneringerTilArsplan(seasonPlanId, year);
        });
      }}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
    >
      <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      {isPending ? "Kobler…" : `Last inn ${antall} turneringer`}
    </button>
  );
}
