"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export type StubModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function StubModal({
  open,
  onClose,
  title,
  description,
  children,
}: StubModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(10,31,23,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        aria-labelledby="stub-modal-title"
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] mx-4 flex flex-col gap-4 rounded-[20px] p-6 border border-border"
        style={{ background: "var(--card)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="stub-modal-title"
              className="m-0 font-display font-bold tracking-[-0.02em]"
              style={{ fontSize: 22 }}
            >
              {title}
            </h2>
            {description && (
              <p className="m-0 mt-2 text-[14px] text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 grid place-items-center rounded-full border border-border text-muted-foreground"
            style={{ background: "var(--card)" }}
            aria-label="Lukk"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {children && <div>{children}</div>}
      </div>
    </>
  );
}
