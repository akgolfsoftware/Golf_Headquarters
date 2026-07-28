"use client";

import { useState, useTransition } from "react";
import { Check, X, Play, CheckCheck, XOctagon } from "lucide-react";
import { godkjennVideoForslag, avvisVideoForslag } from "./actions";

export type VideoForslagRad = {
  id: string;
  exerciseName: string;
  videoUrl: string;
  videoTitle: string;
  videoChannel: string;
};

export function VideoForslagListe({ forslag }: { forslag: VideoForslagRad[] }) {
  const [rader, setRader] = useState(forslag);
  const [pending, startTransition] = useTransition();
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [bulkPending, setBulkPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function handle(id: string, godkjenn: boolean) {
    setFeil(null);
    setAktiv(id);
    startTransition(async () => {
      const res = godkjenn ? await godkjennVideoForslag(id) : await avvisVideoForslag(id);
      if (res.ok) {
        setRader((r) => r.filter((x) => x.id !== id));
      } else {
        setFeil(res.melding);
      }
      setAktiv(null);
    });
  }

  async function handleAlle(godkjenn: boolean) {
    setFeil(null);
    setBulkPending(true);
    const idene = rader.map((r) => r.id);
    const resultater = await Promise.all(
      idene.map((id) => (godkjenn ? godkjennVideoForslag(id) : avvisVideoForslag(id))),
    );
    const feilede = resultater.filter((r) => !r.ok);
    if (feilede.length > 0) setFeil(`${feilede.length} av ${idene.length} feilet — de resterende ble ${godkjenn ? "godkjent" : "avvist"}.`);
    const okIder = new Set(idene.filter((_, i) => resultater[i].ok));
    setRader((r) => r.filter((x) => !okIder.has(x.id)));
    setBulkPending(false);
  }

  if (rader.length === 0) return null;

  return (
    <div className="space-y-3">
      {feil && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {feil}
        </p>
      )}
      {rader.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleAlle(true)}
            disabled={bulkPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Godkjenn alle ({rader.length})
          </button>
          <button
            type="button"
            onClick={() => handleAlle(false)}
            disabled={bulkPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-60"
          >
            <XOctagon className="h-3.5 w-3.5" strokeWidth={2} />
            Avvis alle
          </button>
        </div>
      )}
      {rader.map((v) => (
        <div
          key={v.id}
          className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-foreground">
                {v.exerciseName}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Video-forslag
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              «{v.videoTitle}» — {v.videoChannel}
            </p>
            <a
              href={v.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-destructive hover:underline"
            >
              <Play className="h-4 w-4" strokeWidth={1.8} />
              Se video
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => handle(v.id, true)}
              disabled={(pending && aktiv === v.id) || bulkPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              Godkjenn
            </button>
            <button
              type="button"
              onClick={() => handle(v.id, false)}
              disabled={(pending && aktiv === v.id) || bulkPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:opacity-60"
            >
              <X className="h-4 w-4" strokeWidth={2} />
              Avvis
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
