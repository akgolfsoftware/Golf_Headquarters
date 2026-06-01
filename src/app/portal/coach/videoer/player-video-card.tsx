"use client";

/**
 * PlayerHQ · Coach-video-kort (mobile-first).
 *
 * Re-stylet til athletic-mønster (DS-tokens, mono-meta, hover-løft). Logikken
 * er uendret: signert URL hentes via getSignedVideoUrl og åpnes i ny fane.
 */

import { useState, useTransition } from "react";
import { ExternalLink, Play, Video } from "lucide-react";
import { getSignedVideoUrl } from "@/lib/storage/video";

type Props = {
  id: string;
  title: string;
  tag: string | null;
  notes: string | null;
  createdAt: Date;
  coachName: string;
};

export function PlayerVideoCard({
  id,
  title,
  tag,
  notes,
  createdAt,
  coachName,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function spillAv() {
    setError(null);
    startTransition(async () => {
      try {
        const url = await getSignedVideoUrl(id);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke åpne");
      }
    });
  }

  return (
    <li>
      <button
        type="button"
        onClick={spillAv}
        disabled={pending}
        className="flex w-full flex-col gap-3 rounded-xl border border-l-[3px] border-border border-l-pyr-tek bg-card p-3.5 text-left transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(10,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="flex items-start gap-3">
          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-accent">
            <Video className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <span className="absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-accent text-primary">
              <Play className="h-2 w-2" strokeWidth={3} aria-hidden />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
              {title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              <span>Fra {coachName}</span>
              {tag && (
                <>
                  <span aria-hidden>·</span>
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[8px] tracking-[0.10em] text-muted-foreground">
                    {tag}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {notes && (
          <p className="text-[12px] leading-snug tracking-[-0.005em] text-muted-foreground">
            {notes}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="font-mono text-[10px] tabular-nums tracking-[0.04em] text-muted-foreground">
            {createdAt.toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
            {pending ? "Åpner …" : "Åpne"}
            <ExternalLink className="h-3 w-3" strokeWidth={2} aria-hidden />
          </span>
        </div>
      </button>

      {error && (
        <div
          role="alert"
          className="mt-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[12px] text-destructive"
        >
          {error}
        </div>
      )}
    </li>
  );
}
