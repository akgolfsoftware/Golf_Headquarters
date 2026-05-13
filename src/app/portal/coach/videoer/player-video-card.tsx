"use client";

import { useState } from "react";
import { Video, Play, ExternalLink } from "lucide-react";
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

  async function spillAv() {
    setError(null);
    try {
      const url = await getSignedVideoUrl(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke åpne");
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Video className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-semibold tracking-tight">
            {title}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Fra {coachName}</span>
            {tag && (
              <>
                <span>·</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.10em]">
                  {tag}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {notes && (
        <p className="text-xs text-muted-foreground">{notes}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {createdAt.toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          onClick={spillAv}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <Play className="h-3 w-3" strokeWidth={1.75} />
          Åpne
          <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </li>
  );
}
