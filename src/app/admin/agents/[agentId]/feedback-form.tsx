"use client";

// Feedback-form for én agent-kjøring. Tommel opp/ned + valgfri kommentar.
// Bruker server action `gisFeedback` for å lagre i AuditLog.

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
import { gisFeedback } from "./actions";

export function FeedbackForm({ auditId }: { auditId: string }) {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [comment, setComment] = useState("");
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send(r: 1 | -1) {
    setRating(r);
    setFeil(null);
    start(async () => {
      const res = await gisFeedback(auditId, r, comment);
      if (res.ok) {
        setLagret(true);
        setTimeout(() => setLagret(false), 2500);
      } else {
        setFeil(res.feil);
      }
    });
  }

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Valgfri kommentar — hva fungerte, hva manglet…"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs leading-relaxed"
        disabled={pending}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => send(1)}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary disabled:opacity-40 ${
            rating === 1 ? "bg-primary/10 text-primary" : "bg-card"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.8} />
          Bra
        </button>
        <button
          type="button"
          onClick={() => send(-1)}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary disabled:opacity-40 ${
            rating === -1 ? "bg-destructive/10 text-destructive" : "bg-card"
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.8} />
          Treffer ikke
        </button>
        {pending && (
          <Loader2
            className="h-3.5 w-3.5 animate-spin text-muted-foreground"
            strokeWidth={2}
          />
        )}
        {lagret && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            <Check className="h-3 w-3" strokeWidth={2} />
            Lagret
          </span>
        )}
        {feil && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
            {feil}
          </span>
        )}
      </div>
    </div>
  );
}
