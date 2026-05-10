"use client";

import { useEffect } from "react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portal-error]", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
        Noe gikk galt
      </span>
      <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground">
        Vi støtte på en feil
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Prøv på nytt. Hvis problemet vedvarer, gi beskjed til support.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          ref {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Prøv igjen
      </button>
    </div>
  );
}
