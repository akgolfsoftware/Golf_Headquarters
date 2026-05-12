"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { ChatMelding } from "@/lib/anthropic";

const FORSLAG = [
  "Hva bør jeg trene på i dag?",
  "Analyser siste runde",
  "Lag en putt-plan for uken",
];

export function AiChat({
  sessionId,
  initialMessages,
}: {
  sessionId: string | null;
  initialMessages: ChatMelding[];
}) {
  const [meldinger, setMeldinger] = useState<ChatMelding[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [aktivSessionId, setAktivSessionId] = useState<string | null>(sessionId);
  const meldingerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    meldingerRef.current?.scrollTo({
      top: meldingerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [meldinger]);

  async function sendMelding(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sender) return;

    const userMsg: ChatMelding = { role: "user", content: input.trim() };
    const nyHistorikk = [...meldinger, userMsg];
    setMeldinger([...nyHistorikk, { role: "assistant", content: "" }]);
    setInput("");
    setSender(true);
    setFeil(null);

    try {
      const res = await fetch("/api/coach/ai-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: aktivSessionId,
          messages: nyHistorikk,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const nySessionId = res.headers.get("x-session-id");
      if (nySessionId && nySessionId !== aktivSessionId) {
        setAktivSessionId(nySessionId);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Ingen respons-stream");
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setMeldinger((m) => {
          const kopi = [...m];
          kopi[kopi.length - 1] = { role: "assistant", content: acc };
          return kopi;
        });
      }
    } catch (err) {
      setMeldinger((m) => m.slice(0, -1)); // fjern tom assistant
      setFeil(
        err instanceof Error ? err.message : "Kunne ikke sende melding.",
      );
    } finally {
      setSender(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-320px)] min-h-[500px] flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div ref={meldingerRef} className="flex-1 space-y-6 overflow-y-auto p-6">
        {meldinger.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-secondary text-accent-foreground">
              <Sparkles size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-semibold leading-tight">
              <em className="font-normal italic text-primary">Hva vil du</em>{" "}
              jobbe med i dag?
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Spør om treningsforslag, analyse av siste runder, eller hjelp
              til å lage en plan. AI-coach kjenner profilen din.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {FORSLAG.map((forslag) => (
                <button
                  key={forslag}
                  type="button"
                  onClick={() => setInput(forslag)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {forslag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          meldinger.map((m, i) => <Boble key={i} melding={m} />)
        )}
      </div>

      {feil && (
        <div
          role="alert"
          className="mx-6 mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {feil}
        </div>
      )}

      <form
        onSubmit={sendMelding}
        className="border-t border-border bg-card p-4"
      >
        <div className="grid grid-cols-[1fr_44px] items-end gap-2 rounded-md border border-input bg-background p-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMelding(e);
              }
            }}
            placeholder="Spør AI-coach …"
            rows={1}
            disabled={sender}
            className="min-h-[44px] resize-none border-0 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sender || !input.trim()}
            aria-label="Send"
            className="grid h-11 w-11 place-items-center rounded-sm bg-accent text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send size={18} strokeWidth={1.5} />
          </button>
        </div>
        {meldinger.length === 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Forslag
            </span>
            {FORSLAG.map((forslag) => (
              <button
                key={forslag}
                type="button"
                onClick={() => setInput(forslag)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {forslag}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

function Boble({ melding }: { melding: ChatMelding }) {
  const erBruker = melding.role === "user";
  if (erBruker) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-primary/10 bg-primary/[0.06] px-4 py-3 text-sm leading-relaxed text-foreground">
          {melding.content}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[36px_1fr] gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-accent">
        <Sparkles size={16} strokeWidth={1.5} />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
        {melding.content || (
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
