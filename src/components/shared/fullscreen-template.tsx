import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type FullScreenTemplateProps = {
  title?: React.ReactNode;
  onClose: () => void;
  closeLabel?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Full-screen layout uten sidemeny eller topbar.
 *
 * Brukes for live-økt-modus, test-execution, eller andre fokus-flyter
 * der distraksjoner skal minimeres.
 *
 * Bruk:
 * <FullScreenTemplate title="Live-økt · 14:00" onClose={() => router.back()}>
 *   <LiveSessionContent />
 * </FullScreenTemplate>
 */
export function FullScreenTemplate({
  title,
  onClose,
  closeLabel = "Avslutt",
  children,
  className,
}: FullScreenTemplateProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex flex-col bg-background",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-3 shrink-0">
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="font-display text-base font-bold leading-tight truncate">
              {title}
            </h1>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X size={16} aria-hidden />
          {closeLabel}
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
