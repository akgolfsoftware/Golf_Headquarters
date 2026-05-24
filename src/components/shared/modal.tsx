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
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          "relative w-full rounded-2xl border border-border bg-card shadow-xl",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeClasses[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div className="space-y-1">
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
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} aria-hidden />
            </button>
          </header>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
