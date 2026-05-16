"use client";

/**
 * Knapp som starter et nytt voice-memo-opptak for en gitt booking.
 * Kaller /api/recording/start og redirecter til /admin/recording?id=<recordingId>.
 */

import { Loader2, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  bookingId: string;
  size?: "sm" | "md";
};

export function RecordingTriggerButton({ bookingId, size = "sm" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recording/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        recordingId?: string;
        error?: string;
      };
      if (!res.ok || !json.recordingId) {
        setError(json.error ?? `Feilet (${res.status})`);
        setLoading(false);
        return;
      }
      router.push(`/admin/recording?id=${json.recordingId}`);
    } catch (err) {
      console.error("[recording-trigger] feilet", err);
      setError("Nettverksfeil");
      setLoading(false);
    }
  }

  const padding = size === "sm" ? "px-3 py-1.5 text-[12px]" : "px-4 py-2 text-[13px]";

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-card font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 ${padding}`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
        ) : (
          <Mic className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        Start opptak
      </button>
      {error && (
        <span className="font-mono text-[10px] text-destructive">{error}</span>
      )}
    </div>
  );
}
