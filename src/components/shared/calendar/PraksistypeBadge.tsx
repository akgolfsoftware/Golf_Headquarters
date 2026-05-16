// PraksistypeBadge — viser praksistype som kompakt badge (B/R/K/S).
//
// Bruker farger fra design-tokens. Tooltip viser fullt navn.

import type { PracticeType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { PRAKSISTYPER } from "@/lib/portal/training/ak-taxonomy";

type Props = {
  type: PracticeType;
  size?: "sm" | "md";
  className?: string;
};

const STIL_PER_TYPE: Record<PracticeType, string> = {
  BLOKK: "bg-secondary text-secondary-foreground",
  RANDOM: "bg-accent text-accent-foreground",
  KONKURRANSE: "bg-primary text-primary-foreground",
  SPILL_TEST: "bg-muted text-foreground border border-border",
};

export function PraksistypeBadge({ type, size = "sm", className }: Props) {
  const info = PRAKSISTYPER[type];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-mono font-medium tabular-nums",
        size === "sm" ? "h-5 min-w-5 px-1.5 text-[11px]" : "h-6 min-w-6 px-2 text-xs",
        STIL_PER_TYPE[type],
        className,
      )}
      title={`${info.label} — ${info.beskrivelse}`}
      aria-label={info.label}
    >
      {info.kort}
    </span>
  );
}
