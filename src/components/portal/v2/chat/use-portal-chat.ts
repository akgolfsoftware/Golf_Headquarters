"use client";

/**
 * usePortalChat — wrapper rundt `useChat` fra `@ai-sdk/react`, samme mønster
 * som src/components/admin/caddie/use-caddie-chat.ts, forenklet: portal-chat
 * har ingen godkjenningsflyt (alle verktøy i src/lib/portal-chat/tools.ts er
 * lese-only og auto-approved), så vi trenger ikke approvals-state eller
 * approve-endepunktet Caddie har.
 */

import { useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import type { PortalChatMessage, PortalToolCall } from "./types";

function toPortalMessage(m: UIMessage): PortalChatMessage {
  return {
    id: m.id,
    role: m.role as PortalChatMessage["role"],
    parts: m.parts.map((p) => {
      if (p.type === "text") {
        return { type: "text", text: p.text };
      }
      type AiSdkToolPart = {
        type?: string;
        toolCallId?: string;
        toolName?: string;
        input?: Record<string, unknown>;
        output?: PortalToolCall["output"];
        state?: string;
      };
      const part = p as unknown as AiSdkToolPart;
      if (part.type?.startsWith("tool-") || part.type === "dynamic-tool") {
        // AI SDK v6: statiske verktøy har navnet i type-en ("tool-<navn>"),
        // dynamic-tool har toolName-feltet direkte (jf. gotchas.md).
        const toolName =
          part.type === "dynamic-tool" ? (part.toolName ?? "ukjent") : part.type!.slice("tool-".length);
        const state: PortalToolCall["state"] =
          part.state === "output-available" ? "result" : part.state === "output-error" ? "error" : "calling";
        const tc: PortalToolCall = {
          id: part.toolCallId ?? `tc_${m.id}_${toolName}`,
          toolName,
          input: part.input ?? {},
          output: part.output,
          state,
        };
        return { type: "tool-call", toolCall: tc };
      }
      return { type: "text", text: "" };
    }),
  };
}

export function usePortalChat() {
  const { messages, status, sendMessage, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/portal/chat" }),
    onError: (err) => {
      console.error("Portal-chat-feil:", err);
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

  return {
    messages: messages.map(toPortalMessage),
    status: status as "ready" | "streaming" | "submitted" | "error",
    error,
    sendMessage: send,
    stop,
  };
}
