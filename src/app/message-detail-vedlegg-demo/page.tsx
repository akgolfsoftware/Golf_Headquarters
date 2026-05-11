/**
 * DEMO — Message detail (med vedlegg)
 * Bygd fra wireframe live-states/e4-message-detail-vedlegg.html
 * URL: /message-detail-vedlegg-demo
 */

import {
  CheckCheck,
  FileVideo,
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  Play,
  Send,
  Smile,
  X,
} from "lucide-react";

type Attachment =
  | { kind: "video"; name: string; spec: string; duration: string }
  | { kind: "image"; name: string; spec: string };

type Bubble = {
  who: "me" | "them";
  text?: string;
  time: string;
  read?: boolean;
  attachment?: Attachment;
};

const BUBBLES: Bubble[] = [
  {
    who: "me",
    text: "Sender deg swing-videoen fra rangen i går — driver. Føles som jeg napper med bakhånda.",
    time: "14:22",
    read: true,
  },
  {
    who: "me",
    time: "14:22",
    read: true,
    attachment: {
      kind: "video",
      name: "swing-driver-rangen.mov",
      spec: "Driver · Face-on · 82 MB",
      duration: "0:08",
    },
  },
  {
    who: "them",
    text: "Sett. Skal se gjennom i kveld og sende deg en stoppframe med to ting å fokusere på.",
    time: "14:31",
  },
  {
    who: "them",
    time: "19:48",
    attachment: {
      kind: "image",
      name: "stoppframe-annotert.png",
      spec: "2 punkt markert · 1,4 MB",
    },
  },
  {
    who: "them",
    text: "1 = håndhøyde for tidlig oppe, 2 = vekt sitter igjen på høyre. Prøv tre repetisjoner tørr før onsdag.",
    time: "19:49",
  },
  {
    who: "me",
    text: "Klart. Skal kjøre det i morgen tidlig før jobb.",
    time: "19:54",
    read: true,
  },
];

function AttachmentCard({
  attachment,
  who,
}: {
  attachment: Attachment;
  who: "me" | "them";
}) {
  const accent =
    who === "me"
      ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
      : "bg-secondary/60 border-border text-foreground";
  if (attachment.kind === "video") {
    return (
      <div className={`flex flex-col gap-2 rounded-xl border p-2 ${accent}`}>
        <div
          className={`relative flex h-32 items-center justify-center overflow-hidden rounded-lg ${
            who === "me" ? "bg-primary-foreground/15" : "bg-card"
          }`}
        >
          <FileVideo
            size={40}
            strokeWidth={1.5}
            className={who === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}
          />
          <span
            className={`absolute inset-0 m-auto grid h-10 w-10 place-items-center rounded-full ${
              who === "me"
                ? "bg-primary-foreground text-primary"
                : "bg-foreground text-background"
            }`}
          >
            <Play size={16} strokeWidth={2} className="fill-current" />
          </span>
          <span
            className={`absolute bottom-2 right-2 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
              who === "me"
                ? "bg-foreground/40 text-primary-foreground"
                : "bg-foreground/70 text-background"
            }`}
          >
            {attachment.duration}
          </span>
        </div>
        <div className="px-1">
          <div className="text-sm font-medium">{attachment.name}</div>
          <div
            className={`mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
              who === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {attachment.spec}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-2 ${accent}`}>
      <div
        className={`flex h-40 items-center justify-center overflow-hidden rounded-lg ${
          who === "me" ? "bg-primary-foreground/15" : "bg-card"
        }`}
      >
        <ImageIcon
          size={40}
          strokeWidth={1.5}
          className={who === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}
        />
      </div>
      <div className="px-1">
        <div className="text-sm font-medium">{attachment.name}</div>
        <div
          className={`mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
            who === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {attachment.spec}
        </div>
      </div>
    </div>
  );
}

export default function MessageDetailVedleggDemo() {
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
        <div className="flex h-[640px] flex-col gap-2 overflow-y-auto bg-secondary/30 px-6 py-6">
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
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                {b.text && <div className="text-sm leading-relaxed">{b.text}</div>}
                {b.attachment && (
                  <div className={b.text ? "mt-2" : ""}>
                    <AttachmentCard attachment={b.attachment} who={b.who} />
                  </div>
                )}
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
