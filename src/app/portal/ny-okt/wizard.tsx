"use client";

/**
 * NyOktWizard — skjelett for "Lag din egen økt"-wizard.
 *
 * Full wizard (type → drills → tid/sted → bekreft) bygges i Spor 2.
 * Dette skjelettet viser nå steg 0: "Trene sammen?"-valget. Når andre
 * spor bygger ut wizardet, overtar de denne komponenten — Trene sammen-
 * toggle eksporteres som standalone via `@/components/portal/workbench/
 * trene-sammen-toggle`.
 */

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  TreneSammenToggle,
  type TreneSammenValue,
} from "@/components/portal/workbench/trene-sammen-toggle";

export function NyOktWizard() {
  const [treneSammen, setTreneSammen] = useState<TreneSammenValue>({
    isShared: false,
    maxParticipants: null,
  });
  const [steg, setSteg] = useState(0);

  if (steg === 0) {
    return (
      <section className="space-y-6 rounded-lg border border-border bg-card p-6">
        <header>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Steg 1 av 4
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
            Hvem er økten for?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Velg om du vil trene alene eller invitere kompiser.
          </p>
        </header>

        <TreneSammenToggle value={treneSammen} onChange={setTreneSammen} />

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setSteg(1)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Videre
            <ArrowRight size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </section>
    );
  }

  // Steg 1+ — overlater til Spor 2/4 å bygge ut. Inntil videre vis
  // placeholder med valget fra steg 0 så det er synlig at toggle virker.
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
      <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        Steg 2 av 4 — kommer snart
      </p>
      <p className="mt-2">
        Valgte:{" "}
        <strong className="text-foreground">
          {treneSammen.isShared
            ? `Delt økt (maks ${treneSammen.maxParticipants ?? 8})`
            : "Privat økt"}
        </strong>
      </p>
      <button
        type="button"
        onClick={() => setSteg(0)}
        className="mt-2 text-xs underline"
      >
        Tilbake
      </button>
    </div>
  );
}
