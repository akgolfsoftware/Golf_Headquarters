import { cn } from "@/lib/utils";

export type PresenceState = "online" | "away" | "busy" | "offline";

type PresenceDotProps = {
  state?: PresenceState;
  /**
   * Når true posisjoneres dotten absolutt nederst-høyre — ment å legges inni en
   * `relative` avatar-container med en ramme mot bakgrunnen.
   */
  overlay?: boolean;
  /** Tailwind-klasse for ramme-fargen (matcher flaten dotten ligger på). */
  ringClassName?: string;
  className?: string;
};

const stateClasses: Record<PresenceState, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-muted-foreground",
};

/**
 * Presence-indikator (online/borte/opptatt/offline). Som `overlay` legges den
 * over en avatar; ellers inline.
 */
export function PresenceDot({
  state = "offline",
  overlay = false,
  ringClassName = "ring-card",
  className,
}: PresenceDotProps) {
  return (
    <span
      aria-label={`Status: ${state}`}
      className={cn(
        "h-2 w-2 rounded-full ring-2",
        stateClasses[state],
        ringClassName,
        overlay && "absolute bottom-0.5 right-0.5",
        className,
      )}
    />
  );
}
