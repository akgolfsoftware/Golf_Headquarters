"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <AlertTriangle className="h-10 w-10 text-primary" strokeWidth={1.5} aria-hidden />
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">500 · Feil</span>
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        Noe <em className="font-normal italic text-primary">gikk galt</em>
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Vi støtte på en uventet feil. Prøv igjen, eller gå tilbake til oversikten.
      </p>
      {error.digest && (
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          ref {error.digest}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => reset()} className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90">
          Prøv igjen
        </button>
        <Link href="/admin" className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground">
          Tilbake til oversikten
        </Link>
      </div>
    </div>
  );
}
