"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function ApprovalActions({ actionId, playerId }: { actionId: string; playerId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(godkjenn: boolean) {
    startTransition(async () => {
      if (godkjenn) await acceptPlanAction(actionId);
      else await rejectPlanAction(actionId);
      router.refresh();
    });
  }

  return (
    <div className="mt-[14px] flex gap-2">
      <button
        type="button"
        onClick={() => handle(true)}
        disabled={pending}
        className={`${agBtnClass("primary", "sm")} disabled:opacity-60`}
      >
        <Check className="h-4 w-4" strokeWidth={2} /> Godkjenn
      </button>
      <button
        type="button"
        onClick={() => handle(false)}
        disabled={pending}
        className={`${agBtnClass("ghost", "sm")} disabled:opacity-60`}
      >
        <X className="h-4 w-4" strokeWidth={2} /> Avvis
      </button>
      <Link href={`/admin/spillere/${playerId}`} className={agBtnClass("ghost", "sm")}>
        Se profil
      </Link>
    </div>
  );
}
