"use client";

import { useState } from "react";
import { Clock, FileEdit, Plus, Trash2, X } from "lucide-react";
import { AthleticCard } from "@/components/athletic/card";
import { Button } from "@/components/ui/button";
import type { PlanChangeRequestItem, CreatePlanChangeRequestInput } from "@/app/portal/coach/actions";

type PlanChangeRequestsProps = {
  requests: PlanChangeRequestItem[];
  onCreate: (input: CreatePlanChangeRequestInput) => Promise<void>;
};

const TYPE_LABELS: Record<PlanChangeRequestItem["changeType"], string> = {
  MOVE: "Flytt",
  DELETE: "Slett",
  EDIT: "Endre",
  CREATE: "Ny økt",
};

const TYPE_EXAMPLES: Record<PlanChangeRequestItem["changeType"], string> = {
  MOVE: "Flytt langdagsøkt til torsdag",
  DELETE: "Fjern økten på grunn av skole",
  EDIT: "Endre fokus til putting",
  CREATE: "Legg til en ekstra puttingøkt",
};

const STATUS_STYLES: Record<PlanChangeRequestItem["status"], string> = {
  PENDING: "bg-warning/10 text-warning",
  APPROVED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<PlanChangeRequestItem["status"], string> = {
  PENDING: "Venter",
  APPROVED: "Godkjent",
  REJECTED: "Avvist",
};

export function PlanChangeRequests({ requests, onCreate }: PlanChangeRequestsProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<CreatePlanChangeRequestInput["changeType"]>("CREATE");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return;

    setPending(true);
    try {
      await onCreate({ changeType: type, note: trimmed });
      setNote("");
      setShowForm(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AthleticCard
      label="Planendringer"
      action={
        <Button
          type="button"
          variant="lime"
          size="sm"
          onClick={() => setShowForm((s) => !s)}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ny forespørsel
        </Button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-semibold">Ny endringsforespørsel</span>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["CREATE", "MOVE", "EDIT", "DELETE"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${
                  type === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={TYPE_EXAMPLES[type]}
            rows={3}
            required
            className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" disabled={pending || !note.trim()}>
              Send forespørsel
            </Button>
          </div>
        </form>
      )}

      {requests.length === 0 ? (
        <div className="py-6 text-center">
          <FileEdit className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">Ingen aktive planendringsforespørsler.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {r.changeType === "DELETE" ? (
                    <Trash2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  ) : (
                    <FileEdit className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  )}
                  <span className="font-display text-sm font-semibold">{TYPE_LABELS[r.changeType]}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] ${STATUS_STYLES[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <p className="text-sm text-foreground">{r.description}</p>
              {r.coachNote && (
                <p className="rounded-md bg-secondary/50 px-2 py-2 text-xs text-muted-foreground">
                  <span className="font-semibold">Coach:</span> {r.coachNote}
                </p>
              )}
              <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                {r.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AthleticCard>
  );
}
