"use client";

import { Sparkles } from "lucide-react";

const FORSLAG = [
  "Hvem av spillerne har ikke trent siste 7 dagene?",
  "Hvor mye er utestående i fakturaer?",
  "Send vinterpakke-tilbud til Bjørn",
  "Når har Aksel neste putting-økt?",
  "Lag ukesrapport for sponsor-møtet",
  "Hvilke tester forfaller denne uka?",
];

type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

export function ForeslatteSporsmaal({ onPick, disabled }: Props) {
  return (
    <section
      aria-label="Foreslåtte spørsmål"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Caddie foreslår
        </h3>
      </div>
      <ul className="space-y-2 px-4 py-4">
        {FORSLAG.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              disabled={disabled}
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-left text-xs text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
