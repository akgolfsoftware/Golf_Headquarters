"use client";

import { useState, useTransition } from "react";
import { Pin, PinOff } from "lucide-react";
import {
  pinSession,
  unpinSession,
} from "@/app/portal/mal/sg-hub/best-vs-now/actions";

type Props = {
  currentSessionId: string;
  isCurrentPinned: boolean;
  // Hvis dagens økt slår beste på ≥3 metrikker
  suggestPin: boolean;
};

export function SessionPinControl({
  currentSessionId,
  isCurrentPinned,
  suggestPin,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePin(autoSuggested: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        await pinSession({
          trackmanSessionId: currentSessionId,
          autoSuggested,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "kunne ikke pinne");
      }
    });
  }

  function handleUnpin() {
    setError(null);
    startTransition(async () => {
      try {
        await unpinSession();
      } catch (e) {
        setError(e instanceof Error ? e.message : "kunne ikke fjerne pin");
      }
    });
  }

  return (
    <div className="space-y-3">
      {suggestPin && !isCurrentPinned && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent bg-accent/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Pin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-accent-foreground">
                Ny &quot;best ever&quot;-kandidat
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Dagens økt slår beste på flere metrikker. Pinne den som ny
                referanse?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handlePin(true)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Pin className="h-3.5 w-3.5" />
            Pinne som best
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isCurrentPinned ? (
          <button
            type="button"
            onClick={handleUnpin}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
          >
            <PinOff className="h-3.5 w-3.5" />
            Fjern pin
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handlePin(false)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Pin className="h-3.5 w-3.5" />
            Pinne denne økten
          </button>
        )}
        {pending && (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Lagrer…
          </span>
        )}
        {error && (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-destructive">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
