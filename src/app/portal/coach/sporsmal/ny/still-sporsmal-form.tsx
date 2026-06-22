"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Send } from "lucide-react";
import { stillSporsmal } from "../actions";

const HURTIG_EMNER = [
  "Spørsmål om en økt",
  "Be om feedback på sving",
  "Spørsmål om turneringsplan",
];

export function StillSporsmalForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canSend = title.trim().length >= 3 && body.trim().length >= 10;

  function send() {
    if (!canSend) return;
    setError(null);
    startTransition(async () => {
      try {
        await stillSporsmal({ title, body });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke sende.";
        // redirect() kaster en kontrollflyt-feil — la den boble videre.
        if (msg.includes("NEXT_REDIRECT")) throw err;
        setError(msg);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Hurtig-emner */}
      <section className="space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Hurtig-emner{" "}
          <span className="font-normal normal-case text-muted-foreground/60">
            — bruk som utgangspunkt
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {HURTIG_EMNER.map((emne) => (
            <button
              key={emne}
              type="button"
              onClick={() => setTitle(emne)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12.5px] font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              {emne}
            </button>
          ))}
        </div>
      </section>

      {/* Tittel */}
      <section className="space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Tittel <span className="text-destructive">*</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 140))}
            placeholder="Hva gjelder det?"
            className="w-full rounded-md border border-input bg-card px-4 py-2 pr-20 text-[14.5px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10.5px] tabular-nums ${
              title.length > 120 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {title.length} / 140
          </span>
        </div>
      </section>

      {/* Spørsmål */}
      <section className="space-y-2">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Spørsmål <span className="text-destructive">*</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 4000))}
          rows={9}
          placeholder="Beskriv spørsmålet ditt så coachen kan svare godt …"
          className="w-full resize-none rounded-xl border border-input bg-card px-4 py-4 text-[14.5px] leading-relaxed focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
        <div className="text-right font-mono text-[10.5px] tabular-nums text-muted-foreground">
          {body.length} / 4000
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Handlinger */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/portal/coach/melding")}
          className="rounded-full border-0 bg-transparent px-4 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
        >
          Avbryt
        </button>
        <button
          type="button"
          disabled={!canSend || pending}
          onClick={send}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:brightness-95 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2} />
          {pending ? "Sender …" : "Send spørsmål"}
        </button>
      </div>
    </div>
  );
}
