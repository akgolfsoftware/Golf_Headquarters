"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useCaddieChat } from "./use-caddie-chat";
import { CaddieMessage } from "./caddie-message";
import { CaddieApprovalModal } from "./caddie-approval-modal";
import type { CaddieToolCall } from "./types";

type Props = {
  conversationId: string;
  /** Når satt, sender Caddie umiddelbart en melding med denne teksten. */
  initialSeed?: string;
};

export function CaddieChat({ conversationId, initialSeed }: Props) {
  const { messages, status, sendMessage, updateToolApproval } = useCaddieChat({
    conversationId,
  });
  const [input, setInput] = useState("");
  const lastSeedRef = useRef<string>("");
  const [dismissedApprovalIds, setDismissedApprovalIds] = useState<Set<string>>(
    () => new Set()
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll til bunnen ved nye meldinger.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Oppdag tool-calls som krever godkjenning (filtrert mot avviste).
  const approvalToolCall = useMemo<CaddieToolCall | null>(() => {
    for (const m of messages) {
      for (const p of m.parts) {
        if (
          p.type === "tool-call" &&
          p.toolCall.needsApproval &&
          !dismissedApprovalIds.has(p.toolCall.id)
        ) {
          return p.toolCall;
        }
      }
    }
    return null;
  }, [messages, dismissedApprovalIds]);

  const dismissApproval = (id: string) => {
    setDismissedApprovalIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Plukk opp seed-spørsmål fra foreslåtte spørsmål-knappene.
  useEffect(() => {
    if (initialSeed && initialSeed !== lastSeedRef.current) {
      lastSeedRef.current = initialSeed;
      void sendMessage(initialSeed);
    }
  }, [initialSeed, sendMessage]);

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return;
    void sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section
      aria-label="Chat med Caddie"
      className="flex h-full min-h-[600px] flex-col rounded-lg border border-border bg-card"
    >
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Direkte med <em className="font-normal text-primary md:italic">Caddie</em>
        </h2>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <span
            className={`h-2 w-2 rounded-full ${
              isStreaming ? "animate-pulse bg-primary" : "bg-primary/60"
            }`}
            aria-hidden="true"
          />
          {isStreaming ? "Caddie skriver" : "Klar"}
        </span>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-4"
      >
        {messages.map((m, i) => (
          <CaddieMessage
            key={m.id}
            message={m}
            streaming={
              isStreaming && i === messages.length - 1 && m.role === "assistant"
            }
          />
        ))}
      </div>

      <div className="border-t border-border bg-card px-6 py-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Skriv direkte til Caddie… (cmd+enter for å sende)"
            className="min-h-[64px] w-full resize-none rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Skriv melding til Caddie"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            aria-label="Send melding"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Cmd/Ctrl + Enter for å sende
        </div>
      </div>

      <CaddieApprovalModal
        toolCall={approvalToolCall}
        onApprove={(id) => {
          updateToolApproval(id, true);
          dismissApproval(id);
        }}
        onReject={(id) => {
          updateToolApproval(id, false);
          dismissApproval(id);
        }}
        onClose={() => approvalToolCall && dismissApproval(approvalToolCall.id)}
      />
    </section>
  );
}
