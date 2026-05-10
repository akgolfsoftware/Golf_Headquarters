"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMelding } from "@/lib/anthropic";

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
        err instanceof Error ? err.message : "Kunne ikke sende melding."
      );
    } finally {
      setSender(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] flex-col rounded-lg border border-border bg-card">
      <div
        ref={meldingerRef}
        className="flex-1 space-y-4 overflow-y-auto p-6"
      >
        {meldinger.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h3 className="font-display text-xl font-semibold text-foreground">
              <em className="font-normal text-primary md:italic">Hva vil du</em> jobbe
              med i dag?
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Spør om treningsforslag, analyse av siste runder, eller hjelp til
              å lage en plan. AI-coach kjenner profilen din.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Hva bør jeg trene på i dag?",
                "Analyser siste runde",
                "Lag en putt-plan for uken",
              ].map((forslag) => (
                <button
                  key={forslag}
                  type="button"
                  onClick={() => setInput(forslag)}
                  className="rounded-full border border-input bg-card px-3 py-1.5 text-xs text-foreground hover:border-border"
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
        className="flex items-end gap-2 border-t border-border p-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMelding(e);
            }
          }}
          placeholder="Skriv en melding…"
          rows={1}
          disabled={sender}
          className="min-h-[44px] flex-1 resize-none rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sender || !input.trim()}
          className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {sender ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}

function Boble({ melding }: { melding: ChatMelding }) {
  const erBruker = melding.role === "user";
  return (
    <div className={`flex ${erBruker ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          erBruker
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-muted/40 text-foreground"
        }`}
      >
        {melding.content || (
          <span className="inline-flex gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-current"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-current"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
