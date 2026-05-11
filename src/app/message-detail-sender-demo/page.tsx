/**
 * DEMO — Message detail (sender utgående melding)
 * Bygd fra wireframe live-states/e4-message-detail-sender.html
 * URL: /message-detail-sender-demo
 */

import { CheckCheck, Loader2, MoreHorizontal, Paperclip, Send, Smile, X } from "lucide-react";

type Bubble = {
  who: "me" | "them";
  text: string;
  time: string;
  read?: boolean;
  sending?: boolean;
};

const BUBBLES: Bubble[] = [
  {
    who: "them",
    text: "Husk: drikke vann mellom hver beste-etappe. Lett å glemme når det er varmt.",
    time: "16:02",
  },
  {
    who: "me",
    text: "Helt enig. Hadde med to flasker i dag og det utgjorde stor forskjell på siste 9.",
    time: "16:18",
    read: true,
  },
  {
    who: "me",
    text: "Forresten, kan vi flytte økta på torsdag til 18:00 i stedet for 17:00? Jobbmøte drar ut.",
    time: "16:24",
    sending: true,
  },
];

export default function MessageDetailSenderDemo() {
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
            <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1A7D56]" />
              Aktiv nå · Hovedcoach
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Mer"
            >
              <MoreHorizontal size={18} strokeWidth={1.5} />
            </button>
            <button
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Thread */}
        <div className="flex h-[560px] flex-col gap-2 overflow-y-auto bg-secondary/30 px-6 py-6">
          <div className="my-2 flex items-center justify-center">
            <span className="rounded-full bg-card px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              I dag · tirsdag 12. mai
            </span>
          </div>
          {BUBBLES.map((b, i) => (
            <div
              key={i}
              className={`flex ${b.who === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                  b.who === "me"
                    ? `bg-primary text-primary-foreground ${b.sending ? "animate-pulse opacity-80" : ""}`
                    : "bg-card text-foreground border border-border"
                }`}
              >
                <div className="text-sm leading-relaxed">{b.text}</div>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 font-mono text-[10px] tabular-nums ${
                    b.who === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {b.sending ? (
                    <span className="flex items-center gap-1 uppercase tracking-[0.08em]">
                      <Loader2 size={11} strokeWidth={2.5} className="animate-spin" />
                      Sender ...
                    </span>
                  ) : (
                    <>
                      {b.time}
                      {b.read && <CheckCheck size={12} strokeWidth={2.5} />}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              placeholder="Skriv en melding til Anders..."
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
