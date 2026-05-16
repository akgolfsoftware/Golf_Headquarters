"use client";

/**
 * @deprecated Bruker nå `CaddieChat` fra `@/components/admin/caddie/caddie-chat`.
 * Filen er beholdt midlertidig som referanse til den gamle V1-stub-en og slettes
 * når M19 (AI SDK-integrasjon) er ferdig. Ikke importer denne i nye komponenter.
 */

import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

type Msg = { who: "you" | "caddie"; text: string; src?: string };

const INTRO: Msg[] = [
  {
    who: "caddie",
    src: "Caddie",
    text: "Hei Anders. Jeg er klar når du er. Spør om kalender, fakturaer, spillerlogger eller utkast — jeg svarer kort og foreslår handlinger du kan godkjenne.",
  },
];

export function CaddieChatStub({ foreslatteSporsmal }: { foreslatteSporsmal: string[] }) {
  const [history, setHistory] = useState<Msg[]>(INTRO);
  const [text, setText] = useState("");

  const send = (t: string) => {
    const tt = t.trim();
    if (!tt) return;
    setHistory((h) => [
      ...h,
      { who: "you", text: tt },
      {
        who: "caddie",
        src: "Caddie · stub",
        text: "Forstått — jeg vil håndtere det automatisk når MCP-tilkoblingen er på plass (M19). Foreløpig logger jeg forespørselen.",
      },
    ]);
    setText("");
  };

  return (
    <div className="flex h-[500px] flex-col">
      {/* Historikk */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {history.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              m.who === "you"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-secondary text-foreground"
            }`}
          >
            {m.src && (
              <div
                className={`mb-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
                  m.who === "you" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                via {m.src}
              </div>
            )}
            {m.text}
          </div>
        ))}
      </div>

      {/* Foreslåtte spørsmål */}
      <div className="border-t border-border px-6 py-4">
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Caddie foreslår
        </div>
        <div className="flex flex-wrap gap-2">
          {foreslatteSporsmal.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => send(p)}
              className="rounded-full border border-border bg-background px-4 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
          C
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(text)}
          placeholder="Skriv direkte til Caddie…"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => send(text)}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
