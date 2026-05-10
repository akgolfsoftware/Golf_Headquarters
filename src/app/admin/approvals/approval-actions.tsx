"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";

export function ApprovalActions({ actionId }: { actionId: string }) {
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
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => handle(true)}
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        Godkjenn
      </button>
      <button
        type="button"
        onClick={() => handle(false)}
        disabled={pending}
        className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border disabled:opacity-60"
      >
        Avvis
      </button>
    </div>
  );
}
