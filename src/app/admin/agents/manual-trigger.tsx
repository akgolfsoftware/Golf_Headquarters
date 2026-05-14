"use client";

import { useState, useTransition } from "react";
import { triggerPlanWatcherManually } from "./actions";

export function ManualTrigger() {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<string | null>(null);

  function trigger() {
    setResultat(null);
    startTransition(async () => {
      try {
        const res = await triggerPlanWatcherManually();
        setResultat(`OK · ${res.planActionsWritten ?? 0} plan-actions opprettet`);
      } catch (err) {
        setResultat(
          err instanceof Error ? `Feil: ${err.message}` : "Ukjent feil"
        );
      }
    });
  }

  return (
    <section className="rounded-lg border border-accent/30 bg-accent/5 p-6">
      <h3 className="font-display text-base font-semibold tracking-tight">
        Manuell trigger (admin)
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Kjør plan-watcher umiddelbart i stedet for å vente på cron.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={trigger}
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Kjører…" : "Kjør plan-watcher"}
        </button>
        {resultat && (
          <span className="font-mono text-xs text-muted-foreground">
            {resultat}
          </span>
        )}
      </div>
    </section>
  );
}
