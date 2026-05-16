"use client";

/**
 * useCaddieChat — mock-hook som mimer `useChat` fra `@ai-sdk/react`.
 *
 * Streamer assistant-svar token for token via setTimeout slik at vi får
 * den ekte chat-følelsen før vi kobler mot ekte AI SDK i M19. Når vi
 * bytter til `import { useChat } from "@ai-sdk/react"` kan denne fila
 * slettes — komponentene leser samme API (messages, sendMessage, status).
 */

import { useCallback, useRef, useState } from "react";
import type {
  CaddieChatStatus,
  CaddieMessage,
  CaddieToolCall,
} from "./types";

const MOCK_REPLIES: Array<{ text: string; tool?: CaddieToolCall }> = [
  {
    text: "Jeg har sjekket spillerlista. Tre spillere har ikke registrert økt siste 7 dager: Markus, Bjørn og Aksel. Vil du at jeg sender en sjekk-inn-melding?",
    tool: {
      id: "tc_1",
      toolName: "searchPlayers",
      input: { activeWithin: "7d", limit: 50 },
      output: { totalInactive: 3, players: ["Markus", "Bjørn", "Aksel"] },
      state: "result",
    },
  },
  {
    text: "Utestående akkurat nå er **12 450 kr** fordelt på 4 fakturaer. Eldste forfaller om 2 dager. Skal jeg lage purring-utkast?",
    tool: {
      id: "tc_2",
      toolName: "getOutstandingInvoices",
      input: {},
      output: { totalOre: 1245000, count: 4 },
      state: "result",
    },
  },
  {
    text: "Klart. Jeg har laget utkast til vinterpakke-tilbudet. Trenger godkjenning før sending.",
    tool: {
      id: "tc_3",
      toolName: "sendEmail",
      input: { to: "bjorn@example.no", template: "vinterpakke" },
      state: "result",
      needsApproval: true,
      approvalPreview: {
        title: "Vinterpakke 2026 — eksklusivt tilbud",
        recipient: "bjorn@example.no",
        body:
          "Hei Bjørn,\n\nJeg vil tilby deg vinterpakken vår med 10 økter på Mulligan-simulator + " +
          "videoanalyse, til en pris av 9 990 kr (ord. 12 990 kr). Tilbudet gjelder ut november.\n\n" +
          "Vennlig hilsen,\nAnders",
      },
    },
  },
];

export type UseCaddieChatOptions = {
  conversationId: string;
  initialMessages?: CaddieMessage[];
};

export function useCaddieChat({ conversationId, initialMessages }: UseCaddieChatOptions) {
  const [messages, setMessages] = useState<CaddieMessage[]>(
    initialMessages ?? [
      {
        id: "intro",
        role: "assistant",
        createdAt: new Date().toISOString(),
        parts: [
          {
            type: "text",
            text: "Hei Anders. Jeg er klar når du er. Spør om kalender, fakturaer, spillerlogger eller utkast — jeg svarer kort og foreslår handlinger du kan godkjenne.",
          },
        ],
      },
    ]
  );
  const [status, setStatus] = useState<CaddieChatStatus>("ready");
  const replyIndexRef = useRef(0);

  const stop = useCallback(() => {
    setStatus("ready");
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "streaming") return;

      const userMsg: CaddieMessage = {
        id: `u_${Date.now()}`,
        role: "user",
        createdAt: new Date().toISOString(),
        parts: [{ type: "text", text: trimmed }],
      };
      setMessages((m) => [...m, userMsg]);
      setStatus("submitted");

      // Velg neste mock-svar (round-robin).
      const reply = MOCK_REPLIES[replyIndexRef.current % MOCK_REPLIES.length];
      replyIndexRef.current += 1;

      const assistantId = `a_${Date.now()}`;
      setMessages((m) => [
        ...m,
        {
          id: assistantId,
          role: "assistant",
          createdAt: new Date().toISOString(),
          parts: reply.tool
            ? [{ type: "tool-call", toolCall: reply.tool }, { type: "text", text: "" }]
            : [{ type: "text", text: "" }],
        },
      ]);

      setStatus("streaming");
      await streamTokens(reply.text, (partial) => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  parts: msg.parts.map((p) =>
                    p.type === "text" ? { type: "text", text: partial } : p
                  ),
                }
              : msg
          )
        );
      });
      setStatus("ready");
    },
    [status]
  );

  const updateToolApproval = useCallback(
    (toolCallId: string, approved: boolean) => {
      setMessages((m) =>
        m.map((msg) => ({
          ...msg,
          parts: msg.parts.map((p) =>
            p.type === "tool-call" && p.toolCall.id === toolCallId
              ? {
                  type: "tool-call" as const,
                  toolCall: {
                    ...p.toolCall,
                    needsApproval: false,
                    output: { approved, executedAt: new Date().toISOString() },
                  },
                }
              : p
          ),
        }))
      );
    },
    []
  );

  return {
    conversationId,
    messages,
    status,
    sendMessage,
    stop,
    updateToolApproval,
  };
}

function streamTokens(text: string, onChunk: (partial: string) => void): Promise<void> {
  return new Promise((resolve) => {
    const words = text.split(/(\s+)/);
    let i = 0;
    let acc = "";
    const tick = () => {
      if (i >= words.length) return resolve();
      acc += words[i];
      i += 1;
      onChunk(acc);
      setTimeout(tick, 24);
    };
    tick();
  });
}
