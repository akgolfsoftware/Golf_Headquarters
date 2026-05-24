import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Standard tom-tilstand med ikon + tittel + beskrivelse + CTA.
 *
 * Bruk:
 * <EmptyState
 *   icon={Calendar}
 *   title="Ingen økter i dag"
 *   description="Sjekk kalenderen for kommende økter."
 *   action={<Button>Åpne kalender</Button>}
 * />
 */
export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/30">
        <IconComponent
          size={20}
          strokeWidth={1.75}
          className="text-accent-foreground"
          aria-hidden
        />
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
