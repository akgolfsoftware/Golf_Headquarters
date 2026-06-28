"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { godkjennDrillForslag, avvisDrillForslag } from "./actions";

export type ForslagRad = {
  id: string;
  navn: string;
  beskrivelse: string;
  omraade: string;
  varighetMin: number | null;
};

export function ForslagListe({ forslag }: { forslag: ForslagRad[] }) {
  const [rader, setRader] = useState(forslag);
  const [pending, startTransition] = useTransition();
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  function handle(id: string, godkjenn: boolean) {
    setFeil(null);
    setAktiv(id);
    startTransition(async () => {
      const res = godkjenn
        ? await godkjennDrillForslag(id)
        : await avvisDrillForslag(id);
      if (res.ok) {
        setRader((r) => r.filter((x) => x.id !== id));
      } else {
        setFeil(res.melding);
      }
      setAktiv(null);
    });
  }

  if (rader.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Ingen forslag venter. Kjør drill-forslag-agenten fra{" "}
        <Link href="/admin/agents" className="text-foreground underline">
          AI-agenter
        </Link>{" "}
        for å generere nye.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {feil && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {feil}
        </p>
      )}
      {rader.map((d) => (
        <div
          key={d.id}
          className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-foreground">
                {d.navn}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {d.omraade}
                {d.varighetMin ? ` · ${d.varighetMin} min` : ""}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
              {d.beskrivelse}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => handle(d.id, true)}
              disabled={pending && aktiv === d.id}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              Godkjenn
            </button>
            <button
              type="button"
              onClick={() => handle(d.id, false)}
              disabled={pending && aktiv === d.id}
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
