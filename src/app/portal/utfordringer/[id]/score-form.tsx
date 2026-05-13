"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrerScore } from "../actions";

type Props = {
  challengeId: string;
  currentScore: number | null;
  currentNotes: string | null;
};

export function ScoreForm({ challengeId, currentScore, currentNotes }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [score, setScore] = useState<string>(
    currentScore != null ? String(currentScore) : "",
  );
  const [notes, setNotes] = useState<string>(currentNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    const tall = Number(score.replace(",", "."));
    if (!Number.isFinite(tall)) {
      setError("Score må være et tall.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await registrerScore(challengeId, tall, notes || null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <form onSubmit={lagre} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold tracking-tight">
        <em className="font-normal text-primary md:italic">Min</em> score
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Score (høyere er bedre)
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="F.eks. 42"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Notat (valgfritt)
          </span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kort kommentar"
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {pending ? "Lagrer…" : currentScore != null ? "Oppdater score" : "Registrer score"}
        </button>
      </div>
    </form>
  );
}
