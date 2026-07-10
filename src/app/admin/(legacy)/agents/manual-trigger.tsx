"use client";

import { useState, useTransition } from "react";
import { triggerAgentManually, MANUELLE_AGENTER } from "./actions";

const NAVN: Record<string, string> = {
  "plan-watcher": "Plan Watcher",
  "training-gap": "Training Gap",
  "daily-brief": "Daily Brief",
  "drill-forslag": "Drill-forslag",
};

export function ManualTrigger() {
  const [pending, startTransition] = useTransition();
  const [valgt, setValgt] = useState<string>(MANUELLE_AGENTER[0] ?? "");
  const [resultat, setResultat] = useState<string | null>(null);

  function trigger() {
    setResultat(null);
    startTransition(async () => {
      const res = await triggerAgentManually(valgt);
      setResultat(res.ok ? `OK · ${res.melding}` : `Feil: ${res.melding}`);
    });
  }

  return (
    <section className="rounded-lg border border-accent/30 bg-accent/5 p-6">
      <h3 className="font-display text-base font-semibold tracking-tight">
        Manuell trigger (admin)
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Kjør en agent umiddelbart i stedet for å vente på cron.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <select
          value={valgt}
          onChange={(e) => setValgt(e.target.value)}
          disabled={pending}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          {MANUELLE_AGENTER.map((a) => (
            <option key={a} value={a}>
              {NAVN[a] ?? a}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={trigger}
          disabled={pending || !valgt}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Kjører…" : "Kjør agent"}
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
