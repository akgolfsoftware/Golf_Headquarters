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
    base: "left-0 top-0 h-full w-80 max-w-[85vw]",
    transition: "data-[state=open]:animate-in data-[state=open]:slide-in-from-left",
  },
  right: {
    base: "right-0 top-0 h-full w-[480px] max-w-[90vw]",
    transition: "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
  },
  bottom: {
    base: "bottom-0 left-0 w-full max-h-[90vh] rounded-t-2xl",
    transition: "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
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
          side === "left" ? "border-r" : side === "right" ? "border-l" : "border-t",
          sideConfig.transition,
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
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
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} aria-hidden />
            </button>
          </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="border-t border-border px-5 py-4 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
