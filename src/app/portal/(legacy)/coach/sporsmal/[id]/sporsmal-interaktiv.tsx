"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/shared/toast-provider";
import { Check, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { svarPaSporsmal } from "../actions";

const RELATERTE = [
  "Hvor mye skal venstre håndledd flektes ved topp?",
  "Hvordan beholde balanse gjennom finish?",
  "Bør tempo være likt på iron og driver?",
] as const;

export function SvarSkjema({ questionId }: { questionId: string }) {
  const toast = useToast();
  const [answer, setAnswer] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed) {
      toast.info("Skriv et svar før du sender.");
      return;
    }
    startTransition(async () => {
      try {
        await svarPaSporsmal(questionId, trimmed);
        toast.info("Svaret er sendt til spilleren.");
      } catch {
        toast.info("Kunne ikke sende svaret. Prøv igjen.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-primary/30 bg-card p-4 md:p-6"
    >
      <label
        htmlFor="svar"
        className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground"
      >
        Skriv svar til spilleren
      </label>
      <textarea
        id="svar"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={pending}
        rows={6}
        placeholder="Svar konkret — gjerne med sjekkpunkter spilleren kan teste på neste økt."
        className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-[14.5px] leading-relaxed text-foreground outline-none focus:border-primary disabled:opacity-60"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          {pending ? "Sender…" : "Send svar"}
        </button>
      </div>
    </form>
  );
}

export function SporsmalReaksjoner() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-6 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold">Hjalp dette deg?</div>
        <div className="text-[12px] text-muted-foreground">
          Reaksjonen din hjelper Hans med å forstå hva som funker.
        </div>
      </div>
      <div className="flex gap-2" role="group" aria-label="Reaksjon">
        <button
          type="button"
          aria-pressed="true"
          onClick={() => toast.info("Tilbakemelding registrert — takk!")}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-4 py-1.5 text-[12px] font-semibold text-primary"
        >
          <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          Hjalp <span className="font-mono text-[10px] text-muted-foreground">· markert</span>
        </button>
        <button
          type="button"
          aria-pressed="false"
          onClick={() => toast.info("Tilbakemelding registrert — takk!")}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-1.5 text-[12px] font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
        >
          <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          Trenger mer
        </button>
      </div>
    </div>
  );
}

export function RelaterteSporsmal() {
  const toast = useToast();
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {RELATERTE.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toast.info("Spørsmål-søk kommer snart")}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left hover:-translate-y-px hover:border-muted-foreground"
        >
          <span className="w-max rounded-full bg-primary/10 px-2 py-0.5 font-display italic text-[12px] text-primary">
            Teknikk
          </span>
          <div className="font-display text-[13.5px] font-semibold leading-tight">{q}</div>
          <div className="mt-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-foreground">
              <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
            <span>Besvart</span>
            <span>·</span>
            <span>{[14, 22, 9][i]} fant nyttig</span>
          </div>
        </button>
      ))}
    </div>
  );
}
