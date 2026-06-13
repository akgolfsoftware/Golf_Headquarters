"use client";

/**
 * CreateSessionSheet — skuff for å opprette ny TrainingPlanSession fra Workbench.
 *
 * Kaller createTrainingPlanSession() server action. Lukker seg selv ved suksess.
 * Viser inline feilmelding ved feil — krasjer ikke.
 *
 * Krever `planId` (aktiv TrainingPlan for brukeren). Hvis ingen aktiv plan
 * finnes, viser et graceful empty state med lenke til "Opprett plan".
 */

import { useRef, useState, useTransition } from "react";
import { CalendarPlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { createTrainingPlanSession } from "@/app/portal/planlegge/workbench/actions";

const PYRAMID_AREAS = [
  { value: "FYS", label: "FYS — Fysisk trening" },
  { value: "TEK", label: "TEK — Teknisk trening" },
  { value: "SLAG", label: "SLAG — Slagtrening" },
  { value: "SPILL", label: "SPILL — Spilltrening" },
  { value: "TURN", label: "TURN — Turneringsøving" },
] as const;

const ENVIRONMENTS = [
  { value: "", label: "Ikke spesifisert" },
  { value: "RANGE", label: "Range" },
  { value: "BANE", label: "Bane" },
  { value: "STUDIO", label: "Studio" },
  { value: "HJEM", label: "Hjem" },
  { value: "SIMULATOR", label: "Simulator" },
  { value: "GYM", label: "Gym" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Aktiv TrainingPlan-id. Null = ingen aktiv plan → empty state. */
  planId: string | null;
};

export function CreateSessionSheet({ open, onOpenChange, planId }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!planId) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTrainingPlanSession(fd);
      if (!result.ok) {
        setError(result.error ?? "Noe gikk galt");
        return;
      }
      formRef.current?.reset();
      onOpenChange(false);
    });
  }

  // Foreslå dato/tid: i dag kl. 09:00
  const todayAt09 = (() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="lg">
        <SheetHeader>
          <div className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
            Ny treningsøkt
          </div>
          <SheetTitle className="mt-2 font-display text-lg font-bold tracking-[-0.01em]">
            Planlegg økt
          </SheetTitle>
        </SheetHeader>

        {!planId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <CalendarPlus size={32} strokeWidth={1.5} className="text-muted-foreground" />
            <p className="font-sans text-sm text-muted-foreground">
              Du har ingen aktiv treningsplan. Opprett en plan først, så kan du legge til økter.
            </p>
            <button
              type="button"
              className="rounded-full bg-primary px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
              onClick={() => onOpenChange(false)}
            >
              Lukk
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-y-auto"
          >
            <input type="hidden" name="planId" value={planId} />

            <div className="flex flex-col gap-6 p-6">
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                  Tittel
                </span>
                <Input
                  name="title"
                  placeholder="Putting — distansekontroll"
                  required
                  maxLength={120}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                  Dato og tid
                </span>
                <Input
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={todayAt09}
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                  Varighet (minutter)
                </span>
                <Input
                  name="durationMin"
                  type="number"
                  min={5}
                  max={480}
                  defaultValue={60}
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                  Pyramideområde
                </span>
                <select
                  name="pyramidArea"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PYRAMID_AREAS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                  Sted (valgfri)
                </span>
                <select
                  name="environment"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ENVIRONMENTS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </label>

              {error && (
                <p className="rounded-lg bg-destructive/10 p-4 font-mono text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-auto flex gap-4 border-t border-border px-6 py-4">
              <button
                type="button"
                className="flex-1 rounded-full border border-border bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity disabled:opacity-50"
              >
                <CalendarPlus size={14} strokeWidth={1.5} />
                {isPending ? "Lagrer…" : "Legg til økt"}
              </button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
