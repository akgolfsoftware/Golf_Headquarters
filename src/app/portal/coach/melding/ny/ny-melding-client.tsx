"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import {
  Bold,
  Check,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Lock,
  Paperclip,
  Quote,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import { sendMessage } from "./actions";

type Mottaker = {
  id: string;
  name: string;
  role: string;
  kind: "coach" | "fysio" | "mentor" | "team";
  status?: "online" | "away";
};

const SNIPPETS = [
  { icon: HelpCircle, text: "Spørsmål om økt" },
  { icon: Lock, text: "Be om feedback" },
  { icon: ShieldAlert, text: "Skadeoppdatering" },
];

export function NyMeldingClient({ mottakere }: { mottakere: Mottaker[] }) {
  const router = useRouter();
  const toast = useToast();
  const [recipientId, setRecipientId] = useState(mottakere[0]?.id ?? "");
  const [subject, setSubject] = useState("Spørsmål om gårsdagens videoanalyse");
  const [body, setBody] = useState(
    "Hei Hans,\n\nJeg så på videoen fra i går og lurer på posisjonen ved P3 — det ser ut som hoftene roterer tidligere enn vi snakket om sist uke. Skal jeg justere oppvarmingen, eller er dette en effekt av at jeg har testet en ny grep-trykk?\n\nBilde lagt ved fra TrackMan kl 14:22 — sammenligning mot referanse-swing.\n\nTakk!\nØyvind",
  );
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([
    { name: "screenshot-trackman-1422.png", size: "240 KB · BILDE" },
  ]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canSend = recipientId && subject.trim().length >= 3 && body.trim().length >= 10;

  function send() {
    if (!canSend) return;
    setError(null);
    startTransition(async () => {
      try {
        await sendMessage({ recipientId, subject, body });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke sende.";
        if (msg.includes("NEXT_REDIRECT")) throw err;
        setError(msg === "upgrade-required" ? "Krever Pro-abonnement." : msg);
      }
    });
  }

  const selectedMottaker = mottakere.find((m) => m.id === recipientId);

  return (
    <>
      {/* Mottaker */}
      <section className="space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Mottaker <span className="text-destructive">*</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {mottakere.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setRecipientId(m.id)}
              className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                recipientId === m.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground"
              }`}
            >
              {m.status && (
                <span
                  className={`absolute right-3 top-3 h-2 w-2 rounded-full ${
                    m.status === "online" ? "bg-[#22C55E]" : "bg-[#F59E0B]"
                  }`}
                />
              )}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="text-[13px] font-semibold leading-tight">{m.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {m.role}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Hurtig-emner */}
      <section className="mt-8 space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Hurtig-emner{" "}
          <span className="font-normal normal-case text-muted-foreground/60">
            — bruk som utgangspunkt
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SNIPPETS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => setSubject(text)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12.5px] font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {text}
            </button>
          ))}
        </div>
      </section>

      {/* Emne */}
      <section className="mt-8 space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Emne <span className="text-destructive">*</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value.slice(0, 100))}
            placeholder="Hva gjelder det?"
            className="w-full rounded-md border border-input bg-card px-4 py-2 pr-20 text-[14.5px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10.5px] tabular-nums ${
              subject.length > 80 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {subject.length} / 100
          </span>
        </div>
      </section>

      {/* Body */}
      <section className="mt-8 space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Melding <span className="text-destructive">*</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-input bg-card">
          <div className="flex items-center gap-1 border-b border-border bg-secondary/30 px-4 py-2">
            <ToolbarBtn icon={<Bold className="h-4 w-4" strokeWidth={1.75} />} title="Fet" />
            <ToolbarBtn icon={<Italic className="h-4 w-4" strokeWidth={1.75} />} title="Kursiv" />
            <span className="mx-1 h-4 w-px bg-border" />
            <ToolbarBtn icon={<List className="h-4 w-4" strokeWidth={1.75} />} title="Liste" />
            <ToolbarBtn icon={<LinkIcon className="h-4 w-4" strokeWidth={1.75} />} title="Lenke" />
            <ToolbarBtn icon={<Quote className="h-4 w-4" strokeWidth={1.75} />} title="Sitat" />
            <span className="mx-1 h-4 w-px bg-border" />
            <ToolbarBtn icon={<ImageIcon className="h-4 w-4" strokeWidth={1.75} />} title="Bilde" />
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              ⌘B / ⌘I
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full resize-none bg-card px-4 py-4 text-[14.5px] leading-relaxed focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            placeholder="Skriv meldingen din her…"
          />
        </div>
      </section>

      {/* Vedlegg */}
      <section className="mt-8 space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Vedlegg{" "}
          <span className="font-normal normal-case text-muted-foreground/60">
            — maks 5 filer, 25 MB per fil
          </span>
        </div>
        <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-dashed border-input bg-card px-6 py-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
            <Paperclip className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold">Slipp filer her, eller velg fra galleri</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              PNG · JPG · MP4 · PDF · M4A
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toast.info("Galleri-opplasting kommer snart")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-1.5 text-[12px] font-semibold text-foreground hover:border-primary"
            >
              <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              Galleri
            </button>
            <button
              type="button"
              onClick={() => toast.info("Filopplasting kommer snart")}
              className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-bold text-primary-foreground hover:opacity-90"
            >
              Velg filer
            </button>
          </div>
        </div>
        {attachments.length > 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="grid grid-cols-[40px_minmax(0,1fr)_28px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-primary">
                  <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-semibold">{a.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {a.size}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Fjern"
                  onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Sticky send bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[880px] flex-wrap items-center gap-2 px-6 py-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
            Utkast lagret{" "}
            <strong className="ml-1 font-semibold text-foreground">14:08</strong>
          </span>
          {selectedMottaker && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              <Check className="h-3 w-3" strokeWidth={1.75} />
              Til{" "}
              <strong className="ml-1 font-semibold text-foreground normal-case">
                {selectedMottaker.name}
              </strong>
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/portal/coach/melding")}
              className="rounded-full border-0 bg-transparent px-4 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={() => toast.info("Forhåndsvisning kommer snart")}
              className="rounded-full border border-border bg-transparent px-4 py-2 text-[13px] font-semibold text-foreground hover:border-primary"
            >
              Forhåndsvis
            </button>
            <button
              type="button"
              disabled={!canSend || pending}
              onClick={send}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
              {pending ? "Sender …" : "Send melding"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ToolbarBtn({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      {icon}
    </button>
  );
}
