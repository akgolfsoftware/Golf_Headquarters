"use client";

/**
 * GoalDetailClient — interaktive handlinger for ett mål.
 *
 * Tre actions: Endre · Marker som oppnådd · Avbryt mål.
 * Bruker server actions fra `mal/goals-actions.ts` for marker/slett.
 * "Endre" er stub-knapp som venter på edit-modal.
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";

import {
  markeerGoalSomOppnaadd,
  slettGoal,
} from "../../goals-actions";

type Props = {
  goalId: string;
};

export function GoalDetailClient({ goalId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function endreMal() {
    // Stub — kobles til edit-modal i neste runde.
    alert("Endre mål — modal kommer snart.");
  }

  function markerOppnadd() {
    if (!confirm("Marker dette målet som oppnådd?")) return;
    startTransition(async () => {
      await markeerGoalSomOppnaadd(goalId);
      router.refresh();
    });
  }

  function avbrytMal() {
    if (!confirm("Er du sikker på at du vil avbryte dette målet?")) return;
    startTransition(async () => {
      await slettGoal(goalId);
      router.push("/portal/mal");
    });
  }

  const isDummy = goalId === "dummy";

  return (
    <section
      aria-label="Mål-handlinger"
      className="flex flex-wrap items-center gap-3 border-t border-border pt-8"
    >
      <button
        type="button"
        onClick={endreMal}
        disabled={pending || isDummy}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
        Endre mål
      </button>

      <button
        type="button"
        onClick={markerOppnadd}
        disabled={pending || isDummy}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
        ) : (
          <Check className="h-4 w-4" strokeWidth={1.75} />
        )}
        Marker som oppnådd
      </button>

      <button
        type="button"
        onClick={avbrytMal}
        disabled={pending || isDummy}
        className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-6 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
        Avbryt mål
      </button>

      {isDummy && (
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Demo · handlinger ikke aktive
        </span>
      )}
    </section>
  );
}
