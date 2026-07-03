"use client";

/**
 * Forberedelse-checklist — avkryssbar liste med live progresjon.
 *
 * Port av checklist-interaksjonen i
 * [historisk fasit, fjernet 2026-07-03] playerhq/components-turnering-detalj.html.
 *
 * Lokalt verktøy: punktene er en huskeliste spilleren krysser av selv. Det
 * finnes ingen persisteringsmodell for dette i schemaet, så tilstanden lever i
 * klient-state (ingen falsk «lagret»-påstand). Alle punkter starter ukrysset —
 * HTML-fasiten forhåndskrysset «Banerecon», men det ville vært en usann
 * påstand om utført arbeid, så vi seeder ingenting.
 *
 * Tastatur: Enter/Space toggler. aria-checked + role=checkbox. Respekterer
 * prefers-reduced-motion via Tailwind motion-reduce.
 */

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = [
  "Banerecon utført",
  "Pre-shot-rutine trent",
  "Pakke utstyr",
  "Sjekk vær (oppdateres daglig)",
] as const;

export function ForberedelseChecklist() {
  const [done, setDone] = useState<boolean[]>(() =>
    DEFAULT_ITEMS.map(() => false),
  );

  const doneCount = done.filter(Boolean).length;

  function toggle(i: number) {
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <section className="border-t border-border px-4 py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          Forberedelse
        </span>
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] tabular-nums text-primary">
          {doneCount} / {DEFAULT_ITEMS.length} klart
        </span>
      </div>

      <ul className="flex flex-col gap-[7px]">
        {DEFAULT_ITEMS.map((label, i) => {
          const isDone = done[i];
          return (
            <li key={label}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                onClick={() => toggle(i)}
                className={cn(
                  "grid w-full grid-cols-[24px_1fr] items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-secondary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors motion-reduce:transition-none",
                    isDone
                      ? "border-primary bg-primary text-accent"
                      : "border-input bg-card text-transparent",
                  )}
                >
                  {isDone && (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[13.5px] font-semibold leading-tight tracking-[-0.005em]",
                    isDone
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
