"use client";

/**
 * Klient-kontroller for /admin/recording.
 *
 * Foreløpig state-only — pause/avslutt/lukk holdes som lokal React-state og
 * viser et banner. Når Deepgram-pipeline kobles på blir disse erstattet med
 * server actions som muterer SessionRecording.status.
 */

import { Pause, Square, X } from "lucide-react";
import { useState, type ReactNode } from "react";

type Props = {
  harAktivt: boolean;
  aktivStatus: string | null;
  aktivId: string | null;
  topbar: ReactNode;
  stage: ReactNode;
};

type Banner = {
  tone: "info" | "success";
  text: string;
} | null;

export function RecordingControls({
  harAktivt,
  aktivStatus,
  aktivId,
  topbar,
  stage,
}: Props) {
  const [skjult, setSkjult] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [paused, setPaused] = useState(false);

  if (skjult) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-card px-4 py-4 text-[13px] text-muted-foreground">
        <span>Live-vinduet er skjult.</span>
        <button
          type="button"
          onClick={() => setSkjult(false)}
          className="rounded-md border border-border bg-secondary px-4 py-1.5 text-[12px] font-medium text-foreground hover:opacity-90"
        >
          Vis igjen
        </button>
      </div>
    );
  }

  const aktivKanStyres = harAktivt && aktivStatus === "PROCESSING";

  function pause() {
    if (!aktivKanStyres) return;
    const blirPause = !paused;
    setPaused(blirPause);
    setBanner({
      tone: "info",
      text: blirPause
        ? `Opptak ${aktivId ?? ""} satt på pause (lokalt). Server-pause kobles på når Deepgram er aktiv.`
        : `Opptak ${aktivId ?? ""} fortsetter (lokal pause).`,
    });
  }

  function avslutt() {
    if (!aktivKanStyres) return;
    setBanner({
      tone: "success",
      text: `Avslutt-signal sendt for ${aktivId ?? "økten"}. AI-analyse trigges når pipeline er live.`,
    });
  }

  return (
    <div className="space-y-4">
      {banner && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 rounded-md border px-4 py-4 text-[13px] ${
            banner.tone === "success"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-accent/40 bg-accent/10 text-foreground"
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.10em] hover:opacity-80"
          >
            Lukk
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-4">
          <div className="flex flex-1 items-center gap-4">{topbar}</div>
          <button
            type="button"
            onClick={() => setSkjult(true)}
            aria-label="Lukk"
            className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {stage}

        <div className="flex items-center gap-4 border-t border-border bg-secondary px-4 py-4">
          <button
            type="button"
            onClick={pause}
            disabled={!aktivKanStyres}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-4 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <Pause className="h-4 w-4" strokeWidth={1.5} />
            {paused ? "Fortsett opptak" : "Pause opptak"}
          </button>
          <button
            type="button"
            onClick={avslutt}
            disabled={!aktivKanStyres}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Square className="h-4 w-4" strokeWidth={1.5} fill="currentColor" />
            Avslutt og analyser
          </button>
        </div>
      </div>
    </div>
  );
}
