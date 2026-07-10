"use client";

/**
 * Caddie · Samtale (v2). Rekomponert fra
 * src/components/admin/caddie/caddie-chat.tsx med v2-biblioteket. Samme
 * hook (useCaddieChat), samme godkjenningsflyt og samme seed-oppførsel —
 * kun restylet.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { T, Icon, Kort } from "@/components/v2";
import { useCaddieChat } from "@/components/admin/caddie/use-caddie-chat";
import type { CaddieToolCall } from "@/components/admin/caddie/types";
import { CaddieMessageV2 } from "./caddie-message-v2";
import { CaddieApprovalModalV2 } from "./caddie-approval-modal-v2";

export function CaddieChatV2({ conversationId, initialSeed }: { conversationId: string; initialSeed?: string }) {
  const { messages, status, sendMessage, updateToolApproval } = useCaddieChat({ conversationId });
  const [input, setInput] = useState("");
  const lastSeedRef = useRef<string>("");
  const [dismissedApprovalIds, setDismissedApprovalIds] = useState<Set<string>>(() => new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const approvalToolCall = useMemo<CaddieToolCall | null>(() => {
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "tool-call" && p.toolCall.needsApproval && !dismissedApprovalIds.has(p.toolCall.id)) {
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
    <Kort pad="0" style={{ display: "flex", flexDirection: "column", minHeight: 600, height: "100%" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, padding: "16px 20px" }}>
        <h2 style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg, margin: 0 }}>
          Direkte med <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>Caddie</em>
        </h2>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
          <span
            aria-hidden
            className={isStreaming ? "animate-pulse" : undefined}
            style={{ width: 7, height: 7, borderRadius: 9999, background: isStreaming ? T.lime : `color-mix(in srgb, ${T.lime} 55%, transparent)` }}
          />
          {isStreaming ? "Caddie skriver" : "Klar"}
        </span>
      </header>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, padding: "16px 20px" }}>
        {messages.map((m, i) => (
          <CaddieMessageV2 key={m.id} message={m} streaming={isStreaming && i === messages.length - 1 && m.role === "assistant"} />
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Skriv direkte til Caddie… (cmd+enter for å sende)"
            aria-label="Skriv melding til Caddie"
            style={{
              minHeight: 64, width: "100%", resize: "none", borderRadius: 12, border: `1px solid ${T.borderS}`, background: T.panel2,
              padding: "10px 14px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            aria-label="Send melding"
            className="v2-press v2-focus"
            style={{
              width: 40, height: 40, flex: "none", borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: T.lime, color: T.onLime, border: "none", cursor: !input.trim() || isStreaming ? "default" : "pointer",
              opacity: !input.trim() || isStreaming ? 0.5 : 1,
            }}
          >
            <Icon name={isStreaming ? "loader" : "arrow-up"} size={16} className={isStreaming ? "animate-spin" : undefined} />
          </button>
        </div>
        <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
          Cmd/Ctrl + Enter for å sende
        </div>
      </div>

      <CaddieApprovalModalV2
        toolCall={approvalToolCall}
        onApprove={async (id) => {
          if (!approvalToolCall) return { status: "failed", error: "Mangler tool-call kontekst" };
          const result = await updateToolApproval(id, true, { toolName: approvalToolCall.toolName, toolInput: approvalToolCall.input });
          if (result.status === "done") dismissApproval(id);
          return result;
        }}
        onReject={async (id) => {
          if (!approvalToolCall) return { status: "failed", error: "Mangler tool-call kontekst" };
          const result = await updateToolApproval(id, false, { toolName: approvalToolCall.toolName, toolInput: approvalToolCall.input });
          dismissApproval(id);
          return result;
        }}
        onClose={() => approvalToolCall && dismissApproval(approvalToolCall.id)}
      />
    </Kort>
  );
}
