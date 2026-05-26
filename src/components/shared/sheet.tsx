"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right" | "bottom";
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const sideClasses = {
  left: {
    // Mobile: fra venstre, bredere; Desktop: fast bredde
    base: "left-0 top-0 h-full w-[85vw] max-w-sm sm:w-80",
    transition: "animate-in slide-in-from-left",
  },
  right: {
    // Mobile (<sm): bottom-sheet 85vh; Desktop: right-panel 480px
    base: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto sm:h-full sm:max-h-none sm:w-[480px] sm:max-w-[90vw] sm:rounded-none",
    transition: "animate-in slide-in-from-bottom sm:slide-in-from-right",
  },
  bottom: {
    base: "bottom-0 left-0 w-full max-h-[90vh] rounded-t-2xl",
    transition: "animate-in slide-in-from-bottom",
  },
} as const;

/**
 * Slide-in panel for sidemeny mobile + detalj-paneler (Drill Library slide-in).
 *
 * Bruk:
 * <Sheet open={open} onClose={close} side="right" title="Gate-drill 50cm">
 *   <DrillDetailContent />
 * </Sheet>
 */
export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  className,
}: SheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideConfig = sideClasses[side];

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "sheet-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "absolute flex flex-col bg-card border-border shadow-xl",
          "duration-200",
          sideConfig.base,
          side === "left" ? "border-r" : side === "right" ? "border-l sm:border-l" : "border-t",
          sideConfig.transition,
          className,
        )}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4 shrink-0">
            <div className="space-y-1 min-w-0">
              {title && (
                <h2
                  id="sheet-title"
                  className="font-display text-lg font-bold leading-tight truncate"
                >
                  {title}
                </h2>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
              aria-label="Lukk"
            >
              <X size={20} aria-hidden />
            </button>
          </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <footer className="sticky bottom-0 border-t border-border bg-card px-6 py-4 pb-safe shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
