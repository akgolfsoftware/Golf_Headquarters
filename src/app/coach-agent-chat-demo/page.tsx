/**
 * PILOT — Coach-agent Chat
 * Bygd fra wireframe/design-files-v2/screens/08-coach-agent-chat.html
 * URL: /coach-agent-chat-demo
 */

import { Sparkles, Download, Plus, FileText, Send } from "lucide-react";

type Message =
  | {
      role: "coach";
      text: string;
      time: string;
    }
  | {
      role: "agent";
      text: string;
      list?: string[];
      rec?: { label: string; body: string };
      sources?: number;
      time: string;
      typing?: boolean;
    };

const messages: Message[] = [
  {
    role: "coach",
    text: "Hvorfor har Markus mistet 3 cm i drive-lengde siste 30 d?",
    time: "14:28",
  },
  {
    role: "agent",
    text: "Tre sannsynlige årsaker basert på TrackMan + helse-data:",
    list: [
      "Søvn-snitt fra 7,8 t → 6,9 t (−12 %)",
      "Kropp-rotasjons-data viser 4° mindre vridning ved backswing-topp",
      "5 av 8 siste økter manglet warm-up",
    ],
    rec: {
      label: "Anbefaling:",
      body: "Sett opp 20 min mobilitet-økt før neste range-økt.",
    },
    sources: 3,
    time: "14:28 · 2 s tenketid",
  },
  {
    role: "coach",
    text: "Når sist hadde han 100 % warm-up?",
    time: "14:29",
  },
  {
    role: "agent",
    text: "12. april — 24 dager siden. Etter den datoen droppet warm-up-ratio fra 100 % → 62 %.",
    time: "14:29 · 1 s tenketid",
  },
  {
    role: "agent",
    text: "",
    time: "tenker …",
    typing: true,
  },
];

export default function CoachAgentChatDemo() {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background text-foreground">
      {/* Chat header */}
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-8 py-3.5">
        <div className="flex items-center gap-3.5">
          <div className="relative grid h-11 w-11 place-items-center rounded-full bg-primary text-white">
            <span className="font-bold text-[14px]">MR</span>
            <span className="absolute -right-1 -bottom-0.5 grid h-4.5 w-4.5 place-items-center rounded-full border-2 border-card bg-accent text-accent-foreground">
              <Sparkles size={10} strokeWidth={1.5} fill="currentColor" />
            </span>
          </div>
          <div>
            <div className="text-[16px] font-semibold leading-none">
              AI om <em className="font-display font-semibold italic text-primary">Markus</em>
            </div>
            <div className="mt-1 font-mono text-[12px] tabular-nums text-muted-foreground">
              Kontekst: 30 d data · 4 økter · 2 runder
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            <Download size={14} strokeWidth={1.5} />
            Eksporter chat
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Ny chat"
          >
            <Plus size={18} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Chat scroll */}
      <div className="overflow-auto px-8 pt-8 pb-4">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6">
          {messages.map((m, idx) => {
            if (m.role === "coach") {
              return (
                <div key={idx} className="grid grid-cols-[1fr_36px] gap-3 justify-items-end">
                  <div>
                    <div className="max-w-[92%] rounded-2xl rounded-br-sm border border-primary/10 bg-primary/[0.06] px-4.5 py-3.5 text-[15px] leading-[1.55]">
                      {m.text}
                    </div>
                    <div className="mt-1.5 flex justify-end font-mono text-[11px] tabular-nums text-muted-foreground">
                      {m.time}
                    </div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-bold text-[12px] text-accent-foreground">
                    AK
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="grid grid-cols-[36px_1fr] gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#061210] text-accent">
                  <Sparkles size={18} strokeWidth={1.5} fill="currentColor" />
                </div>
                <div>
                  {m.typing ? (
                    <div className="inline-flex gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4.5 py-3.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.15s]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.3s]" />
                    </div>
                  ) : (
                    <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-card px-4.5 py-3.5 text-[15px] leading-[1.55]">
                      <p>{m.text}</p>
                      {m.list && (
                        <ol className="mt-2.5 list-decimal pl-5 text-[14px]">
                          {m.list.map((li) => (
                            <li key={li} className="mb-1">
                              {li}
                            </li>
                          ))}
                        </ol>
                      )}
                      {m.rec && (
                        <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3.5 py-2.5 text-[13.5px] font-medium leading-[1.5]">
                          <b className="font-bold text-primary">{m.rec.label}</b> {m.rec.body}
                        </div>
                      )}
                    </div>
                  )}
                  {m.sources !== undefined && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                      <FileText size={12} strokeWidth={1.5} />
                      Kilder · {m.sources}
                    </div>
                  )}
                  <div className="mt-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <footer className="border-t border-border bg-card px-8 pt-3.5 pb-4">
        <div className="mx-auto max-w-[720px]">
          <div className="grid grid-cols-[1fr_44px] items-center gap-2 rounded-md border border-border bg-background p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
            <input
              type="text"
              placeholder="Spør om Markus …"
              className="border-0 bg-transparent px-3.5 py-2.5 text-[15px] leading-[1.4] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              className="grid h-11 w-11 place-items-center rounded-sm bg-accent text-accent-foreground"
              style={{ boxShadow: "0 4px 12px rgba(209,248,67,0.30)" }}
              aria-label="Send"
            >
              <Send size={18} strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Forslag
            </span>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              Vis siste 5 økter
            </button>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              Sammenlign med peers
            </button>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              Forklar HCP-trend
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
