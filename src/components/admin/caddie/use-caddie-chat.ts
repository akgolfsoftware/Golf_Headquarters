"use client";

/**
 * useCaddieChat — wrapper rundt `useChat` fra `@ai-sdk/react`.
 *
 * Streamer fra `/api/caddie/chat` (Sonnet 4.6 via AI Gateway).
 * Persisterer både bruker- og assistant-meldinger via API-routens
 * `onFinish`-hook.
 */

import { useCallback, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import type {
  CaddieChatStatus,
  CaddieMessage,
  CaddieToolCall,
} from "./types";

export type UseCaddieChatOptions = {
  conversationId: string;
  initialMessages?: CaddieMessage[];
};

const INTRO_MESSAGE: CaddieMessage = {
  id: "intro",
  role: "assistant",
  createdAt: new Date(0).toISOString(),
  parts: [
    {
      type: "text",
      text: "Hei Anders. Jeg er klar når du er. Spør om kalender, fakturaer, spillerlogger eller utkast — jeg svarer kort og foreslår handlinger du kan godkjenne.",
    },
  ],
};

function toCaddieMessage(m: UIMessage): CaddieMessage {
  return {
    id: m.id,
    role: m.role as CaddieMessage["role"],
    createdAt: new Date().toISOString(),
    parts: m.parts.map((p) => {
      if (p.type === "text") {
        return { type: "text", text: p.text };
      }
      // Tool-call/result-parter fra AI SDK v6 har varierende form;
      // mapper minimalt så UI-en kan vise dem som tool-call.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const part = p as any;
      if (part.type?.startsWith("tool-")) {
        const tc: CaddieToolCall = {
          id: part.toolCallId ?? `tc_${Date.now()}`,
          toolName: part.toolName ?? "ukjent",
          input: part.input ?? {},
          output: part.output,
          state: part.state === "result" ? "result" : part.state === "error" ? "error" : "calling",
          needsApproval: part.output?.needsApproval === true,
          approvalPreview: part.output?.needsApproval ? part.output : undefined,
        };
        return { type: "tool-call", toolCall: tc };
      }
      return { type: "text", text: "" };
    }),
  };
}

export function useCaddieChat({ conversationId, initialMessages }: UseCaddieChatOptions) {
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});

  const { messages, status, sendMessage, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/caddie/chat",
      body: { conversationId },
    }),
    onError: (err) => {
      console.error("Caddie chat-feil:", err);
    },
  });

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await sendMessage({ text: trimmed });
    },
    [sendMessage],
  );

  const updateToolApproval = useCallback((toolCallId: string, approved: boolean) => {
    setApprovals((prev) => ({ ...prev, [toolCallId]: approved }));
    // TODO: send tool-result-melding tilbake til API for å fortsette samtalen
    // når approval-flyten er fullt implementert.
  }, []);

  const caddieMessages: CaddieMessage[] =
    messages.length === 0
      ? initialMessages ?? [INTRO_MESSAGE]
      : messages.map(toCaddieMessage);

  const caddieStatus: CaddieChatStatus =
    status === "streaming" || status === "submitted"
      ? status
      : status === "error"
      ? "error"
      : "ready";

  return {
    conversationId,
    messages: caddieMessages,
    status: caddieStatus,
    sendMessage: send,
    stop,
    updateToolApproval,
    approvals,
  };
}
