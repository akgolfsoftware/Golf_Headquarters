"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-8 py-16 text-center">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-secondary text-destructive">
        <AlertTriangle size={24} strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-lg font-semibold leading-tight tracking-tight">
        <em className="font-normal italic text-primary">Noe gikk galt</em>
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Vi støtte på en feil. Prøv på nytt, eller gå tilbake til hjem.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          ref {error.digest}
        </p>
      )}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Last på nytt
        </button>
        <Link
          href="/portal"
          className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground"
        >
          Gå til hjem
        </Link>
      </div>
    </div>
  );
}
