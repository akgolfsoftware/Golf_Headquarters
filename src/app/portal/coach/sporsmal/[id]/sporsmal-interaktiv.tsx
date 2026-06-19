"use client";

import { useToast } from "@/components/shared/toast-provider";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";

const RELATERTE = [
  "Hvor mye skal venstre håndledd flektes ved topp?",
  "Hvordan beholde balanse gjennom finish?",
  "Bør tempo være likt på iron og driver?",
] as const;

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
