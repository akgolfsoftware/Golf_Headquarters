"use client";

import { useEffect, useRef } from "react";
import { Check, Mail, X } from "lucide-react";
import type { CaddieToolCall } from "./types";

type Props = {
  toolCall: CaddieToolCall | null;
  onApprove: (toolCallId: string) => void;
  onReject: (toolCallId: string) => void;
  onClose: () => void;
};

export function CaddieApprovalModal({ toolCall, onApprove, onReject, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toolCall) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [toolCall, onClose]);

  if (!toolCall || !toolCall.approvalPreview) return null;

  const { title, body, recipient } = toolCall.approvalPreview;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caddie-approval-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg outline-none"
      >
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2
            id="caddie-approval-title"
            className="font-display text-base font-semibold tracking-tight"
          >
            Caddie vil sende e-post
          </h2>
        </div>
        <div className="space-y-4 px-6 py-4">
          {recipient && (
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Til: <span className="text-foreground">{recipient}</span>
            </div>
          )}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Emne
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">{title}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Forhåndsvisning
            </div>
            <pre className="mt-1 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground">
              {body}
            </pre>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onReject(toolCall.id);
              onClose();
            }}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Avvis
          </button>
          <button
            type="button"
            onClick={() => {
              onApprove(toolCall.id);
              onClose();
            }}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Godkjenn og send
          </button>
        </div>
      </div>
    </div>
  );
}
