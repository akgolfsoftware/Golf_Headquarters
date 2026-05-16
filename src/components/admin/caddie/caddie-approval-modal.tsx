"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Mail, X } from "lucide-react";
import type { CaddieToolCall } from "./types";
import type { ToolApprovalState } from "./use-caddie-chat";

type Props = {
  toolCall: CaddieToolCall | null;
  /** Returnerer endelig tilstand etter API-kall. */
  onApprove: (toolCallId: string) => Promise<ToolApprovalState>;
  onReject: (toolCallId: string) => Promise<ToolApprovalState>;
  onClose: () => void;
};

export function CaddieApprovalModal({ toolCall, onApprove, onReject, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<
    "idle" | "executing" | "done" | "rejected" | "failed"
  >("idle");
  const [resultText, setResultText] = useState<string | null>(null);

  // Reset phase når modal åpnes med ny toolCall.
  useEffect(() => {
    if (toolCall) {
      setPhase("idle");
      setResultText(null);
    }
  }, [toolCall?.id]);

  useEffect(() => {
    if (!toolCall) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "executing") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [toolCall, onClose, phase]);

  if (!toolCall || !toolCall.approvalPreview) return null;

  const { title, body, recipient } = toolCall.approvalPreview;

  const handleApprove = async () => {
    setPhase("executing");
    const result = await onApprove(toolCall.id);
    setResultText(result.summary ?? result.error ?? null);
    if (result.status === "done") {
      setPhase("done");
      // Lukk modal automatisk så Anders rekker å se bekreftelsen.
      setTimeout(() => onClose(), 1500);
    } else if (result.status === "failed") {
      setPhase("failed");
    } else {
      setPhase("idle");
    }
  };

  const handleReject = async () => {
    setPhase("executing");
    const result = await onReject(toolCall.id);
    setResultText(result.summary ?? null);
    setPhase("rejected");
    setTimeout(() => onClose(), 800);
  };

  const isBusy = phase === "executing";
  const isFinished = phase === "done" || phase === "rejected";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caddie-approval-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      onClick={() => {
        if (!isBusy) onClose();
      }}
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
          {resultText && (
            <div
              role="status"
              className={`rounded-md border px-4 py-2 text-sm ${
                phase === "failed"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-primary/30 bg-primary/5 text-foreground"
              }`}
            >
              {resultText}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={handleReject}
            disabled={isBusy || isFinished}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Avvis
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isBusy || isFinished}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Utfører…
              </>
            ) : phase === "done" ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" /> Utført
              </>
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" /> Godkjenn og send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
