"use client";

// Rask "AI-foreslå plan"-knapp som henter en kort skisse fra
// /api/admin/ai-plan og viser den i en enkel inline-modal.
// Brukes som teaser før coach går videre til full plan-generator.

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

type Props = {
  playerId?: string;
  fokusOmrader?: string[];
};

export function AiPlanForslagButton({ playerId, fokusOmrader }: Props) {
  const [apen, setApen] = useState(false);
  const [henter, setHenter] = useState(false);
  const [forslag, setForslag] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  async function hent() {
    if (!playerId) {
      setFeil("Velg spiller først.");
      setApen(true);
      return;
    }
    setApen(true);
    setHenter(true);
    setFeil(null);
    setForslag(null);
    try {
      const res = await fetch("/api/admin/ai-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, fokusOmrader }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { suggestion: string };
      setForslag(data.suggestion);
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil.");
    } finally {
      setHenter(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={hent}
        disabled={henter}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {henter ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        )}
        AI-foreslå plan
      </button>

      {apen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-plan-forslag-tittel"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setApen(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-secondary active:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Lukk"
            >
              <X className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </button>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              AI-coach · skisse
            </div>
            <h3
              id="ai-plan-forslag-tittel"
              className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight"
            >
              Forslag til <em className="font-normal italic text-primary">plan</em>
            </h3>
            <div className="mt-4 min-h-24 rounded-md border border-border bg-background p-4 text-sm leading-relaxed">
              {henter && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  Henter forslag…
                </div>
              )}
              {feil && <p className="text-destructive">{feil}</p>}
              {forslag && <p>{forslag}</p>}
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Dette er en skisse — bruk AI-coach-panelet under for full generering med revisjon.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setApen(false)}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary active:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
