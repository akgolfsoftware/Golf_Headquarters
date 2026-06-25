"use client";

// Agenter-modul: chat mot valgt modell (Claude/Gemini/Grok/Ollama).
// Speiler caddie-mønsteret (useChat + DefaultChatTransport). Modell + samtale-id
// sendes per melding via body-opsjonen så modellbyttet treffer rett provider.

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { KOMMANDO_MODELS, DEFAULT_MODEL, type KommandoModelId } from "@/lib/kommando/models";

type TextPart = { type: "text"; text: string };

function messageText(parts: ReadonlyArray<{ type: string }>): string {
  return parts
    .filter((p): p is TextPart => p.type === "text" && typeof (p as TextPart).text === "string")
    .map((p) => p.text)
    .join("");
}

export function AgentChat({ conversationId }: { conversationId: string }) {
  const [model, setModel] = useState<KommandoModelId>(DEFAULT_MODEL);
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/kommando/chat" }),
    onError: (e) => console.error("Kommando chat-feil:", e),
  });

  const busy = status === "streaming" || status === "submitted";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text }, { body: { conversationId, model } });
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {KOMMANDO_MODELS.map((m) => {
          const active = m.id === model;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-card/40 p-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Velg en modell og still et spørsmål.
          </p>
        ) : (
          messages.map((m) => {
            const text = messageText(m.parts);
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "bg-accent text-accent-foreground"
                      : "border border-border bg-card text-foreground",
                  )}
                >
                  {text || (busy ? "…" : "")}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv en melding…"
          className="h-11 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          aria-label="Send"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
        >
          <Send className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </form>
    </div>
  );
}
