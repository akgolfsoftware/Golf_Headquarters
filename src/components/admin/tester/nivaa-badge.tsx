/**
 * NivaaBadge — kompakt nivå-chip i Tester-matrisens målte celler.
 *
 * Viser beste oppnådde nivå mot DataGolf-fasiten ("PGA", "DPW/KFT", "CHA",
 * "NOR", "JR", "SCR" — eller "U/SCR" når målingen er under Scratch-kravet).
 * Tooltip (title) viser hele nivåstigen. Kun DS-tokens, ingen hardkodede farger.
 */

import { cn } from "@/lib/utils";

export type NivaaBadgeData = {
  /** Kompakt nivå-tekst, f.eks. "PGA", "DPW/KFT", "CHA". */
  short: string;
  /** Fullt nivånavn, f.eks. "PGA topp 40". */
  label: string;
  /** Posisjon i nivåstigen (0 = beste nivå). */
  index: number;
  /** `false` = under Scratch-kravet. */
  achieved: boolean;
  /** Hele nivåstigen som flerlinjers tooltip-tekst. */
  ladder: string;
};

function toneClass(badge: NivaaBadgeData): string {
  if (!badge.achieved) return "bg-secondary/60 text-muted-foreground";
  // PGA-nivåene (topp 40 + snitt) fremheves, resten nøytral chip.
  if (badge.index <= 1) return "bg-primary/10 text-primary";
  return "bg-secondary text-foreground";
}

export function NivaaBadge({ badge }: { badge: NivaaBadgeData }) {
  return (
    <span
      title={`${badge.label}\n\nNivåstige:\n${badge.ladder}`}
      className={cn(
        "inline-flex h-[14px] cursor-help items-center whitespace-nowrap rounded-[3px] px-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.06em]",
        toneClass(badge),
      )}
    >
      {badge.short}
    </span>
  );
}
