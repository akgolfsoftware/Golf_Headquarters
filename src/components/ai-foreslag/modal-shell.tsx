"use client";

/**
 * AIForeslagModalShell — felles modal-skall for AI-foreslag-modaler
 * (drill, turnering, mål-bygger).
 *
 * Variant A fra Claude Design-bundle Sg2FEKvykU45c4naIgQx6w.
 * 600px desktop, fullscreen mobile, mørk overlay med subtle blur.
 */

import { useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";

export function AIForeslagModalShell({
  open,
  onClose,
  eyebrow,
  titleLead,
  titleItalic,
  footerLeft,
  footerRight,
  width = 600,
  children,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  titleLead: string;
  titleItalic: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="relative flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl bg-card shadow-[0_24px_60px_rgba(10,31,23,0.30)] max-sm:max-h-[100vh] max-sm:rounded-none"
        style={{ maxWidth: width }}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              {eyebrow ?? "AI · Claude"}
            </span>
            <h2
              id="ai-modal-title"
              className="font-display mt-2.5 text-2xl font-semibold tracking-tight"
            >
              {titleLead}{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  color: "#005840",
                }}
              >
                {titleItalic}
              </em>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {(footerLeft || footerRight) && (
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-3.5">
            <div className="font-mono text-[10.5px] tracking-[0.04em] text-muted-foreground">
              {footerLeft}
            </div>
            <div className="flex items-center gap-2">{footerRight}</div>
          </footer>
        )}
      </div>
    </div>
  );
}
