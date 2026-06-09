"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pause, Play, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui";
import { togglePlanActive, deletePlan } from "./actions";

type Props = {
  planId: string;
  planNavn: string;
  isActive: boolean;
};

/**
 * Per-kort handlingsmeny på plan-lista: aktiver/deaktiver + slett.
 * Stopper klikk-propagering så kort-lenken ikke trigges.
 */
export function PlanCardMenu({ planId, planNavn, isActive }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await togglePlanActive(planId);
      router.refresh();
    });
  }

  function slett() {
    if (
      !confirm(
        `Slette planen «${planNavn}» permanent? Dette kan ikke angres. Alle økter og drills slettes også.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deletePlan(planId);
      router.refresh();
    });
  }

  return (
    <div
      className="relative"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Handlinger"
          disabled={pending}
          className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <MoreHorizontal size={14} strokeWidth={1.75} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
          <DropdownMenuItem onSelect={toggle}>
            {isActive ? (
              <>
                <Pause size={14} strokeWidth={1.75} />
                Sett på pause
              </>
            ) : (
              <>
                <Play size={14} strokeWidth={1.75} />
                Aktiver
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={slett} variant="destructive">
            <Trash2 size={14} strokeWidth={1.75} />
            Slett plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
