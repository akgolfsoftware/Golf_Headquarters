"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markeerGoalSomOppnaadd,
  slettGoal,
} from "../../goals-actions";

export function GoalActions({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function fullfor() {
    startTransition(async () => {
      await markeerGoalSomOppnaadd(goalId);
      router.refresh();
    });
  }

  function slett() {
    if (!confirm("Er du sikker på at du vil slette dette målet?")) return;
    startTransition(async () => {
      await slettGoal(goalId);
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={fullfor}
        disabled={pending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Marker som oppnådd
      </button>
      <button
        type="button"
        onClick={slett}
        disabled={pending}
        className="rounded-md border border-destructive/30 bg-destructive/5 px-5 py-2.5 text-sm font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
      >
        Slett mål
      </button>
    </div>
  );
}
