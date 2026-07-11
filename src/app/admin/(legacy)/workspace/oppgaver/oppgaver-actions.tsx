"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function NyOppgaveButton({ size }: { size?: "sm" }) {
  return (
    <button
      type="button"
      className={agBtnClass("primary", size)}
      onClick={() => toast.info("Bruk Notion for å opprette oppgaver")}
    >
      <Plus className="h-4 w-4" strokeWidth={2} /> Ny oppgave
    </button>
  );
}

export function NyOppgaveButtonSm() {
  return (
    <button
      type="button"
      className={agBtnClass("primary", "sm")}
      onClick={() => toast.info("Bruk Notion for å opprette oppgaver")}
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Ny oppgave
    </button>
  );
}

export function KanbanPlusButton() {
  return (
    <button
      type="button"
      className="ml-auto text-muted-foreground hover:text-foreground"
      onClick={() => toast.info("Bruk Notion for å opprette oppgaver")}
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}

export function KanbanNyButton() {
  return (
    <button
      type="button"
      className="font-mono rounded-xl border border-dashed border-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:bg-secondary/40"
      onClick={() => toast.info("Bruk Notion for å opprette oppgaver")}
    >
      + NY
    </button>
  );
}

export function FilterPillInteractive({
  label,
  count,
  active = false,
}: {
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!active) toast.info("Filter-funksjon kommer snart");
      }}
      className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-px tabular-nums ${
            active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
