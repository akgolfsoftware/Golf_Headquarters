"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PlanAction } from "@/generated/prisma/client";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
};

export function PlanActionsCard({ actions }: { actions: PlanAction[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(id: string, godkjenn: boolean) {
    startTransition(async () => {
      if (godkjenn) await acceptPlanAction(id);
      else await rejectPlanAction(id);
      router.refresh();
    });
  }

  if (actions.length === 0) return null;

  return (
    <article className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Forslag fra agentene
        </span>
        <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
          {actions.length} ny{actions.length === 1 ? "tt" : "e"}
        </span>
      </div>

      <ul className="mt-4 space-y-4">
        {actions.map((a) => {
          const sugg = a.suggestion as { forklaring?: string } | null;
          return (
            <li
              key={a.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  {ACTION_LABEL[a.actionType] ?? a.actionType}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {a.agentName}
                </span>
              </div>
              {sugg?.forklaring && (
                <p className="mt-2 text-sm text-foreground">{sugg.forklaring}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handle(a.id, true)}
                  disabled={pending}
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  Godkjenn
                </button>
                <button
                  type="button"
                  onClick={() => handle(a.id, false)}
                  disabled={pending}
                  className="rounded-md border border-input bg-card px-4 py-1.5 text-xs font-medium text-foreground hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  Avvis
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
