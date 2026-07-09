"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";
import { markerSomNyttUtkast } from "./actions";

type Props = {
  planId: string;
  playerComment: string;
  playerName: string;
};

export function RejectedBanner({ planId, playerComment, playerName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function markerSomUtkast() {
    if (
      !confirm(
        "Tilbake til utkast? Spillerens kommentar fjernes og planen kan redigeres på nytt før den sendes.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await markerSomNyttUtkast(planId);
        router.refresh();
      } catch {
        // no-op — siden re-validerer ved feil i action
      }
    });
  }

  return (
    <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-start gap-4">
        <AlertCircle
          size={20}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
            {playerName} har bedt om endring
          </div>
          <blockquote className="mt-4 rounded-md border-l-2 border-destructive/60 bg-card px-4 py-4 font-display text-[14px] italic leading-snug text-foreground">
            «{playerComment}»
          </blockquote>
          <div className="mt-4">
            <button
              type="button"
              onClick={markerSomUtkast}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              {pending ? "Tilbakestiller…" : "Marker som nytt utkast"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
