"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePlanActive, dupliserPlan } from "../actions";

export function PlanActions({
  planId,
  isActive,
}: {
  planId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await togglePlanActive(planId);
      router.refresh();
    });
  }

  function dupliser() {
    startTransition(async () => {
      const newId = await dupliserPlan(planId);
      if (newId) router.push(`/admin/plans/${newId}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${
          isActive
            ? "border border-input bg-card text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {pending ? "…" : isActive ? "Sett inaktiv" : "Aktiver"}
      </button>
      <button
        type="button"
        onClick={dupliser}
        disabled={pending}
        className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border disabled:opacity-60"
      >
        Dupliser
      </button>
    </div>
  );
}
