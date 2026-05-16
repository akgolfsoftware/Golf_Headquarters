"use client";

/**
 * Retry-knapp for transkribering når status=FAILED.
 * Kaller POST /api/recording/transcribe og refresher siden.
 */

import { Loader2, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  recordingId: string;
};

export function TranscribeRetryButton({ recordingId }: Props) {
  const router = useRouter();
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function trigger() {
    setFeil(null);
    try {
      const res = await fetch("/api/recording/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setFeil(err instanceof Error ? err.message : String(err));
    }
  }

  const laster = pending;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={trigger}
        disabled={laster}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {laster ? (
          <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
        ) : (
          <RefreshCw className="h-3 w-3" strokeWidth={1.75} />
        )}
        Prøv igjen
      </button>
      {feil && (
        <span className="font-mono text-[10px] text-destructive">{feil}</span>
      )}
    </div>
  );
}
