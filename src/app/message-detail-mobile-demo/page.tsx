/**
 * DEMO — Message Detail (mobile)
 * Bygd fra wireframe/_extracted/live-states/e4-message-detail-mobile.html
 * URL: /message-detail-mobile-demo
 *
 * Mobile chat-tråd med Anders Kristiansen.
 */

import { ArrowLeft, Check, MoreHorizontal, Plus, Send } from "lucide-react";

type Bubble = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  read?: boolean;
};

const BUBBLES: Bubble[] = [
  {
    id: "1",
    from: "them",
    text: "Foreslår plan-justering for uke 19–22 som AI har sendt deg.",
    time: "09:18",
  },
  {
    id: "2",
    from: "me",
    text: "Sett. Aksepterer i kveld etter trening på WANG.",
    time: "09:32",
    read: true,
  },
  {
    id: "3",
    from: "them",
    text: "Bra. Drikk vann og sov 8 timer. Ses onsdag.",
    time: "09:34",
  },
  {
    id: "4",
    from: "me",
    text: "Tar lett middag i kveld. Kos deg.",
    time: "09:36",
    read: true,
  },
];

export default function MessageDetailMobileDemo() {
  return (
    <div className="min-h-screen w-full bg-foreground/85 flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen bg-card flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border px-3 py-3">
          <button
            className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Tilbake"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-mono text-[12px] font-semibold text-primary-foreground">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-sans text-sm font-semibold text-foreground">
              Anders Kristiansen
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Aktiv nå
            </div>
          </div>
          <button
            className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Mer"
          >
            <MoreHorizontal size={18} strokeWidth={1.75} />
          </button>
        </header>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto bg-secondary/30 px-3 py-4 flex flex-col gap-2">
          <div className="my-2 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']">
            I dag
          </div>

          {BUBBLES.map((b) => (
            <div
              key={b.id}
              className={
                b.from === "me"
                  ? "max-w-[82%] self-end rounded-[18px_18px_6px_18px] bg-primary px-3 py-2 text-[14px] leading-snug text-primary-foreground"
                  : "max-w-[82%] self-start rounded-[18px_18px_18px_6px] border border-border bg-card px-3 py-2 text-[14px] leading-snug text-foreground"
              }
            >
              {b.text}
              <div
                className={
                  b.from === "me"
                    ? "mt-1 flex items-center justify-end gap-1 font-mono text-[9px] tracking-[0.06em] text-primary-foreground/75"
                    : "mt-1 flex items-center gap-1 font-mono text-[9px] tracking-[0.06em] text-muted-foreground"
                }
              >
                {b.time}
                {b.read ? <Check size={12} strokeWidth={2.5} /> : null}
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="flex items-end gap-2 border-t border-border bg-card px-3 py-3">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:bg-card"
            aria-label="Legg til vedlegg"
          >
            <Plus size={16} strokeWidth={1.75} />
          </button>
          <div className="flex-1 rounded-full border border-input bg-secondary px-4 py-2.5 text-[13px] text-muted-foreground">
            Skriv en melding …
          </div>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-border text-muted-foreground"
            aria-label="Send"
            disabled
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
