/**
 * DEMO — MessageDetail · Dark (kvelds-modus)
 * Bygd fra wireframe live-states/e4-message-detail-moerkt.html
 * URL: /message-detail-dark-demo
 */

import { CheckCheck, MoreHorizontal, Paperclip, Send, X } from "lucide-react";

type Bubble = {
  who: "me" | "them";
  text: string;
  time: string;
  read?: boolean;
};

const BUBBLES: Bubble[] = [
  { who: "them", text: "Hvordan føltes økta på Wang i kveld?", time: "21:14" },
  {
    who: "me",
    text: "Bra. Trodde jeg skulle være sliten, men 9-iron satt overraskende godt.",
    time: "21:22",
    read: true,
  },
  {
    who: "them",
    text: "Knall. Det matcher dataene — konfidensen din på 9-iron har bygd seg jevnt i to uker.",
    time: "21:23",
  },
  {
    who: "them",
    text: "Onsdag fokuserer vi på 7-iron 130–150 m som planlagt. Sov godt.",
    time: "21:24",
  },
  { who: "me", text: "Takk Anders. God natt.", time: "21:26", read: true },
];

export default function MessageDetailDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center bg-black/70 px-4 py-10">
        <div className="flex h-[760px] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <header className="flex items-center gap-3.5 border-b border-border bg-card px-6 py-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              AK
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold text-foreground">
                Anders Kristiansen
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ boxShadow: "0 0 0 3px rgba(209,248,67,0.18)" }}
                />
                Aktiv nå · Kvelds-modus
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Mer"
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <MoreHorizontal size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Lukk"
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
          </header>

          {/* Thread */}
          <div className="flex-1 overflow-y-auto bg-background px-6 py-5">
            <div className="my-2 flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              I kveld · tirsdag 12. mai
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              {BUBBLES.map((b, i) => (
                <div
                  key={i}
                  className={`flex ${b.who === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      b.who === "me"
                        ? "rounded-t-2xl rounded-bl-2xl rounded-br-md bg-accent text-accent-foreground"
                        : "rounded-t-2xl rounded-br-2xl rounded-bl-md bg-secondary text-foreground"
                    }`}
                  >
                    <div>{b.text}</div>
                    <div
                      className={`mt-1 flex items-center gap-1 font-mono text-[9px] tracking-[0.06em] tabular-nums ${
                        b.who === "me"
                          ? "justify-end text-accent-foreground/65"
                          : "text-muted-foreground"
                      }`}
                    >
                      {b.time}
                      {b.read && <CheckCheck size={12} strokeWidth={2.5} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div className="flex items-end gap-2.5 border-t border-border bg-card px-4 py-3.5">
            <button
              type="button"
              aria-label="Vedlegg"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Paperclip size={18} strokeWidth={1.75} />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full border border-input bg-secondary/40 px-3.5 py-2">
              <textarea
                rows={1}
                placeholder="Skriv ..."
                className="min-h-[22px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
