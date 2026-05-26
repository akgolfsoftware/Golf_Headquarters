"use client";

// Klient-knapp som trigger AI-analyse + Notion-sync for et opptak.
// Vises kun nar SessionRecording.status === "PROCESSING".
// Inkluderer ogsa en "Sett dummy-transkripsjon"-knapp for testing fram til
// V2-transkribering er klar.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  ExternalLink,
  FileText,
  AlertCircle,
} from "lucide-react";

type Props = {
  recordingId: string;
  harTranskripsjon: boolean;
};

export function RecordingAnalyzeButton({ recordingId, harTranskripsjon }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [henter, setHenter] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{
    notionUrl: string | null;
    notionPageId: string | null;
  } | null>(null);

  async function analyser() {
    setHenter(true);
    setFeil(null);
    setResultat(null);
    try {
      const res = await fetch("/api/recording/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordingId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        notionUrl?: string | null;
        notionPageId?: string | null;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setResultat({
        notionUrl: data.notionUrl ?? null,
        notionPageId: data.notionPageId ?? null,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setHenter(false);
    }
  }

  async function settDummy() {
    setHenter(true);
    setFeil(null);
    try {
      const res = await fetch("/api/recording/dummy-transcript", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordingId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setHenter(false);
    }
  }

  const laster = henter || isPending;

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {harTranskripsjon ? (
        <button
          type="button"
          onClick={analyser}
          disabled={laster}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {laster ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
          ) : (
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
          )}
          Analyser nå
        </button>
      ) : (
        <button
          type="button"
          onClick={settDummy}
          disabled={laster}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {laster ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
          ) : (
            <FileText className="h-3 w-3" strokeWidth={1.75} />
          )}
          Sett dummy-transkripsjon
        </button>
      )}

      {feil && (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-destructive">
          <AlertCircle className="h-3 w-3" strokeWidth={1.75} />
          {feil}
        </span>
      )}

      {resultat?.notionUrl && (
        <a
          href={resultat.notionUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
          Åpne i Notion
        </a>
      )}
    </div>
  );
}
