"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, Eyebrow } from "@/components/athletic/golfdata";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketingError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[(marketing)/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <AlertTriangle className="h-10 w-10 text-primary" strokeWidth={1.5} aria-hidden />
      <Eyebrow as="span">500 · Feil</Eyebrow>
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        Noe <em className="font-normal italic text-primary">gikk galt</em>
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Vi støtte på en uventet feil. Prøv igjen, eller gå tilbake til forsiden.
      </p>
      {error.digest && (
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          ref {error.digest}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={() => reset()} variant="primary">
          Prøv igjen
        </Button>
        <Button as={Link} href="/" variant="secondary">
          Til forsiden
        </Button>
      </div>
    </div>
  );
}
