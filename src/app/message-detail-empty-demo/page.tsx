/**
 * DEMO — Message detail (tom samtale)
 * Bygd fra wireframe live-states/e4-message-detail-empty.html
 * URL: /message-detail-empty-demo
 */

import { ChevronRight, MessageSquare, Paperclip, Send, Smile, X } from "lucide-react";

type Starter = { text: string };

const STARTERS: Starter[] = [
  { text: "Hei Anders — gleder meg til økta i morgen." },
  { text: "Har du tid til en kort prat før helga?" },
  { text: "Spørsmål om planen min for uke 19." },
];

export default function MessageDetailEmptyDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-[640px] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            AK
          </span>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold">Anders Kristiansen</div>
            <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Hovedcoach · Koblet 5. mai
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Empty pane */}
        <div className="flex h-[560px] flex-col items-center justify-center bg-secondary/30 px-8 py-12 text-center">
          <div className="mb-6 grid h-[120px] w-[120px] place-items-center rounded-[32px] bg-gradient-to-br from-accent/40 to-card text-primary shadow-inner ring-1 ring-primary/10">
            <MessageSquare size={48} strokeWidth={1.5} />
          </div>
          <div className="font-display text-2xl italic leading-tight text-foreground">
            Ingen meldinger ennå.
          </div>
          <p className="mt-2 max-w-[340px] text-sm leading-relaxed text-muted-foreground">
            Anders ser hva du skriver og kan svare via app eller e-post. Pleier å svare innen samme
            dag.
          </p>

          <div className="mt-6 flex w-full max-w-[380px] flex-col gap-2">
            <div className="text-left font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Første meldinger andre spillere har sendt
            </div>
            {STARTERS.map((s) => (
              <button
                key={s.text}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-left text-[13px] text-foreground transition-colors hover:border-primary"
              >
                <span className="flex-1">{s.text}</span>
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="flex items-end gap-2 border-t border-border bg-card px-4 py-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Vedlegg"
          >
            <Paperclip size={18} strokeWidth={1.5} />
          </button>
          <div className="flex flex-1 items-center gap-1 rounded-2xl border border-input bg-secondary/40 px-3 py-2">
            <textarea
              rows={1}
              placeholder="Skriv din første melding til Anders..."
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              aria-label="Emoji"
            >
              <Smile size={16} strokeWidth={1.5} />
            </button>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-md bg-muted text-muted-foreground"
            aria-label="Send"
            disabled
          >
            <Send size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
