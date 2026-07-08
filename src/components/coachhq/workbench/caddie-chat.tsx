"use client";

// Coach Workbench Caddie-chat-komponent.
//
// Klient-side chat med Caddie-AI der valgt spiller er bundet inn som kontekst.
// Caddie vet hvilken spiller coachen jobber med — coach kan stille spørsmål
// uten å nevne navn ("Hvilke drills bør jobbes med?" → Caddie henter SG-data
// og foreslår basert på spillerens svakheter).
//
// State er lokalt for nå. Persistens til DB kommer i senere sprint.

import { Button } from "@/components/athletic/golfdata";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sendCaddieMelding } from "./actions";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoachCaddieChatProps = {
  spillerId: string;
  spillerName: string;
  initialMessages?: ChatMessage[];
  className?: string;
};

const FORSLAG_PILLS = [
  "Foreslå drills",
  "Lag plan",
  "Sjekk fremgang",
  "Hvor taper han slag?",
] as const;

export function CoachCaddieChat({
  spillerId,
  spillerName,
  initialMessages,
  className,
}: CoachCaddieChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll til bunn ved ny melding.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const nyMeldinger = [...messages, userMsg];
      setMessages(nyMeldinger);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const result = await sendCaddieMelding({
          spillerId,
          messages: nyMeldinger,
        });

        if (result.ok) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: result.assistantText },
          ]);
        } else {
          // Vis demo-svar inline hvis tilgjengelig, ellers feil.
          if (result.demoAnswer) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: result.demoAnswer ?? "" },
            ]);
          }
          setError(result.error);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Caddie er midlertidig utilgjengelig: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, spillerId],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  const handlePill = useCallback(
    (pill: string) => {
      sendMessage(pill);
    },
    [sendMessage],
  );

  const handleReload = useCallback(() => {
    setError(null);
    // Resend siste user-melding hvis vi har en feil.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Fjern eventuell siste assistant-melding (som er error-fallback).
      const utenSisteAssistant =
        messages[messages.length - 1]?.role === "assistant"
          ? messages.slice(0, -1)
          : messages;
      setMessages(utenSisteAssistant.slice(0, -1));
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  return (
    <div
      className={cn(
        "bg-card border-border flex flex-col rounded-2xl border shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-full">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-display text-foreground text-sm font-bold tracking-tight">
              CADDIE
            </h2>
            <p className="text-muted-foreground text-xs">
              Spør om {spillerName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
          aria-label={collapsed ? "Vis chat" : "Skjul chat"}
        >
          {collapsed ? (
            <>
              <span>Vis</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <span>Skjul</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </header>

      {!collapsed && (
        <>
          {/* Meldingsliste */}
          <div
            ref={scrollRef}
            className="flex max-h-[480px] min-h-[280px] flex-col gap-4 overflow-y-auto px-6 py-6"
          >
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
                  <Bot className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="text-muted-foreground text-sm">
                  Spør Caddie om {spillerName}. Velg et forslag eller skriv
                  selv.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {FORSLAG_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => handlePill(pill)}
                      disabled={loading}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-4 py-2 text-xs font-medium transition disabled:opacity-50"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 self-start">
                <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Bot className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Caddie tenker...</span>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="border-destructive/40 bg-destructive/10 text-destructive flex flex-col gap-2 self-stretch rounded-md border px-4 py-2 text-xs">
                <p className="font-medium">{error}</p>
                {messages.some((m) => m.role === "user") && (
                  <button
                    type="button"
                    onClick={handleReload}
                    className="inline-flex w-fit items-center gap-1 underline underline-offset-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Prøv igjen
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-border flex items-end gap-2 border-t px-6 py-4"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Spør om ${spillerName}... (Cmd+Enter for å sende)`}
              rows={2}
              disabled={loading}
              className="flex-1 resize-none text-sm"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
              <span>Send</span>
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-2",
        isUser ? "flex-row-reverse self-end" : "self-start",
      )}
    >
      {!isUser && (
        <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <Bot className="h-4 w-4" strokeWidth={1.75} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
