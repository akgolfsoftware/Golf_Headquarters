"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Send,
  Pencil,
  FileDown,
  Archive,
  Trash2,
  Copy,
} from "lucide-react";
import { godkjennPlan, arkiverPlan, slettPlan } from "./actions";
import { dupliserPlan } from "../actions";

type Props = {
  planId: string;
  isActive: boolean;
  isAdmin: boolean;
};

export function PlanActions({ planId, isActive, isAdmin }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function godkjenn() {
    startTransition(async () => {
      await godkjennPlan(planId);
      router.refresh();
    });
  }

  function arkiver() {
    if (!confirm("Arkivere planen? Den blir inaktiv, men beholdes i historikken.")) {
      return;
    }
    startTransition(async () => {
      await arkiverPlan(planId);
      router.refresh();
    });
  }

  function slett() {
    if (
      !confirm(
        "Slette planen permanent? Dette kan ikke angres. Alle økter og drills slettes også.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      await slettPlan(planId);
    });
  }

  function dupliser() {
    startTransition(async () => {
      const newId = await dupliserPlan(planId);
      if (newId) router.push(`/admin/plans/${newId}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isActive && (
        <button
          type="button"
          onClick={godkjenn}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Check className="h-4 w-4" strokeWidth={1.5} />
          Godkjenn
        </button>
      )}

      {isActive && (
        <button
          type="button"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
          Send til spiller
        </button>
      )}

      <button
        type="button"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.5} />
        Rediger
      </button>

      <button
        type="button"
        onClick={dupliser}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        <Copy className="h-4 w-4" strokeWidth={1.5} />
        Dupliser
      </button>

      <button
        type="button"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        <FileDown className="h-4 w-4" strokeWidth={1.5} />
        Eksport PDF
      </button>

      {isActive && (
        <button
          type="button"
          onClick={arkiver}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
        >
          <Archive className="h-4 w-4" strokeWidth={1.5} />
          Arkiver
        </button>
      )}

      {isAdmin && (
        <button
          type="button"
          onClick={slett}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-card px-3 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          aria-label="Slett plan"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
