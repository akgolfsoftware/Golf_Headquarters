"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { acceptPlanActionMedKvittering, rejectPlanActionMedKvittering } from "@/lib/agents/actions";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function ApprovalActions({
  actionId,
  playerId,
  detailHref,
}: {
  actionId: string;
  playerId: string;
  detailHref?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function handle(godkjenn: boolean) {
    startTransition(async () => {
      setFeil(null);
      try {
        const resultat = godkjenn
          ? await acceptPlanActionMedKvittering(actionId)
          : await rejectPlanActionMedKvittering(actionId);
        if (!resultat.ok) {
          setFeil(resultat.feil);
          if (resultat.oppdater) router.refresh();
          return;
        }
        router.refresh();
      } catch {
        setFeil("Handlingen kunne ikke bekreftes. Oppdater oversikten før du prøver igjen.");
      }
    });
  }

  return (
    <div className="mt-[14px] flex flex-wrap gap-2">
      {feil && <p role="alert" className="w-full text-sm">{feil}</p>}
      <button
        type="button"
        onClick={() => handle(true)}
        disabled={pending}
        className={`${agBtnClass("primary", "sm")} max-md:h-11 max-md:flex-1 disabled:opacity-60`}
      >
        <Check className="h-4 w-4" strokeWidth={2} /> Godkjenn
      </button>
      <button
        type="button"
        onClick={() => handle(false)}
        disabled={pending}
        className={`${agBtnClass("ghost", "sm")} max-md:h-11 max-md:flex-1 disabled:opacity-60`}
      >
        <X className="h-4 w-4" strokeWidth={2} /> Avvis
      </button>
      {detailHref && (
        <Link
          href={detailHref}
          className={`${agBtnClass("ghost", "sm")} max-md:h-11 max-md:flex-1`}
        >
          Detaljer
        </Link>
      )}
      <Link
        href={`/admin/spillere/${playerId}`}
        className={`${agBtnClass("ghost", "sm")} max-md:h-11 max-md:flex-1`}
      >
        Se profil
      </Link>
    </div>
  );
}
