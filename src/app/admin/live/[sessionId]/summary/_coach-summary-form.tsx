"use client";

import { useState, useTransition } from "react";
import { Star, FileText, Check, Loader2 } from "lucide-react";
import { lagreCoachVurdering } from "./actions";

type Props = {
  sessionId: string;
  initialRating: number | null;
  initialNotat: string;
};

export function CoachSummaryForm({
  sessionId,
  initialRating,
  initialNotat,
}: Props) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [notat, setNotat] = useState<string>(initialNotat);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [isPending, startTransition] = useTransition();

  function håndterLagre() {
    if (rating < 1) {
      setFeil("Velg en vurdering (1–5)");
      return;
    }
    setFeil(null);
    setLagret(false);
    startTransition(async () => {
      const res = await lagreCoachVurdering(sessionId, rating, notat);
      if (!res.ok) {
        setFeil(res.error);
      } else {
        setLagret(true);
      }
    });
  }

  return (
    <div className="mt-6 space-y-6 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          <Star className="inline h-3.5 w-3.5 mr-1" />
          Coach-vurdering
        </h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const valgt = rating >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setRating(n);
                  setLagret(false);
                }}
                disabled={isPending}
                aria-pressed={valgt}
                aria-label={`${n} av 5`}
                className={
                  valgt
                    ? "h-8 w-8 rounded-md border border-primary bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    : "h-8 w-8 rounded-md border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
                }
              >
                {n}
              </button>
            );
          })}
          <span className="ml-2 text-xs text-muted-foreground">
            Økt-kvalitet (1–5)
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="coach-notat"
          className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2"
        >
          <FileText className="inline h-3.5 w-3.5 mr-1" />
          Coach-notat
        </label>
        <textarea
          id="coach-notat"
          rows={4}
          value={notat}
          onChange={(e) => {
            setNotat(e.target.value);
            setLagret(false);
          }}
          disabled={isPending}
          placeholder="Observasjoner, fremgang, fokus til neste økt..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {feil && <span className="text-xs text-destructive">{feil}</span>}
        {lagret && !isPending && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="h-3.5 w-3.5" />
            Lagret
          </span>
        )}
        <button
          type="button"
          onClick={håndterLagre}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Lagre vurdering
        </button>
      </div>
    </div>
  );
}
