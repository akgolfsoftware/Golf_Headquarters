"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

/**
 * Standard modal med backdrop + fade + scale-in.
 *
 * Bruk:
 * <Modal open={open} onClose={close} title="Ny plan" size="md">
 *   <FormContent />
 *   <ModalFooter>
 *     <Button variant="ghost-light" onClick={close}>Avbryt</Button>
 *     <Button>Opprett</Button>
 *   </ModalFooter>
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  className,
}: ModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative flex w-full max-h-[95vh] flex-col bg-card shadow-xl",
          // Mobile: full-bredde, sheet-stil med kun toppen rundet, slide-up
          "rounded-t-2xl animate-in slide-in-from-bottom duration-200",
          // Desktop: sentrert modal med full radius og scale-in
          "sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-border sm:animate-in sm:fade-in sm:zoom-in-95",
          sizeClasses[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 sm:px-6 shrink-0">
            <div className="space-y-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="font-display text-lg font-bold leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
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

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-6">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border px-6 py-4 pb-safe sm:px-6 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
