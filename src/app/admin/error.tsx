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
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col items-center rounded-lg border border-dashed border-border bg-card/40 px-8 py-16 text-center">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-secondary text-destructive">
          <AlertTriangle size={24} strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">
          <em className="font-normal italic text-primary">Noe gikk galt</em>
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {error.message || "En uventet feil oppsto. Prøv på nytt eller gå tilbake til hjem."}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Last på nytt
          </button>
          <Link
            href="/admin"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Gå til hjem
          </Link>
        </div>
      </div>
    </div>
  );
}
