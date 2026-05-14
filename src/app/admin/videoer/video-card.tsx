"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, Play, Trash2, ExternalLink } from "lucide-react";
import { deleteVideo, getSignedVideoUrl } from "@/lib/storage/video";

type Props = {
  id: string;
  title: string;
  tag: string | null;
  status: string;
  createdAt: Date;
  playerName: string;
  playerId: string;
  coachName: string;
  sizeBytes: number | null;
  canDelete: boolean;
};

export function VideoCard({
  id,
  title,
  tag,
  status,
  createdAt,
  playerName,
  playerId,
  coachName,
  sizeBytes,
  canDelete,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function spillAv() {
    setError(null);
    try {
      const url = await getSignedVideoUrl(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke åpne video");
    }
  }

  function slett() {
    if (!confirm(`Slett videoen «${title}»? Kan ikke angres.`)) return;
    startTransition(async () => {
      try {
        await deleteVideo(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sletting feilet");
      }
    });
  }

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Video className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-semibold tracking-tight">
            {title}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link
              href={`/admin/elever/${playerId}`}
              className="hover:text-primary"
            >
              {playerName}
            </Link>
            <span>·</span>
            <span>{coachName}</span>
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
        {status !== "READY" && (
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {status}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {createdAt.toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
          })}
          {sizeBytes ? ` · ${(sizeBytes / 1024 / 1024).toFixed(0)} MB` : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={spillAv}
            disabled={status !== "READY"}
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Play className="h-3 w-3" strokeWidth={1.75} />
            Åpne
            <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={slett}
              disabled={pending}
              className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20 disabled:opacity-50"
              aria-label="Slett video"
            >
              <Trash2 className="h-3 w-3" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </li>
  );
}
