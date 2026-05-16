// MyelinTracker — viser treningshelse de siste N dagene.
//
// Hver dag = en sirkel langs en horisontal strip. Fargen følger volum:
//   0 min        → grå (hvil/glipp)
//   < 30 min     → svak farge
//   30-90 min    → middels farge
//   > 90 min     → full farge
// Hvis dagen er en hviledag (planlagt 0), vises sirkelen som outlined-only.

import { cn } from "@/lib/utils";

type Dagsdata = {
  dato: Date;
  minutter: number;
  /** Hvis true: dette var en planlagt hviledag (ikke et glipp). */
  hviledag?: boolean;
};

type Props = {
  dager: Dagsdata[];
  className?: string;
};

function fargeKlasse(min: number, hviledag: boolean | undefined): string {
  if (hviledag) return "border border-muted-foreground/40 bg-transparent";
  if (min === 0) return "bg-muted";
  if (min < 30) return "bg-pyr-fys/30";
  if (min < 90) return "bg-pyr-fys/60";
  return "bg-pyr-fys";
}

export function MyelinTracker({ dager, className }: Props) {
  return (
    <div className={cn("flex items-end gap-1", className)}>
      {dager.map((d, i) => {
        const dag = d.dato.toLocaleDateString("no-NO", { day: "2-digit" });
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span
              className={cn(
                "h-3 w-3 rounded-full",
                fargeKlasse(d.minutter, d.hviledag),
              )}
              title={`${d.dato.toLocaleDateString("no-NO")}: ${d.minutter} min${d.hviledag ? " (hvil)" : ""}`}
              aria-label={`${d.dato.toLocaleDateString("no-NO")}: ${d.minutter} min`}
            />
            {dager.length <= 14 && (
              <span className="text-[9px] tabular-nums text-muted-foreground">{dag}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
