// PyramideBar — viser fordeling av pyramide-områder som horisontal stack-bar.
//
// Brukes i kalender-vyer for å gi rask visuell oversikt over hvor mye tid
// som er brukt på FYS/TEK/SLAG/SPILL/TURN. Pulserer hvis avviket fra default-
// fordelingen er > 10 prosentpoeng i ett område.

import type { PyramidArea } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type Props = {
  fordeling: Record<PyramidArea, number>;
  /** Forventet fordeling (% per område). Hvis ulik fordelingen med > 10pp, puls. */
  forventet?: Partial<Record<PyramidArea, number>>;
  /** Vis prosent-tall over hvert segment. */
  visTall?: boolean;
  className?: string;
};

const SEGMENTER: Array<{ key: PyramidArea; bg: string; label: string }> = [
  { key: "FYS", bg: "bg-pyr-fys", label: "Fysisk" },
  { key: "TEK", bg: "bg-pyr-tek", label: "Teknisk" },
  { key: "SLAG", bg: "bg-pyr-slag", label: "Slag" },
  { key: "SPILL", bg: "bg-pyr-spill", label: "Spill" },
  { key: "TURN", bg: "bg-pyr-turn", label: "Turnering" },
];

export function PyramideBar({ fordeling, forventet, visTall = false, className }: Props) {
  const total = SEGMENTER.reduce((s, seg) => s + (fordeling[seg.key] ?? 0), 0);
  if (total === 0) {
    return (
      <div
        className={cn(
          "h-2 w-full rounded-full bg-muted",
          className,
        )}
        role="img"
        aria-label="Ingen treningsdata"
      />
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {SEGMENTER.map((seg) => {
          const verdi = fordeling[seg.key] ?? 0;
          if (verdi === 0) return null;
          const pst = (verdi / total) * 100;
          const forventetPst = forventet?.[seg.key];
          const harAvvik =
            typeof forventetPst === "number" && Math.abs(pst - forventetPst) > 10;
          return (
            <div
              key={seg.key}
              className={cn(seg.bg, "h-full", harAvvik && "animate-pulse")}
              style={{ width: `${pst}%` }}
              title={`${seg.label}: ${pst.toFixed(0)}%`}
              aria-label={`${seg.label} ${pst.toFixed(0)}%`}
            />
          );
        })}
      </div>
      {visTall && (
        <div className="flex w-full justify-between text-[10px] tabular-nums text-muted-foreground">
          {SEGMENTER.map((seg) => {
            const verdi = fordeling[seg.key] ?? 0;
            const pst = total === 0 ? 0 : (verdi / total) * 100;
            return (
              <span key={seg.key}>
                {seg.key}: {pst.toFixed(0)}%
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
