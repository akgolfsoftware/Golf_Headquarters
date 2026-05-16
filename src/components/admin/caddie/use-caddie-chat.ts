"use client";

/**
 * useCaddieChat — wrapper rundt `useChat` fra `@ai-sdk/react`.
 *
 * Streamer fra `/api/caddie/chat` (Sonnet 4.6 via AI Gateway).
 * Persisterer både bruker- og assistant-meldinger via API-routens
 * `onFinish`-hook.
 *
 * Approval-flyt: når et write-tool returnerer `needsApproval: true`,
 * viser UI en modal. Brukerens valg sendes til `/api/caddie/approve`
 * som utfører handlingen og logger til CaddieMessage (role="tool").
 * Etter resultat sendes en følge-melding til samtalen så Sonnet kan
 * fortsette.
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

export type ToolApprovalState = {
  status: "pending" | "executing" | "done" | "failed" | "rejected";
  summary?: string;
  error?: string;
};

type ApprovalResponse = {
  ok: boolean;
  status?: string;
  summary?: string;
  error?: string;
  details?: unknown;
};

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
        const out = part.output ?? {};
        const needsApproval = out?.needsApproval === true;
        const approvalPreview = needsApproval
          ? {
              title:
                typeof out.subject === "string"
                  ? out.subject
                  : typeof out.previewText === "string"
                  ? out.previewText
                  : "Forslag fra Caddie",
              body:
                typeof out.body === "string"
                  ? out.body
                  : typeof out.note === "string"
                  ? out.note
                  : typeof out.change === "string"
                  ? out.change
                  : typeof out.previewText === "string"
                  ? out.previewText
                  : JSON.stringify(out, null, 2),
              recipient:
                typeof out.recipient === "string" ? out.recipient : undefined,
            }
          : undefined;
        const tc: CaddieToolCall = {
          id: part.toolCallId ?? `tc_${Date.now()}`,
          toolName: part.toolName ?? "ukjent",
          input: part.input ?? {},
          output: part.output,
          state: (part.state === "result" ? "result" : part.state === "error" ? "error" : "calling") as CaddieToolCall["state"],
          needsApproval,
          approvalPreview,
        };
        return { type: "tool-call", toolCall: tc };
      }
      return { type: "text", text: "" };
    }),
  };
}

export function useCaddieChat({ conversationId, initialMessages }: UseCaddieChatOptions) {
  const [approvals, setApprovals] = useState<Record<string, ToolApprovalState>>({});

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

  const updateToolApproval = useCallback(
    async (
      toolCallId: string,
      approved: boolean,
      ctx: { toolName: string; toolInput: Record<string, unknown> },
    ): Promise<ToolApprovalState> => {
      setApprovals((prev) => ({
        ...prev,
        [toolCallId]: { status: approved ? "executing" : "rejected" },
      }));

      try {
        const res = await fetch("/api/caddie/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            toolCallId,
            toolName: ctx.toolName,
            approved,
            toolInput: ctx.toolInput,
          }),
        });
        const data = (await res.json()) as ApprovalResponse;

        if (!res.ok || !data.ok) {
          const failed: ToolApprovalState = {
            status: "failed",
            error: data.error ?? `HTTP ${res.status}`,
          };
          setApprovals((prev) => ({ ...prev, [toolCallId]: failed }));
          return failed;
        }

        const final: ToolApprovalState = approved
          ? { status: "done", summary: data.summary }
          : { status: "rejected", summary: data.summary };
        setApprovals((prev) => ({ ...prev, [toolCallId]: final }));

        // Send følge-melding så Sonnet kan fortsette samtalen med kontekst
        // om at handlingen ble utført (eller avvist).
        const followUp = approved
          ? `[System] Handlingen "${ctx.toolName}" ble godkjent og utført. Resultat: ${data.summary ?? "OK"}. Fortsett der du slapp.`
          : `[System] Handlingen "${ctx.toolName}" ble avvist av Anders. Spør hva han vil endre, eller foreslå alternativ.`;
        void sendMessage({ text: followUp });

        return final;
      } catch (err) {
        const failed: ToolApprovalState = {
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        };
        setApprovals((prev) => ({ ...prev, [toolCallId]: failed }));
        return failed;
      }
    },
    [conversationId, sendMessage],
  );

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
