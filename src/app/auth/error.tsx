"use client";

/* Feilgrense for /auth — rapporterer til feillogg, nøytral UI uten app-chrome. */

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/lib/report-client-error";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "auth-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Feil
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Noe gikk galt</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Innloggingen eller siden feilet. Prøv igjen, eller gå tilbake til
        forsiden.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  );
}
