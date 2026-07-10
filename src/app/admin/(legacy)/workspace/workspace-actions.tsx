"use client";

import { toast } from "sonner";
import { Filter, ExternalLink, Plus, Check, Flame } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";
import { type SampleTask } from "@/components/workspace/sample-data";

export function WorkspaceHeaderActions() {
  return (
    <>
      <button
        type="button"
        className={agBtnClass("ghost")}
        onClick={() => toast.info("Filter kommer snart")}
      >
        <Filter className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden /> Filter
      </button>
      <button
        type="button"
        className={agBtnClass("ghost")}
        onClick={() => toast.info("Notion-integrasjon ikke koblet til ennå")}
      >
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden /> Åpne Notion
      </button>
      <button
        type="button"
        className={agBtnClass("primary")}
        onClick={() => toast.info("Ny oppgave — bruk Notion for å opprette oppgaver")}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Ny oppgave
      </button>
    </>
  );
}

export function LeggTilOppgaveButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Bruk Notion for å opprette oppgaver")}
      className="font-mono mt-2 inline-flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-[11px] uppercase tracking-[0.04em] text-muted-foreground hover:bg-muted/30"
    >
      <Plus className="h-3.5 w-3.5" /> Legg til oppgave for i dag …
    </button>
  );
}

export function BrennerStrip({ tasks }: { tasks: SampleTask[] }) {
  return (
    <div className="rounded-2xl border border-destructive/20 border-l-[4px] border-l-destructive bg-gradient-to-br from-destructive/[0.06] to-destructive/[0.02] p-4">
      <div className="mb-2 flex items-baseline gap-2.5">
        <Flame className="h-3.5 w-3.5 text-destructive" fill="currentColor" />
        <span className="font-display text-sm font-bold tracking-tight text-destructive">
          {tasks.length} brenner
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
          må håndteres i dag
        </span>
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg border border-destructive/20 bg-card p-2.5"
          >
            <div className="text-[13.5px] font-semibold">{t.title}</div>
            <button
              type="button"
              onClick={() => toast.info("Bruk Notion for å fullføre oppgaven")}
              className="font-mono inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-primary-foreground"
            >
              <Check className="h-3 w-3" /> Fullfør
            </button>
            <button
              type="button"
              onClick={() => toast.info("Bruk Notion for å utsette oppgaven")}
              className="font-mono inline-flex h-7 items-center rounded-full border border-border bg-card px-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground"
            >
              Snooze
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
