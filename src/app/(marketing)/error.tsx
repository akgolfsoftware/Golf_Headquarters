"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticHero } from "@/components/athletic/hero";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketingError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[marketing/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col">
      <AthleticHero eyebrow="500 · FEIL" height="lg">
        <div className="px-6 pb-10 md:px-10">
          <AlertTriangle
            className="mb-4 h-10 w-10 text-accent"
            strokeWidth={1.5}
            aria-hidden
          />
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-background md:text-5xl">
            Noe <em className="font-normal italic text-accent">gikk galt</em>
          </h1>
          <p className="mt-2 max-w-md text-sm text-background/80">
            Vi støtte på en uventet feil. Prøv igjen, eller gå tilbake til forsiden.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-background/60">
              ref {error.digest}
            </p>
          )}
        </div>
      </AthleticHero>

      <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="font-display inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-2 text-sm font-bold tracking-[-0.005em] text-primary shadow-[0_6px_14px_var(--color-accent-fill)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          className="font-display inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-6 py-2 text-sm font-bold tracking-[-0.005em] text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  );
}
