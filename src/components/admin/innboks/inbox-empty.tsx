/**
 * Tomstater for AgencyOS Innboks.
 *  - InboxEmpty: ingen tråder i det hele tatt ("Innboks tom. Bra jobba.")
 *  - InboxNoSelection: tråder finnes, men ingen er valgt (midtkolonne-melding)
 */

import { CheckCircle2, MessageSquare } from "lucide-react";

export function InboxEmpty() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 text-center"
      style={{ height: "calc(100vh - 240px)", minHeight: "640px" }}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-primary">
        <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 font-display text-lg font-bold tracking-[-0.015em] text-foreground">
        Innboks tom. Bra jobba.
      </p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Når spillere eller foresatte sender meldinger, dukker de opp her.
      </p>
    </div>
  );
}

export function InboxNoSelection() {
  return (
    <div className="hidden flex-1 items-center justify-center border-l border-border bg-background md:flex">
      <div className="text-center">
        <MessageSquare
          className="mx-auto h-7 w-7 text-muted-foreground/40"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="mt-3 text-[13px] text-muted-foreground">
          Velg en samtale til venstre.
        </p>
      </div>
    </div>
  );
}
