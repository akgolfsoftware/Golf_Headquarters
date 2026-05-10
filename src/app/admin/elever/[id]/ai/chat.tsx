"use client";

import { useEffect, useRef, useState } from "react";

type PlayerContext = {
  hcp: number | null;
  ambition: string | null;
  homeClub: string | null;
  tier: string;
  playingYears: number | null;
  sisteRunder: { dato: string; bane: string; score: number; sgTotal: number | null }[];
  aktivPlan: { navn: string; antallSesjoner: number; fullført: number } | null;
  sisteTester: { navn: string; score: number; dato: string }[];
};

type Melding = { role: "user" | "assistant"; content: string };

export function CoachAiChat({
  playerName,
  playerContext,
}: {
  playerName: string;
  playerContext: PlayerContext;
}) {
  const [meldinger, setMeldinger] = useState<Melding[]>([]);
  const [input, setInput] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [meldinger]);

  const forslag = [
    "Foreslå neste økt for spilleren",
    "Analyser siste 5 runder",
    "Hvordan kan jeg hjelpe spilleren mot målet?",
  ];

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sender) return;

    const userMsg: Melding = { role: "user", content: input.trim() };
    const ny = [...meldinger, userMsg];
    setMeldinger([...ny, { role: "assistant", content: "" }]);
    setInput("");
    setSender(true);
    setFeil(null);

    try {
      const res = await fetch("/api/admin/coach-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          playerName,
          playerContext,
          messages: ny,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Ingen stream");
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMeldinger((m) => {
          const kopi = [...m];
          kopi[kopi.length - 1] = { role: "assistant", content: acc };
          return kopi;
        });
      }
    } catch (err) {
      setMeldinger((m) => m.slice(0, -1));
      setFeil(err instanceof Error ? err.message : "Kunne ikke sende.");
    } finally {
      setSender(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] flex-col rounded-lg border border-border bg-card">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {meldinger.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h3 className="font-display text-xl font-semibold text-foreground">
              <em className="font-normal text-primary md:italic">Hva</em> vil du analysere?
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              AI har {playerName} sin profil, plan og runder som kontekst.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {forslag.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setInput(f)}
                  className="rounded-full border border-input bg-card px-3 py-1.5 text-xs hover:border-border"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        ) : (
          meldinger.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted/40 text-foreground"
                }`}
              >
                {m.content || (
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
          ))
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
        onSubmit={send}
        className="flex items-end gap-2 border-t border-border p-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
          placeholder={`Spør AI om ${playerName}…`}
          rows={1}
          disabled={sender}
          className="min-h-[44px] flex-1 resize-none rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          disabled={sender || !input.trim()}
          className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {sender ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
