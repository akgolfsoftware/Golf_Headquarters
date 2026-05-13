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
  userInitials = "DU",
}: {
  sessionId: string | null;
  initialMessages: ChatMelding[];
  userInitials?: string;
}) {
  const [meldinger, setMeldinger] = useState<ChatMelding[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [aktivSessionId, setAktivSessionId] = useState<string | null>(sessionId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
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
      setMeldinger((m) => m.slice(0, -1));
      setFeil(
        err instanceof Error ? err.message : "Kunne ikke sende melding.",
      );
    } finally {
      setSender(false);
    }
  }

  function settForslag(forslag: string) {
    setInput(forslag);
  }

  return (
    <div className="grid grid-rows-[1fr_auto] overflow-hidden">
      <div ref={scrollRef} className="overflow-auto px-8 pt-8 pb-4">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6">
          {meldinger.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-secondary text-accent-foreground">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl font-semibold leading-tight -tracking-[0.01em]">
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
                    onClick={() => settForslag(forslag)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {forslag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            meldinger.map((m, i) => (
              <Boble key={i} melding={m} userInitials={userInitials} />
            ))
          )}
        </div>
      </div>

      {feil && (
        <div className="border-t border-border bg-card px-8 pt-3">
          <div
            role="alert"
            className="mx-auto max-w-[720px] rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {feil}
          </div>
        </div>
      )}

      <footer className="border-t border-border bg-card px-8 pt-3.5 pb-4">
        <form onSubmit={sendMelding} className="mx-auto max-w-[720px]">
          <div className="grid grid-cols-[1fr_44px] items-center gap-2 rounded-md border border-border bg-background p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
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
              className="min-h-[44px] resize-none border-0 bg-transparent px-3.5 py-2.5 text-[15px] leading-[1.4] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
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
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Forslag
            </span>
            {FORSLAG.map((forslag) => (
              <button
                key={forslag}
                type="button"
                onClick={() => settForslag(forslag)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {forslag}
              </button>
            ))}
          </div>
        </form>
      </footer>
    </div>
  );
}

function Boble({
  melding,
  userInitials,
}: {
  melding: ChatMelding;
  userInitials: string;
}) {
  const erBruker = melding.role === "user";
  if (erBruker) {
    return (
      <div className="grid grid-cols-[1fr_36px] justify-items-end gap-3">
        <div>
          <div className="max-w-[92%] rounded-2xl rounded-br-sm border border-primary/10 bg-primary/[0.06] px-4 py-3 text-[15px] leading-[1.55] text-foreground">
            {melding.content}
          </div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-bold text-[12px] text-accent-foreground">
          {userInitials}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[36px_1fr] gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-accent">
        <Sparkles size={16} strokeWidth={1.5} fill="currentColor" />
      </div>
      <div>
        {melding.content ? (
          <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-[15px] leading-[1.55] text-foreground">
            <p className="whitespace-pre-wrap">{melding.content}</p>
          </div>
        ) : (
          <div className="inline-flex gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
