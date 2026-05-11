/**
 * DEMO — Message detail (utvidet)
 * Bygd fra wireframe live-states/e4-message-detail-default.html
 * URL: /message-detail-demo
 */

import { CheckCheck, MoreHorizontal, Paperclip, Send, Smile, Video, X } from "lucide-react";

type Bubble = {
  who: "me" | "them";
  text: string;
  time: string;
  read?: boolean;
};

type DayGroup = { day: string; bubbles: Bubble[] };

const THREAD: DayGroup[] = [
  {
    day: "Søndag 10. mai",
    bubbles: [
      {
        who: "me",
        text: "Ferdig på Borre — 78 (+6). 7-jern var helt på trynet i dag.",
        time: "19:42",
        read: true,
      },
      {
        who: "them",
        text: "Sett tallene. Tapte 1,8 SG på approach. Vi bytter onsdag-økta — kjører 7-jern fra 130-150 m.",
        time: "20:15",
      },
      { who: "me", text: "OK. Onsdag 17:00 Mulligan?", time: "20:18", read: true },
      {
        who: "them",
        text: "Bekreftet. 80 min. Ta med deg pulshjerten din også.",
        time: "20:19",
      },
    ],
  },
  {
    day: "Mandag 11. mai",
    bubbles: [
      {
        who: "them",
        text: "Foreslår plan-justering for uke 19-22 som AI har sendt deg. Sjekk approval-modalen og si fra hvis ok.",
        time: "09:18",
      },
      {
        who: "me",
        text: "Sett. Aksepterer i kveld etter trening på WANG.",
        time: "09:32",
        read: true,
      },
      { who: "them", text: "Bra. Drikk vann og sov 8 timer. Ses onsdag.", time: "09:34" },
    ],
  },
];

export default function MessageDetailDemo() {
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
              aria-label="Video"
            >
              <Video size={18} strokeWidth={1.5} />
            </button>
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
        <div className="flex h-[560px] flex-col gap-4 overflow-y-auto bg-secondary/30 px-6 py-6">
          {THREAD.map((group) => (
            <div key={group.day} className="flex flex-col gap-2">
              <div className="my-2 flex items-center justify-center">
                <span className="rounded-full bg-card px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  {group.day}
                </span>
              </div>
              {group.bubbles.map((b, i) => (
                <div
                  key={i}
                  className={`flex ${b.who === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                      b.who === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{b.text}</div>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 font-mono text-[10px] tabular-nums ${
                        b.who === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {b.time}
                      {b.read && <CheckCheck size={12} strokeWidth={2.5} />}
                    </div>
                  </div>
                </div>
              ))}
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
