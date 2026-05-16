// TurneringMarker — diamant-ikon med turneringsnavn.
// Plasseres i kalender-vyer på datoene en turnering ligger på.

import { Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  navn: string;
  prioritet?: "MAJOR" | "NORMAL" | "LOCAL";
  className?: string;
  /** Vis kort form (kun ikon) — bruk i tette layout. */
  kort?: boolean;
};

const PRIORITET_FARGE: Record<NonNullable<Props["prioritet"]>, string> = {
  MAJOR: "text-primary",
  NORMAL: "text-accent",
  LOCAL: "text-muted-foreground",
};

export function TurneringMarker({ navn, prioritet = "NORMAL", className, kort }: Props) {
  const farge = PRIORITET_FARGE[prioritet];
  if (kort) {
    return (
      <span
        className={cn("inline-flex items-center", className)}
        title={navn}
        aria-label={`Turnering: ${navn}`}
      >
        <Diamond size={14} className={cn(farge, "fill-current")} strokeWidth={1.5} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-xs",
        className,
      )}
      title={navn}
    >
      <Diamond size={12} className={cn(farge, "fill-current")} strokeWidth={1.5} />
      <span className="truncate font-medium text-foreground">{navn}</span>
    </span>
  );
}
